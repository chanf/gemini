import { STYLES } from './styles.mjs';
import { escapeHtml, safeJsonParse, renderInline, renderMarkdownBlocks, renderMarkdown } from './markdown.mjs';
import { parseApiError, renderError, setStatus } from './errors.mjs';
import { loadModels, renderModelList, updateModelStatus, checkSingleModel, checkAllModels, getActiveModel } from './models.mjs';
import { persistMessages, updateMessageCount, renderHistory, normalizeMessages, setSendingState, sendMessage, readSseStream, LOCAL_KEYS, SESSION_KEYS } from './chat.mjs';

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

    // ========== Markdown Utilities ==========
    ${escapeHtml.toString()}
    ${safeJsonParse.toString()}
    ${renderInline.toString()}
    ${renderMarkdownBlocks.toString()}
    ${renderMarkdown.toString()}

    // ========== Error Handling ==========
    ${parseApiError.toString()}
    ${renderError.toString()}
    ${setStatus.toString()}

    // ========== Model Management ==========
    ${loadModels.toString()}
    ${renderModelList.toString()}
    ${updateModelStatus.toString()}
    ${checkSingleModel.toString()}
    ${checkAllModels.toString()}
    ${getActiveModel.toString()}

    // ========== Chat Functions ==========
    ${persistMessages.toString()}
    ${updateMessageCount.toString()}
    ${renderHistory.toString()}
    ${normalizeMessages.toString()}
    ${setSendingState.toString()}
    ${sendMessage.toString()}
    ${readSseStream.toString()}

    // ========== Constants ==========
    const LOCAL_KEYS = {
      apiBase: 'gemini.ui.apiBase',
      apiKey: 'gemini.ui.apiKey',
      model: 'gemini.ui.model'
    };
    const SESSION_KEYS = {
      messages: 'gemini.ui.messages'
    };

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
      value = value.replace(new RegExp('/+$'), '');
      if (!new RegExp('^https?://', 'i').test(value)) {
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
      return { apiBase, apiKey };
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
    elements.saveBase.addEventListener('click', () => {
      try {
        const normalized = normalizeApiBase(elements.apiBase.value);
        localStorage.setItem(LOCAL_KEYS.apiBase, normalized);
        elements.apiBase.value = normalized;
        setStatus(elements, 'API Base URL saved', 'ok');
      } catch (error) {
        setStatus(elements, error.message, 'error');
      }
    });

    elements.saveApiKey.addEventListener('click', () => {
      const value = normalizeApiKey(elements.apiKey.value);
      if (!value) {
        setStatus(elements, 'API Key is empty, nothing saved', 'error');
        return;
      }
      localStorage.setItem(LOCAL_KEYS.apiKey, value);
      setStatus(elements, 'API Key saved to localStorage', 'ok');
    });

    elements.clearApiKey.addEventListener('click', () => {
      localStorage.removeItem(LOCAL_KEYS.apiKey);
      elements.apiKey.value = '';
      setStatus(elements, 'API Key removed', 'ok');
    });

    elements.loadModels.addEventListener('click', () => {
      loadModels(state, elements, ensureApiConfig())
        .then((count) => setStatus(elements, 'Loaded ' + count + ' models', 'ok'))
        .catch((error) => setStatus(elements, error.message, 'error'));
    });

    elements.checkModels.addEventListener('click', () => {
      checkAllModels(state, elements, ensureApiConfig())
        .then(({ availableCount, unavailableCount }) => {
          setStatus(elements, 'Checked: ' + availableCount + ' available, unavailable: ' + unavailableCount, availableCount > 0 ? 'ok' : 'error');
        })
        .catch((error) => setStatus(elements, error.message, 'error'));
    });

    elements.modelFilter.addEventListener('input', () => renderModelList(state, elements));
    elements.availableOnly.addEventListener('change', () => renderModelList(state, elements));
    elements.modelInput.addEventListener('input', () => renderModelList(state, elements));
    elements.saveModel.addEventListener('click', saveModelSelection);

    elements.chatForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (state.isSending) return;

      state.promptText = String(elements.prompt.value || '').trim();
      if (!state.promptText) {
        setStatus(elements, 'Prompt cannot be empty', 'error');
        return;
      }
      elements.prompt.value = '';

      sendMessage(state, elements, ensureApiConfig())
        .then(() => setStatus(elements, 'Ready', ''))
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setStatus(elements, 'Request failed', 'error');
          }
        });
    });

    elements.stopButton.addEventListener('click', () => {
      if (state.abortController) {
        state.abortController.abort();
      }
    });

    elements.clearHistory.addEventListener('click', () => {
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
