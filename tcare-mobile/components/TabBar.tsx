import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, fontSize } from '../theme';

export type TabKey = 'ask' | 'resources' | 'tai' | 'contact';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ask', label: 'Ask' },
  { key: 'resources', label: 'Resources' },
  { key: 'tai', label: 'Chat' },
  { key: 'contact', label: 'Contact' },
];

type Props = {
  active: TabKey;
  onChange: (key: TabKey) => void;
};

export function TabBar({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
          >
            <View
              style={[
                styles.indicator,
                isActive && { backgroundColor: colors.accent },
              ]}
            />
            <Text
              style={[
                styles.label,
                isActive && { color: colors.accent, fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: Platform.OS === 'ios' ? 52 : 64,
    paddingVertical: Platform.OS === 'ios' ? 4 : 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    minHeight: Platform.OS === 'ios' ? 44 : 48,
  },
  indicator: {
    width: 18,
    height: 3,
    backgroundColor: 'transparent',
    // square — no borderRadius
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
