import { readFile, writeFile, readdir, cp, mkdir } from "fs/promises";

const baseUrl = "https://tanhoangviet.github.io/revenge-plugs";

function owo(text, pluginId, manifest) {
    return text
        .replaceAll("{baseurl}", baseUrl)
        .replaceAll("{pluginname}", manifest.name)
        .replaceAll("{pluginid}", pluginId)
        .replaceAll("{plugindescription}", manifest.description ?? "");
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
    await writeFile(`./dist/${plug}/index.html`, owo(pluginTemplate, plug, manifest));
}

const indexHtml = indexTemplate.replaceAll(/<(for-each-plugin)>([\s\S]*?)<\/\1>/g, (_, __, template) => {
    return plugs.map(p => owo(template, p.id, p.manifest)).join('');
}).replaceAll("{baseurl}", baseUrl);

await writeFile('dist/index.html', indexHtml);
await writeFile('dist/404.html', indexHtml);
