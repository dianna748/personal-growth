/*
  Bloom V12 · Per-text language font annotator
  不把整页切换为中文字体；仅给实际出现的中文字符和中文标点包上 .font-zh。
*/
(function () {
  'use strict';

  var CJK_RE = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3000-\u303F\uFF01-\uFF60]/;
  var SKIP_TAGS = { SCRIPT: true, STYLE: true, NOSCRIPT: true, TEMPLATE: true, SVG: true };
  var TITLE_SELECTOR = 'h1, h2, h3, .module-title, .section-title, .dash-section-title, .heatmap-title, .article-title, .vocab-title, .panel-sub-title, .date-group-date, .empty-title, .expression-word, .fc-word, .reading-title, .grammar-title';

  function hasCjk(value) {
    return CJK_RE.test(value || '');
  }

  function shouldSkipText(node) {
    var parent = node && node.parentElement;
    if (!parent) return true;
    if (SKIP_TAGS[parent.tagName]) return true;
    if (parent.closest('[data-font-language="zh"]')) return true;
    if (parent.closest('[data-font-language="processed"]')) return true;
    if (parent.closest('[contenteditable="true"]')) return true;
    return false;
  }

  function wrapChineseText(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || shouldSkipText(node)) return;
    var value = node.nodeValue;
    if (!hasCjk(value)) return;

    var fragment = document.createDocumentFragment();
    var parts = value.split(/([\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3000-\u303F\uFF01-\uFF60]+)/g);
    parts.forEach(function (part) {
      if (!part) return;
      if (hasCjk(part)) {
        var span = document.createElement('span');
        span.className = 'font-zh';
        span.setAttribute('data-font-language', 'zh');
        span.textContent = part;
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });
    node.parentNode.replaceChild(fragment, node);
  }

  function annotate(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      wrapChineseText(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || SKIP_TAGS[root.tagName]) return;
    if (root.matches('[data-font-language="zh"]')) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    var current;
    while ((current = walker.nextNode())) nodes.push(current);
    nodes.forEach(wrapChineseText);
  }

  function updateFieldFont(field) {
    if (!field || !/^(INPUT|TEXTAREA)$/.test(field.tagName)) return;
    var value = field.value || '';
    var placeholder = field.getAttribute('placeholder') || '';
    field.classList.toggle('font-field-zh', value ? hasCjk(value) : false);
    field.classList.toggle('font-placeholder-zh', !value && hasCjk(placeholder));
  }

  function updateFields(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
    if (root.matches('input, textarea')) updateFieldFont(root);
    root.querySelectorAll('input, textarea').forEach(updateFieldFont);
  }

  function markChineseHeadings(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
    var headings = [];
    if (root.matches(TITLE_SELECTOR)) headings.push(root);
    root.querySelectorAll(TITLE_SELECTOR).forEach(function (heading) { headings.push(heading); });
    headings.forEach(function (heading) {
      heading.classList.toggle('has-zh-title', hasCjk(heading.textContent || ''));
    });
  }

  function init() {
    annotate(document.body);
    updateFields(document.body);
    markChineseHeadings(document.body);

    document.addEventListener('input', function (event) {
      updateFieldFont(event.target);
    }, true);

    var observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          annotate(node);
          updateFields(node);
          if (node.nodeType === Node.ELEMENT_NODE) markChineseHeadings(node);
          if (record.target && record.target.nodeType === Node.ELEMENT_NODE) markChineseHeadings(record.target);
        });
        if (record.type === 'attributes' && record.target) updateFieldFont(record.target);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['placeholder', 'value']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
