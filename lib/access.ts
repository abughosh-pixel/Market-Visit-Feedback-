import {env} from 'cloudflare:workers';
export const companyDomains=['finehh.com','nuqulgroup.com'];
export function corporateEmail(email:string){const parts=email.trim().toLowerCase().split('@');return parts.length===2&&parts[0].length>0&&companyDomains.includes(parts[1]);}
export function ownerEmail(email:string){const owner=(env as unknown as {OWNER_EMAIL?:string}).OWNER_EMAIL;return !!owner&&email.trim().toLowerCase()===owner.trim().toLowerCase();}
export function verifiedIdentity(request:Request){const id=request.headers.get('oai-authenticated-user-id');const email=request.headers.get('oai-authenticated-user-email');return id&&email?{id,email:email.trim().toLowerCase()}:null;}
export function isOwner(request:Request){const user=verifiedIdentity(request);return !!user&&ownerEmail(user.email);}
export function visitorIdentity(request:Request){const user=verifiedIdentity(request);return user&&(corporateEmail(user.email)||ownerEmail(user.email))?user:null;}
