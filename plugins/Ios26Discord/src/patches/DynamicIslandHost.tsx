import { findByDisplayName, findByName } from '@vendetta/metro';
import { after } from '@vendetta/patcher';
import { React, ReactNative } from '@vendetta/metro/common';
import { getBooleanSetting } from '../settings';
import { DynamicIsland } from '../ui/DynamicIsland';

const { View, StyleSheet } = ReactNative;
const HostView: any = View;
const HOST_CANDIDATES = [
  'MessagesWrapperConnected',
  'MessagesWrapper',
  'ChannelMessages',
  'ChannelScreen',
  'ChatScreen',
  'Chat',
  'App',
];

function hasIslandMarker(node: any): boolean {
  if (!node || typeof node !== 'object') return false;
  if (node.props?.__ios26IslandHost) return true;
  const children = node.props?.children;
  if (Array.isArray(children)) return children.some(hasIslandMarker);
  return hasIslandMarker(children);
}

function wrapScreen(node: any) {
  if (!node || hasIslandMarker(node)) return node;
  return (
    <HostView style={styles.host} __ios26IslandHost>
      {node}
      {getBooleanSetting('dynamicIsland') && <DynamicIsland />}
    </HostView>
  );
}

function patchModule(module: any) {
  if (!module) return null;
  if (module.default && typeof module.default === 'function') {
    return after('default', module, (_, result) => wrapScreen(result));
  }
  if (module.render && typeof module.render === 'function') {
    return after('render', module, (_, result) => wrapScreen(result));
  }
  return null;
}

export default function patchDynamicIslandHost() {
  for (const name of HOST_CANDIDATES) {
    try {
      const module = findByName(name, false) ?? findByDisplayName(name, false);
      const unpatch = patchModule(module);
      if (unpatch) return unpatch;
    } catch (error) {
      console.warn('[iOS26Discord] Failed to patch island host candidate', name, error);
    }
  }

  console.warn('[iOS26Discord] No Dynamic Island host was found. Settings preview will still work.');
  return () => {};
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});
