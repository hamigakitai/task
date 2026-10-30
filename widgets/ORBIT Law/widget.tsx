import { VStack, HStack, Text, Image, Spacer, Button, Widget, Script } from 'scripting'
import { load } from './api'
import { TITLE } from './config'
import { SetCheck, Page, Refresh } from './app_intents'
import { widgetLayout } from './layout'
async function main() {
 const {view,offline,message}=await load();
 const layout=widgetLayout(Widget.family,Widget.displaySize,!!message);
 const total=view?.items.length||0,pages=Math.max(1,Math.ceil(total/layout.limit));
 const savedPage=Number(Storage.get<number>('orbit-page'))||0;
 const page=Math.max(0,Math.min(Math.floor(savedPage),pages-1));
 const items=view?.items.slice(page*layout.limit,(page+1)*layout.limit)||[];
 function Display(){return <VStack alignment="leading" spacing={6} widgetBackground="#F6F8F4" frame={{maxWidth:'infinity',maxHeight:'infinity',alignment:'topLeading'}}>
  <HStack spacing={4}><Text font="caption" lineLimit={1} foregroundStyle="#173F36">{TITLE}</Text><Spacer minLength={0}/><Text font="caption2" lineLimit={1} foregroundStyle="secondaryLabel">{view?.date?.slice(5).replace('-','/')||'未接続'}</Text></HStack>
  {items.map(item=><Button key={item.id} intent={SetCheck({id:item.id,date:item.date,done:!item.done,version:item.version})} buttonStyle="plain" disabled={offline} frame={{maxWidth:'infinity',alignment:'leading'}}>
   <HStack spacing={6} alignment="top" frame={{maxWidth:'infinity',alignment:'leading'}}>
    <Image systemName={item.done?'checkmark.square.fill':'square'} foregroundStyle={item.done?'#315C49':'secondaryLabel'} font="body" frame={{width:20,height:20}}/>
    <VStack alignment="leading" spacing={2} frame={{minWidth:0,maxWidth:'infinity',alignment:'leading'}}>
     <Text font="caption" lineLimit={layout.titleLines} foregroundStyle={item.done?'secondaryLabel':'label'} frame={{maxWidth:'infinity',alignment:'leading'}}>{layout.compactRows?[(item.subject||item.group),item.title].filter(Boolean).join(' · '):item.title}</Text>
     {!layout.compactRows?<Text font="caption2" lineLimit={1} foregroundStyle="secondaryLabel">{item.subject||item.group||''}{item.originDate&&item.originDate!==item.date?' · '+item.originDate.slice(5).replace('-','/')+'から':''}</Text>:null}
    </VStack>
   </HStack>
  </Button>)}
  {!items.length?<Text font="caption" lineLimit={layout.titleLines} foregroundStyle="secondaryLabel">{view?'表示する項目はありません':'Scriptingで接続してください'}</Text>:null}
  <Spacer minLength={0}/>
  {message?<Text font="caption2" lineLimit={1} foregroundStyle="systemOrange">{message}</Text>:null}
  <HStack spacing={5}>
   <Text font="caption2" lineLimit={1} foregroundStyle="secondaryLabel">{offline?'未接続':`${view?.items.filter(i=>i.done).length||0}/${total}`}</Text>
   <Spacer minLength={0}/>
   <Button intent={Refresh(undefined)} title="更新" buttonStyle="plain" font="caption2"/>
   {pages>1?<Button intent={Page({page:(page+1)%pages})} title={`${page+1}/${pages} ›`} buttonStyle="plain" font="caption2"/>:null}
  </HStack>
 </VStack>}
 Widget.present(<Display/>,{policy:'after',date:new Date(Date.now()+5*60000)});
 Script.exit();
}
main();
