import { ENDPOINT, KIND, TOKEN_KEY, CACHE_KEY, ERROR_KEY } from './config'
export type Item = { id: string; title: string; subject?: string; group?: string; date: string; originDate?: string; done: boolean; version: string }
export type Snapshot = { kind: string; date: string; generatedAt: string; updatedAt: string; items: Item[] }
export function tokenValue(): string { return Keychain.get(TOKEN_KEY) || '' }
export function errorText(code: string): string { return ({connection:'ORBITの設定で接続コードを作り直してください。',scope:'別のウィジェットの接続コードです。',sync_first:'ORBITで一度同期してください。',day_changed:'日付が変わりました。更新してからチェックしてください。',item_changed:'内容が変わりました。更新してからチェックしてください。',retry:'ほかの端末の更新中です。もう一度お試しください。'} as Record<string,string>)[code] || '通信できませんでした。チェックは変更していません。' }
export async function request(input: object, code = tokenValue()): Promise<Snapshot> {
 if (!new RegExp('^ocw1\\.'+KIND+'\\.[0-9a-f]{64}$').test(code)) throw new Error('このウィジェットの接続コードを設定してください。')
 const response = await fetch(ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json','x-orbit-widget':code}, body:JSON.stringify({...input,kind:KIND}), timeout:15 })
 const data = await response.json()
 if (!response.ok) throw new Error(errorText(data.error))
 if (data.kind !== KIND || !Array.isArray(data.items)) throw new Error('表示内容を確認できませんでした。')
 return data as Snapshot
}
export async function load(): Promise<{view:Snapshot|null;offline:boolean;message:string}> {
 try { const view=await request({action:'view'});Storage.set(CACHE_KEY,view);const message=Storage.get<string>(ERROR_KEY)||'';return {view,offline:false,message} }
 catch(error) { return {view:Storage.get<Snapshot>(CACHE_KEY),offline:true,message:String((error as Error).message||'接続できませんでした。')} }
}
