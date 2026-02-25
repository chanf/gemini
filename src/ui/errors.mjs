import { escapeHtml } from './markdown.mjs';

export function parseApiError(errorText) {
  try {
    const json = JSON.parse(errorText);
    if (json.error) {
      const err = json.error;
      if (err.code === 429) {
        const match = err.message.match(new RegExp('Please retry in ([\\d.]+)s'));
        const retrySeconds = match ? Math.ceil(parseFloat(match[1])) : null;
        return {
          type: 'quota',
          title: '配额限制 (Quota Limit)',
          message: retrySeconds
            ? `免费配额已用完，请在 ${retrySeconds} 秒后重试，或更换其他模型（如 gemini-1.5-flash）`
            : '免费配额已用完，请稍后重试或更换其他模型',
          details: err.message
        };
      }
      return {
        type: 'api',
        title: `API 错误 (Error ${err.code})`,
        message: err.message.split('\n')[0],
        details: err.message
      };
    }
  } catch (e) {
    // Ignore parse errors
  }
  return {
    type: 'unknown',
    title: '请求失败',
    message: errorText.slice(0, 200),
    details: errorText
  };
}

export function renderError(errorText) {
  const parsedError = parseApiError(errorText);
  return `
    <div class="msg-error-title">${escapeHtml(parsedError.title)}</div>
    <div>${escapeHtml(parsedError.message)}</div>
    <details style="margin-top: 8px;">
      <summary style="cursor: pointer; font-size: 0.85rem; opacity: 0.8;">查看详情</summary>
      <pre class="msg-error-content" style="margin-top: 6px;">${escapeHtml(parsedError.details)}</pre>
    </details>
  `;
}

export function setStatus(elements, message, type) {
  elements.status.textContent = message;
  elements.status.classList.remove('ok', 'error');
  if (type === 'ok') {
    elements.status.classList.add('ok');
  } else if (type === 'error') {
    elements.status.classList.add('error');
  }
}
