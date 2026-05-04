/**
 * GitHub Pages で SPA の深い URL を開いたとき用に、index.html を 404.html に複製する。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, '..', 'dist')
const indexHtml = path.join(dist, 'index.html')
const notFoundHtml = path.join(dist, '404.html')

if (!fs.existsSync(indexHtml)) {
  console.error('dist/index.html が見つかりません。先に vite build を実行してください。')
  process.exit(1)
}

fs.copyFileSync(indexHtml, notFoundHtml)
console.log('GitHub Pages 用: dist/index.html を dist/404.html にコピーしました。')
