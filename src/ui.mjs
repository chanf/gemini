const UI_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gemini Proxy UI</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f2efe8;
      --card: rgba(255, 255, 255, 0.88);
      --card-border: rgba(11, 21, 51, 0.16);
      --text: #0f1f38;
      --muted: #5f6a82;
      --accent: #f56f46;
      --accent-soft: rgba(245, 111, 70, 0.16);
      --ok: #0d7745;
      --warn: #8f2a10;
      --shadow: 0 12px 40px rgba(13, 17, 25, 0.12);
      --radius: 18px;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      min-height: 100%;
      font-family: "Avenir Next", "Segoe UI", "Trebuchet MS", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 10% 10%, rgba(245, 111, 70, 0.2), transparent 50%),
        radial-gradient(circle at 90% 20%, rgba(11, 21, 51, 0.14), transparent 42%),
        linear-gradient(140deg, #f6f2ea 0%, #f0efe9 45%, #e8eee8 100%);
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image: linear-gradient(rgba(15, 31, 56, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 31, 56, 0.045) 1px, transparent 1px);
      background-size: 30px 30px;
      mask-image: radial-gradient(circle at 50% 45%, black 35%, transparent 88%);
      z-index: 0;
    }

    .app {
      max-width: 1320px;
      margin: 0 auto;
      padding: 26px 20px 30px;
      position: relative;
      z-index: 1;
      animation: rise-in 340ms ease-out;
    }

    @keyframes rise-in {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .title {
      margin: 0;
      font-size: clamp(1.2rem, 2.2vw, 1.78rem);
      letter-spacing: 0.01em;
      font-family: "Gill Sans", "Avenir Next", "Trebuchet MS", sans-serif;
      text-transform: uppercase;
    }

    .status {
      border: 1px solid var(--card-border);
      background: var(--card);
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 0.86rem;
      color: var(--muted);
      box-shadow: var(--shadow);
      min-height: 38px;
      display: flex;
      align-items: center;
    }

    .status.ok {
      color: var(--ok);
      border-color: rgba(13, 119, 69, 0.28);
      background: rgba(13, 119, 69, 0.08);
    }

    .status.error {
      color: var(--warn);
      border-color: rgba(143, 42, 16, 0.26);
      background: rgba(143, 42, 16, 0.08);
    }

    .layout {
      display: grid;
      grid-template-columns: 360px minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      backdrop-filter: blur(4px);
    }

    .panel {
      padding: 16px;
      display: grid;
      gap: 14px;
      animation: rise-in 460ms ease-out;
    }

    .section-title {
      margin: 0;
      font-size: 0.95rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #42516f;
      font-weight: 700;
    }

    .field {
      display: grid;
      gap: 7px;
    }

    .label {
      font-size: 0.84rem;
      color: var(--muted);
      letter-spacing: 0.01em;
    }

    input, textarea, button {
      font: inherit;
    }

    input, textarea, select {
      border: 1px solid rgba(11, 21, 51, 0.2);
      border-radius: 12px;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.84);
      color: var(--text);
      width: 100%;
      outline: none;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }

    input:focus, textarea:focus, select:focus {
      border-color: rgba(245, 111, 70, 0.7);
      box-shadow: 0 0 0 3px rgba(245, 111, 70, 0.15);
    }

    textarea {
      min-height: 96px;
      resize: vertical;
    }

    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    button {
      border: none;
      border-radius: 11px;
      padding: 10px 14px;
      cursor: pointer;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(120deg, #ef6335, #f28445);
      transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
      box-shadow: 0 10px 22px rgba(245, 111, 70, 0.24);
    }

    button:hover:enabled {
      transform: translateY(-1px);
      box-shadow: 0 14px 30px rgba(245, 111, 70, 0.32);
    }

    button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .button-ghost {
      background: rgba(15, 31, 56, 0.1);
      color: #1a2f4f;
      box-shadow: none;
      border: 1px solid rgba(15, 31, 56, 0.18);
    }

    .button-danger {
      background: linear-gradient(120deg, #9e2f20, #b94a2f);
      box-shadow: 0 10px 22px rgba(158, 47, 32, 0.25);
    }

    .hint {
      margin: 0;
      color: var(--muted);
      font-size: 0.81rem;
      line-height: 1.45;
    }

    .models {
      border: 1px solid rgba(11, 21, 51, 0.14);
      border-radius: 12px;
      padding: 8px;
      max-height: 270px;
      overflow: auto;
      background: rgba(255, 255, 255, 0.72);
      display: grid;
      gap: 5px;
    }

    .model-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 6px;
      align-items: center;
      border-radius: 10px;
      padding: 7px 8px;
      border: 1px solid transparent;
      background: rgba(245, 248, 252, 0.8);
    }

    .model-row.active {
      border-color: rgba(245, 111, 70, 0.4);
      background: var(--accent-soft);
    }

    .model-name {
      font-family: "IBM Plex Mono", "Consolas", "Monaco", monospace;
      font-size: 0.77rem;
      overflow-wrap: anywhere;
    }

    .model-pick {
      padding: 6px 9px;
      border-radius: 8px;
      font-size: 0.72rem;
      box-shadow: none;
    }

    .chat {
      display: grid;
      grid-template-rows: minmax(420px, 63vh) auto;
      animation: rise-in 520ms ease-out;
    }

    .history {
      overflow: auto;
      padding: 16px;
      display: grid;
      gap: 12px;
      border-bottom: 1px solid rgba(11, 21, 51, 0.11);
      scroll-behavior: smooth;
    }

    .empty {
      margin: auto;
      color: var(--muted);
      font-size: 0.92rem;
      text-align: center;
      max-width: 440px;
      line-height: 1.5;
    }

    .msg {
      display: grid;
      gap: 7px;
      animation: msg-pop 180ms ease-out;
    }

    @keyframes msg-pop {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .msg-role {
      font-size: 0.75rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #4d5f82;
      font-weight: 700;
    }

    .msg-bubble {
      border: 1px solid rgba(11, 21, 51, 0.17);
      border-radius: 13px;
      padding: 10px 12px;
      line-height: 1.6;
      background: rgba(255, 255, 255, 0.89);
      overflow-wrap: anywhere;
    }

    .msg.user .msg-bubble {
      border-color: rgba(245, 111, 70, 0.42);
      background: rgba(245, 111, 70, 0.12);
    }

    .msg-bubble p,
    .msg-bubble ul,
    .msg-bubble pre,
    .msg-bubble h1,
    .msg-bubble h2,
    .msg-bubble h3 {
      margin: 0 0 8px;
    }

    .msg-bubble p:last-child,
    .msg-bubble ul:last-child,
    .msg-bubble pre:last-child,
    .msg-bubble h1:last-child,
    .msg-bubble h2:last-child,
    .msg-bubble h3:last-child {
      margin-bottom: 0;
    }

    .msg-bubble pre {
      background: rgba(14, 23, 42, 0.9);
      color: #f0f4ff;
      border-radius: 10px;
      padding: 10px;
      overflow: auto;
      font-size: 0.84rem;
    }

    .msg-bubble code {
      font-family: "IBM Plex Mono", "Consolas", "Monaco", monospace;
      font-size: 0.86em;
      background: rgba(11, 21, 51, 0.08);
      border-radius: 6px;
      padding: 1px 5px;
    }

    .msg-bubble pre code {
      background: transparent;
      padding: 0;
      border-radius: 0;
      font-size: 0.95em;
    }

    .msg-bubble a {
      color: #0f5fb8;
    }

    .composer {
      padding: 14px;
      display: grid;
      gap: 9px;
    }

    .composer-top {
      display: grid;
      gap: 8px;
      grid-template-columns: minmax(0, 1fr) 170px;
      align-items: start;
    }

    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: var(--muted);
      font-size: 0.85rem;
    }

    .toggle input {
      width: 17px;
      height: 17px;
      padding: 0;
      accent-color: #f56f46;
      border-radius: 4px;
      margin: 0;
    }

    .composer-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }

    .stat-line {
      margin: 0;
      color: var(--muted);
      font-size: 0.82rem;
    }

    @media (max-width: 1080px) {
      .layout {
        grid-template-columns: 1fr;
      }

      .chat {
        grid-template-rows: minmax(360px, 58vh) auto;
      }
    }

    @media (max-width: 640px) {
      .app {
        padding: 16px 12px 16px;
      }

      .composer-top {
        grid-template-columns: 1fr;
      }

      .composer-actions {
        justify-content: stretch;
      }

      .composer-actions button {
        flex: 1 1 auto;
      }
    }
  </style>
