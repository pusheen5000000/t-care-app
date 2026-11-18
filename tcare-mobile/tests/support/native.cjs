const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

// Each platform suite runs in its own Node test worker. Keep React, the app,
// and its network client real. Substitute only the device-facing modules.
module.exports = function installNative(platform) {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  process.env.EXPO_PUBLIC_API_URL = 'https://tcare.invalid';
  global.requestAnimationFrame = callback => setImmediate(callback);
  global.cancelAnimationFrame = clearImmediate;
  const flags = new Map();
  const backHandlers = new Set();
  const device = {
    alerts: [], announcements: [], links: [], copied: [], storage: flags,
    permission: 'granted', screenReader: true, dialerCalls: 0, locationRequests: 0,
    back: () => [...backHandlers].reverse().some(handler => handler()),
  };
  const native = {
    Platform: { OS: platform },
    StyleSheet: { create: styles => styles, absoluteFillObject: {} },
    useWindowDimensions: () => ({ width: 390, height: 844, fontScale: 2 }),
    Modal: ({ visible, children }) => visible ? children : null,
    Alert: { alert: (title, message, buttons = []) => device.alerts.push({ title, message, buttons }) },
    AccessibilityInfo: {
      isScreenReaderEnabled: async () => device.screenReader,
      announceForAccessibility: text => device.announcements.push(text),
      addEventListener: () => ({ remove() {} }),
    },
    Linking: { openURL: async url => {
      device.links.push(url);
      if (device.linkFails) throw Error('No handler');
    } },
    BackHandler: { addEventListener: (_, handler) => {
      backHandlers.add(handler);
      return { remove: () => backHandlers.delete(handler) };
    } },
    Animated: {
      Value: class {}, View: 'View', delay() {}, timing() {}, sequence() {},
      loop: () => ({ start() {}, stop() {} }),
    },
  };
  for (const name of ['View', 'Text', 'TextInput', 'ScrollView', 'TouchableOpacity', 'Pressable',
    'Image', 'StatusBar', 'ActivityIndicator']) native[name] = name;
  const modules = {
    'react-native': native,
    'react-native-safe-area-context': {
      SafeAreaProvider: 'SafeAreaProvider', SafeAreaView: 'SafeAreaView',
      useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    },
    'react-native-keyboard-controller': {
      KeyboardChatScrollView: 'ScrollView', KeyboardStickyView: 'View',
      KeyboardAvoidingView: 'View', KeyboardProvider: 'View',
    },
    'react-native-reanimated': { useSharedValue: value => React.useRef({ value }).current },
    'react-native-maps': { __esModule: true, default: 'MapView', Marker: 'Marker', Polyline: 'Polyline' },
    '@react-native-async-storage/async-storage': {
      getItem: async key => flags.get(key) ?? null,
      setItem: async (key, value) => flags.set(key, value),
      removeItem: async key => flags.delete(key),
    },
    'expo-location': {
      Accuracy: { Balanced: 3 },
      requestForegroundPermissionsAsync: async () => {
        device.locationRequests++;
        return { status: device.permission };
      },
      getCurrentPositionAsync: async () => ({ coords: { latitude: 43.66, longitude: -79.4 } }),
    },
    'expo-intent-launcher': { startActivityAsync: async () => {
      device.dialerCalls++;
      if (device.dialerFails) throw Error('Dialer unavailable');
    } },
    'expo-clipboard': { setStringAsync: async text => {
      if (device.clipboardFails) return false;
      device.copied.push(text);
      return true;
    } },
  };
  const load = Module._load;
  Module._load = function (name, ...args) {
    if (Object.hasOwn(modules, name)) return modules[name];
    return load.call(this, name, ...args);
  };
  for (const ext of ['.tsx', '.ts']) {
    require.extensions[ext] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file, compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022, esModuleInterop: true,
      },
    }).outputText, file);
  }
  require.extensions['.png'] = mod => { mod.exports = 1; };
  return device;
};

function visible(node) {
  for (let current = node; current; current = current.parent) {
    if ([current.props.style].flat(Infinity).some(style => style?.display === 'none')) return false;
  }
  return true;
}

module.exports.render = async function render(t, component, props = {}) {
  let tree;
  await act(async () => {
    tree = create(React.createElement(component, props), {
      createNodeMock: () => ({ focus() {}, scrollTo() {}, scrollToEnd() {}, fitToCoordinates() {} }),
    });
  });
  t.after(async () => { await act(async () => tree.unmount()); });
  const hosts = predicate => tree.root.findAll(n => typeof n.type === 'string' && visible(n) && predicate(n));
  const text = value => hosts(n => n.type === 'Text' && n.children.join('') === value);
  const control = label => hosts(n => n.props.accessibilityLabel === label ||
    (n.props.onPress && n.findAll(c => c.type === 'Text' && c.children.join('') === label).length > 0 &&
      !n.props.accessibilityLabel)).at(-1);
  return {
    hosts, text, control,
    async press(label) {
      const node = control(label);
      assert.ok(node?.props.onPress, 'Missing action: ' + label);
      assert.ok(!node.props.disabled, 'Disabled action: ' + label);
      await act(async () => { node.props.onPress(); });
    },
    async type(label, value) {
      const node = control(label);
      assert.ok(node?.props.onChangeText, 'Missing input: ' + label);
      assert.notEqual(node.props.editable, false);
      await act(async () => node.props.onChangeText(value));
    },
  };
};

