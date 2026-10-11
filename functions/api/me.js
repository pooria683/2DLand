import { getSessionEmail, json } from '../_auth.js'

export async function onRequestGet({ request, env }) {
  const email = await getSessionEmail(request, env)
  if (!email || !env.SITE_KV) return json({ ok: false })
  const user = await env.SITE_KV.get('user:' + email, 'json')
  if (!user) return json({ ok: false })
  return json({ ok: true, email, firstName: user.firstName, lastName: user.lastName })
}
