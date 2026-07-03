import Settings from './ui/Settings';
import { ensureSettings, getStorage } from './settings';
import patchGlassCards from './patches/GlassCards';
import patchDynamicIslandHost, { getDynamicIslandPatchStatus, probeDynamicIslandHosts } from './patches/DynamicIslandHost';
import { probeActionModules } from './actions';

let patches: Array<() => void> = [];
let removeDebugApi: (() => void) | null = null;

function installDebugApi() {
  const root = globalThis as any;
  const api = {
    status: getDynamicIslandPatchStatus,
    probeHosts: probeDynamicIslandHosts,
    probeActions: probeActionModules,
    settings: () => ({ ...getStorage() }),
  };
  root.__ios26Discord = api;
  return () => {
    if (root.__ios26Discord === api) delete root.__ios26Discord;
  };
}

function unpatchAll() {
  removeDebugApi?.();
  removeDebugApi = null;

  for (const unpatch of patches.splice(0)) {
    try {
      unpatch?.();
    } catch (error) {
      console.error('[iOS26Discord] Failed to unpatch', error);
    }
  }
}

export default {
  onLoad: () => {
    ensureSettings();
    unpatchAll();
    removeDebugApi = installDebugApi();
    patches.push(patchGlassCards(), patchDynamicIslandHost());
  },
  onUnload: unpatchAll,
  settings: Settings,
};

export { Settings };
