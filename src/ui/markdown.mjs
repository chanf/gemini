// Utility functions
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeJsonParse(input, fallback) {
  try {
    return JSON.parse(input);
  } catch (error) {
    return fallback;
  }
}

// Inline markdown rendering (bold, italic, code, links)
export function renderInline(raw) {
  const text = escapeHtml(raw);
  const result = text
    .replace(/\[([^\]]+)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return result;
}

// Block-level markdown rendering
export function renderMarkdownBlocks(raw) {
  const lines = String(raw).replace(/\r/g, '').split('\n');
  const html = [];
  let paragraph = [];
  let listItems = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    const value = renderInline(paragraph.join('\n')).replace(/\n/g, '<br>');
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

    const listMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1]);
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
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

// Full markdown rendering with code blocks
export function renderMarkdown(raw) {
  const text = String(raw || '');
  if (!text) return '';

  const chunks = [];
  const pattern = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
  let cursor = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      chunks.push(renderMarkdownBlocks(text.slice(cursor, match.index)));
    }
    const languageAttr = match[1] ? ` data-lang="${escapeHtml(match[1])}"` : '';
    chunks.push(`<pre><code${languageAttr}>${escapeHtml(match[2])}</code></pre>`);
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) {
    chunks.push(renderMarkdownBlocks(text.slice(cursor)));
  }
  return chunks.join('');
}
