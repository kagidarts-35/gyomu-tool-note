import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = (await readdir(path.join(root, "content/articles"))).filter((file) => file.endsWith(".json"));
const errors = [];
const slugs = new Set();

for (const file of files) {
  const article = JSON.parse(await readFile(path.join(root, "content/articles", file), "utf8"));
  const label = `${file} (${article.slug || "slugなし"})`;
  if (!/^[a-z0-9-]+$/.test(article.slug || "")) errors.push(`${label}: slugは英小文字・数字・ハイフンのみ使用できます`);
  if (slugs.has(article.slug)) errors.push(`${label}: slugが重複しています`);
  slugs.add(article.slug);
  if (!article.title || article.title.length < 12) errors.push(`${label}: titleが短すぎます`);
  if (!article.description || article.description.length < 40) errors.push(`${label}: descriptionが短すぎます`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.updated || "")) errors.push(`${label}: updatedはYYYY-MM-DD形式が必要です`);
  if (!article.disclosure) errors.push(`${label}: 広告開示文がありません`);
  if (!article.sources?.length) errors.push(`${label}: 参照元がありません`);
  if (JSON.stringify(article).includes("絶対") || JSON.stringify(article).includes("必ず儲か")) {
    errors.push(`${label}: 断定的な表現を確認してください`);
  }
}

if (errors.length) {
  throw new Error(errors.join("\n"));
}
console.log(`Content checks passed: ${files.length} article(s)`);
