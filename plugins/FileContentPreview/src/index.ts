import patch0 from './patches/MessageHandlers';
import patch1 from './patches/RowManager';

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
    unpatchAll();
    patches.push(patch0(), patch1());
  },
  onUnload: unpatchAll,
};
