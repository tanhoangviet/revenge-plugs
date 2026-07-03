import { find, findByDisplayName, findByDisplayNameAll, findByName, findByNameAll, findByProps } from '@vendetta/metro';
import { after } from '@vendetta/patcher';
import { React, ReactNative } from '@vendetta/metro/common';
import { getBooleanSetting } from '../settings';
import { DynamicIsland } from '../ui/DynamicIsland';

const { View, StyleSheet } = ReactNative;
const HostView: any = View;
export const HOST_CANDIDATES = [
  'Root',
  'AppRoot',
  'RootApp',
  'Main',
  'MainTabs',
  'Home',
  'HomeScreen',
  'HomeStack',
  'MessagesConnected',
  'MessagesWrapperConnected',
  'MessagesWrapper',
  'Messages',
  'MessageList',
  'MessageListConnected',
  'ChannelMessages',
  'ChannelMessagesConnected',
  'GuildChannelScreen',
  'ChannelScreen',
  'ChannelRoot',
  'ChatInputWrapper',
  'ChatScreen',
  'ChatView',
  'Chat',
  'App',
];

const HOST_NAME_SET = new Set(HOST_CANDIDATES);
let runtimeHostName: string | null = null;

type PatchStatus = {
  patched: boolean;
  hostName: string | null;
  hostKind: string | null;
  patchCount: number;
  attempts: string[];
  error: string | null;
};

const status: PatchStatus = {
  patched: false,
  hostName: null,
  hostKind: null,
  patchCount: 0,
  attempts: [],
  error: null,
};

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

function recordPatch(name: string, kind: string) {
  status.patched = true;
  status.hostName = status.hostName ? `${status.hostName}, ${name}` : name;
  status.hostKind = status.hostKind ? `${status.hostKind}, ${kind}` : kind;
  status.patchCount += 1;
}

function patchModule(module: any, name: string, kind: string) {
  if (!module) return null;
  if (module.default && typeof module.default === 'function') {
    const unpatch = after('default', module, (_, result) => wrapScreen(result));
    recordPatch(name, `${kind}.default`);
    return unpatch;
  }
  if (module.render && typeof module.render === 'function') {
    const unpatch = after('render', module, (_, result) => wrapScreen(result));
    recordPatch(name, `${kind}.render`);
    return unpatch;
  }
  return null;
}

function getComponentName(type: any) {
  return type?.displayName ?? type?.name ?? type?.type?.displayName ?? type?.type?.name ?? '';
}

function maybeWrapNamedElement(type: any, result: any) {
  const name = getComponentName(type);
  if (!HOST_NAME_SET.has(name)) return undefined;
  if (runtimeHostName && runtimeHostName !== name) return undefined;
  runtimeHostName = name;
  return wrapScreen(result);
}

function patchCreateElementFallback() {
  return after('createElement', React, ([type], result) => {
    return maybeWrapNamedElement(type, result);
  });
}

function patchJsxRuntimeFallback() {
  const jsxRuntime = findByProps('jsx', 'jsxs');
  const unpatches: Array<() => void> = [];
  if (typeof jsxRuntime?.jsx === 'function') {
    unpatches.push(after('jsx', jsxRuntime, ([type], result) => maybeWrapNamedElement(type, result)));
  }
  if (typeof jsxRuntime?.jsxs === 'function') {
    unpatches.push(after('jsxs', jsxRuntime, ([type], result) => maybeWrapNamedElement(type, result)));
  }
  return () => {
    for (const unpatch of unpatches.splice(0)) unpatch();
  };
}

function uniqueModules(modules: any[]) {
  return modules.filter((module, index) => module && modules.indexOf(module) === index);
}

