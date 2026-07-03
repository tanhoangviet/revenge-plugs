import { getPreviewableFiletype } from '../filetypes';

export type CodeTokenType = 'plain' | 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'operator';

export type CodeToken = {
  text: string;
  type: CodeTokenType;
};

const languageLabels: Record<string, string> = {
  js: 'JavaScript',
  jsx: 'JavaScript React',
  ts: 'TypeScript',
  tsx: 'TypeScript React',
  lua: 'Lua',
  py: 'Python',
  json: 'JSON',
  md: 'Markdown',
  markdown: 'Markdown',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  xml: 'XML',
  sh: 'Shell',
  bash: 'Shell',
  zsh: 'Shell',
  sql: 'SQL',
  yml: 'YAML',
  yaml: 'YAML',
};

const keywordSets: Record<string, string[]> = {
  js: ['async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'if', 'import', 'in', 'let', 'new', 'null', 'return', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while', 'yield'],
  ts: ['abstract', 'any', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'if', 'implements', 'import', 'in', 'interface', 'let', 'namespace', 'new', 'null', 'number', 'private', 'protected', 'public', 'readonly', 'return', 'string', 'switch', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'var', 'void', 'while'],
  lua: ['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while'],
  py: ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'],
  json: ['true', 'false', 'null'],
  css: ['animation', 'background', 'border', 'color', 'display', 'flex', 'grid', 'height', 'margin', 'padding', 'position', 'transform', 'transition', 'width'],
  sql: ['and', 'as', 'by', 'case', 'create', 'delete', 'drop', 'else', 'end', 'from', 'group', 'having', 'insert', 'into', 'join', 'left', 'limit', 'not', 'null', 'on', 'or', 'order', 'right', 'select', 'set', 'table', 'then', 'update', 'values', 'when', 'where'],
  shell: ['case', 'do', 'done', 'elif', 'else', 'esac', 'fi', 'for', 'function', 'if', 'in', 'then', 'while'],
};

const languageGroups: Record<string, string> = {
  jsx: 'js',
  javascript: 'js',
  tsx: 'ts',
  typescript: 'ts',
  python: 'py',
  bash: 'shell',
  sh: 'shell',
  zsh: 'shell',
  scss: 'css',
  less: 'css',
  yml: 'yaml',
};

function extensionOf(filename = '') {
  const normalized = filename.toLowerCase();
  const parts = normalized.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : normalized;
}

function languageKey(filename = '') {
  const detected = getPreviewableFiletype(filename) ?? extensionOf(filename);
  return languageGroups[detected] ?? detected;
}

export function getLanguageInfo(filename = '') {
  const key = languageKey(filename);
  return {
    key,
    label: languageLabels[key] ?? languageLabels[extensionOf(filename)] ?? key.toUpperCase(),
  };
}

function countMatches(content: string, regex: RegExp) {
  return content.match(regex)?.length ?? 0;
}

function uniqueMatches(content: string, regex: RegExp, limit = 8) {
  const values = new Set<string>();
  for (const match of content.matchAll(regex)) {
    const value = (match.slice(1).find(Boolean) ?? match[0] ?? '').trim();
    if (value) values.add(value);
    if (values.size >= limit) break;
  }
  return [...values];
}

