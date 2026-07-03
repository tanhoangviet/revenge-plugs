import { clipboard } from '@vendetta/metro/common';
import { findByProps, findByStoreName } from '@vendetta/metro';

const SEARCH_METHODS = ['openSearch', 'openChannelSearch', 'openSearchModal', 'showSearch', 'searchMessages'];
const USER_SEARCH_METHODS = ['openUserSearch', 'openUserSearchModal', 'searchUsers', 'showUserSearch', 'openSearch'];
const SERVER_SEARCH_METHODS = ['openGuildSearch', 'openServerSearch', 'searchGuilds', 'showGuildSearch', 'openSearch'];
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

function quickTypedSearch(query: string, methods: string[], type: string) {
  const text = clean(query);
  if (!text) return { ok: false, mode: 'empty' };

  const context = getChannelContext();
  const payloads = [
    { query: text, searchQuery: text, initialQuery: text, type, searchType: type, ...context },
    text,
  ];

  for (const method of methods) {
    const module = safeFindByProps(method);
    const fn = module?.[method];
    if (typeof fn === 'function' && tryCall(fn.bind(module), payloads)) {
      return { ok: true, mode: method };
    }
  }

  clipboard.setString(text);
  return { ok: true, mode: 'clipboard' };
}

export function quickSearchUsers(query: string) {
  return quickTypedSearch(query, USER_SEARCH_METHODS, 'user');
}

export function quickSearchServers(query: string) {
  return quickTypedSearch(query, SERVER_SEARCH_METHODS, 'guild');
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

export function probeActionModules() {
  return {
    search: SEARCH_METHODS.map((method) => ({ method, found: !!safeFindByProps(method)?.[method] })),
    userSearch: USER_SEARCH_METHODS.map((method) => ({ method, found: !!safeFindByProps(method)?.[method] })),
    serverSearch: SERVER_SEARCH_METHODS.map((method) => ({ method, found: !!safeFindByProps(method)?.[method] })),
    input: INPUT_METHODS.map((method) => ({ method, found: !!safeFindByProps(method)?.[method] })),
    context: getChannelContext(),
  };
}
