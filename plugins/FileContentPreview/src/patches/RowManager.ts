/**
 * Patch the in-chat messages (RowManager.generate)
 */
import { findByStoreName, findByName, findByProps } from '@vendetta/metro';
import { after } from '@vendetta/patcher';
import { isPreviewableFile } from '../filetypes';

const ThemeStore = findByStoreName('ThemeStore');

const RowManager = findByName('RowManager');
const getEmbedThemeColors = findByName('getEmbedThemeColors');
const CodedLinkExtendedType = findByProps("CodedLinkExtendedType")?.CodedLinkExtendedType ?? { EMBEDDED_ACTIVITY_INVITE: 3 };
const PREVIEW_LINK_MARKER = '__fileContentPreview';

function formatBytes(bytes?: number) {
  if (!Number.isFinite(bytes)) return '? bytes';
  if (bytes < 1024) return `${bytes} bytes`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = units.shift()!;
  while (value >= 1024 && units.length) {
    value /= 1024;
    unit = units.shift()!;
  }
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${unit}`;
}

function getCodedLinkColors() {
  let colors = getEmbedThemeColors?.(ThemeStore.theme)?.colors || {
    acceptLabelGreenBackgroundColor: -14385083,
    headerColor: -6973533,
    borderColor: 268435455,
    backgroundColor: -14276817,
  };
  return {
    acceptLabelBackgroundColor: colors.acceptLabelGreenBackgroundColor,
    headerColor: colors.headerColor,
    borderColor: colors.borderColor,
    backgroundColor: colors.backgroundColor,
  };
}

function makeRPL(attachment: any) {
  const filename = attachment.filename ?? 'unknown';
  return {
    [PREVIEW_LINK_MARKER]: true,
    ...getCodedLinkColors(),
    thumbnailCornerRadius: 15,
    headerText: '',
    titleText: 'File - ' + formatBytes(attachment.size),
    structurableSubtitleText: null,
    type: null,
    extendedType: CodedLinkExtendedType.EMBEDDED_ACTIVITY_INVITE,
    participantAvatarUris: [],
    acceptLabelText: 'Preview',
    splashUrl: null,
    noParticipantsText: '\n' + filename,
    ctaEnabled: true,
  };
}

export default function patch() {
  return after('generate', RowManager.prototype, (_, row) => {
    const { message } = row;
    if (!message) return;
    if (!message.attachments?.length) return;
    if (message.codedLinks?.some((link) => link?.[PREVIEW_LINK_MARKER])) return;

    let rpls: any[] = [];
    let attachs: any[] = [];
    message.attachments.forEach((attachment) => {
      if (isPreviewableFile(attachment.filename)) {
        rpls.push(makeRPL(attachment));
      } else {
        attachs.push(attachment);
      }
    });
    if (rpls.length) {
      message.codedLinks = [...(message.codedLinks ?? []), ...rpls];
      message.attachments = attachs;
    }
  });
}
