import { games } from '../data/games.js'

/* کلیدهایی که بازی‌ها در localStorage می‌نویسند (مثل behesht_save) */
const PREFIXES = games.map((g) => g.id + '_')

let lastSnapshot = ''
let timer = null
let synced = false

export function isSynced() { return synced }

function collect() {
  const out = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (PREFIXES.some((p) => k.startsWith(p))) out[k] = localStorage.getItem(k)
  }
  return out
}

function writeServerData(data) {
  for (const [k, v] of Object.entries(data || {})) localStorage.setItem(k, v)
  lastSnapshot = JSON.stringify(collect())
}

/* اولین همگام‌سازی بعد از ورود:
   - اکانت سیو ندارد ولی این دستگاه دارد → سیو محلی آپلود می‌شود
   - اکانت سیو دارد → سیو اکانت روی این دستگاه می‌نشیند */
export async function initialSync() {
  try {
    const r = await fetch('/api/saves')
    const d = await r.json()
    if (!d.ok) { synced = true; return false }
    const local = collect()
    const serverEmpty = !d.data || Object.keys(d.data).length === 0
    if (serverEmpty && Object.keys(local).length > 0) {
      lastSnapshot = JSON.stringify(local)
      await fetch('/api/saves', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: local }),
      })
    } else if (!serverEmpty) {
      writeServerData(d.data)
    }
    synced = true
    return true
  } catch {
    return false
  }
}

async function push(force = false) {
  try {
    const snap = JSON.stringify(collect())
    if (!force && snap === lastSnapshot) return
    lastSnapshot = snap
    await fetch('/api/saves', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: collect() }),
    })
  } catch {}
}

export function startAutoSync() {
  if (timer) return
  timer = setInterval(() => push(), 4000)          // هر ۴ ثانیه چک و ارسال
  window.addEventListener('pagehide', () => push(true)) // موقع بستن هم بفرست
}

export function stopAutoSync() {
  if (timer) { clearInterval(timer); timer = null }
}

export { push as pushSaves }
