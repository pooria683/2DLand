/* هش امن رمز عبور با PBKDF2 — رمز خام هرگز ذخیره نمی‌شود */
export function bytesToHex(bytes) {
  let s = ''
  for (const b of bytes) s += b.toString(16).padStart(2, '0')
  return s
}

export function hexToBytes(hex) {
  const a = new Uint8Array(hex.length / 2)
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return a
}

export function makeSalt() {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
}

export async function hashPassword(password, saltHex) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations: 100000 },
    key, 256
  )
  return bytesToHex(new Uint8Array(bits))
}
