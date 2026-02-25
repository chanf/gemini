// Model management functions
import { safeJsonParse } from './markdown.mjs';

export async function loadModels(state, elements, config) {
  // Remove trailing /models from apiBase if present, then add /models
  const apiBase = config.apiBase.replace(new RegExp('/models$'), '');
  const response = await fetch(apiBase + '/models', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + config.apiKey
    }
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error('Load models failed: ' + response.status + ' ' + responseText);
  }

  const payload = safeJsonParse(responseText, {});
  const models = Array.isArray(payload.data)
    ? payload.data.map((item) => item.id).filter(Boolean)
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
}

export function renderModelList(state, elements) {
  const filter = String(elements.modelFilter.value || '').toLowerCase().trim();
  const availableOnly = elements.availableOnly && elements.availableOnly.checked;
  elements.modelList.innerHTML = '';

  const models = state.models.filter((id) => {
    // Text filter
    if (filter && id.toLowerCase().indexOf(filter) < 0) {
      return false;
    }
    // Availability filter
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

    // Status indicator
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
    action.addEventListener('click', () => {
      elements.modelInput.value = action.dataset.model;
      localStorage.setItem('gemini.ui.model', action.dataset.model);
      renderModelList(state, elements);
      // setStatus will be available in global scope when inlined
      if (typeof setStatus === 'function') {
        setStatus(elements, 'Model selected: ' + action.dataset.model, 'ok');
      }
    });

    row.appendChild(name);
    row.appendChild(statusDiv);
    row.appendChild(action);
    elements.modelList.appendChild(row);
  }
}

export function updateModelStatus(state, elements, modelId, status) {
  state.modelStatus[modelId] = status;
  renderModelList(state, elements);
}

export async function checkSingleModel(state, elements, modelId, config) {
  updateModelStatus(state, elements, modelId, 'checking');
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
        model: modelId,
        messages: [{ role: 'user', content: 'Hi' }],
        stream: false,
        max_tokens: 10
      })
    });

    if (response.ok) {
      updateModelStatus(state, elements, modelId, 'available');
    } else {
      const text = await response.text();
      if (text.includes('429') || text.includes('quota') || text.includes('model not found')) {
        updateModelStatus(state, elements, modelId, 'unavailable');
      } else {
        updateModelStatus(state, elements, modelId, 'unknown');
      }
    }
  } catch (error) {
    updateModelStatus(state, elements, modelId, 'unknown');
  }
}

export async function checkAllModels(state, elements, config) {
  if (!state.models.length) {
    throw new Error('Load models first');
  }

  elements.checkModels.disabled = true;
  elements.loadModels.disabled = true;

  // Check models in batches
  const batchSize = 3;
  for (let i = 0; i < state.models.length; i += batchSize) {
    const batch = state.models.slice(i, i + batchSize);
    await Promise.all(batch.map((modelId) => checkSingleModel(state, elements, modelId, config)));
    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  elements.checkModels.disabled = false;
  elements.loadModels.disabled = false;

  const availableCount = Object.values(state.modelStatus).filter((s) => s === 'available').length;
  const unavailableCount = Object.values(state.modelStatus).filter((s) => s === 'unavailable').length;
  return { availableCount, unavailableCount };
}

export function getActiveModel(elements) {
  const manual = String(elements.modelInput.value || '').trim();
  if (manual) {
    return manual;
  }
  return 'gemini-flash-latest';
}
