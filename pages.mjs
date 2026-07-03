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

function owo(text, pluginId, manifest) {
    const pluginName = escapeHtml(manifest.name);
    const pluginDescription = escapeHtml(manifest.description ?? "");
    const pluginAuthor = escapeHtml((manifest.authors ?? []).map(author => author.name).join(", ") || "Community");

    return text
        .replaceAll("{baseurl}", baseUrl)
        .replaceAll("{pluginname}", pluginName)
        .replaceAll("{pluginid}", escapeHtml(pluginId))
        .replaceAll("{pluginurl}", `${baseUrl}/${pluginId}`)
        .replaceAll("{pluginauthor}", pluginAuthor)
        .replaceAll("{plugindescription}", pluginDescription);
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

    await writeFile(`./dist/${plug}/index.html`, owo(pluginTemplate, plug, manifest));
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
