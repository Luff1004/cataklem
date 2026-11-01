// Downloads the game's fonts once so the desktop build works offline.
// Writes app/fonts/fonts.css and the font files it points to.
const fs = require('fs');
const path = require('path');
const URL_CSS = 'https://fonts.googleapis.com/css2?family=Gasoek+One&family=Gothic+A1:wght@500;700;800&family=IBM+Plex+Mono:wght@500;700&family=Dela+Gothic+One&family=Noto+Sans+JP:wght@500;700;800&family=ZCOOL+QingKe+HuangYou&family=Noto+Sans+SC:wght@500;700;900&display=swap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const out = path.join(__dirname, 'app', 'fonts');

(async () => {
  const src = path.join(out, 'source.txt');
  if (fs.existsSync(path.join(out, 'fonts.css')) && fs.existsSync(src) && fs.readFileSync(src, 'utf8') === URL_CSS) { console.log('fonts already here'); return; }
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  let css = await (await fetch(URL_CSS, { headers: { 'User-Agent': UA } })).text();
  const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))];
  let i = 0;
  for (const u of urls) {
    const name = 'f' + (i++) + path.extname(new URL(u).pathname);
    const buf = Buffer.from(await (await fetch(u)).arrayBuffer());
    fs.writeFileSync(path.join(out, name), buf);
    css = css.split(u).join(name);
    process.stdout.write('.');
  }
  fs.writeFileSync(path.join(out, 'fonts.css'), css);
  fs.writeFileSync(src, URL_CSS);
  console.log('\n' + urls.length + ' font files saved');
})().catch(e => { console.error('font download failed:', e.message); process.exit(1); });