function functionRegex(key: string) {
  if (key === 'lua') return /\b(?:local\s+function|function)\s+([A-Za-z_][\w.:]*)/g;
  if (key === 'py') return /\b(?:def|class)\s+([A-Za-z_]\w*)/g;
  if (key === 'css') return /([.#]?[A-Za-z_-][\w-]*)\s*\{/g;
  if (key === 'sql') return /\b(?:create\s+(?:table|view|function|procedure)\s+)([A-Za-z_][\w.]*)/gi;
  return /\b(?:function\s+([A-Za-z_$][\w$]*)|class\s+([A-Za-z_$][\w$]*)|const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\()/g;
}

function importRegex(key: string) {
  if (key === 'lua') return /\brequire\s*\(?['"]([^'"]+)['"]\)?/g;
  if (key === 'py') return /^\s*(?:from\s+([A-Za-z_][\w.]*)\s+import|import\s+([A-Za-z_][\w.]*))/gm;
  if (key === 'shell') return /^\s*(?:source|\.)\s+(.+)$/gm;
  return /\b(?:from\s+['"]([^'"]+)['"]|import\s+.+?\s+from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
}

export function getCodeInsights(content: string, filename: string, totalBytes: number, loadedBytes: number) {
  const language = getLanguageInfo(filename);
  const lines = content ? content.split(/\r\n|\r|\n/) : [];
  const nonEmptyLines = lines.filter((line) => line.trim()).length;
  const commentLines = lines.filter((line) => /^\s*(\/\/|--|#|\/\*|\*|<!--)/.test(line)).length;
  const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const functions = uniqueMatches(content, functionRegex(language.key)).map((value) => value.replace(/^undefined$/, '')).filter(Boolean);
  const imports = uniqueMatches(content, importRegex(language.key)).map((value) => value.replace(/^undefined$/, '')).filter(Boolean);
  const loops = countMatches(content, /\b(for|while|repeat|until|forEach|map)\b/g);
  const branches = countMatches(content, /\b(if|else|elseif|elif|switch|case|try|catch|except)\b/g);
  const todos = countMatches(content, /\b(TODO|FIXME|HACK|BUG)\b/gi);
  const networkSignals = uniqueMatches(content, /\b(fetch|axios|XMLHttpRequest|http|https|request|WebSocket)\b/g, 6);
  const storageSignals = uniqueMatches(content, /\b(localStorage|sessionStorage|storage|fs|readFile|writeFile|MMKV|database|sqlite)\b/g, 6);
  const eventSignals = uniqueMatches(content, /\b(addEventListener|on[A-Z][A-Za-z0-9_]*|emit|dispatch|subscribe|useEffect)\b/g, 6);
  const loadedPercent = totalBytes > 0 ? Math.min(100, Math.round((loadedBytes / totalBytes) * 100)) : 100;

  const signals = [
    networkSignals.length ? `${networkSignals.length} network` : null,
    storageSignals.length ? `${storageSignals.length} storage` : null,
    eventSignals.length ? `${eventSignals.length} events` : null,
    todos ? `${todos} TODO` : null,
  ].filter(Boolean) as string[];

  const overview = [
    `${language.label} file with ${lines.length} lines and ${nonEmptyLines} active lines.`,
    functions.length ? `Detected ${functions.length} named blocks: ${functions.slice(0, 4).join(', ')}.` : 'No named function or class blocks were detected in the loaded chunk.',
    imports.length ? `Imports or dependencies include ${imports.slice(0, 4).join(', ')}.` : 'No import or require statements were detected in the loaded chunk.',
  ];

  const sections = [
    {
      title: 'Structure',
      items: [
        `${functions.length} function or class matches`,
        `${loops} loop patterns`,
        `${branches} branch or error-control patterns`,
        `${commentLines} comment lines`,
      ],
    },
    {
      title: 'Signals',
      items: [
        networkSignals.length ? `Network usage: ${networkSignals.join(', ')}` : 'No obvious network calls in the loaded chunk',
        storageSignals.length ? `Storage usage: ${storageSignals.join(', ')}` : 'No obvious storage calls in the loaded chunk',
        eventSignals.length ? `Event flow: ${eventSignals.join(', ')}` : 'No obvious event hooks in the loaded chunk',
        todos ? `${todos} TODO or FIXME markers need review` : 'No TODO or FIXME markers found',
      ],
    },
    {
      title: 'Readability',
      items: [
        `Longest line is ${longestLine} characters`,
        `${loadedPercent}% of the file is loaded`,
        loadedPercent < 100 ? 'Use Load more before relying on the explanation for the whole file' : 'Explanation covers the loaded file content',
      ],
    },
  ];

  return {
    language,
    metrics: {
      lines: lines.length,
      nonEmptyLines,
      commentLines,
      functions: functions.length,
      imports: imports.length,
      loops,
      branches,
      todos,
      longestLine,
      loadedPercent,
    },
    functions,
    imports,
    signals,
    overview,
    sections,
  };
}

function keywordRegex(key: string) {
  const words = keywordSets[key] ?? keywordSets[languageGroups[key]] ?? keywordSets.js;
  return new RegExp(`\\b(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'y');
}

function matchAt(line: string, index: number, regex: RegExp) {
  regex.lastIndex = index;
  return regex.exec(line);
}

export function tokenizeLine(line: string, key: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  const group = languageGroups[key] ?? key;
  const keyword = keywordRegex(group);
  const stringRegex = /(["'`])(?:\\.|(?!\1).)*\1/y;
  const numberRegex = /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?)\b/y;
  const functionRegex = /\b[A-Za-z_$][\w$]*(?=\s*\()/y;
  const operatorRegex = /[{}()[\].,;:+\-*/%=<>!&|?]+/y;
  const commentRegex =
    group === 'lua' || group === 'sql'
      ? /--.*/y
      : group === 'py' || group === 'shell' || group === 'yaml'
        ? /#.*/y
        : /(?:\/\/.*|\/\*.*?\*\/|<!--.*?-->)/y;

  let index = 0;
  while (index < line.length) {
    const comment = matchAt(line, index, commentRegex);
    if (comment) {
      tokens.push({ text: comment[0], type: 'comment' });
      index += comment[0].length;
      continue;
    }

    const string = matchAt(line, index, stringRegex);
    if (string) {
      tokens.push({ text: string[0], type: 'string' });
      index += string[0].length;
      continue;
    }

    const number = matchAt(line, index, numberRegex);
    if (number) {
      tokens.push({ text: number[0], type: 'number' });
      index += number[0].length;
      continue;
    }

    const word = matchAt(line, index, keyword);
    if (word) {
      tokens.push({ text: word[0], type: 'keyword' });
      index += word[0].length;
      continue;
    }

    const fn = matchAt(line, index, functionRegex);
    if (fn) {
      tokens.push({ text: fn[0], type: 'function' });
      index += fn[0].length;
      continue;
    }

    const operator = matchAt(line, index, operatorRegex);
    if (operator) {
      tokens.push({ text: operator[0], type: 'operator' });
      index += operator[0].length;
      continue;
    }

    tokens.push({ text: line[index], type: 'plain' });
    index++;
  }

  return tokens;
}

export function tokenizeCode(content: string, key: string, maxChars = 180000) {
  if (!content || content.length > maxChars) return null;
  return content.split(/\r\n|\r|\n/).map((line) => tokenizeLine(line, key));
}