function getHostCandidates() {
  const modules: Array<{ name: string; kind: string; module: any }> = [];

  for (const name of HOST_CANDIDATES) {
    try {
      const byName = uniqueModules([
        findByName(name, false),
        findByName(name, true),
        ...findByNameAll(name, false),
        ...findByNameAll(name, true),
      ]);
      for (const module of byName) modules.push({ name, kind: 'name', module });

      const byDisplayName = uniqueModules([
        findByDisplayName(name, false),
        findByDisplayName(name, true),
        ...findByDisplayNameAll(name, false),
        ...findByDisplayNameAll(name, true),
      ]);
      for (const module of byDisplayName) modules.push({ name, kind: 'displayName', module });
    } catch (error) {
      status.attempts.push(`${name}: ${String(error)}`);
    }
  }

  try {
    const heuristic = find((module: any) => {
      const fn = module?.default ?? module?.render ?? module;
      const source = typeof fn === 'function' ? Function.prototype.toString.call(fn) : '';
      return source.includes('HACK_fixModalInteraction') || source.includes('messagesWrapper') || source.includes('MessagesConnected');
    });
    if (heuristic) modules.push({ name: 'heuristic.Messages', kind: 'source', module: heuristic });
  } catch (error) {
    status.attempts.push(`heuristic: ${String(error)}`);
  }

  return modules;
}

export function getDynamicIslandPatchStatus() {
  return { ...status, runtimeHostName };
}

function describeModule(module: any) {
  if (!module) return null;
  const target = module.default ?? module.render ?? module;
  return {
    keys: typeof module === 'object' ? Object.keys(module).slice(0, 12) : [],
    type: typeof module,
    defaultType: typeof module.default,
    renderType: typeof module.render,
    functionName: target?.name ?? target?.displayName ?? null,
    hasDefault: !!module.default,
    hasRender: !!module.render,
  };
}

export function probeDynamicIslandHosts() {
  return HOST_CANDIDATES.map((name) => {
    try {
      const modules = uniqueModules([
        findByName(name, false),
        findByName(name, true),
        findByDisplayName(name, false),
        findByDisplayName(name, true),
        ...findByNameAll(name, false),
        ...findByNameAll(name, true),
        ...findByDisplayNameAll(name, false),
        ...findByDisplayNameAll(name, true),
      ]);
      return {
        name,
        count: modules.length,
        modules: modules.slice(0, 4).map(describeModule),
      };
    } catch (error) {
      return { name, count: 0, error: String(error) };
    }
  });
}

export default function patchDynamicIslandHost() {
  status.patched = false;
  status.hostName = null;
  status.hostKind = null;
  status.patchCount = 0;
  status.attempts = [];
  status.error = null;
  runtimeHostName = null;
  const unpatches: Array<() => void> = [];
  const seen = new Set<any>();

  for (const candidate of getHostCandidates()) {
    if (!candidate.module || seen.has(candidate.module)) continue;
    seen.add(candidate.module);
    try {
      status.attempts.push(`${candidate.name}:${candidate.kind}`);
      const unpatch = patchModule(candidate.module, candidate.name, candidate.kind);
      if (unpatch) {
        unpatches.push(unpatch);
      }
    } catch (error) {
      status.error = String(error);
      console.warn('[iOS26Discord] Failed to patch island host candidate', candidate.name, error);
    }
  }

  try {
    unpatches.push(patchCreateElementFallback());
    recordPatch('React.createElement', 'fallback');
  } catch (error) {
    status.error = String(error);
  }

  try {
    unpatches.push(patchJsxRuntimeFallback());
    recordPatch('jsxRuntime', 'fallback');
  } catch (error) {
    status.error = String(error);
  }

  if (status.patchCount > 0) {
    if (getBooleanSetting('diagnostics')) {
      console.log('[iOS26Discord] Patched Dynamic Island hosts', status.hostName, status.hostKind);
    }
    return () => {
      status.patched = false;
      status.patchCount = 0;
      runtimeHostName = null;
      for (const unpatch of unpatches.splice(0)) unpatch();
    };
  }

  status.error = status.error ?? 'No Dynamic Island host was found.';
  console.warn('[iOS26Discord] No Dynamic Island host was found. Settings preview will still work.');
  return () => {};
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});
