import { api, API, formatDate } from '../assets/app.js';

const $ = (id) => document.getElementById(id);

async function loadConfigs() {
  try {
    const configs = await api('/configs');
    const body = $('configs-body');
    $('count').textContent = `${configs.length} ${configs.length === 1 ? 'file' : 'files'}`;

    if (configs.length === 0) {
      body.innerHTML = `<tr><td class="empty" colspan="5">no configs uploaded yet</td></tr>`;
      return;
    }

    body.innerHTML = configs.map(c => `
      <tr data-id="${c.id}">
        <td class="name"><a href="config.html?id=${c.id}">${escapeHtml(c.name)}</a></td>
        <td>${escapeHtml(c.plugin || '—')}</td>
        <td>${c.version_count}</td>
        <td>${formatDate(c.updated_at)}</td>
        <td class="row-actions">
          <a href="config.html?id=${c.id}">edit</a>
          <a href="${API}/configs/${c.id}/download">download</a>
          <button class="danger" data-delete="${c.id}">delete</button>
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteConfig(btn.dataset.delete));
    });
  } catch (err) {
    $('configs-body').innerHTML = `<tr><td class="empty" colspan="5">error: ${err.message}</td></tr>`;
  }
}

async function uploadConfig() {
  const file = $('f-file').files[0];
  if (!file) {
    setStatus('select a file first', 'err');
    return;
  }

  const fd = new FormData();
  fd.append('file', file);
  fd.append('name', $('f-name').value || file.name);
  fd.append('plugin', $('f-plugin').value);

  setStatus('uploading...', '');
  $('upload-btn').disabled = true;

  try {
    await api('/configs', { method: 'POST', body: fd });
    setStatus('uploaded', 'ok');
    $('f-file').value = '';
    $('f-name').value = '';
    $('f-plugin').value = '';
    loadConfigs();
  } catch (err) {
    setStatus(`error: ${err.message}`, 'err');
  } finally {
    $('upload-btn').disabled = false;
  }
}

async function deleteConfig(id) {
  if (!confirm('delete this config and all its versions?')) return;
  try {
    await api(`/configs/${id}`, { method: 'DELETE' });
    loadConfigs();
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

$('upload-btn').addEventListener('click', uploadConfig);
loadConfigs();