</head>
<body>
  <main class="app">
    <div class="topbar">
      <h1 class="title">Gemini Proxy Test Console</h1>
      <div id="status" class="status">Ready</div>
    </div>

    <section class="layout">
      <aside class="card panel">
        <h2 class="section-title">Connection</h2>

        <div class="field">
          <label class="label" for="apiBase">API Base URL</label>
          <input id="apiBase" type="url" spellcheck="false" placeholder="https://example.com/v1">
        </div>

        <div class="row">
          <button id="saveBase" type="button" class="button-ghost">Save Base URL</button>
        </div>

        <div class="field">
          <label class="label" for="apiKey">Gemini API Key</label>
          <input id="apiKey" type="password" spellcheck="false" autocomplete="off" placeholder="AI...">
        </div>

        <div class="row">
          <button id="saveApiKey" type="button">Save API Key</button>
          <button id="clearApiKey" type="button" class="button-ghost">Clear Key</button>
        </div>

        <p class="hint">
          API Key and Base URL are stored in localStorage. Chat history is stored in sessionStorage and is cleared when the browser session ends.
        </p>

        <h2 class="section-title">Models</h2>
        <div class="row">
          <button id="loadModels" type="button">Load Models</button>
        </div>

        <div class="field">
          <label class="label" for="modelFilter">Filter Models</label>
          <input id="modelFilter" type="search" spellcheck="false" placeholder="Search model id...">
        </div>

        <div class="models" id="modelList"></div>

        <div class="field">
          <label class="label" for="modelInput">Active Chat Model</label>
          <input id="modelInput" type="text" spellcheck="false" placeholder="gemini-flash-latest">
        </div>

        <div class="row">
          <button id="saveModel" type="button" class="button-ghost">Save Model</button>
        </div>
      </aside>

      <section class="card chat">
        <div id="history" class="history"></div>

        <form id="chatForm" class="composer">
          <div class="composer-top">
            <textarea id="prompt" placeholder="Type your prompt..."></textarea>
            <div class="field">
              <label class="toggle" for="streamToggle">
                <input id="streamToggle" type="checkbox" checked>
                Stream response
              </label>
              <p class="stat-line" id="messageCount">Messages: 0</p>
            </div>
          </div>

          <div class="composer-actions">
            <button id="stopButton" type="button" class="button-danger" disabled>Stop</button>
            <button id="clearHistory" type="button" class="button-ghost">Clear Session History</button>
            <button id="sendButton" type="submit">Send</button>
          </div>
        </form>
      </section>
    </section>
  </main>

  <script>
    'use strict';

    var LOCAL_KEYS = {
      apiBase: 'gemini.ui.apiBase',
      apiKey: 'gemini.ui.apiKey',
      model: 'gemini.ui.model'
    };
    var SESSION_KEYS = {
      messages: 'gemini.ui.messages'
    };

    var state = {
      models: [],
      messages: [],
      isSending: false,
      abortController: null
    };

    var elements = {
      status: document.getElementById('status'),
      apiBase: document.getElementById('apiBase'),
      saveBase: document.getElementById('saveBase'),
      apiKey: document.getElementById('apiKey'),
      saveApiKey: document.getElementById('saveApiKey'),
      clearApiKey: document.getElementById('clearApiKey'),
      loadModels: document.getElementById('loadModels'),
      modelFilter: document.getElementById('modelFilter'),
      modelList: document.getElementById('modelList'),
      modelInput: document.getElementById('modelInput'),
      saveModel: document.getElementById('saveModel'),
      history: document.getElementById('history'),
      messageCount: document.getElementById('messageCount'),
      chatForm: document.getElementById('chatForm'),
      prompt: document.getElementById('prompt'),
      streamToggle: document.getElementById('streamToggle'),
      clearHistory: document.getElementById('clearHistory'),
      stopButton: document.getElementById('stopButton'),
      sendButton: document.getElementById('sendButton')
    };

    function setStatus(message, type) {
      elements.status.textContent = message;
      elements.status.classList.remove('ok', 'error');
      if (type === 'ok') {
        elements.status.classList.add('ok');
      } else if (type === 'error') {
        elements.status.classList.add('error');
      }
    }

    function safeJsonParse(input, fallback) {
      try {
        return JSON.parse(input);
      } catch (error) {
        return fallback;
      }
    }

    function normalizeApiBase(rawValue) {
      var value = String(rawValue || '').trim();
      if (!value) {
        value = window.location.origin + '/v1';
      }
      value = value.replace(/\\/+$/, '');
      if (!/^https?:\\/\\//i.test(value)) {
        throw new Error('API Base URL must start with http:// or https://');
      }
      return value;
    }

    function normalizeApiKey(rawValue) {
      return String(rawValue || '').trim();
    }

    function persistMessages() {
      sessionStorage.setItem(SESSION_KEYS.messages, JSON.stringify(state.messages));
      updateMessageCount();
    }

    function updateMessageCount() {
      elements.messageCount.textContent = 'Messages: ' + state.messages.length;
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderInline(raw) {
      var text = escapeHtml(raw);
      text = text.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      text = text.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
      text = text.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
      text = text.replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
      return text;
    }

    function renderMarkdownBlocks(raw) {
      var lines = String(raw).replace(/\\r/g, '').split('\\n');
      var html = [];
      var paragraph = [];
      var listItems = [];

      function flushParagraph() {
        if (!paragraph.length) {
          return;
        }
        var value = renderInline(paragraph.join('\\n')).replace(/\\n/g, '<br>');
        html.push('<p>' + value + '</p>');
        paragraph = [];
      }

      function flushList() {
        if (!listItems.length) {
          return;
        }
        html.push('<ul>');
        for (var index = 0; index < listItems.length; index += 1) {
          html.push('<li>' + renderInline(listItems[index]) + '</li>');
        }
        html.push('</ul>');
        listItems = [];
      }

      for (var i = 0; i < lines.length; i += 1) {
        var line = lines[i];
        if (!line.trim()) {
          flushParagraph();
          flushList();
          continue;
        }

        var listMatch = line.match(/^\\s*[-*]\\s+(.*)$/);
        if (listMatch) {
          flushParagraph();
          listItems.push(listMatch[1]);
          continue;
        }

        var headingMatch = line.match(/^(#{1,3})\\s+(.*)$/);
        if (headingMatch) {
          flushParagraph();
          flushList();
          var level = headingMatch[1].length;
          html.push('<h' + level + '>' + renderInline(headingMatch[2]) + '</h' + level + '>');
          continue;
        }

        flushList();
        paragraph.push(line);
      }

      flushParagraph();
      flushList();
      return html.join('');
    }

    function renderMarkdown(raw) {
      var text = String(raw || '');
      if (!text) {
        return '';
      }

      var chunks = [];
      var pattern = /\`\`\`([a-zA-Z0-9_-]+)?\\n([\\s\\S]*?)\`\`\`/g;
      var cursor = 0;
      var match;
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > cursor) {
          chunks.push(renderMarkdownBlocks(text.slice(cursor, match.index)));
        }
        var languageAttr = match[1] ? ' data-lang="' + escapeHtml(match[1]) + '"' : '';
        chunks.push('<pre><code' + languageAttr + '>' + escapeHtml(match[2]) + '</code></pre>');
        cursor = pattern.lastIndex;
      }
      if (cursor < text.length) {
        chunks.push(renderMarkdownBlocks(text.slice(cursor)));
      }
      return chunks.join('');
    }

    function renderHistory() {
      elements.history.innerHTML = '';
      if (!state.messages.length) {
        var empty = document.createElement('p');
        empty.className = 'empty';
        empty.textContent = 'No messages in this session yet. Start with model list fetch and send a prompt.';
        elements.history.appendChild(empty);
        updateMessageCount();
        return;
      }

      for (var i = 0; i < state.messages.length; i += 1) {
        var item = state.messages[i];
        var article = document.createElement('article');
        article.className = 'msg ' + item.role;

        var role = document.createElement('div');
        role.className = 'msg-role';
        role.textContent = item.role === 'assistant' ? 'Assistant' : 'User';

        var bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = renderMarkdown(item.content || '');

        article.appendChild(role);
        article.appendChild(bubble);
        elements.history.appendChild(article);
      }
      updateMessageCount();
      elements.history.scrollTop = elements.history.scrollHeight;
    }

    function setSendingState(isSending) {
      state.isSending = isSending;
      elements.sendButton.disabled = isSending;
      elements.stopButton.disabled = !isSending;
      elements.prompt.disabled = isSending;
      elements.loadModels.disabled = isSending;
      elements.clearHistory.disabled = isSending;
    }

    function ensureApiConfig() {
      var apiBase = normalizeApiBase(elements.apiBase.value);
      var apiKey = normalizeApiKey(elements.apiKey.value);
      if (!apiKey) {
        throw new Error('API Key is required');
      }
      return { apiBase: apiBase, apiKey: apiKey };
    }

    function saveModelSelection() {
      var model = String(elements.modelInput.value || '').trim();
      if (!model) {
        localStorage.removeItem(LOCAL_KEYS.model);
        setStatus('Model selection cleared', 'ok');
        return;
      }
      localStorage.setItem(LOCAL_KEYS.model, model);
      setStatus('Model saved', 'ok');
    }

    function renderModelList() {
      var filter = String(elements.modelFilter.value || '').toLowerCase().trim();
      elements.modelList.innerHTML = '';

      var models = state.models.filter(function (id) {
        return !filter || id.toLowerCase().indexOf(filter) >= 0;
      });

      if (!models.length) {
        var empty = document.createElement('p');
        empty.className = 'hint';
        empty.textContent = state.models.length ? 'No model matched current filter.' : 'Load models to display available model IDs.';
        elements.modelList.appendChild(empty);
        return;
      }

      var activeModel = String(elements.modelInput.value || '').trim();
      for (var i = 0; i < models.length; i += 1) {
        var id = models[i];
        var row = document.createElement('div');
        row.className = 'model-row' + (id === activeModel ? ' active' : '');

        var name = document.createElement('div');
        name.className = 'model-name';
        name.textContent = id;

        var action = document.createElement('button');
        action.type = 'button';
        action.className = 'model-pick button-ghost';
        action.textContent = 'Use';
        action.dataset.model = id;
        action.addEventListener('click', function (event) {
          var target = event.currentTarget;
          elements.modelInput.value = target.dataset.model;
          localStorage.setItem(LOCAL_KEYS.model, target.dataset.model);
          renderModelList();
          setStatus('Model selected: ' + target.dataset.model, 'ok');
        });

        row.appendChild(name);
        row.appendChild(action);
        elements.modelList.appendChild(row);
      }
    }

    async function loadModels() {
      var config = ensureApiConfig();
      setStatus('Loading models...', '');
      var response = await fetch(config.apiBase + '/models', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + config.apiKey
        }
      });
      var responseText = await response.text();
      if (!response.ok) {
        throw new Error('Load models failed: ' + response.status + ' ' + responseText);
      }

      var payload = safeJsonParse(responseText, {});
      var models = Array.isArray(payload.data)
        ? payload.data.map(function (item) { return item.id; }).filter(Boolean)
        : [];
      models.sort();
      state.models = models;
      if (!elements.modelInput.value && models.length) {
        elements.modelInput.value = models[0];
      }
      renderModelList();
      setStatus('Loaded ' + models.length + ' models', 'ok');
    }

    function normalizeMessages(messages) {
      return messages.map(function (item) {
        return {
          role: item.role,
          content: item.content
        };
      });
    }

    async function readSseStream(stream, onDelta) {
      var reader = stream.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      function consumeEvent(rawEvent) {
        if (!rawEvent.trim()) {
          return;
        }
        var lines = rawEvent.split(/\\r?\\n/);
        for (var index = 0; index < lines.length; index += 1) {
          var line = lines[index];
          if (!line.startsWith('data:')) {
            continue;
          }
          var payload = line.slice(5).trim();
          if (!payload) {
            continue;
          }
          if (payload === '[DONE]') {
            return 'done';
          }
          var data = safeJsonParse(payload, null);
          if (!data || !Array.isArray(data.choices) || !data.choices[0]) {
            continue;
          }
          var delta = data.choices[0].delta;
          if (delta && typeof delta.content === 'string') {
            onDelta(delta.content);
          }
        }
        return '';
      }

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) {
          break;
        }
        buffer += decoder.decode(chunk.value, { stream: true });
        var events = buffer.split(/\\r?\\n\\r?\\n/);
        buffer = events.pop() || '';
        for (var i = 0; i < events.length; i += 1) {
          if (consumeEvent(events[i]) === 'done') {
            return;
          }
        }
      }

      if (buffer) {
        consumeEvent(buffer);
      }
    }

    function getActiveModel() {
      var manual = String(elements.modelInput.value || '').trim();
      if (manual) {
        return manual;
      }
      return 'gemini-flash-latest';
    }

    async function sendMessage(promptText) {
      var config = ensureApiConfig();
      var useStream = elements.streamToggle.checked;
      var model = getActiveModel();

      var userMessage = { role: 'user', content: promptText };
      var assistantMessage = { role: 'assistant', content: '' };
      state.messages.push(userMessage);
      state.messages.push(assistantMessage);
      persistMessages();
      renderHistory();

      var requestMessages = normalizeMessages(state.messages.slice(0, -1));

      state.abortController = new AbortController();
      setSendingState(true);

      try {
        var response = await fetch(config.apiBase + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + config.apiKey
          },
          body: JSON.stringify({
            model: model,
            stream: useStream,
            stream_options: useStream ? { include_usage: true } : undefined,
            messages: requestMessages
          }),
          signal: state.abortController.signal
        });

        if (!response.ok) {
          var text = await response.text();
          throw new Error('Chat request failed: ' + response.status + ' ' + text);
        }

        if (useStream && response.body) {
          await readSseStream(response.body, function (deltaText) {
            assistantMessage.content += deltaText;
            persistMessages();
            renderHistory();
          });
        } else {
          var body = await response.text();
          var json = safeJsonParse(body, {});
          var choice = json.choices && json.choices[0];
          var content = choice && choice.message && typeof choice.message.content === 'string'
            ? choice.message.content
            : '';
          assistantMessage.content = content || '(No text content in response)';
          persistMessages();
          renderHistory();
        }

        setStatus('Response completed', 'ok');
      } catch (error) {
        if (error && error.name === 'AbortError') {
          setStatus('Generation stopped by user', 'error');
          if (!assistantMessage.content) {
            assistantMessage.content = '(Generation stopped)';
          }
          persistMessages();
          renderHistory();
          return;
        }
        state.messages.pop();
        state.messages.pop();
        persistMessages();
        renderHistory();
        throw error;
      } finally {
        state.abortController = null;
        setSendingState(false);
      }
    }

    function restoreState() {
      var storedBase = localStorage.getItem(LOCAL_KEYS.apiBase);
      var storedKey = localStorage.getItem(LOCAL_KEYS.apiKey);
      var storedModel = localStorage.getItem(LOCAL_KEYS.model);
      var storedMessages = sessionStorage.getItem(SESSION_KEYS.messages);

      elements.apiBase.value = storedBase || (window.location.origin + '/v1');
      elements.apiKey.value = storedKey || '';
      elements.modelInput.value = storedModel || '';
      state.messages = Array.isArray(safeJsonParse(storedMessages, [])) ? safeJsonParse(storedMessages, []) : [];
      renderHistory();
      renderModelList();
    }

    elements.saveBase.addEventListener('click', function () {
      try {
        var normalized = normalizeApiBase(elements.apiBase.value);
        localStorage.setItem(LOCAL_KEYS.apiBase, normalized);
        elements.apiBase.value = normalized;
        setStatus('API Base URL saved', 'ok');
      } catch (error) {
        setStatus(error.message, 'error');
      }
    });

    elements.saveApiKey.addEventListener('click', function () {
      var value = normalizeApiKey(elements.apiKey.value);
      if (!value) {
        setStatus('API Key is empty, nothing saved', 'error');
        return;
      }
      localStorage.setItem(LOCAL_KEYS.apiKey, value);
      setStatus('API Key saved to localStorage', 'ok');
    });

    elements.clearApiKey.addEventListener('click', function () {
      localStorage.removeItem(LOCAL_KEYS.apiKey);
      elements.apiKey.value = '';
      setStatus('API Key removed', 'ok');
    });

    elements.loadModels.addEventListener('click', function () {
      loadModels().catch(function (error) {
        setStatus(error.message, 'error');
      });
    });

    elements.modelFilter.addEventListener('input', renderModelList);
    elements.modelInput.addEventListener('input', renderModelList);
    elements.saveModel.addEventListener('click', saveModelSelection);

    elements.chatForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (state.isSending) {
        return;
      }
      var promptText = String(elements.prompt.value || '').trim();
      if (!promptText) {
        setStatus('Prompt cannot be empty', 'error');
        return;
      }
      elements.prompt.value = '';
      sendMessage(promptText).catch(function (error) {
        setStatus(error.message, 'error');
      });
    });

    elements.stopButton.addEventListener('click', function () {
      if (state.abortController) {
        state.abortController.abort();
      }
    });

    elements.clearHistory.addEventListener('click', function () {
      if (state.isSending) {
        return;
      }
      state.messages = [];
      sessionStorage.removeItem(SESSION_KEYS.messages);
      renderHistory();
      setStatus('Session history cleared', 'ok');
    });

    restoreState();
    setStatus('Ready', '');
  </script>
</body>
</html>
`;

const UI_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
};

export const handleUiRequest = (pathname) => {
  if (pathname === "/ui" || pathname === "/ui/" || pathname === "/ui/index.html") {
    return new Response(UI_HTML, { headers: UI_HEADERS });
  }
};
