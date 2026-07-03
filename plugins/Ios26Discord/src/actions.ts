import { clipboard, url } from '@vendetta/metro/common';
import { findByProps, findByStoreName } from '@vendetta/metro';

export type MediaKind = 'spotify' | 'youtube';

const SEARCH_METHODS = ['openSearch', 'openChannelSearch', 'openSearchModal', 'showSearch', 'searchMessages'];
const INPUT_METHODS = ['setText', 'setInputText', 'setDraft', 'updateDraft', 'setChatInputText'];

function clean(value?: string) {
  return String(value ?? '').trim();
}

function safeFindByProps(prop: string) {
  try {
    return findByProps(prop);
  } catch {
    return null;
  }
}

function safeFindByStoreName(name: string) {
  try {
    return findByStoreName(name);
  } catch {
    return null;
  }
}

function getChannelContext() {
  const selectedChannel = safeFindByStoreName('SelectedChannelStore');
  const selectedGuild = safeFindByStoreName('SelectedGuildStore');
  return {
    channelId: selectedChannel?.getChannelId?.() ?? selectedChannel?.getCurrentlySelectedChannelId?.(),
    guildId: selectedGuild?.getGuildId?.() ?? selectedGuild?.getLastSelectedGuildId?.(),
  };
}

function tryCall(fn: Function, payloads: any[]) {
  for (const payload of payloads) {
    try {
      fn(payload);
      return true;
    } catch {
      try {
        fn(payload?.query, payload?.channelId, payload?.guildId);
        return true;
      } catch {
        continue;
      }
    }
  }
  return false;
}

export function quickSearchMessages(query: string) {
  const text = clean(query);
  if (!text) return { ok: false, mode: 'empty' };

  const context = getChannelContext();
  const payloads = [
    { query: text, searchQuery: text, initialQuery: text, ...context },
    text,
  ];

  for (const method of SEARCH_METHODS) {
    const module = safeFindByProps(method);
    const fn = module?.[method];
    if (typeof fn === 'function' && tryCall(fn.bind(module), payloads)) {
      return { ok: true, mode: method };
    }
  }

  clipboard.setString(text);
  return { ok: true, mode: 'clipboard' };
}

export function runQuickCommand(command: string) {
  const raw = clean(command);
  if (!raw) return { ok: false, mode: 'empty' };
  const text = raw.startsWith('/') ? raw : `/${raw}`;
  const context = getChannelContext();
  const payloads = [
    { text, value: text, content: text, ...context },
    text,
  ];

  for (const method of INPUT_METHODS) {
    const module = safeFindByProps(method);
    const fn = module?.[method];
    if (typeof fn === 'function' && tryCall(fn.bind(module), payloads)) {
      return { ok: true, mode: method, text };
    }
  }

  clipboard.setString(text);
  return { ok: true, mode: 'clipboard', text };
}

export function getMediaUrl(kind: MediaKind, input: string) {
  const text = clean(input);
  if (/^https?:\/\//i.test(text)) return text;
  if (kind === 'spotify') {
    return text ? `https://open.spotify.com/search/${encodeURIComponent(text)}` : 'https://open.spotify.com/';
  }
  return text ? `https://www.youtube.com/results?search_query=${encodeURIComponent(text)}` : 'https://www.youtube.com/';
}

export function openMedia(kind: MediaKind, input: string) {
  const target = getMediaUrl(kind, input);
  try {
    url.openURL(target);
    return { ok: true, url: target };
  } catch {
    clipboard.setString(target);
    return { ok: false, url: target };
  }
}

export function copyText(value: string) {
  clipboard.setString(value);
}

export function probeActionModules() {
  return {
    search: SEARCH_METHODS.map((method) => ({ method, found: !!safeFindByProps(method)?.[method] })),
    input: INPUT_METHODS.map((method) => ({ method, found: !!safeFindByProps(method)?.[method] })),
    context: getChannelContext(),
  };
}
