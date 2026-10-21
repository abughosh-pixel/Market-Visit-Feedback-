import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {isAdmin,sameOrigin,fail} from '../../../lib/security';
const observations=z.object({availability:z.string().trim().min(1).max(5000),presence:z.string().trim().min(1).max(5000),activation:z.string().trim().min(1).max(5000),pricing:z.string().trim().min(1).max(5000),quality:z.string().trim().min(1).max(5000)});
const schema=z.object({id:z.string().uuid(),visitor:z.string().trim().min(2).max(200),department:z.string().trim().min(1).max(150),country:z.string().trim().min(1).max(100),location:z.string().trim().min(1).max(200),visitDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),visitTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),areas:z.string().trim().min(1).max(1000),stores:z.string().trim().min(1).max(2000),accompanied:z.enum(['Yes','No']),salesperson:z.string().max(200),salesTitle:z.string().max(200),evaluation:z.record(z.string().max(1000)),observations,leads:z.string().max(5000),ownerEngaged:z.enum(['Yes','No']),ownerFeedback:z.string().max(5000),conclusion:z.string().trim().min(1).max(5000),action:z.string().max(2000),priority:z.enum(['Routine','Follow up','Urgent'])});
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request) { if(!await isAdmin(request))return fail('Please sign in to the response workspace.',401); const result=await env.DB!.prepare('SELECT * FROM visits ORDER BY created_at DESC LIMIT 2001').all(); return Response.json({visits:result.results.slice(0,2000),hasMore:result.results.length>2000},{headers}); }
export async function POST(request:Request) {
 if(!sameOrigin(request))return fail('Please submit your visit from this website.',403);
 if(Number(request.headers.get('content-length')||0)>23*1024*1024)return fail('Please keep photos below 20 MB in total.',413);
 let form:FormData; try{form=await request.formData()}catch{return fail('We could not read the report. Please try again.')}
 let input; try{input=JSON.parse(String(form.get('report')))}catch{return fail('The report could not be read.')}
 const parsed=schema.safeParse(input); if(!parsed.success)return fail('Please complete all required fields and use a valid visit date and time.'); const data=parsed.data;
 const visitDay=new Date(data.visitDate+'T00:00:00Z'); if(Number.isNaN(visitDay.getTime())||visitDay.toISOString().slice(0,10)!==data.visitDate)return fail('Please select a valid visit date.'); const today=new Date(Date.now()+14*60*60*1000).toISOString().slice(0,10); if(data.visitDate>today)return fail('The visit date cannot be in the future.');
 if(data.accompanied==='Yes'&&(!data.salesperson.trim()||!data.salesTitle.trim()||['Attire','Behavior','Car condition','Cleanliness','Tools'].some(k=>!data.evaluation[k]?.trim())))return fail('Please complete the salesperson details and evaluation.');
 if(data.ownerEngaged==='Yes'&&!data.ownerFeedback.trim())return fail('Please add the store owner’s feedback.');
 if(data.accompanied==='No'){data.salesperson='';data.salesTitle='';data.evaluation={}} if(data.ownerEngaged==='No')data.ownerFeedback='';
 const existing=await env.DB!.prepare('SELECT id FROM visits WHERE id=?').bind(data.id).first(); if(existing)return Response.json({id:data.id,saved:true},{headers});
 const groups=['availability','presence','activation','pricing','quality','leads']; const files:{file:File;group:string;key:string}[]=[];
 let total=0;
 for(const [group,value] of form.entries()) {if(group==='report')continue; if(!groups.includes(group)||!(value instanceof File))return fail('An attachment is not supported.'); if(value.size===0)continue; total+=value.size; if(value.size>5*1024*1024||total>20*1024*1024)return fail('Photos must be under 5 MB each and 20 MB in total.',413);const bytes=new Uint8Array(await value.slice(0,12).arrayBuffer());const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';if(!(jpg||png||webp))return fail('Use JPG, PNG or WebP photos.'); const ext=jpg?'jpg':png?'png':'webp';files.push({file:value,group,key:`visits/${data.id}/${group}-${crypto.randomUUID()}.${ext}`}); }
 if(files.length>12||groups.some(g=>files.filter(f=>f.group===g).length>3))return fail('Add up to 3 photos per topic and 12 photos per visit.');
 const saved:string[]=[];const photos:{key:string;group:string;name:string}[]=[];
 try{for(const item of files){await env.BUCKET!.put(item.key,await item.file.arrayBuffer(),{httpMetadata:{contentType:item.key.endsWith('.jpg')?'image/jpeg':item.key.endsWith('.png')?'image/png':'image/webp'}});saved.push(item.key);photos.push({key:item.key,group:item.group,name:item.file.name.slice(0,200)})}
 await env.DB!.prepare('INSERT INTO visits (id,created_at,visitor,country,department,visit_date,payload,photos) VALUES (?,?,?,?,?,?,?,?)').bind(data.id,new Date().toISOString(),data.visitor,data.country,data.department,data.visitDate,JSON.stringify(data),JSON.stringify(photos)).run();
 return Response.json({id:data.id,saved:true},{status:201,headers});
 }catch(error){await Promise.allSettled(saved.map(key=>env.BUCKET!.delete(key)));const existing=await env.DB!.prepare('SELECT id FROM visits WHERE id=?').bind(data.id).first();if(existing)return Response.json({id:data.id,saved:true},{headers}); console.error('Visit could not be saved',error instanceof Error?error.name:'unknown'); return fail('Your visit was not saved. Your answers are still here; please try again.',503)}
}
