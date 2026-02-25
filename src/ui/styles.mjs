export const STYLES = `
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

  .github-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--muted);
    text-decoration: none;
    font-size: 0.88rem;
    padding: 6px 10px;
    border-radius: 8px;
    transition: background 120ms ease, color 120ms ease;
  }

  .github-link:hover {
    background: rgba(11, 21, 51, 0.06);
    color: var(--text);
  }

  .github-link svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
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
    max-height: calc(100vh - 100px);
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
    max-height: calc(100vh - 100px);
    overflow-y: auto;
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

  .model-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    padding: 3px 6px;
    border-radius: 6px;
  }

  .model-status.unknown {
    background: rgba(95, 106, 130, 0.15);
    color: var(--muted);
  }

  .model-status.checking {
    background: rgba(245, 111, 70, 0.15);
    color: #c44d26;
  }

  .model-status.available {
    background: rgba(13, 119, 69, 0.15);
    color: #0d7745;
  }

  .model-status.unavailable {
    background: rgba(143, 42, 16, 0.15);
    color: #8f2a10;
  }

  .model-status-icon {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .model-status.unknown .model-status-icon {
    background: var(--muted);
  }

  .model-status.checking .model-status-icon {
    background: #f56f46;
    animation: pulse 1s infinite;
  }

  .model-status.available .model-status-icon {
    background: #0d7745;
  }

  .model-status.unavailable .model-status-icon {
    background: #8f2a10;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .chat {
    display: grid;
    grid-template-rows: 1fr auto;
    max-height: calc(100vh - 100px);
    animation: rise-in 520ms ease-out;
  }

  .history {
    overflow-y: auto;
    padding: 16px;
    display: grid;
    gap: 12px;
    border-bottom: 1px solid rgba(11, 21, 51, 0.11);
    scroll-behavior: smooth;
    min-height: 0;
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

  .msg-error {
    border: 1px solid rgba(143, 42, 16, 0.3);
    border-radius: 12px;
    padding: 12px 14px;
    background: rgba(143, 42, 16, 0.08);
    color: #8f2a10;
    font-size: 0.9rem;
    line-height: 1.5;
    animation: msg-pop 180ms ease-out;
  }

  .msg-error-title {
    font-weight: 700;
    margin-bottom: 6px;
  }

  .msg-error-content {
    font-family: "IBM Plex Mono", "Consolas", "Monaco", monospace;
    font-size: 0.82rem;
    white-space: pre-wrap;
    word-break: break-all;
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
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .composer-options {
    display: flex;
    gap: 12px;
    align-items: center;
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
      max-height: none;
    }

    .panel {
      max-height: none;
      overflow-y: visible;
    }

    .chat {
      grid-template-rows: minmax(360px, 58vh) auto;
      max-height: none;
    }

    .topbar {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 640px) {
    .app {
      padding: 16px 12px 16px;
    }

    .github-link {
      align-self: flex-start;
    }

    .layout {
      max-height: none;
    }

    .panel {
      max-height: none;
      overflow-y: visible;
    }

    .chat {
      max-height: none;
    }

    .composer-top {
      grid-template-columns: 1fr;
    }

    .composer-options {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }

    .composer-actions {
      justify-content: stretch;
    }

    .composer-actions button {
      flex: 1 1 auto;
    }
  }
`;
