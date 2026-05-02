import { api, API, formatBytes, formatDate } from '../assets/app.js';

const $ = (id) => document.getElementById(id);

async function loadPlugins() {
  try {
    const plugins = await api('/plugins');
    const body = $('plugins-body');
    $('count').textContent = `${plugins.length} ${plugins.length === 1 ? 'file' : 'files'}`;

    if (plugins.length === 0) {
      body.innerHTML = `<tr><td class="empty" colspan="5">no plugins uploaded yet</td></tr>`;
      return;
    }

    body.innerHTML = plugins.map(p => `
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
  } catch (err) {
    $('plugins-body').innerHTML = `<tr><td class="empty" colspan="5">error: ${err.message}</td></tr>`;
  }
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
loadPlugins();
