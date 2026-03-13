(function () {
  'use strict';

  // ── Config from script tag ──────────────────────────────────────────────
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var LANGUAGE = (currentScript.getAttribute('data-language') || 'en').toLowerCase();
  var BRAND = currentScript.getAttribute('data-brand') || 'AI Assistant';
  var PRIMARY = currentScript.getAttribute('data-color') || '#0ea5e9';

  // data-api-base  → builds  {base}/{lang}/chat   (recommended)
  // data-api       → uses the URL as-is            (override / legacy)
  var API_BASE = currentScript.getAttribute('data-api-base');
  var API_URL = API_BASE
    ? API_BASE.replace(/\/$/, '') + '/' + LANGUAGE + '/chat'
    : (currentScript.getAttribute('data-api') || ('http://localhost:5002/api/' + LANGUAGE + '/chat'));

  // ── Prevent double-init ──────────────────────────────────────────────────
  if (window.__cmsWidgetLoaded) return;
  window.__cmsWidgetLoaded = true;

  // ── Styles ───────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#cms-chat-wrap *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    '#cms-chat-wrap{position:fixed;bottom:24px;right:24px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;gap:12px}',
    '#cms-chat-btn{width:54px;height:54px;border-radius:50%;background:' + PRIMARY + ';border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;transition:transform .15s,opacity .15s}',
    '#cms-chat-btn:hover{opacity:.9;transform:scale(1.05)}',
    '#cms-chat-btn svg{width:24px;height:24px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '#cms-chat-panel{width:340px;height:480px;background:#0f172a;border:1px solid #1e293b;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);transition:opacity .2s,transform .2s;transform-origin:bottom right}',
    '#cms-chat-panel.hidden{opacity:0;transform:scale(.92) translateY(16px);pointer-events:none}',
    '#cms-chat-head{background:#1e293b;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155}',
    '#cms-chat-head-left{display:flex;align-items:center;gap:10px}',
    '#cms-chat-avatar{width:32px;height:32px;border-radius:50%;background:rgba(14,165,233,.15);display:flex;align-items:center;justify-content:center}',
    '#cms-chat-avatar svg{width:16px;height:16px;stroke:' + PRIMARY + ';fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '#cms-chat-title{font-size:13px;font-weight:600;color:#f1f5f9}',
    '#cms-chat-subtitle{font-size:11px;color:#64748b}',
    '#cms-chat-close{background:none;border:none;cursor:pointer;padding:4px;color:#64748b;display:flex;align-items:center;justify-content:center;border-radius:6px;transition:color .15s,background .15s}',
    '#cms-chat-close:hover{color:#f1f5f9;background:#334155}',
    '#cms-chat-close svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
    '#cms-chat-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}',
    '#cms-chat-msgs::-webkit-scrollbar{width:4px}',
    '#cms-chat-msgs::-webkit-scrollbar-track{background:transparent}',
    '#cms-chat-msgs::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}',
    '.cms-msg{display:flex;gap:8px;max-width:100%}',
    '.cms-msg.user{flex-direction:row-reverse}',
    '.cms-msg-icon{width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px}',
    '.cms-msg.user .cms-msg-icon{background:rgba(14,165,233,.15);color:' + PRIMARY + '}',
    '.cms-msg.bot .cms-msg-icon{background:rgba(16,185,129,.15);color:#10b981}',
    '.cms-msg-icon svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.cms-msg-body{max-width:82%;display:flex;flex-direction:column;gap:4px}',
    '.cms-msg.user .cms-msg-body{align-items:flex-end}',
    '.cms-bubble{padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word}',
    '.cms-msg.user .cms-bubble{background:' + PRIMARY + ';color:#fff;border-top-right-radius:3px}',
    '.cms-msg.bot .cms-bubble{background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-top-left-radius:3px}',
    '.cms-sources{display:flex;flex-wrap:wrap;gap:4px}',
    '.cms-source-tag{font-size:10px;background:#1e293b;color:#64748b;border:1px solid #334155;padding:2px 7px;border-radius:99px}',
    '.cms-typing{display:flex;align-items:center;gap:4px;padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:12px;border-top-left-radius:3px}',
    '.cms-dot{width:6px;height:6px;border-radius:50%;background:#475569;animation:cms-blink 1.2s infinite}',
    '.cms-dot:nth-child(2){animation-delay:.2s}.cms-dot:nth-child(3){animation-delay:.4s}',
    '@keyframes cms-blink{0%,100%{opacity:.3}50%{opacity:1}}',
    '.cms-error{font-size:12px;color:#f87171;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.2);border-radius:8px;padding:8px 10px}',
    '#cms-chat-foot{padding:10px;border-top:1px solid #1e293b;background:rgba(30,41,59,.5)}',
    '#cms-chat-input-row{display:flex;gap:8px;align-items:flex-end}',
    '#cms-chat-input{flex:1;background:#1e293b;border:1px solid #334155;border-radius:10px;padding:8px 12px;font-size:13px;color:#f1f5f9;resize:none;outline:none;min-height:36px;max-height:80px;transition:border-color .2s;font-family:inherit}',
    '#cms-chat-input:focus{border-color:' + PRIMARY + '}',
    '#cms-chat-input::placeholder{color:#475569}',
    '#cms-send-btn{width:36px;height:36px;flex-shrink:0;background:' + PRIMARY + ';border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s}',
    '#cms-send-btn:disabled{opacity:.4;cursor:not-allowed}',
    '#cms-send-btn svg{width:15px;height:15px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '#cms-chat-hint{font-size:10px;color:#475569;text-align:center;margin-top:6px}'
  ].join('\n');
  document.head.appendChild(style);

  // ── SVG helpers ──────────────────────────────────────────────────────────
  function iconChat() {
    return '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  }
  function iconClose() {
    return '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }
  function iconBot() {
    return '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2" ry="2"/><path d="M12 11V3"/><circle cx="12" cy="3" r="1"/><path d="M8 11V9a4 4 0 0 1 8 0v2"/></svg>';
  }
  function iconUser() {
    return '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  }
  function iconSend() {
    return '<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  }

  // ── Build DOM ────────────────────────────────────────────────────────────
  var wrap = document.createElement('div');
  wrap.id = 'cms-chat-wrap';

  var panel = document.createElement('div');
  panel.id = 'cms-chat-panel';
  panel.className = 'hidden';
  panel.innerHTML = [
    '<div id="cms-chat-head">',
    '  <div id="cms-chat-head-left">',
    '    <div id="cms-chat-avatar">' + iconBot() + '</div>',
    '    <div><div id="cms-chat-title">' + BRAND + '</div><div id="cms-chat-subtitle">Powered by local AI</div></div>',
    '  </div>',
    '  <button id="cms-chat-close">' + iconClose() + '</button>',
    '</div>',
    '<div id="cms-chat-msgs"></div>',
    '<div id="cms-chat-foot">',
    '  <div id="cms-chat-input-row">',
    '    <textarea id="cms-chat-input" placeholder="Ask something..." rows="1"></textarea>',
    '    <button id="cms-send-btn" disabled>' + iconSend() + '</button>',
    '  </div>',
    '  <div id="cms-chat-hint">Answers based on published content</div>',
    '</div>'
  ].join('');

  var toggleBtn = document.createElement('button');
  toggleBtn.id = 'cms-chat-btn';
  toggleBtn.innerHTML = iconChat();
  toggleBtn.setAttribute('aria-label', 'Open chat');

  wrap.appendChild(panel);
  wrap.appendChild(toggleBtn);
  document.body.appendChild(wrap);

  // ── Element refs ─────────────────────────────────────────────────────────
  var msgsEl = document.getElementById('cms-chat-msgs');
  var inputEl = document.getElementById('cms-chat-input');
  var sendBtn = document.getElementById('cms-send-btn');
  var closeBtn = document.getElementById('cms-chat-close');

  // ── State ────────────────────────────────────────────────────────────────
  var isOpen = false;
  var isLoading = false;

  // ── Helpers ──────────────────────────────────────────────────────────────
  function scrollBottom() {
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function appendMessage(role, text, sources) {
    var msgEl = document.createElement('div');
    msgEl.className = 'cms-msg ' + role;

    var iconEl = document.createElement('div');
    iconEl.className = 'cms-msg-icon';
    iconEl.innerHTML = role === 'user' ? iconUser() : iconBot();

    var bodyEl = document.createElement('div');
    bodyEl.className = 'cms-msg-body';

    var bubble = document.createElement('div');
    bubble.className = 'cms-bubble';
    bubble.textContent = text;
    bodyEl.appendChild(bubble);

    if (sources && sources.length) {
      var srcRow = document.createElement('div');
      srcRow.className = 'cms-sources';
      sources.forEach(function (s) {
        var tag = document.createElement('span');
        tag.className = 'cms-source-tag';
        var label = (s.title || '').slice(0, 28) + (s.title && s.title.length > 28 ? '…' : '');
        tag.textContent = s.sourceModel + ': ' + label;
        srcRow.appendChild(tag);
      });
      bodyEl.appendChild(srcRow);
    }

    msgEl.appendChild(iconEl);
    msgEl.appendChild(bodyEl);
    msgsEl.appendChild(msgEl);
    scrollBottom();
    return msgEl;
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'cms-msg bot';
    el.id = 'cms-typing-indicator';
    el.innerHTML = '<div class="cms-msg-icon">' + iconBot() + '</div>'
      + '<div class="cms-typing"><span class="cms-dot"></span><span class="cms-dot"></span><span class="cms-dot"></span></div>';
    msgsEl.appendChild(el);
    scrollBottom();
  }

  function hideTyping() {
    var el = document.getElementById('cms-typing-indicator');
    if (el) el.parentNode.removeChild(el);
  }

  function showError(msg) {
    var el = document.createElement('div');
    el.className = 'cms-error';
    el.textContent = msg;
    msgsEl.appendChild(el);
    scrollBottom();
  }

  // ── Send ─────────────────────────────────────────────────────────────────
  function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || isLoading) return;
    isLoading = true;
    inputEl.value = '';
    sendBtn.disabled = true;
    resizeInput();

    appendMessage('user', text);
    showTyping();

    var payload = JSON.stringify({ message: text, language: LANGUAGE, topK: 5 });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      hideTyping();
      isLoading = false;
      sendBtn.disabled = !inputEl.value.trim();

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var json = JSON.parse(xhr.responseText);
          var d = json.data || {};
          appendMessage('bot', d.response || 'Sorry, I could not generate a response.', d.sources);
        } catch (e) {
          showError('Unexpected response from server.');
        }
      } else {
        var errMsg = 'Server error (' + xhr.status + '). Please try again.';
        try { errMsg = JSON.parse(xhr.responseText).message || errMsg; } catch (e) {}
        showError(errMsg);
      }
    };
    xhr.onerror = function () {
      hideTyping();
      isLoading = false;
      sendBtn.disabled = !inputEl.value.trim();
      showError('Network error. Please check your connection.');
    };
    xhr.send(payload);
  }

  // ── Auto-resize textarea ─────────────────────────────────────────────────
  function resizeInput() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
  }

  // ── Toggle panel ─────────────────────────────────────────────────────────
  function togglePanel() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.remove('hidden');
      toggleBtn.innerHTML = iconClose();
      toggleBtn.setAttribute('aria-label', 'Close chat');
      inputEl.focus();
      if (!msgsEl.children.length) {
        appendMessage('bot', 'Hi! I\'m your AI assistant. Ask me anything about our content, jobs, news, or blogs.');
      }
    } else {
      panel.classList.add('hidden');
      toggleBtn.innerHTML = iconChat();
      toggleBtn.setAttribute('aria-label', 'Open chat');
    }
  }

  // ── Events ───────────────────────────────────────────────────────────────
  toggleBtn.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', togglePanel);

  inputEl.addEventListener('input', function () {
    resizeInput();
    sendBtn.disabled = !inputEl.value.trim() || isLoading;
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);
})();
