import Settings from './ui/Settings';
import { ensureSettings } from './settings';
import patchGlassCards from './patches/GlassCards';
import patchDynamicIslandHost from './patches/DynamicIslandHost';

let patches: Array<() => void> = [];

function unpatchAll() {
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
    patches.push(patchGlassCards(), patchDynamicIslandHost());
  },
  onUnload: unpatchAll,
  settings: Settings,
};

export { Settings };
