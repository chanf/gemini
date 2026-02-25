import { STYLES } from './styles.mjs';

// Generate HTML
export function getHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gemini Proxy UI</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234285f4'/%3E%3Cstop offset='25%25' style='stop-color:%2334a853'/%3E%3Cstop offset='50%25' style='stop-color:%23fbbc05'/%3E%3Cstop offset='75%25' style='stop-color:%23ea4335'/%3E%3Cstop offset='100%25' style='stop-color:%239c27b0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='6' fill='url(%23grad)'/%3E%3Ccircle cx='16' cy='12' r='4' fill='white' opacity='0.9'/%3E%3Cellipse cx='16' cy='22' rx='6' ry='3' fill='white' opacity='0.7'/%3E%3C/svg%3E">
  <style>${STYLES}</style>
</head>
<body>
  <main class="app">
    <div class="topbar">
      <h1 class="title">Gemini Proxy Test Console</h1>
      <a href="https://github.com/chanf/gemini" target="_blank" rel="noopener noreferrer" class="github-link">
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        GitHub
      </a>
      <div id="status" class="status">Ready</div>
    </div>

    <section class="layout">
      <aside class="card panel">
        <h2 class="section-title">Connection</h2>

        <div class="field">
          <label class="label" for="apiBase">API Base URL</label>
          <input id="apiBase" type="url" spellcheck="false" placeholder="https://example.com/v1">
          <p class="hint">Full URL: https://your-worker.example.com/v1</p>
        </div>

        <div class="row">
          <button id="saveBase" type="button" class="button-ghost">Save Base URL</button>
        </div>

        <div class="field">
          <label class="label" for="apiKey">Gemini API Key</label>
          <input id="apiKey" type="password" spellcheck="false" autocomplete="off" placeholder="AI...">
          <p class="hint">
            <a href="https://aistudio.google.com/app/api-keys" target="_blank" rel="noopener noreferrer">获取 API Key</a>
          </p>
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
          <button id="checkModels" type="button" class="button-ghost" disabled>Check Availability</button>
        </div>

        <div class="field">
          <label class="label" for="modelFilter">Filter Models</label>
          <input id="modelFilter" type="search" spellcheck="false" placeholder="Search model id...">
        </div>

        <div class="row">
          <label class="toggle" for="availableOnly">
            <input id="availableOnly" type="checkbox">
            只显示可用模型
          </label>
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
            <button id="sendButton" type="submit">Send</button>
          </div>

          <div class="composer-options">
            <label class="toggle" for="streamToggle">
              <input id="streamToggle" type="checkbox" checked>
              Stream response
            </label>
            <p class="stat-line" id="messageCount">Messages: 0</p>
          </div>

          <div class="composer-actions">
            <button id="stopButton" type="button" class="button-danger" disabled>Stop</button>
            <button id="clearHistory" type="button" class="button-ghost">Clear Session History</button>
          </div>
        </form>
      </section>
    </section>
  </main>

  <script>
    'use strict';

    // ========== Storage Keys ==========
    const LOCAL_KEYS = {
      apiBase: 'gemini.ui.apiBase',
      apiKey: 'gemini.ui.apiKey',
      model: 'gemini.ui.model'
    };
    const SESSION_KEYS = {
      messages: 'gemini.ui.messages'
    };

    // ========== Utility Functions ==========
    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function safeJsonParse(input, fallback) {
      try {
        return JSON.parse(input);
      } catch (error) {
        return fallback;
      }
    }

    function renderInline(raw) {
      const text = escapeHtml(raw);
      return text
        .replace(/\\[([^\\]]+)\\]\\((https?:[^\\s)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
        .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
    }

    function renderMarkdownBlocks(raw) {
      const lines = String(raw).replace(/\\r/g, '').split('\\n');
      const html = [];
      let paragraph = [];
      let listItems = [];

      function flushParagraph() {
        if (!paragraph.length) return;
        const value = renderInline(paragraph.join('\\n')).replace(/\\n/g, '<br>');
        html.push('<p>' + value + '</p>');
        paragraph = [];
      }

      function flushList() {
        if (!listItems.length) return;
        html.push('<ul>');
        for (let index = 0; index < listItems.length; index += 1) {
          html.push('<li>' + renderInline(listItems[index]) + '</li>');
        }
        html.push('</ul>');
        listItems = [];
      }

      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (!line.trim()) {
          flushParagraph();
          flushList();
          continue;
        }

        const listMatch = line.match(/^\\s*[-*]\\s+(.*)$/);
        if (listMatch) {
          flushParagraph();
          listItems.push(listMatch[1]);
          continue;
        }

        const headingMatch = line.match(/^(#{1,3})\\s+(.*)$/);
        if (headingMatch) {
          flushParagraph();
          flushList();
          const level = headingMatch[1].length;
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
      const text = String(raw || '');
      if (!text) return '';

      const chunks = [];
      const pattern = /\\\`\`\`([a-zA-Z0-9_-]+)?\\n([\\s\\S]*?)\\\`\`\`/g;
      let cursor = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > cursor) {
          chunks.push(renderMarkdownBlocks(text.slice(cursor, match.index)));
        }
        const languageAttr = match[1] ? ' data-lang="' + escapeHtml(match[1]) + '"' : '';
        chunks.push('<pre><code' + languageAttr + '>' + escapeHtml(match[2]) + '</code></pre>');
        cursor = pattern.lastIndex;
      }
      if (cursor < text.length) {
        chunks.push(renderMarkdownBlocks(text.slice(cursor)));
      }
      return chunks.join('');
    }

    function parseApiError(errorText) {
      try {
        const json = JSON.parse(errorText);
        if (json.error) {
          const err = json.error;
          if (err.code === 429) {
            const match = err.message.match(/Please retry in ([\\d.]+)s/);
            const retrySeconds = match ? Math.ceil(parseFloat(match[1])) : null;
            return {
              type: 'quota',
              title: '配额限制 (Quota Limit)',
              message: retrySeconds
                ? '免费配额已用完，请在 ' + retrySeconds + ' 秒后重试，或更换其他模型（如 gemini-1.5-flash）'
                : '免费配额已用完，请稍后重试或更换其他模型',
              details: err.message
            };
          }
          return {
            type: 'api',
            title: 'API 错误 (Error ' + err.code + ')',
            message: err.message.split('\\n')[0],
            details: err.message
          };
        }
      } catch (e) {}
      return {
        type: 'unknown',
        title: '请求失败',
        message: errorText.slice(0, 200),
        details: errorText
      };
    }

    function renderError(errorText) {
      const parsedError = parseApiError(errorText);
      return '<div class="msg-error-title">' + escapeHtml(parsedError.title) + '</div>' +
        '<div>' + escapeHtml(parsedError.message) + '</div>' +
        '<details style="margin-top: 8px;">' +
          '<summary style="cursor: pointer; font-size: 0.85rem; opacity: 0.8;">查看详情</summary>' +
          '<pre class="msg-error-content" style="margin-top: 6px;">' + escapeHtml(parsedError.details) + '</pre>' +
        '</details>';
    }

    function setStatus(elements, message, type) {
      elements.status.textContent = message;
      elements.status.classList.remove('ok', 'error');
      if (type === 'ok') {
        elements.status.classList.add('ok');
      } else if (type === 'error') {
        elements.status.classList.add('error');
      }
    }

    function persistMessages(messages) {
      sessionStorage.setItem(SESSION_KEYS.messages, JSON.stringify(messages));
    }

    function updateMessageCount(elements, messages) {
      elements.messageCount.textContent = 'Messages: ' + messages.length;
    }

    function renderHistory(elements, state) {
      elements.history.innerHTML = '';
      if (!state.messages.length) {
        const empty = document.createElement('p');
        empty.className = 'empty';
        empty.textContent = 'No messages in this session yet. Start with model list fetch and send a prompt.';
        elements.history.appendChild(empty);
        updateMessageCount(elements, state.messages);
        return;
      }

      for (let i = 0; i < state.messages.length; i += 1) {
        const item = state.messages[i];

        if (item.error) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'msg-error';
          errorDiv.innerHTML = renderError(item.error);
          elements.history.appendChild(errorDiv);
          continue;
        }

        const article = document.createElement('article');
        article.className = 'msg ' + item.role;

        const role = document.createElement('div');
        role.className = 'msg-role';
        if (item.role === 'assistant') {
          const modelText = item.model ? ' (' + item.model + ')' : '';
          role.textContent = 'Assistant' + modelText;
        } else {
          role.textContent = 'User';
        }

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = renderMarkdown(item.content || '');

        article.appendChild(role);
        article.appendChild(bubble);
        elements.history.appendChild(article);
      }

      updateMessageCount(elements, state.messages);
      elements.history.scrollTop = elements.history.scrollHeight;
    }

    function normalizeMessages(messages) {
      return messages.map(function(item) {
        return { role: item.role, content: item.content };
      });
    }

    function setSendingState(elements, isSending) {
      elements.sendButton.disabled = isSending;
      elements.stopButton.disabled = !isSending;
      elements.prompt.disabled = isSending;
      elements.loadModels.disabled = isSending;
      elements.clearHistory.disabled = isSending;
    }

    function readSseStream(stream, onDelta) {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      function consumeEvent(rawEvent) {
        if (!rawEvent.trim()) return;
        const lines = rawEvent.split(/\\r?\\n/);
        for (let index = 0; index < lines.length; index += 1) {
          const line = lines[index];
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          if (payload === '[DONE]') return 'done';
          const data = safeJsonParse(payload, null);
          if (!data || !Array.isArray(data.choices) || !data.choices[0]) continue;
          const delta = data.choices[0].delta;
          if (delta && typeof delta.content === 'string') {
            onDelta(delta.content);
          }
        }
        return '';
      }

      return new Promise(function(resolve) {
        function pump() {
          reader.read().then(function(result) {
            if (result.done) {
              if (buffer) consumeEvent(buffer);
              resolve();
              return;
            }
            buffer += decoder.decode(result.value, { stream: true });
            const events = buffer.split(/\\r?\\n\\r?\\n/);
            buffer = events.pop() || '';
            for (let i = 0; i < events.length; i += 1) {
              if (consumeEvent(events[i]) === 'done') {
                resolve();
                return;
              }
            }
            pump();
          });
        }
        pump();
      });
    }

    function sendMessage(state, elements, config) {
      const useStream = elements.streamToggle.checked;
      const model = elements.modelInput.value.trim() || 'gemini-flash-latest';

      const userMessage = { role: 'user', content: state.promptText };
      const assistantMessage = { role: 'assistant', content: '', model: model };
      state.messages.push(userMessage);
      state.messages.push(assistantMessage);
      persistMessages(state.messages);
      renderHistory(elements, state);

      const requestMessages = normalizeMessages(state.messages.slice(0, -1));

      state.abortController = new AbortController();
      setSendingState(elements, true);

      let apiBase = config.apiBase.replace(/\\/models$/, '');
      apiBase = apiBase.replace(/\\/chat\\/completions$/, '');

      return fetch(apiBase + '/chat/completions', {
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
      }).then(function(response) {
        if (!response.ok) {
          return response.text().then(function(text) {
            assistantMessage.error = text;
            assistantMessage.content = '';
            persistMessages(state.messages);
            renderHistory(elements, state);
            throw new Error('Request failed');
          });
        }

        if (useStream && response.body) {
          return readSseStream(response.body, function(deltaText) {
            assistantMessage.content += deltaText;
            persistMessages(state.messages);
            renderHistory(elements, state);
          });
        } else {
          return response.text().then(function(body) {
            const json = safeJsonParse(body, {});
            const choice = json.choices && json.choices[0];
            const content = choice && choice.message && typeof choice.message.content === 'string'
              ? choice.message.content
              : '';
            assistantMessage.content = content || '(No text content in response)';
            persistMessages(state.messages);
            renderHistory(elements, state);
            return Promise.resolve();
          });
        }
      }).then(function() {
        return true;
      }).catch(function(error) {
        if (error && error.name === 'AbortError') {
          if (!assistantMessage.content && !assistantMessage.error) {
            assistantMessage.content = '(Generation stopped)';
          }
          persistMessages(state.messages);
          renderHistory(elements, state);
          throw error;
        }
        if (!assistantMessage.content && !assistantMessage.error) {
          assistantMessage.error = error.message || String(error);
        }
        persistMessages(state.messages);
        renderHistory(elements, state);
        throw error;
      }).finally(function() {
        state.abortController = null;
        setSendingState(elements, false);
      });
    }

    function loadModels(state, elements, config) {
      let apiBase = config.apiBase.replace(/\\/models$/, '');
      return fetch(apiBase + '/models', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + config.apiKey
        }
      }).then(function(response) {
        return response.text();
      }).then(function(responseText) {
        const payload = safeJsonParse(responseText, {});
        const models = Array.isArray(payload.data)
          ? payload.data.map(function(item) { return item.id; }).filter(Boolean)
          : [];
        models.sort();
        state.models = models;
        state.modelStatus = {};
        if (!elements.modelInput.value && models.length) {
          elements.modelInput.value = models[0];
        }
        renderModelList(state, elements);
        elements.checkModels.disabled = false;
        return models.length;
      });
    }

    function renderModelList(state, elements) {
      const filter = String(elements.modelFilter.value || '').toLowerCase().trim();
      const availableOnly = elements.availableOnly && elements.availableOnly.checked;
      elements.modelList.innerHTML = '';

      const models = state.models.filter(function(id) {
        if (filter && id.toLowerCase().indexOf(filter) < 0) {
          return false;
        }
        if (availableOnly) {
          const status = state.modelStatus && state.modelStatus[id] ? state.modelStatus[id] : 'unknown';
          return status === 'available';
        }
        return true;
      });

      if (!models.length) {
        const empty = document.createElement('p');
        empty.className = 'hint';
        if (state.models.length) {
          if (availableOnly) {
            empty.textContent = 'No available models. Click "Check Availability" first.';
          } else {
            empty.textContent = 'No model matched current filter.';
          }
        } else {
          empty.textContent = 'Load models to display available model IDs.';
        }
        elements.modelList.appendChild(empty);
        return;
      }

      const activeModel = String(elements.modelInput.value || '').trim();
      for (let i = 0; i < models.length; i += 1) {
        const id = models[i];
        const row = document.createElement('div');
        row.className = 'model-row' + (id === activeModel ? ' active' : '');

        const name = document.createElement('div');
        name.className = 'model-name';
        name.textContent = id;

        const status = state.modelStatus && state.modelStatus[id] ? state.modelStatus[id] : 'unknown';
        const statusDiv = document.createElement('div');
        statusDiv.className = 'model-status ' + status;
        statusDiv.innerHTML = '<div class="model-status-icon"></div>' +
          (status === 'available' ? '可用' : status === 'unavailable' ? '限制' : status === 'checking' ? '检查中' : '');

        const action = document.createElement('button');
        action.type = 'button';
        action.className = 'model-pick button-ghost';
        action.textContent = 'Use';
        action.dataset.model = id;
        action.addEventListener('click', function() {
          elements.modelInput.value = action.dataset.model;
          localStorage.setItem(LOCAL_KEYS.model, action.dataset.model);
          renderModelList(state, elements);
          setStatus(elements, 'Model selected: ' + action.dataset.model, 'ok');
        });

        row.appendChild(name);
        row.appendChild(statusDiv);
        row.appendChild(action);
        elements.modelList.appendChild(row);
      }
    }

    function updateModelStatus(state, elements, modelId, status) {
      state.modelStatus[modelId] = status;
      renderModelList(state, elements);
    }

    function checkSingleModel(state, elements, modelId, config) {
      updateModelStatus(state, elements, modelId, 'checking');
      let apiBase = config.apiBase.replace(/\\/models$/, '');
      apiBase = apiBase.replace(/\\/chat\\/completions$/, '');

      return fetch(apiBase + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + config.apiKey
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: 'Hi' }],
          stream: false,
          max_tokens: 10
        })
      }).then(function(response) {
        if (response.ok) {
          updateModelStatus(state, elements, modelId, 'available');
        } else {
          return response.text().then(function(text) {
            if (text.indexOf('429') >= 0 || text.indexOf('quota') >= 0 || text.indexOf('model not found') >= 0) {
              updateModelStatus(state, elements, modelId, 'unavailable');
            } else {
              updateModelStatus(state, elements, modelId, 'unknown');
            }
          });
        }
      }).catch(function() {
        updateModelStatus(state, elements, modelId, 'unknown');
      });
    }

    function checkAllModels(state, elements, config) {
      if (!state.models.length) {
        return Promise.reject(new Error('Load models first'));
      }

      elements.checkModels.disabled = true;
      elements.loadModels.disabled = true;

      const batchSize = 3;
      const promises = [];

      for (let i = 0; i < state.models.length; i += batchSize) {
        const batch = state.models.slice(i, i + batchSize);
        for (let j = 0; j < batch.length; j++) {
          promises.push(checkSingleModel(state, elements, batch[j], config));
        }
        if (i + batchSize < state.models.length) {
          promises.push(new Promise(function(resolve) {
            setTimeout(resolve, 200);
          }));
        }
      }

      return Promise.all(promises).then(function() {
        elements.checkModels.disabled = false;
        elements.loadModels.disabled = false;

        const availableCount = Object.values(state.modelStatus).filter(function(s) { return s === 'available'; }).length;
        const unavailableCount = Object.values(state.modelStatus).filter(function(s) { return s === 'unavailable'; }).length;
        return { availableCount: availableCount, unavailableCount: unavailableCount };
      });
    }

    // ========== State ==========
    const state = {
      models: [],
      messages: [],
      isSending: false,
      abortController: null,
      modelStatus: {},
      promptText: null
    };

    // ========== Elements ==========
    const elements = {
      status: document.getElementById('status'),
      apiBase: document.getElementById('apiBase'),
      saveBase: document.getElementById('saveBase'),
      apiKey: document.getElementById('apiKey'),
      saveApiKey: document.getElementById('saveApiKey'),
      clearApiKey: document.getElementById('clearApiKey'),
      loadModels: document.getElementById('loadModels'),
      checkModels: document.getElementById('checkModels'),
      modelFilter: document.getElementById('modelFilter'),
      availableOnly: document.getElementById('availableOnly'),
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

    // ========== Utility Functions ==========
    function normalizeApiBase(rawValue) {
      let value = String(rawValue || '').trim();
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

    function ensureApiConfig() {
      const apiBase = normalizeApiBase(elements.apiBase.value);
      const apiKey = normalizeApiKey(elements.apiKey.value);
      if (!apiKey) {
        throw new Error('API Key is required');
      }
      return { apiBase: apiBase, apiKey: apiKey };
    }

    function saveModelSelection() {
      const model = String(elements.modelInput.value || '').trim();
      if (!model) {
        localStorage.removeItem(LOCAL_KEYS.model);
        setStatus(elements, 'Model selection cleared', 'ok');
        return;
      }
      localStorage.setItem(LOCAL_KEYS.model, model);
      setStatus(elements, 'Model saved', 'ok');
    }

    function restoreState() {
      const storedBase = localStorage.getItem(LOCAL_KEYS.apiBase);
      const storedKey = localStorage.getItem(LOCAL_KEYS.apiKey);
      const storedModel = localStorage.getItem(LOCAL_KEYS.model);
      const storedMessages = sessionStorage.getItem(SESSION_KEYS.messages);

      elements.apiBase.value = storedBase || (window.location.origin + '/v1');
      elements.apiKey.value = storedKey || '';
      elements.modelInput.value = storedModel || '';
      state.messages = Array.isArray(safeJsonParse(storedMessages, []))
        ? safeJsonParse(storedMessages, [])
        : [];
      renderHistory(elements, state);
      renderModelList(state, elements);
    }

    // ========== Event Listeners ==========
    elements.saveBase.addEventListener('click', function() {
      try {
        const normalized = normalizeApiBase(elements.apiBase.value);
        localStorage.setItem(LOCAL_KEYS.apiBase, normalized);
        elements.apiBase.value = normalized;
        setStatus(elements, 'API Base URL saved', 'ok');
      } catch (error) {
        setStatus(elements, error.message, 'error');
      }
    });

    elements.saveApiKey.addEventListener('click', function() {
      const value = normalizeApiKey(elements.apiKey.value);
      if (!value) {
        setStatus(elements, 'API Key is empty, nothing saved', 'error');
        return;
      }
      localStorage.setItem(LOCAL_KEYS.apiKey, value);
      setStatus(elements, 'API Key saved to localStorage', 'ok');
    });

    elements.clearApiKey.addEventListener('click', function() {
      localStorage.removeItem(LOCAL_KEYS.apiKey);
      elements.apiKey.value = '';
      setStatus(elements, 'API Key removed', 'ok');
    });

    elements.loadModels.addEventListener('click', function() {
      loadModels(state, elements, ensureApiConfig())
        .then(function(count) { setStatus(elements, 'Loaded ' + count + ' models', 'ok'); })
        .catch(function(error) { setStatus(elements, error.message, 'error'); });
    });

    elements.checkModels.addEventListener('click', function() {
      checkAllModels(state, elements, ensureApiConfig())
        .then(function(result) {
          setStatus(elements, 'Checked: ' + result.availableCount + ' available, unavailable: ' + result.unavailableCount, result.availableCount > 0 ? 'ok' : 'error');
        })
        .catch(function(error) { setStatus(elements, error.message, 'error'); });
    });

    elements.modelFilter.addEventListener('input', function() { renderModelList(state, elements); });
    elements.availableOnly.addEventListener('change', function() { renderModelList(state, elements); });
    elements.modelInput.addEventListener('input', function() { renderModelList(state, elements); });
    elements.saveModel.addEventListener('click', saveModelSelection);

    elements.chatForm.addEventListener('submit', function(event) {
      event.preventDefault();
      if (state.isSending) return;

      state.promptText = String(elements.prompt.value || '').trim();
      if (!state.promptText) {
        setStatus(elements, 'Prompt cannot be empty', 'error');
        return;
      }
      elements.prompt.value = '';

      sendMessage(state, elements, ensureApiConfig())
        .then(function() { setStatus(elements, 'Ready', ''); })
        .catch(function(error) {
          if (error.name !== 'AbortError') {
            setStatus(elements, 'Request failed', 'error');
          }
        });
    });

    elements.stopButton.addEventListener('click', function() {
      if (state.abortController) {
        state.abortController.abort();
      }
    });

    elements.clearHistory.addEventListener('click', function() {
      if (state.isSending) return;
      state.messages = [];
      sessionStorage.removeItem(SESSION_KEYS.messages);
      renderHistory(elements, state);
      setStatus(elements, 'Session history cleared', 'ok');
    });

    // ========== Initialize ==========
    restoreState();
    setStatus(elements, 'Ready', '');
  </script>
</body>
</html>`;
}

const UI_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
};

export const handleUiRequest = (pathname) => {
  if (pathname === '/ui' || pathname === '/ui/' || pathname === '/ui/index.html') {
    return new Response(getHtml(), { headers: UI_HEADERS });
  }
};
