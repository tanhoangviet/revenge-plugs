import patch0 from './patches/MessageHandlers';
import patch1 from './patches/RowManager';
import Settings from './ui/Settings';
import { ensureSettings } from './settings';

let patches: Array<() => void> = [];

function unpatchAll() {
  for (const unpatch of patches.splice(0)) {
    try {
      unpatch?.();
    } catch (error) {
      console.error('[FileContentPreview] Failed to unpatch', error);
    }
  }
}

export default {
  onLoad: () => {
    ensureSettings();
    unpatchAll();
    patches.push(patch0(), patch1());
  },
  onUnload: unpatchAll,
  settings: Settings,
};

export { Settings };
