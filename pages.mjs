import { readFile, writeFile, readdir, cp, mkdir } from "fs/promises";

const baseUrl = "https://tanhoangviet.github.io/revenge-plugs";

function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;",
    })[char]);
}

function getPluginCopy(pluginId, manifest, files) {
    const hasShowcase = files.some((file) => file === "showcase0.png");
    const pluginName = escapeHtml(manifest.name);
    const description = escapeHtml(manifest.description ?? "");
    const showcase = hasShowcase
        ? `<img src="${baseUrl}/${pluginId}/showcase0.png" width="720" height="720" alt="${pluginName} Discord preview" />`
        : `<div class="showcase-fallback">
            <div class="fallback-island">Dynamic Island</div>
            <div class="fallback-card">
              <strong>${pluginName}</strong>
              <span>Liquid glass preview surface</span>
            </div>
            <div class="fallback-bar"></div>
          </div>`;

    if (pluginId === "Ios26Discord") {
        return {
            plugindetailsubtitle: `${description} It reshapes Discord with liquid glass panels, glass cards, gesture search, and a smaller floating Dynamic Island.`,
            previewtitle: "Dynamic Island",
            previewbadge: "iOS Glass",
            previewcode: `<span>const</span> discord = ios26({
  island: true,
  pullDownSearch: true,
  swipeUserSearch: true,
  swipeServerSearch: true,
  glassCards: true,
  motion: "liquid"
})`,
            featureintro: "The plugin adds a liquid glass visual layer across Discord while turning Dynamic Island into a compact gesture surface.",
            feature1label: "Island",
            feature1title: "Smaller island, no duplicate overlays.",
            feature1body: "The island now mounts through one runtime host and sits lower near the top bar with a slimmer collapsed state.",
            feature2label: "Gestures",
            feature2title: "Pull and swipe search actions.",
            feature2body: "Pull down for message search, swipe right for user search, and swipe left for server search with live arrow hints.",
            feature3label: "Commands",
            feature3title: "Fast slash command panel.",
            feature3body: "Tap the island to open an input, search buttons, and quick slash command chips.",
            feature4label: "Runtime",
            feature4title: "More reliable overlay patching.",
            feature4body: "The island now patches normal React and JSX runtime paths, plus diagnostics for Evaluate JavaScript.",
            cardpill1: "Gesture search",
            cardpill2: "No duplicates",
            cardpill3: "Glass cards",
            cardbutton: "Launch",
            pluginshowcase: showcase,
        };
    }

    return {
        plugindetailsubtitle: `${description} Built to feel native inside Discord chat.`,
        previewtitle: "Preview editor",
        previewbadge: "Lua",
        previewcode: `<span>local</span> settings = {
  theme = "VS Code Dark+",
  glass = true,
  explain = true
}`,
        featureintro: "The plugin turns raw text attachments into a readable, configurable preview flow.",
        feature1label: "Reader",
        feature1title: "Open code without leaving Discord.",
        feature1body: "Line numbers, word wrap, monospace mode, chunk loading, and a status bar keep long files readable.",
        feature2label: "Highlight",
        feature2title: "Syntax colors and file metrics.",
        feature2body: "Keywords, strings, comments, imports, and blocks are surfaced directly in the preview.",
        feature3label: "Explain",
        feature3title: "Local code explanation.",
        feature3body: "The info panel summarizes what the file appears to do without sending code to a server.",
        feature4label: "Configure",
        feature4title: "Theme, glass, motion, and reader defaults.",
        feature4body: "Choose VS Code-style themes, transparent preview panels, glass zoom timing, chunk size, and default reader behavior.",
        cardpill1: "Discord card",
        cardpill2: "Syntax highlight",
        cardpill3: "Liquid settings",
        cardbutton: "Preview",
        pluginshowcase: showcase,
    };
}

function owo(text, pluginId, manifest, files = []) {
    const pluginName = escapeHtml(manifest.name);
    const pluginDescription = escapeHtml(manifest.description ?? "");
    const pluginAuthor = escapeHtml((manifest.authors ?? []).map(author => author.name).join(", ") || "Community");

    const copy = getPluginCopy(pluginId, manifest, files);

    return text
        .replaceAll("{baseurl}", baseUrl)
        .replaceAll("{pluginname}", pluginName)
        .replaceAll("{pluginid}", escapeHtml(pluginId))
        .replaceAll("{pluginurl}", `${baseUrl}/${pluginId}`)
        .replaceAll("{pluginauthor}", pluginAuthor)
        .replaceAll("{plugindescription}", pluginDescription)
        .replaceAll("{plugindetailsubtitle}", copy.plugindetailsubtitle)
        .replaceAll("{previewtitle}", copy.previewtitle)
        .replaceAll("{previewbadge}", copy.previewbadge)
        .replaceAll("{previewcode}", copy.previewcode)
        .replaceAll("{featureintro}", copy.featureintro)
        .replaceAll("{feature1label}", copy.feature1label)
        .replaceAll("{feature1title}", copy.feature1title)
        .replaceAll("{feature1body}", copy.feature1body)
        .replaceAll("{feature2label}", copy.feature2label)
        .replaceAll("{feature2title}", copy.feature2title)
        .replaceAll("{feature2body}", copy.feature2body)
        .replaceAll("{feature3label}", copy.feature3label)
        .replaceAll("{feature3title}", copy.feature3title)
        .replaceAll("{feature3body}", copy.feature3body)
        .replaceAll("{feature4label}", copy.feature4label)
        .replaceAll("{feature4title}", copy.feature4title)
        .replaceAll("{feature4body}", copy.feature4body)
        .replaceAll("{cardpill1}", copy.cardpill1)
        .replaceAll("{cardpill2}", copy.cardpill2)
        .replaceAll("{cardpill3}", copy.cardpill3)
        .replaceAll("{cardbutton}", copy.cardbutton)
        .replaceAll("{pluginshowcase}", copy.pluginshowcase);
}

await mkdir('dist', { recursive: true });
await cp('pages/common.css', 'dist/common.css');
await writeFile('dist/.nojekyll', '');
const indexTemplate = await readFile('pages/index.html', 'utf-8');
const pluginTemplate = await readFile('pages/plugin.html', 'utf-8');

const plugs = [];
for (let plug of (await readdir("./plugins")).sort()) {
    const manifest = JSON.parse(await readFile(`./plugins/${plug}/manifest.json`));
    plugs.push({ manifest, id: plug });
    await mkdir(`./dist/${plug}`, { recursive: true });

    const pluginFiles = await readdir(`./plugins/${plug}`);
    for (let file of pluginFiles) {
        if (/^showcase\d+\.(png|jpe?g|webp|gif)$/i.test(file)) {
            await cp(`./plugins/${plug}/${file}`, `./dist/${plug}/${file}`);
        }
    }

    await writeFile(`./dist/${plug}/index.html`, owo(pluginTemplate, plug, manifest, pluginFiles));
}

const indexHtml = indexTemplate.replaceAll(/<(for-each-plugin)>([\s\S]*?)<\/\1>/g, (_, __, template) => {
    return plugs.map(p => owo(template, p.id, p.manifest)).join('');
}).replaceAll("{baseurl}", baseUrl);

await writeFile('dist/index.html', indexHtml);
await writeFile('dist/404.html', indexHtml);
await writeFile('dist/deployment.json', `${JSON.stringify({
    sha: process.env.GITHUB_SHA ?? "",
    runId: process.env.GITHUB_RUN_ID ?? "",
    generatedAt: new Date().toISOString(),
}, null, 2)}\n`);
