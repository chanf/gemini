import { renderMarkdown, safeJsonParse } from './markdown.mjs';
import { renderError } from './errors.mjs';
import { getActiveModel } from './models.mjs';

// Storage keys
const LOCAL_KEYS = {
  apiBase: 'gemini.ui.apiBase',
  apiKey: 'gemini.ui.apiKey',
  model: 'gemini.ui.model'
};
const SESSION_KEYS = {
  messages: 'gemini.ui.messages'
};

// Message persistence
export function persistMessages(messages) {
  sessionStorage.setItem(SESSION_KEYS.messages, JSON.stringify(messages));
}

export function updateMessageCount(elements, messages) {
  elements.messageCount.textContent = 'Messages: ' + messages.length;
}

// Render chat history
export function renderHistory(elements, state) {
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

    // Render error message if present
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
      const modelText = item.model ? ` (${item.model})` : '';
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

// Message normalization
export function normalizeMessages(messages) {
  return messages.map((item) => ({
    role: item.role,
    content: item.content
  }));
}

// Sending state
export function setSendingState(elements, isSending) {
  elements.sendButton.disabled = isSending;
  elements.stopButton.disabled = !isSending;
  elements.prompt.disabled = isSending;
  elements.loadModels.disabled = isSending;
  elements.clearHistory.disabled = isSending;
}

// Send message
export async function sendMessage(state, elements, config) {
  const useStream = elements.streamToggle.checked;
  const model = getActiveModel(elements);

  const userMessage = { role: 'user', content: state.promptText };
  const assistantMessage = { role: 'assistant', content: '', model };
  state.messages.push(userMessage);
  state.messages.push(assistantMessage);
  persistMessages(state.messages);
  renderHistory(elements, state);

  const requestMessages = normalizeMessages(state.messages.slice(0, -1));

  state.abortController = new AbortController();
  setSendingState(elements, true);

  try {
    // Remove trailing /models or /chat/completions from apiBase if present
    let apiBase = config.apiBase.replace(new RegExp('/models$'), '');
    apiBase = apiBase.replace(new RegExp('/chat/completions$'), '');
    const response = await fetch(apiBase + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + config.apiKey
      },
      body: JSON.stringify({
        model,
        stream: useStream,
        stream_options: useStream ? { include_usage: true } : undefined,
        messages: requestMessages
      }),
      signal: state.abortController.signal
    });

    if (!response.ok) {
      const text = await response.text();
      assistantMessage.error = text;
      assistantMessage.content = '';
      persistMessages(state.messages);
      renderHistory(elements, state);
      throw new Error('Request failed');
    }

    if (useStream && response.body) {
      await readSseStream(response.body, (deltaText) => {
        assistantMessage.content += deltaText;
        persistMessages(state.messages);
        renderHistory(elements, state);
      });
    } else {
      const body = await response.text();
      const json = safeJsonParse(body, {});
      const choice = json.choices && json.choices[0];
      const content = choice && choice.message && typeof choice.message.content === 'string'
        ? choice.message.content
        : '';
      assistantMessage.content = content || '(No text content in response)';
      persistMessages(state.messages);
      renderHistory(elements, state);
    }

    return true;
  } catch (error) {
    if (error && error.name === 'AbortError') {
      if (!assistantMessage.content && !assistantMessage.error) {
        assistantMessage.content = '(Generation stopped)';
      }
      persistMessages(state.messages);
      renderHistory(elements, state);
      throw error;
    }
    // Other errors
    if (!assistantMessage.content && !assistantMessage.error) {
      assistantMessage.error = error.message || String(error);
    }
    persistMessages(state.messages);
    renderHistory(elements, state);
    throw error;
  } finally {
      state.abortController = null;
      setSendingState(elements, false);
    }
}

// Stream reading
async function readSseStream(stream, onDelta) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  function consumeEvent(rawEvent) {
    if (!rawEvent.trim()) return;
    const lines = rawEvent.split(new RegExp('\\r?\\n'));
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

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    const events = buffer.split(new RegExp('\\r?\\n\\r?\\n'));
    buffer = events.pop() || '';
    for (let i = 0; i < events.length; i += 1) {
      if (consumeEvent(events[i]) === 'done') return;
    }
  }

  if (buffer) {
    consumeEvent(buffer);
  }
}

export { readSseStream, LOCAL_KEYS, SESSION_KEYS };
