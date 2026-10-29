// All routes authenticate explicitly: user JWTs for management, scoped tokens for read-only summaries.
import {buildWidgetSummary} from './summary.js';
const APP_ORIGIN='https://hamigakitai.github.io';
export function widgetHandler(db,{now=()=>new Date(),random=()=>crypto.getRandomValues(new Uint8Array(32)),hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('')}={}){
 return async function(req){
 const origin=req.headers.get('origin'),headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-widget-token','Access-Control-Allow-Methods':'GET, POST, OPTIONS'};
 if(origin===APP_ORIGIN)headers['Access-Control-Allow-Origin']=APP_ORIGIN;
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(origin&&origin!==APP_ORIGIN)return reply({error:'origin_not_allowed'},403);
 if(req.method==='OPTIONS')return reply({ok:true});
 try{
  const clock=now(),stamp=clock.toISOString();
  if(req.method==='GET'){
   const token=req.headers.get('x-widget-token')||'';if(!/^ddw1\.[0-9a-f]{64}$/.test(token))return reply({error:'connection_required'},401);
   const lookup=await db.from('discipline_widget_connections').select('user_id,expires_at,revoked_at').eq('token_hash',await hash(token)).maybeSingle();if(lookup.error)throw Error('db');const link=lookup.data;
   if(!link||link.revoked_at||Date.parse(link.expires_at)<=clock.getTime())return reply({error:'connection_expired'},401);
   const result=await db.from('discipline_sync_documents').select('payload,updated_at').eq('user_id',link.user_id).maybeSingle();if(result.error)throw Error('db');
   const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(clock);
   return reply({...buildWidgetSummary(result.data?.payload,day,result.data?.updated_at,stamp),connected:!!result.data});
  }
  if(req.method!=='POST')return reply({error:'method_not_allowed'},405);
  const jwt=req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];if(!jwt||jwt.length>8192)return reply({error:'sign_in_required'},401);
  const auth=await db.auth.getUser(jwt),owner=auth.data?.user?.id;if(auth.error||!owner)return reply({error:'sign_in_required'},401);
  if(Number(req.headers.get('content-length')||0)>4096)return reply({error:'invalid_input'},400);
  const body=await req.text();if(body.length>4096)return reply({error:'invalid_input'},400);let input;try{input=JSON.parse(body)}catch{return reply({error:'invalid_input'},400)}
  if(!input||typeof input!=='object')return reply({error:'invalid_input'},400);
  if(input.action==='list'){
   const result=await db.from('discipline_widget_connections').select('id,name,created_at,expires_at').eq('user_id',owner).is('revoked_at',null).gt('expires_at',stamp).order('created_at',{ascending:false});if(result.error)throw Error('db');return reply({connections:result.data});
  }
  if(input.action==='create'){
   const name=typeof input.name==='string'?input.name.trim():'';if(!name||name.length>60)return reply({error:'invalid_name'},400);
   const active=await db.from('discipline_widget_connections').select('id',{count:'exact',head:true}).eq('user_id',owner).is('revoked_at',null).gt('expires_at',stamp);if(active.error)throw Error('db');if(active.count>=5)return reply({error:'connection_limit'},409);
   const token='ddw1.'+Array.from(random()).map(b=>b.toString(16).padStart(2,'0')).join(''),expires=new Date(clock.getTime()+90*86400000).toISOString();
   const result=await db.from('discipline_widget_connections').insert({user_id:owner,name,token_hash:await hash(token),expires_at:expires}).select('id,name,expires_at').single();if(result.error)throw Error('db');return reply({connection:result.data,code:token});
  }
  if(input.action==='revoke'){
   if(typeof input.id!=='string'||!/^[0-9a-f-]{36}$/i.test(input.id))return reply({error:'invalid_input'},400);
   const result=await db.from('discipline_widget_connections').update({revoked_at:stamp}).eq('id',input.id).eq('user_id',owner).select('id');if(result.error)throw Error('db');return result.data?.length?reply({ok:true}):reply({error:'not_found'},404);
  }
  return reply({error:'invalid_action'},400);
 }catch{return reply({error:'temporarily_unavailable'},503)}
 };
}