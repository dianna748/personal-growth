const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/js/sync.js', 'utf8');
class Storage {
  constructor() { this.data = {}; }
  get length() { return Object.keys(this.data).length; }
  key(i) { return Object.keys(this.data)[i]; }
  getItem(k) { return this.data[k] ?? null; }
  setItem(k,v) { this.data[k]=String(v); }
}
(async () => {
  const storage = new Storage(), uploads = [], offsets = [];
  const rows = Array.from({length:1003},(_,i)=>({key:'s_TESTCODE|bloom_habit_day_v1_test_'+String(i).padStart(4,'0'),value:JSON.stringify({done:i!==1002}),updated_at:'2026-09-16T00:00:00Z'}));
  const ctx = vm.createContext({Storage, localStorage:storage, window:{}, module:{exports:{}},setTimeout,clearTimeout,fetch:async(url,opt)=>{
    if(opt.method==='POST'){uploads.push(...JSON.parse(opt.body));return {ok:true};}
    const offset=Number(new URL(url).searchParams.get('offset')); offsets.push(offset);
    return {ok:true,json:async()=>rows.slice(offset,offset+500)};
  }});
  vm.runInContext(source,ctx); const sync=ctx.module.exports;
  sync.saveConfig({url:'https://example.invalid',anonKey:'test',syncCode:'TESTCODE',enabled:true});
  await new Promise(resolve=>sync.init(resolve));
  assert.deepEqual(offsets,[0,500,1000]);
  assert.equal(JSON.parse(storage.getItem('bloom_habit_day_v1_test_1002')).done,false);
  storage.setItem('bloom_habit_day_v1_another_2026-09-16',JSON.stringify({done:true}));
  await sync.manualSync();
  assert(uploads.some(r=>r.key==='s_TESTCODE|bloom_habit_day_v1_another_2026-09-16'));
  assert.equal(JSON.parse(storage.getItem('bloom_habit_day_v1_test_0000')).done,true);
  assert(!uploads.some(r=>r.key.endsWith('bloom_todos_v2')));
  offsets.length=0; await sync.safeFirstSync(); assert.deepEqual(offsets,[0,500,1000]);
  console.log('PASS paginated 1003-row startup/manual/first sync, independent check-ins, explicit undo preserved, no task writes');
})().catch(e=>{console.error(e);process.exitCode=1;});
