# 画像アセットについて

このフォルダに以下の画像を追加すると、サイトに反映されます。

## 1. hero-ezo-deer.jpg（設定済み）
現在、ChatGPTで生成されたエゾシカ画像を使用中です。

今後、実写真（自撮影・プロカメラマン・ロイヤリティフリー素材サイト等）に差し替えたい場合は、同じファイル名で上書きするか、index.html内の `--hero-photo` の参照先を変更してください。差し替え時は `--hero-photo-position` （顔・角の位置合わせ用）も合わせて調整することをおすすめします。

**推奨スペック（今後差し替える場合）**：横1920px以上、横長（16:9程度）

## 2. logo.png（設定済み）
鹿の頭部モチーフ＋"EZO HAZEL ORCHARD"の文字が入ったロゴ画像を使用中です（背景透過PNG）。ヒーロー部分のタイトル表示をこの画像に差し替えています。

**差し替える場合**：同じファイル名（`logo.png`）で上書きするか、index.html内の `<img class="logo-mark" src="assets/logo.png">` の参照先を変更してください。表示サイズは `.logo-mark` の `width` で調整できます。

## 3. og-image.jpg（任意・SNS共有用）
X（Twitter）やFacebook、LINEなどでURLをシェアした際に表示されるプレビュー画像。hero-ezo-deer.jpgが決まったら、それを1200×630px程度にトリミングしたものをこの名前で置くと、SNSでの見栄えが良くなります。

## 4. favicon（設定済み）
ブラウザタブ・ブックマーク・スマホのホーム画面アイコン用。金色の背景に白い鹿のシルエットのロゴから生成しています。

- `/favicon.ico`（サイトのルート直下。16/32/48pxのマルチサイズ）
- `assets/favicon-32x32.png` / `assets/favicon-16x16.png`
- `assets/apple-touch-icon.png`（180×180px、iOSのホーム画面追加用）

**差し替える場合**：元画像（正方形、できれば512px以上）を用意し、同様に `.ico`・各PNGサイズを書き出してください。

## 5. about-orchard.jpg（about.htmlで使用・設定済み）
ChatGPTで生成した、目指す果樹園のイメージ画像（街と山の間に果樹園を配置するイメージ）。About / Storyページ（`about.html`）のヒーロー背景に使用しています。実際の自社圃場の写真ではなく、将来像のイメージであることに留意してください。

差し替える場合は、同じファイル名で上書きするか、about.html内の `--about-photo` の参照先を変更してください。`--about-photo-position` で焦点位置を調整できます。

## 6. about-og-image.jpg（about.htmlのSNS共有用）
about.htmlをSNSでシェアした際のプレビュー画像。about-orchard.jpgを1200×630pxにトリミングしたものです。
