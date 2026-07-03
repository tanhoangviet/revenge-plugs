import { findByName, findByNameAll, findByProps } from '@vendetta/metro';
import { after } from '@vendetta/patcher';
import { getBooleanSetting } from '../settings';
import { colorToDiscordInt, getTheme } from '../theme';

const PREVIEW_MARKER = '__ios26DiscordGlass';

function getCardColors() {
  const theme = getTheme();
  const reduceNoise = getBooleanSetting('reduceNoise');
  return {
    borderColor: colorToDiscordInt(theme.accent, 0.42),
    backgroundColor: colorToDiscordInt('#161B27', reduceNoise ? 0.72 : 0.82),
    headerColor: colorToDiscordInt(theme.text, 1),
    acceptLabelBackgroundColor: colorToDiscordInt(theme.accentStrong, 0.92),
    thumbnailCornerRadius: theme.radius,
  };
}

function styleLink(link: any) {
  if (!link || typeof link !== 'object' || link[PREVIEW_MARKER]) return link;
  const colors = getCardColors();
  const target = Object.isFrozen(link) ? { ...link } : link;
  try {
    target[PREVIEW_MARKER] = true;
    for (const key in colors) {
      target[key] = colors[key];
    }
  } catch (error) {
    console.warn('[iOS26Discord] Failed to style coded link', error);
  }
  return target;
}

function getRowManager() {
  const candidates = [findByName('RowManager'), findByName('RowManager', false), ...findByNameAll('RowManager'), ...findByNameAll('RowManager', false)];
  return candidates.find((candidate) => candidate?.prototype?.generate);
}

export default function patchGlassCards() {
  const RowManager = getRowManager();
  const CodedLinkExtendedType = findByProps('CodedLinkExtendedType')?.CodedLinkExtendedType ?? { EMBEDDED_ACTIVITY_INVITE: 3 };
  if (!RowManager?.prototype?.generate) return () => {};

  return after('generate', RowManager.prototype, (_, row) => {
    try {
      if (!getBooleanSetting('glassCards')) return;
      const message = row?.message;
      if (!message?.codedLinks?.length) return;

      message.codedLinks = message.codedLinks.map((link: any) => {
        const styled = styleLink(link);
        if (styled?.extendedType === CodedLinkExtendedType.EMBEDDED_ACTIVITY_INVITE) {
          styled.thumbnailCornerRadius = getTheme().radius;
        }
        return styled;
      });
    } catch (error) {
      console.warn('[iOS26Discord] Failed to apply glass card patch', error);
    }
  });
}
