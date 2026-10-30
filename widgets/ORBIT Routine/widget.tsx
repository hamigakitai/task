import { VStack, HStack, Text, Image, Spacer, Button, Widget, Script } from 'scripting'
import { load } from './api'
import { TITLE, KIND } from './config'
import { SetCheck, Page, Refresh } from './app_intents'
const {view,offline,message}=await load()
const limit=Widget.family==='systemLarge'?5:2,total=view?.items.length||0,pages=Math.max(1,Math.ceil(total/limit)),page=Math.min(Storage.get<number>('orbit-page')||0,pages-1),items=view?.items.slice(page*limit,(page+1)*limit)||[]
function Display(){return <VStack alignment="leading" spacing={8} widgetBackground="#F6F8F4">
 <HStack><VStack alignment="leading" spacing={2}><Text font="headline" foregroundStyle="#173F36">{TITLE}</Text><Text font="caption2" foregroundStyle="secondaryLabel">{view?.date?.replace(/-/g,'/')||'接続待ち'}</Text></VStack><Spacer/><Button intent={Refresh(undefined)} title="更新" systemImage="arrow.clockwise" buttonStyle="plain" /></HStack>
 {items.map(item=><Button key={item.id} intent={SetCheck({id:item.id,date:item.date,done:!item.done,version:item.version})} buttonStyle="plain" disabled={offline}>
  <HStack spacing={7} alignment="top"><Image systemName={item.done?'checkmark.square.fill':'square'} foregroundStyle={item.done?'#315C49':'secondaryLabel'} font="title3"/><VStack alignment="leading" spacing={2}><Text font="subheadline" lineLimit={2} foregroundStyle={item.done?'secondaryLabel':'label'}>{item.title}</Text><Text font="caption2" foregroundStyle="secondaryLabel">{item.subject||item.group||''}{item.originDate&&item.originDate!==item.date?' · '+item.originDate.slice(5).replace('-','/')+'から':''}</Text></VStack><Spacer/></HStack>
 </Button>)}
 {!items.length?<Text font="caption" foregroundStyle="secondaryLabel">{view?'表示する項目はありません。':'Scriptingでこのウィジェットを実行し、接続コードを設定してください。'}</Text>:null}
 <Spacer minLength={0}/>
 {message?<Text font="caption2" foregroundStyle="systemOrange" lineLimit={2}>{message}</Text>:null}
 <HStack><Text font="caption2" foregroundStyle="secondaryLabel">{offline?'未接続・チェック不可':`${view?.items.filter(i=>i.done).length||0} / ${total} 完了`}</Text><Spacer/>{pages>1?<Button intent={Page({page:(page+1)%pages})} title={`${page+1}/${pages} 次へ`} buttonStyle="plain" font="caption2"/>:null}</HStack>
 </VStack>}
Widget.present(<Display/>,{policy:'after',date:new Date(Date.now()+5*60000)})
Script.exit()
