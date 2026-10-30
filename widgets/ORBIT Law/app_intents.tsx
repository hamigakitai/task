import { AppIntentManager, AppIntentProtocol, Widget } from 'scripting'
import { request, Item } from './api'
import { CACHE_KEY, ERROR_KEY } from './config'
export const SetCheck = AppIntentManager.register({
 name:'SetOrbitCheck', protocol:AppIntentProtocol.AppIntent,
 perform:async(input:{id:string;date:string;done:boolean;version:string})=>{
  try { const view=await request({action:'set',...input});Storage.set(CACHE_KEY,view);Storage.remove(ERROR_KEY) }
  catch(error) {Storage.set(ERROR_KEY,String((error as Error).message||'チェックを保存できませんでした。'))}
  Widget.reloadAll()
 }
})
export const Page = AppIntentManager.register({name:'OrbitWidgetPage',protocol:AppIntentProtocol.AppIntent,perform:async(input:{page:number})=>{Storage.set('orbit-page',Math.max(0,input.page));Widget.reloadAll()}})
export const Refresh = AppIntentManager.register({name:'OrbitWidgetRefresh',protocol:AppIntentProtocol.AppIntent,perform:async()=>{Storage.remove(ERROR_KEY);Widget.reloadAll()}})
