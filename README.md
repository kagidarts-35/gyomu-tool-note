# 業務ツール選定ノート

追加費用0円で始める、GitHub Pages向けのアフィリエイト媒体です。現時点では未確認の商品リンクや架空レビューを掲載していません。

## ローカル確認

```bash
npm run check
npm run build
npm run preview
```

ブラウザで `http://localhost:4173` を開きます。

## サイト設定

公開先は次の設定です。

- GitHubユーザー名：`kagidarts-35`
- リポジトリ名：`gyomu-tool-note`
- 公開URL：`https://kagidarts-35.github.io/gyomu-tool-note`
- サイト名：`業務ツール選定ノート`

公開用メールアドレスは未設定です。連絡先が決まったら
`content/site.json` の `contact` を変更します。

## GitHub Pages公開

1. GitHubで空の公開リポジトリを作る
2. このフォルダをリポジトリとしてpushする
3. GitHubの `Settings > Pages > Source` を `GitHub Actions` にする
4. `main` ブランチへpushすると品質確認後に公開される

## 記事追加

`content/articles/first-guide.json` を複製し、slug、日付、本文、参照元を変更します。`status` を `published` にした記事だけが公開されます。

広告案件を掲載する際は、次を確認します。

- ASPの提携承認と媒体登録
- 広告主が指定する表現・禁止キーワード
- 成果地点、否認条件、再訪問期間
- 記事冒頭の広告表示
- 料金・条件の公式ページとの照合

## 30日間の検証目標

- 1週目：公開、ASP申請、比較候補10件の調査
- 2週目：選び方記事2本、個別サービス記事1本
- 3週目：比較記事1本、Search Console登録
- 4週目：表示回数、検索語、離脱箇所から改善

記事数ではなく、公式情報・実測・比較基準が揃ったページを増やします。
