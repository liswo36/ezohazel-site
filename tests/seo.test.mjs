// 検索エンジン向けの基盤（robots.txt・sitemap.xml・canonical・404.html）の検査。
// 実行：リポジトリの直下で `node --test`（Node 22・依存なし）
// 仕様と背景：プロジェクト資料 claude/ezohazel-site-seo.md
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://ezohazel.com/';
const read = (name) => readFileSync(join(ROOT, name), 'utf8');

// 公開するページ（404.html は除く）。Cloudflare Pages のクリーンURLにより、
// index.html → /、about.html → /about が正規URLになる。
const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== '404.html');
const expectedUrl = (file) => (file === 'index.html' ? BASE : `${BASE}${file.replace(/\.html$/, '')}`);

const sitemapLocs = () => [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

test('公開するページが1つ以上ある', () => {
  assert.ok(pages.includes('index.html'));
  assert.ok(pages.length >= 2);
});

test('robots.txt：全許可で、sitemap の絶対URLを示す', () => {
  assert.ok(existsSync(join(ROOT, 'robots.txt')), 'robots.txt がない');
  const txt = read('robots.txt');
  assert.match(txt, /^User-agent:\s*\*\s*$/m);
  assert.match(txt, /^Allow:\s*\/\s*$/m);
  assert.doesNotMatch(txt, /^Disallow:\s*\/\s*$/m, 'サイト全体を拒否してはいけない');
  assert.match(txt, new RegExp(`^Sitemap:\\s*${BASE}sitemap\\.xml\\s*$`, 'm'));
});

test('sitemap.xml：正規URLだけを、過不足なく載せる', () => {
  assert.ok(existsSync(join(ROOT, 'sitemap.xml')), 'sitemap.xml がない');
  const xml = read('sitemap.xml');
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  const locs = sitemapLocs();
  assert.deepEqual([...locs].sort(), pages.map(expectedUrl).sort());
  for (const loc of locs) {
    assert.ok(loc.startsWith(BASE), `${loc} は ${BASE} で始まる必要がある`);
    assert.doesNotMatch(loc, /\.html$/, `${loc} に .html を付けない`);
    assert.doesNotMatch(loc, /\/\/www\./, `${loc} に www を使わない`);
  }
});

for (const file of pages) {
  test(`${file}：canonical が1つだけで、正規URLと一致し、sitemap に載っている`, () => {
    const html = read(file);
    const tags = [...html.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi)].map((m) => m[0]);
    assert.equal(tags.length, 1, 'canonical は1つだけ');
    const href = tags[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
    assert.equal(href, expectedUrl(file));
    assert.ok(existsSync(join(ROOT, 'sitemap.xml')), 'sitemap.xml がない');
    assert.ok(sitemapLocs().includes(href), 'canonical が sitemap にない');
  });

  test(`${file}：検索に出る（robots の meta に noindex がない）`, () => {
    const metas = [...read(file).matchAll(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi)].map((m) => m[0]);
    for (const m of metas) assert.doesNotMatch(m, /noindex/i);
  });

  // OGP：X・Facebook・LINE は画像に絶対URLを求める（資料 claude/ezohazel-site-seo.md の 4）
  const metaContent = (html, attr, key) => {
    const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
      .map((m) => m[0])
      .find((t) => new RegExp(`\\b${attr}=["']${key}["']`, 'i').test(t));
    return tag?.match(/\bcontent=["']([^"']*)["']/i)?.[1];
  };

  test(`${file}：og:image が絶対URLで、指す画像がリポジトリにある`, () => {
    const img = metaContent(read(file), 'property', 'og:image');
    assert.ok(img, 'og:image がない');
    assert.ok(img.startsWith(BASE), `${img} は ${BASE} で始まる必要がある`);
    assert.ok(existsSync(join(ROOT, img.slice(BASE.length))), `${img} の実体がない`);
  });

  test(`${file}：og:url が canonical と一致する`, () => {
    assert.equal(metaContent(read(file), 'property', 'og:url'), expectedUrl(file));
  });

  test(`${file}：twitter:card が summary_large_image`, () => {
    assert.equal(metaContent(read(file), 'name', 'twitter:card'), 'summary_large_image');
  });
}

test('404.html：存在しないURLを 404 にする（Pages の SPA 扱いをやめる）', () => {
  assert.ok(existsSync(join(ROOT, '404.html')), '404.html がない');
  const html = read('404.html');
  assert.match(html, /<html lang="ja">/);
  assert.match(html, /<meta\b[^>]*\bname=["']robots["'][^>]*noindex/i);
  assert.match(html, /<a\b[^>]*\bhref=["']\/["']/i, 'トップへのリンクが必要');
  assert.doesNotMatch(html, /rel=["']canonical["']/i, '404 に canonical は付けない');
});
