import React from 'react';
import { Modal, Platform, StyleSheet, type ModalProps } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export function SystemAwareModal({ children, ...props }: ModalProps) {
  if (Platform.OS !== 'android') return <Modal {...props}>{children}</Modal>;

  // A modal has its own Android window, which can have different insets from the activity.
  return (
    <Modal {...props} statusBarTranslucent navigationBarTranslucent>
      <SafeAreaProvider>
        <SafeAreaView style={styles.content}>{children}</SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({ content: { flex: 1 } });
