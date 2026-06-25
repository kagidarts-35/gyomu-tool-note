import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const site = JSON.parse(await readFile(path.join(root, "content/site.json"), "utf8"));
const articleDir = path.join(root, "content/articles");
const files = (await readdir(articleDir)).filter((file) => file.endsWith(".json"));
const articles = await Promise.all(files.map(async (file) =>
  JSON.parse(await readFile(path.join(articleDir, file), "utf8"))
));
const published = articles.filter((article) => article.status === "published");

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const layout = ({ title, description, body, canonical = "", prefix = "" }) => `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ""}
  <link rel="stylesheet" href="${site.baseUrl.includes("YOUR_") ? `${prefix}styles.css` : `${site.baseUrl}/styles.css`}">
</head>
<body>
  <header><div class="wrap">
    <a class="brand" href="${site.baseUrl.includes("YOUR_") ? `${prefix}index.html` : `${site.baseUrl}/`}">${esc(site.name)}</a>
    <nav><a href="${site.baseUrl.includes("YOUR_") ? `${prefix}index.html` : `${site.baseUrl}/`}">記事一覧</a><a href="${site.baseUrl.includes("YOUR_") ? `${prefix}policy.html` : `${site.baseUrl}/policy.html`}">運営方針</a><a href="${site.baseUrl.includes("YOUR_") ? `${prefix}privacy.html` : `${site.baseUrl}/privacy.html`}">プライバシー</a></nav>
  </div></header>
  <main><div class="wrap">${body}</div></main>
  <footer><div class="wrap">© ${new Date().getFullYear()} ${esc(site.name)}｜広告掲載時は記事内に明示します。</div></footer>
</body>
</html>`;

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "articles"), { recursive: true });
await cp(path.join(root, "public"), dist, { recursive: true });

const cards = published.map((article) => `
  <a class="card" href="articles/${esc(article.slug)}.html">
    <h2>${esc(article.title)}</h2>
    <p>${esc(article.description)}</p>
    <span class="meta">更新日 ${esc(article.updated)}</span>
  </a>`).join("");

await writeFile(path.join(dist, "index.html"), layout({
  title: `${site.name}｜小規模事業者の業務ツール選び`,
  description: site.description,
  canonical: site.baseUrl.includes("YOUR_") ? "" : `${site.baseUrl}/`,
  body: `<section class="hero"><p class="eyebrow">実測して、比較する。</p><h1>業務ツール選びを、広告の強さではなく判断基準から。</h1><p class="lead">${esc(site.description)}</p></section><section class="article-list">${cards}</section>`
}));

for (const article of published) {
  const sections = article.sections.map((section) => `
    <section><h2>${esc(section.heading)}</h2>
    ${section.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
    ${section.bullets?.length ? `<ul>${section.bullets.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : ""}
    </section>`).join("");
  const sources = article.sources.map((source) =>
    `<li><a href="${esc(source.url)}" rel="noopener noreferrer">${esc(source.label)}</a></li>`
  ).join("");
  const affiliateCta = article.affiliateCta ? `
    <aside class="affiliate-cta" aria-label="広告">
      <p class="ad-label">広告</p>
      <p>${esc(article.affiliateCta.note)}</p>
      <a class="cta-button" href="${esc(article.affiliateCta.url)}" rel="nofollow sponsored">${esc(article.affiliateCta.label)}</a>
      <img class="tracking-pixel" width="1" height="1" src="${esc(article.affiliateCta.trackingPixel)}" alt="">
    </aside>` : "";
  const body = `<article>
    <p class="eyebrow">選定ガイド</p><h1>${esc(article.title)}</h1>
    <p class="meta">公開日 ${esc(article.published)}｜更新日 ${esc(article.updated)}</p>
    <p class="disclosure">${esc(article.disclosure)}</p>
    <p class="lead">${esc(article.intro)}</p>${sections}
    <h2>まとめ</h2><p>${esc(article.conclusion)}</p>${affiliateCta}
    <section class="sources"><h2>参照元</h2><ul>${sources}</ul></section>
  </article>`;
  await writeFile(path.join(dist, "articles", `${article.slug}.html`), layout({
    title: `${article.title}｜${site.name}`,
    description: article.description,
    canonical: site.baseUrl.includes("YOUR_") ? "" : `${site.baseUrl}/articles/${article.slug}.html`,
    body,
    prefix: "../"
  }));
}

const policyBody = `<article><h1>運営・編集方針</h1>
<h2>評価方法</h2><p>公式情報、利用条件、実際に確認できた操作結果を分けて記録します。広告報酬の高低だけで順位を変更しません。</p>
<h2>広告について</h2><p>広告リンクを含む記事には、その事実を読者が認識できる位置に表示します。未利用の商品を利用済みとして紹介しません。</p>
<h2>訂正</h2><p>誤りを確認した場合は修正し、重要な変更は更新日または記事内に記録します。</p>
<h2>お問い合わせ</h2><p>${esc(site.contact)}</p></article>`;
await writeFile(path.join(dist, "policy.html"), layout({ title: `運営方針｜${site.name}`, description: "当サイトの運営・編集・広告掲載方針", body: policyBody }));

const privacyBody = `<article><h1>プライバシーポリシー</h1>
<p>当サイトは、アクセス解析を導入する場合があります。導入時は利用サービスと収集内容をこのページに追記します。</p>
<h2>広告</h2><p>アフィリエイト広告を利用する場合、リンク経由の申込みにより運営者が報酬を受け取ることがあります。読者の追加負担は原則ありません。</p>
<h2>免責事項</h2><p>掲載情報は確認時点のものです。契約前に必ず提供元の公式サイトで最新の料金・条件をご確認ください。</p></article>`;
await writeFile(path.join(dist, "privacy.html"), layout({ title: `プライバシーポリシー｜${site.name}`, description: "当サイトのプライバシーポリシーと免責事項", body: privacyBody }));

if (!site.baseUrl.includes("YOUR_")) {
  const urls = ["", "policy.html", "privacy.html", ...published.map((a) => `articles/${a.slug}.html`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${site.baseUrl}/${url}</loc></url>`).join("")}</urlset>`;
  await writeFile(path.join(dist, "sitemap.xml"), sitemap);
  await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
}

console.log(`Built ${published.length} article(s) into dist/`);
