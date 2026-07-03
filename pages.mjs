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
            plugindetailsubtitle: `${description} It reshapes Discord with liquid glass panels, glass cards, and a floating Dynamic Island.`,
            previewtitle: "Dynamic Island",
            previewbadge: "iOS Glass",
            previewcode: `<span>const</span> discord = ios26({
  island: true,
  glassCards: true,
  motion: "liquid"
})`,
            featureintro: "The plugin adds a liquid glass visual layer across Discord while keeping settings easy to tune.",
            feature1label: "Island",
            feature1title: "Dynamic Island above chat.",
            feature1body: "A floating glass island sits over Discord with compact and expanded states.",
            feature2label: "Cards",
            feature2title: "Glass attachment surfaces.",
            feature2body: "Rich links and attachment cards get softer borders, iOS-like radius, and accent-aware colors.",
            feature3label: "Motion",
            feature3title: "Liquid movement that can calm down.",
            feature3body: "Motion, bubbles, compact mode, and clean mode are all configurable from settings.",
            feature4label: "Full style",
            feature4title: "A-Z iOS 26 control panel.",
            feature4body: "Choose accent, intensity, Dynamic Island, card glass, bubbles, and motion from one settings page.",
            cardpill1: "Dynamic Island",
            cardpill2: "Glass cards",
            cardpill3: "Liquid settings",
            cardbutton: "Style",
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
