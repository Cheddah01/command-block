import { api, API, formatDate } from '../assets/app.js';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { yaml } from '@codemirror/lang-yaml';

const $ = (id) => document.getElementById(id);

const params = new URLSearchParams(window.location.search);
const configId = params.get('id');
if (!configId) {
  document.body.innerHTML = '<p style="padding:40px">no config id specified.</p>';
  throw new Error('no id');
}

let editor;
let currentConfig = null;

async function loadConfig() {
  try {
    const cfg = await api(`/configs/${configId}`);
    currentConfig = cfg;

    $('crumb-name').textContent = cfg.name;
    $('header-title').innerHTML = `${escapeHtml(cfg.name)} <span class="dim">// ${escapeHtml(cfg.plugin || 'unassigned')}</span>`;
    $('header-meta').textContent = `internal · last updated ${formatDate(cfg.updated_at)}`;
    $('download-btn').href = `${API}/configs/${cfg.id}/download`;

    initEditor(cfg.content || '');
    loadVersions();
  } catch (err) {
    $('header-title').textContent = `error loading: ${err.message}`;
  }
}

function initEditor(content) {
  if (editor) editor.destroy();
  editor = new EditorView({
    state: EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        yaml(),
        keymap.of([indentWithTab]),
      ],
    }),
    parent: $('editor'),
  });
}

async function loadVersions() {
  try {
    const versions = await api(`/configs/${configId}/versions`);
    const host = $('versions');

    if (versions.length === 0) {
      host.innerHTML = '<div class="empty">no versions</div>';
      return;
    }

    host.innerHTML = versions.map(v => {
      const isCurrent = v.id === currentConfig.current_version_id;
      return `
        <div class="ver-item ${isCurrent ? 'current' : ''}" data-vid="${v.id}">
          <div class="meta">
            v${v.id} · ${formatDate(v.created_at)}
            ${isCurrent ? '<span class="badge">current</span>' : ''}
          </div>
          <div class="note">${escapeHtml(v.note || '—')}</div>
        </div>
      `;
    }).join('');

    host.querySelectorAll('.ver-item').forEach(el => {
      el.addEventListener('click', () => openVersion(el.dataset.vid));
    });
  } catch (err) {
    $('versions').innerHTML = `<div class="empty">error: ${err.message}</div>`;
  }
}

async function openVersion(vid) {
  try {
    const ver = await api(`/configs/${configId}/versions/${vid}`);
    if (vid == currentConfig.current_version_id) {
      initEditor(ver.content);
      setStatus(`viewing current (v${vid})`, '');
      return;
    }
    if (!confirm(`load version v${vid} into the editor?\n\nyou can review/save it as a new version, or click "restore" to make it current.`)) return;
    initEditor(ver.content);
    setStatus(`viewing v${vid} (not saved)`, '');

    if (confirm(`restore v${vid} as the current version now?`)) {
      await api(`/configs/${configId}/restore/${vid}`, { method: 'POST' });
      setStatus(`restored v${vid}`, 'ok');
      await loadConfig();
    }
  } catch (err) {
    setStatus(`error: ${err.message}`, 'err');
  }
}

async function save() {
  if (!editor) return;
  const content = editor.state.doc.toString();
  const note = $('save-note').value;

  setStatus('saving...', '');
  $('save-btn').disabled = true;

  try {
    await api(`/configs/${configId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, note }),
    });
    setStatus('saved', 'ok');
    $('save-note').value = '';
    await loadConfig();
  } catch (err) {
    setStatus(`error: ${err.message}`, 'err');
  } finally {
    $('save-btn').disabled = false;
  }
}

function setStatus(text, kind) {
  const el = $('status');
  el.textContent = text;
  el.className = 'status ' + (kind || '');
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

$('save-btn').addEventListener('click', save);

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    save();
  }
});

loadConfig();
