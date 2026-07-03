# iOS 26 Discord

iOS 26-inspired Discord UI plugin for Revenge.

Features:

- Dynamic Island overlay with liquid glass styling.
- Smaller Dynamic Island overlay designed for the Discord top bar.
- Gesture actions: pull down for message search, swipe right for user search, and swipe left for server search.
- Quick Dynamic Island panel for message search, user search, server search, and slash commands.
- Glass message attachment and coded link cards.
- Configurable accent, island size, glass intensity, and motion.
- Settings preview that mirrors the in-app style.
- Fail-soft runtime patches so Discord updates should not crash the client.
- Diagnostics helper for runtime host probing.

Runtime diagnostics:

If the island does not appear, run this in Evaluate JavaScript after enabling the plugin:

```js
JSON.stringify(globalThis.__ios26Discord?.status?.(), null, 2)
```

To inspect possible Discord host modules:

```js
JSON.stringify(globalThis.__ios26Discord?.probeHosts?.(), null, 2)
```

To inspect quick action modules:

```js
JSON.stringify(globalThis.__ios26Discord?.probeActions?.(), null, 2)
```

Install URL:

```txt
https://tanhoangviet.github.io/revenge-plugs/Ios26Discord
```
