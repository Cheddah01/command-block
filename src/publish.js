import { api, formatBytes, formatDate } from '../assets/app.js';

const $ = (id) => document.getElementById(id);

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
if (!slug) {
  document.body.innerHTML = '<p style="padding:40px">no slug specified.</p>';
  throw new Error('no slug');
}

let plugin = null;

async function loadPlugin() {
  try {
    plugin = await api(`/admin/published/${encodeURIComponent(slug)}`);

    $('crumb-slug').textContent = plugin.slug;
    $('header-title').innerHTML = `${escapeHtml(plugin.name)} <span class="dim">// ${escapeHtml(plugin.slug)}</span>`;
    $('header-meta').textContent = `internal · plugin editor · last updated ${formatDate(plugin.updated_at)}`;

    $('f-name').value = plugin.name || '';
    $('f-tagline').value = plugin.tagline || '';
    $('f-description').value = plugin.description_md || '';
    $('f-mc-versions').value = plugin.mc_versions || '';
    $('f-source-url').value = plugin.source_url || '';
    $('f-support-url').value = plugin.support_url || '';

    renderVersions(plugin.versions || []);
  } catch (err) {
    $('header-title').textContent = `error loading: ${err.message}`;
  }
}

function renderVersions(versions) {
  const body = $('versions-body');
  $('versions-count').textContent = `${versions.length} ${versions.length === 1 ? 'version' : 'versions'}`;

  if (versions.length === 0) {
    body.innerHTML = `<tr><td class="empty" colspan="5">no versions uploaded yet</td></tr>`;
    return;
  }

  body.innerHTML = versions.map(v => {
    const isCurrent = v.id === plugin.current_version_id;
    return `
      <tr data-vid="${v.id}">
        <td class="name">${escapeHtml(v.version)}${isCurrent ? ' <span class="dim">(current)</span>' : ''}</td>
        <td>${escapeHtml(v.mc_version || '—')}</td>
        <td>${formatBytes(v.size_bytes)}</td>
        <td>${formatDate(v.created_at)}</td>
        <td class="row-actions">
          <button class="danger" data-delete="${v.id}">delete</button>
        </td>
      </tr>
    `;
  }).join('');

  body.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteVersion(btn.dataset.delete));
  });
}

async function saveMetadata() {
  setMetaStatus('saving...', '');
  $('save-btn').disabled = true;

  try {
    await api(`/admin/published/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: $('f-name').value,
        tagline: $('f-tagline').value,
        description_md: $('f-description').value,
        mc_versions: $('f-mc-versions').value,
        source_url: $('f-source-url').value,
        support_url: $('f-support-url').value,
      }),
    });
    setMetaStatus('saved', 'ok');
    await loadPlugin();
  } catch (err) {
    setMetaStatus(`error: ${err.message}`, 'err');
  } finally {
    $('save-btn').disabled = false;
  }
}

async function uploadVersion() {
  const file = $('f-file').files[0];
  const version = $('f-version').value.trim();
  if (!file) { setUploadStatus('select a file first', 'err'); return; }
  if (!version) { setUploadStatus('version required', 'err'); return; }

  const fd = new FormData();
  fd.append('file', file);
  fd.append('version', version);
  fd.append('mc_version', $('f-mc-version').value);
  fd.append('changelog_md', $('f-changelog').value);

  setUploadStatus('uploading...', '');
  $('upload-btn').disabled = true;

  try {
    await api(`/admin/published/${encodeURIComponent(slug)}/versions`, {
      method: 'POST',
      body: fd,
    });
    setUploadStatus('uploaded', 'ok');
    $('f-file').value = '';
    $('f-version').value = '';
    $('f-mc-version').value = '';
    $('f-changelog').value = '';
    await loadPlugin();
  } catch (err) {
    setUploadStatus(`error: ${err.message}`, 'err');
  } finally {
    $('upload-btn').disabled = false;
  }
}

async function deleteVersion(vid) {
  if (!confirm(`delete version v${vid}? the jar will be removed from r2.`)) return;
  try {
    await api(`/admin/published/${encodeURIComponent(slug)}/versions/${vid}`, { method: 'DELETE' });
    await loadPlugin();
  } catch (err) {
    alert(`delete failed: ${err.message}`);
  }
}

function setMetaStatus(text, kind) {
  const el = $('meta-status');
  el.textContent = text;
  el.className = 'count ' + (kind || '');
}
function setUploadStatus(text, kind) {
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

$('save-btn').addEventListener('click', saveMetadata);
$('upload-btn').addEventListener('click', uploadVersion);
loadPlugin();
