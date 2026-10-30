import { Script, Widget } from 'scripting'
import { TOKEN_KEY, TITLE, KIND, CACHE_KEY, ERROR_KEY } from './config'
import { request, tokenValue } from './api'
try {
 let existing=tokenValue(),change=!existing
 if(existing){const pick=await Dialog.actionSheet({title:TITLE,message:'接続済みです。',cancelButton:true,actions:[{label:'ウィジェットを更新'},{label:'接続コードを変更'}]});if(pick===null||pick<0){Script.exit();}change=pick===1}
 if(change){const raw=await Dialog.prompt({title:TITLE+'を接続',message:'ORBITの設定で、この種類の「接続コード」をコピーして貼り付けてください。',placeholder:'接続コードを貼り付け'});if(!raw){Script.exit();}const code=String(raw).replace(/\s/g,'');if(!new RegExp('^ocw1\\.'+KIND+'\\.[0-9a-f]{64}$').test(code))throw new Error('種類が違うか、コードが正しくありません。ORBITの設定からコピーし直してください。');const view=await request({action:'view'},code);if(!Keychain.set(TOKEN_KEY,code,{accessibility:'first_unlock_this_device'}))throw new Error('接続コードを保存できませんでした。');Storage.set(CACHE_KEY,view);Storage.remove(ERROR_KEY)}
 Widget.reloadAll()
 await Dialog.alert({title:TITLE+'の準備完了',message:'ホーム画面でScriptingのウィジェットを追加し、このスクリプトを選んでください。一覧の□を押すと、アプリを開かず完了を記録できます。'})
} catch(error){await Dialog.alert({title:'接続を確認してください',message:String((error as Error).message||'接続できませんでした。')})}
Script.exit()
