import { api, API, formatBytes, formatDate } from '../assets/app.js';

const $ = (id) => document.getElementById(id);

let plugins = [];
let sortBy = 'uploaded';
let sortDir = 'desc';
let filter = '';

const sortKey = {
  name: (p) => (p.name || '').toLowerCase(),
  version: (p) => (p.version || '').toLowerCase(),
  size: (p) => p.size_bytes || 0,
  uploaded: (p) => p.uploaded_at || '',
};

async function loadPlugins() {
  try {
    plugins = await api('/plugins');
    render();
  } catch (err) {
    $('plugins-body').innerHTML = `<tr><td class="empty" colspan="5">error: ${err.message}</td></tr>`;
  }
}

function render() {
  const body = $('plugins-body');
  const f = filter.trim().toLowerCase();
  const filtered = f
    ? plugins.filter(p => (p.name || '').toLowerCase().includes(f))
    : plugins;

  const key = sortKey[sortBy];
  const dir = sortDir === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    const va = key(a), vb = key(b);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });

  if (plugins.length === 0) {
    $('count').textContent = '0 files';
    body.innerHTML = `<tr><td class="empty" colspan="5">no plugins uploaded yet</td></tr>`;
    return;
  }

  $('count').textContent = f
    ? `${sorted.length} of ${plugins.length}`
    : `${plugins.length} ${plugins.length === 1 ? 'file' : 'files'}`;

  if (sorted.length === 0) {
    body.innerHTML = `<tr><td class="empty" colspan="5">no matches</td></tr>`;
    return;
  }

  body.innerHTML = sorted.map(p => `
    <tr data-id="${p.id}">
      <td class="name">${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.version || '—')}</td>
      <td>${formatBytes(p.size_bytes)}</td>
      <td>${formatDate(p.uploaded_at)}</td>
      <td class="row-actions">
        <a href="${API}/plugins/${p.id}/download">download</a>
        <button class="danger" data-delete="${p.id}">delete</button>
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deletePlugin(btn.dataset.delete));
  });
}

function setSort(col) {
  if (sortBy === col) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy = col;
    sortDir = col === 'uploaded' || col === 'size' ? 'desc' : 'asc';
  }
  document.querySelectorAll('th.sortable').forEach(th => {
    const active = th.dataset.sort === sortBy;
    th.classList.toggle('active', active);
    const arrow = th.querySelector('.arrow');
    if (arrow) arrow.textContent = active ? (sortDir === 'asc' ? '↑' : '↓') : '';
  });
  render();
}

async function uploadPlugin() {
  const file = $('f-file').files[0];
  if (!file) {
    setStatus('select a file first', 'err');
    return;
  }

  const fd = new FormData();
  fd.append('file', file);
  fd.append('name', $('f-name').value);
  fd.append('version', $('f-version').value);
  fd.append('notes', $('f-notes').value);

  setStatus('uploading...', '');
  $('upload-btn').disabled = true;

  try {
    await api('/plugins', { method: 'POST', body: fd });
    setStatus('uploaded', 'ok');
    $('f-file').value = '';
    $('f-name').value = '';
    $('f-version').value = '';
    $('f-notes').value = '';
    loadPlugins();
  } catch (err) {
    setStatus(`error: ${err.message}`, 'err');
  } finally {
    $('upload-btn').disabled = false;
  }
}

async function deletePlugin(id) {
  if (!confirm('delete this plugin?')) return;
  try {
    await api(`/plugins/${id}`, { method: 'DELETE' });
    loadPlugins();
  } catch (err) {
    alert(`delete failed: ${err.message}`);
  }
}

function setStatus(text, kind) {
  const el = $('upload-status');
  el.textContent = text;
  el.className = 'count ' + (kind || '');
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

$('upload-btn').addEventListener('click', uploadPlugin);

$('search').addEventListener('input', (e) => {
  filter = e.target.value;
  render();
});

document.querySelectorAll('th.sortable').forEach(th => {
  th.addEventListener('click', () => setSort(th.dataset.sort));
});

loadPlugins();
