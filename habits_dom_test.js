// DOM-level interaction tests; this does not claim visual or real-device coverage.
const { JSDOM } = require('jsdom'), fs = require('node:fs'), assert = require('node:assert/strict');
(async () => {
  const dom = new JSDOM(fs.readFileSync(__dirname + '/index.html', 'utf8'), { url: 'https://bloom-test.invalid', runScripts: 'outside-only' });
  const w = dom.window, d = w.document;
  await new Promise(resolve => d.addEventListener('DOMContentLoaded', resolve));
  let interval, now = '2026-09-16T12:00:00+08:00', viewDate = '2026-09-16';
  const RealDate = w.Date;
  w.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return +new RealDate(now); } };
  w.setInterval = fn => { interval = fn; return 1; }; w.scrollTo = () => {}; w.confirm = () => true;
  Object.defineProperty(w, 'innerWidth', { value: 390 });
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  w.I18n = { months: () => Array(12).fill('月'), weekdays: () => Array(7).fill('日'), initUI(){},apply(){},onChange(){} };
  w.English = w.French = { init(){} };
  w.TodoList = { init(){}, setViewDate(date){viewDate = date;}, render(){w.Habits.setDate(viewDate);} };
  w.eval(fs.readFileSync(__dirname + '/js/habits.js', 'utf8'));
  w.eval(fs.readFileSync(__dirname + '/js/app.js', 'utf8') + '\nApp.init();');
  const click = selector => { const el = d.querySelector(selector); assert(el, selector); el.click(); };
  const submit = () => d.getElementById('habit-form').dispatchEvent(new w.Event('submit', {bubbles:true,cancelable:true}));
  assert.equal(d.querySelectorAll('.habit-row').length, 0);
  click('#habit-add'); assert(d.getElementById('habit-editor').open);
  d.getElementById('habit-name').value = '<img src=x onerror=alert(1)>每天运动';
  d.getElementById('habit-note').value = '20 分钟'; submit();
  assert.equal(d.querySelectorAll('.habit-row').length, 1); assert.equal(d.querySelector('.habit-row img'), null);
  click('.habit-check'); assert.equal(d.querySelector('.habit-check').getAttribute('aria-pressed'), 'true');
  click('.habit-check'); assert.equal(d.querySelector('.habit-check').getAttribute('aria-pressed'), 'false');
  click('.habit-check');
  for (const name of ['english','french','todolist']) {
    click('.mobile-top-nav [data-module='+name+']');
    assert.equal(d.querySelector('.module.active').id, 'module-'+name);
    assert.equal(d.querySelector('.mobile-top-nav [aria-current=page]').dataset.module, name);
  }
  click('#bn-sync'); assert.equal(d.getElementById('sync-modal-overlay').hidden,false); click('#sync-modal-close');
  click('.habit-manage-row button:last-child'); assert.equal(d.querySelectorAll('.habit-row').length,0);
  click('.habit-manage-row button:last-child'); assert.equal(d.querySelector('.habit-check').getAttribute('aria-pressed'),'true');
  w.Habits.setDate('2026-09-17'); assert(d.querySelector('.habit-check').disabled);
  w.Habits.setDate('2026-09-16');
  now = '2026-09-17T12:00:00+08:00'; interval();
  assert.equal(viewDate,'2026-09-17'); assert.equal(d.querySelector('.habit-check').getAttribute('aria-pressed'),'false');
  assert.equal(w.localStorage.getItem('bloom_todos_v2'),null);
  dom.window.close();
  console.log('PASS DOM add/check/undo/archive/resume, escaped user text, date switching, midnight rollover, page nav, sync entry; no real-browser layout coverage');
})().catch(e=>{console.error(e);process.exitCode=1;});
