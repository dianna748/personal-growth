/* Bloom · browser push notifications (PWA + Supabase Edge Functions) */
const BloomNotifications = (function () {
  'use strict';

  var registration = null;

  function supported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  function cfg() {
    return (window.Sync && Sync.getConfig && Sync.getConfig()) || null;
  }

  function headers(config) {
    var h = {
      'apikey': config.anonKey,
      'Content-Type': 'application/json',
      'x-client-info': 'bloom-sync/' + config.syncCode
    };
    if (config.anonKey && config.anonKey.indexOf('eyJ') === 0) h.Authorization = 'Bearer ' + config.anonKey;
    return h;
  }

  function functionUrl(config, name) {
    return config.url.replace(/\/+$/, '') + '/functions/v1/' + name;
  }

  function decodeKey(value) {
    var padding = '='.repeat((4 - value.length % 4) % 4);
    var base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(base64);
    return Uint8Array.from(raw, function (c) { return c.charCodeAt(0); });
  }

  async function getPublicKey(config) {
    var response = await fetch(functionUrl(config, 'bloom-push-config'), { headers: headers(config) });
    if (!response.ok) throw new Error('push config ' + response.status);
    var data = await response.json();
    if (!data.publicKey) throw new Error('missing VAPID public key');
    return data.publicKey;
  }

  async function registerWorker() {
    if (!supported()) throw new Error('unsupported');
    registration = await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
    await navigator.serviceWorker.ready;
    return registration;
  }

  async function sendSubscription(config, subscription, action) {
    var response = await fetch(functionUrl(config, 'bloom-push-subscribe'), {
      method: 'POST',
      headers: headers(config),
      body: JSON.stringify({
        action: action || 'subscribe',
        subscription: subscription ? subscription.toJSON() : null,
        endpoint: subscription ? subscription.endpoint : '',
        userAgent: navigator.userAgent
      })
    });
    if (!response.ok) throw new Error('subscription ' + response.status);
    return response.json();
  }

  async function currentSubscription() {
    if (!registration) await registerWorker();
    return registration.pushManager.getSubscription();
  }

  async function subscribe() {
    var config = cfg();
    if (!config || !config.enabled || !config.url || !config.anonKey || !config.syncCode) {
      throw new Error('sync-required');
    }
    var permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('permission-' + permission);
    await registerWorker();
    var existing = await registration.pushManager.getSubscription();
    var subscription = existing;
    if (!subscription) {
      var publicKey = await getPublicKey(config);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(publicKey)
      });
    }
    await sendSubscription(config, subscription, 'subscribe');
    return subscription;
  }

  async function unsubscribe() {
    var config = cfg();
    var subscription = await currentSubscription();
    if (!subscription) return;
    if (config && config.enabled) await sendSubscription(config, subscription, 'unsubscribe');
    await subscription.unsubscribe();
  }

  async function refreshUI() {
    var enable = document.getElementById('push-enable');
    var disable = document.getElementById('push-disable');
    var status = document.getElementById('push-status');
    if (!enable || !disable || !status) return;
    if (!supported()) {
      enable.disabled = true;
      status.textContent = '当前浏览器不支持后台推送';
      return;
    }
    try {
      var subscription = await currentSubscription();
      var active = !!subscription && Notification.permission === 'granted';
      enable.hidden = active;
      disable.hidden = !active;
      status.textContent = active ? '已开启（关闭页面后仍可提醒）' :
        (Notification.permission === 'denied' ? '通知已被浏览器阻止，请在网站设置中允许' : '未开启');
    } catch (e) {
      status.textContent = '通知状态暂时无法读取';
    }
  }

  function init() {
    var enable = document.getElementById('push-enable');
    var disable = document.getElementById('push-disable');
    if (!enable || !disable) return;
    registerWorker().catch(function () {});
    refreshUI();
    enable.addEventListener('click', function () {
      enable.disabled = true;
      subscribe().then(function () {
        App.toast('网页提醒已开启', 'success');
        refreshUI();
      }).catch(function (e) {
        if (e.message === 'sync-required') App.toast('请先保存并启用多设备同步配置', 'warn');
        else if (e.message.indexOf('permission-') === 0) App.toast('浏览器没有获得通知权限', 'warn');
        else App.toast('提醒服务尚未完成后台配置，请稍后再试', 'warn');
        refreshUI();
      }).finally(function () { enable.disabled = false; });
    });
    disable.addEventListener('click', function () {
      disable.disabled = true;
      unsubscribe().then(function () {
        App.toast('网页提醒已关闭', 'info');
        refreshUI();
      }).catch(function () { App.toast('关闭提醒失败，请重试', 'warn'); })
        .finally(function () { disable.disabled = false; });
    });
  }

  return { init: init, subscribe: subscribe, unsubscribe: unsubscribe, supported: supported };
})();

window.BloomNotifications = BloomNotifications;

