// functions/_middleware.js
// کنترل دسترسی بر اساس IP — فقط بازدیدکنندگان ایرانی

/* ═══════════ تنظیمات ═══════════ */
// 'iran-only' → فقط ایران دسترسی دارد، بقیه صفحه‌ی بلاک می‌بینند
// 'open'      → برای همه باز (چک غیرفعال)
const MODE = 'iran-only';

/* ═══════ لیست IPv4 ایران ═══════
   👇 بین دو گیومه‌ی زیر، «کل لیست IPv4» که داری را خط‌به‌خط Paste کن */
const IR_IPV4_RAW = `
2.57.3.0/24
2.144.0.0/14
2.176.0.0/12
5.1.43.0/24
... (بقیه‌ی لیست IPv4 را همین‌جا Paste کن)
`;

/* ═══════ لیست IPv6 ایران ═══════
   👇 کل لیست IPv6 را همین‌جا Paste کن */
const IR_IPV6_RAW = `
2001:678:b0::/46
2001:678:428::/48
2001:67c:c3c::/48
... (بقیه‌ی لیست IPv6 را همین‌جا Paste کن)
`;

/* ═══════ از اینجا به بعد را تغییر نده ═══════ */

/* ---------- ابزارهای IPv4 ---------- */
function v4ToInt(ip) {
  const p = (ip || '').split('.');
  if (p.length !== 4) return null;
  let n = 0;
  for (const s of p) {
    if (!/^\d{1,3}$/.test(s)) return null;
    const v = +s;
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

/* ---------- ابزارهای IPv6 ---------- */
function v6ToBigInt(ip) {
  ip = (ip || '').toLowerCase().trim();
  const zi = ip.indexOf('%');
  if (zi >= 0) ip = ip.slice(0, zi);

  // اگر آخر آدرس IPv4 بود (مثل ::ffff:1.2.3.4)
  const lc = ip.lastIndexOf(':');
  const last = ip.slice(lc + 1);
  if (last.includes('.')) {
    const o = last.split('.');
    if (o.length !== 4) return null;
    const hi = (parseInt(o[0], 10) << 8) | parseInt(o[1], 10);
    const lo = (parseInt(o[2], 10) << 8) | parseInt(o[3], 10);
    ip = ip.slice(0, lc + 1) + hi.toString(16) + ':' + lo.toString(16);
  }

  const dc = ip.split('::');
  let groups;
  if (dc.length === 2) {
    const a = dc[0] === '' ? [] : dc[0].split(':');
    const b = dc[1] === '' ? [] : dc[1].split(':');
    const fill = 8 - a.length - b.length;
    if (fill < 0) return null;
    groups = a.concat(new Array(fill).fill('0'), b);
  } else if (dc.length === 1) {
    groups = ip.split(':');
  } else {
    return null; // بیشتر از یک ::
  }
  if (groups.length !== 8) return null;
  let n = 0n;
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    n = (n << 16n) | BigInt(parseInt(g, 16));
  }
  return n;
}

/* ---------- آماده‌سازی لیست‌ها (یک‌بار در شروع) ---------- */
function buildV4(raw) {
  const out = [];
  for (let line of raw.split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const si = line.indexOf('/');
    if (si < 0) continue;
    const net = v4ToInt(line.slice(0, si));
    const bits = parseInt(line.slice(si + 1), 10);
    if (net === null || !(bits >= 0 && bits <= 32)) continue;
    const mask = bits === 0 ? 0 : ((0xFFFFFFFF << (32 - bits)) >>> 0);
    out.push([net & mask, mask]);
  }
  return out;
}

function buildV6(raw) {
  const out = [];
  for (let line of raw.split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const si = line.indexOf('/');
    if (si < 0) continue;
    const net = v6ToBigInt(line.slice(0, si));
    let bits = BigInt(line.slice(si + 1));
    if (net === null || bits < 0n || bits > 128n) continue;
    const mask = bits === 0n ? 0n : (((1n << bits) - 1n) << (128n - bits));
    out.push([net & mask, mask]);
  }
  return out;
}

const IR4 = buildV4(IR_IPV4_RAW);
const IR6 = buildV6(IR_IPV6_RAW);

/* ---------- چک نهایی: آیا این IP ایرانی است؟ ---------- */
function isIranianIP(ip) {
  if (!ip) return false;
  if (ip.includes(':')) {
    const n = v6ToBigInt(ip);
    if (n === null) return false;
    for (let i = 0; i < IR6.length; i++) {
      if ((n & IR6[i][1]) === IR6[i][0]) return true;
    }
    return false;
  }
  const n = v4ToInt(ip);
  if (n === null) return false;
  for (let i = 0; i < IR4.length; i++) {
    if ((n & IR4[i][1]) === IR4[i][0]) return true;
  }
  return false;
}

/* ---------- صفحه‌ای که به غیرایرانی‌ها نشان داده می‌شود ---------- */
const BLOCK_HTML = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>دسترسی محدود</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0d17;color:#f0f0fa;font-family:Tahoma,sans-serif;text-align:center}
.box{max-width:420px;margin:1rem;padding:2.5rem;background:#181828;border:1px solid #262640;border-radius:16px}
h1{font-size:1.5rem;margin:0 0 .8rem}
p{color:#9a9ab5;line-height:2;margin:0}
</style></head>
<body><div class="box">
<h1>🚫 این سایت فقط از ایران در دسترس است</h1>
<p>لطفاً با IP ایران وارد شوید.</p>
</div></body></html>`;

/* ---------- میان‌افزار اصلی ---------- */
export async function onRequest(context) {
  const { request, next } = context;

  if (MODE !== 'iran-only') return next();

  // راه سریع: خود Cloudflare کشور بازدیدکننده را می‌داند (پایگاه داده‌ی جغرافیایی)
  const country = request.cf && request.cf.country;
  if (country === 'IR') return next();

  // راه دوم: تطبیق با لیست‌هایی که Paste کرده‌ای (پشتیبان)
  const ip = (request.headers.get('cf-connecting-ip') || '').trim();
  if (isIranianIP(ip)) return next();

  // هیچ‌کدام نبود → بلاک
  return new Response(BLOCK_HTML, {
    status: 403,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
