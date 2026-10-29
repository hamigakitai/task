import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {widgetHandler} from './handler.js';
const db=createClient(Deno.env.get('SUPABASE_URL')||'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
Deno.serve(widgetHandler(db));