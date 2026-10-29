// Daily Discipline — Scriptable Home Screen Widget
// 設定：アプリのSettings → ホーム画面ウィジェットで接続コードを作成します。
// Widget parameter: today (default), law, review. This script only reads summaries.
const APP='https://hamigakitai.github.io/task/';
const ENDPOINT='https://vsdewycqxmfuwmacmftq.supabase.co/functions/v1/discipline-widget';
const KEY='daily-discipline.widget.connection.v1';
const fm=FileManager.local(),cachePath=fm.joinPath(fm.documentsDirectory(),'daily-discipline-widget-cache.json');
const mode=['law','review'].includes(String(args.widgetParameter||'').toLowerCase())?String(args.widgetParameter).toLowerCase():'today';
const family=config.widgetFamily||'medium';
const ink=Color.dynamic(new Color('163C30'),new Color('EAF4EE')),muted=Color.dynamic(new Color('6C7F75'),new Color('A2B7AB')),accent=Color.dynamic(new Color('227454'),new Color('8ED6AD'));
const today=()=>new Date(Date.now()+9*3600000).toISOString().slice(0,10);
const clock=v=>{const d=new Date(v);return isNaN(d)?'未同期':new Date(d.getTime()+9*3600000).toISOString().slice(11,16)};
const dateLabel=v=>{const d=new Date(v+'T00:00:00Z');return Number(v.slice(5,7))+'月'+Number(v.slice(8,10))+'日（'+['日','月','火','水','木','金','土'][d.getUTCDay()]+'）'};
function clearCache(){if(fm.fileExists(cachePath))fm.remove(cachePath)}
async function loadSummary(code){const r=new Request(ENDPOINT);r.method='GET';r.headers={'x-widget-token':code};r.timeoutInterval=15;const value=await r.loadJSON();if(r.response.statusCode===401){const e=new Error('接続コードを設定し直してください');e.expired=true;throw e}if(r.response.statusCode!==200||value.version!==1)throw Error('通信できませんでした');return value}
async function setup(){const a=new Alert();a.title='Daily Disciplineに接続';a.message='アプリのSettings → ホーム画面ウィジェットで作成した接続コードを貼り付けてください。';a.addSecureTextField('ddw1.…','');a.addAction('接続する');a.addCancelAction('キャンセル');if(await a.presentAlert()<0)return false;const code=a.textFieldValue(0).trim();if(!/^ddw1\.[0-9a-f]{64}$/.test(code)){const e=new Alert();e.message='接続コード全体を貼り付けてください。';e.addAction('OK');await e.presentAlert();return false}try{const payload=await loadSummary(code);clearCache();Keychain.set(KEY,code);fm.writeString(cachePath,JSON.stringify({suffix:code.slice(-16),payload}));return true}catch(error){const e=new Alert();e.title='接続できませんでした';e.message=error.expired?'アプリで新しい接続コードを作成してください。':'インターネット接続を確認して、もう一度実行してください。';e.addAction('OK');await e.presentAlert();return false}}
function label(parent,value,size=12,color=ink,bold=false){const t=parent.addText(String(value));t.font=bold?Font.semiboldSystemFont(size):Font.systemFont(size);t.textColor=color;return t}
function baseWidget(title){const w=new ListWidget();w.backgroundColor=Color.dynamic(new Color('F1F5EF'),new Color('14271F'));w.setPadding(15,16,13,16);w.url=mode==='review'?APP+'?view=argument-review':APP;w.refreshAfterDate=new Date(Date.now()+15*60000);const h=w.addStack();h.centerAlignContent();label(h,title,11,accent,true);h.addSpacer();if(family!=='small')label(h,dateLabel(today()),10,muted);w.addSpacer(9);return w}
function taskLine(parent,item,small=false){const row=parent.addStack();row.centerAlignContent();label(row,item.done?'✓':'○',small?11:13,item.done?muted:accent,true);row.addSpacer(7);const prefix=item.time?item.time+' ':'';const t=label(row,prefix+item.title,small?11:12,item.done?muted:ink);t.lineLimit=1;if(item.carryLabel){row.addSpacer(3);const badge=label(row,item.carryLabel==='昨日の分'?'昨日':'未完了',9,muted);badge.lineLimit=1}}
function widget(payload,offline=false,message=''){
 const title=mode==='review'?'ARGUMENT REVIEW':mode==='law'?'LAW EXAM':'TODAY';const w=baseWidget(title);
 if(!payload){label(w,message||'最初に接続してください',family==='small'?13:15,ink,true).lineLimit=2;w.addSpacer(7);label(w,'Scriptableでこのスクリプトを開いて設定',11,muted).lineLimit=2;return w}
 if(payload.date!==today()){label(w,'表示の更新待ち',16,ink,true);w.addSpacer(7);label(w,'通信後に今日の内容を表示します。',11,muted).lineLimit=2;w.addSpacer();label(w,'最終取得 '+dateLabel(payload.date),9,muted);return w}
 if(!payload.connected){label(w,'同期データを待っています',14,ink,true).lineLimit=2;w.addSpacer(6);label(w,'アプリを開いて同期してください',11,muted).lineLimit=2;return w}
 const small=family==='small',large=family==='large'||family==='extraLarge';
 if(mode==='review'){
  label(w,String(payload.reviewDue),small?36:42,accent,true);label(w,'今日の復習',12,ink,true);w.addSpacer(6);label(w,payload.reviewDue?'タップして思い出す練習へ':'今日の復習は完了です',small?10:12,muted).lineLimit=2;
 }else if(mode==='law'){
  const pending=payload.laws.filter(a=>!a.done);label(w,'残り '+pending.length+' 件',small?22:25,accent,true);w.addSpacer(8);const items=(pending.length?pending:payload.laws).slice(0,large?8:small?2:3);for(const a of items){taskLine(w,a,small);w.addSpacer(5)}if(!payload.laws.length)label(w,'今日は予定がありません',11,muted);if(!small){w.addSpacer(4);label(w,'論証の復習 '+payload.reviewDue+' 件',11,accent,true)}
 }else{
  const score=w.addStack();score.centerAlignContent();label(score,payload.completion.percent+'%',small?29:32,accent,true);score.addSpacer(10);const sub=score.addStack();sub.layoutVertically();label(sub,payload.completion.done+' / '+payload.completion.total+' 完了',11,ink,true);label(sub,'論証の復習 '+payload.reviewDue+' 件',small?9:10,muted);w.addSpacer(small?6:9);
  const pending=payload.tasks.filter(t=>!t.done),items=(pending.length?pending:payload.tasks).slice(0,large?7:small?2:3);for(const t of items){taskLine(w,t,small);w.addSpacer(small?4:5)}if(!payload.completion.total)label(w,'今日のタスクはまだありません',11,muted).lineLimit=2;else if(!pending.length)label(w,'今日のタスクをすべて完了',11,accent,true);
  if(large&&payload.deadlines.length){w.addSpacer(10);label(w,'DEADLINES',10,accent,true);w.addSpacer(6);for(const a of payload.deadlines.slice(0,2)){label(w,(a.course?a.course+' · ':'')+a.title,12,ink,true).lineLimit=1;label(w,a.due.slice(5,10).replace('-','/')+' '+(a.due.slice(11,16)||'')+' 提出',10,muted);w.addSpacer(6)}}
 }
 w.addSpacer();const footer=(offline?'保存済み · ':'')+'同期 '+clock(payload.updatedAt)+(small?'':'  /  表示 '+clock(payload.generatedAt));label(w,footer,small?8:9,muted).lineLimit=1;return w;
}
async function main(){
 let code=Keychain.contains(KEY)?Keychain.get(KEY):'';
 if(config.runsInApp){if(!code){if(!await setup())return;code=Keychain.get(KEY)}else{const a=new Alert();a.title='Daily Discipline';a.addAction('ウィジェットをプレビュー');a.addAction('接続コードを設定し直す');a.addAction('アプリを開く');a.addCancelAction('閉じる');const choice=await a.presentSheet();if(choice<0)return;if(choice===1){if(!await setup())return;code=Keychain.get(KEY)}if(choice===2){Safari.open(APP);return}}}
 let payload=null,offline=false,message='接続コードを設定してください';
 if(code){try{payload=await loadSummary(code);fm.writeString(cachePath,JSON.stringify({suffix:code.slice(-16),payload}))}catch(error){if(error.expired){clearCache();message='接続コードを設定し直してください'}else{offline=true;message='通信できませんでした';try{if(fm.fileExists(cachePath)){const cached=JSON.parse(fm.readString(cachePath));if(cached.suffix===code.slice(-16))payload=cached.payload}}catch{}}}}
 const w=widget(payload,offline,message);Script.setWidget(w);if(config.runsInApp)await w.presentMedium();
}
await main();Script.complete();