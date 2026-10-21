import { env } from 'cloudflare:workers';
export function sameOrigin(request: Request) { return request.headers.get('origin') === new URL(request.url).origin; }
function secret() { return (env as unknown as {ADMIN_PASSWORD?:string}).ADMIN_PASSWORD || ''; }
async function digest(value:string) { return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))); }
export async function matches(value:string) { if(!secret()) return false; const a=await digest(value), b=await digest(secret()); let difference=0; for(let i=0;i<a.length;i++) difference|=a[i]^b[i]; return difference===0; }
async function sign(value:string) { const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['sign']); return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value))),n=>n.toString(16).padStart(2,'0')).join(''); }
export async function session() { const expiry=String(Date.now()+8*60*60*1000); return expiry+'.'+await sign(expiry); }
export async function isAdmin(request:Request) { if(!secret()) return false; const cookie=request.headers.get('cookie')||''; const token=cookie.match(/(?:^|;\s*)market_admin=([^;]+)/)?.[1]||''; const [expiry,signature]=token.split('.'); if(!expiry||!signature||Number(expiry)<Date.now()) return false; return signature===await sign(expiry); }
export function fail(message:string,status=400) { return Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}}); }
