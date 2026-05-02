import { api, formatDate } from '../assets/app.js';

const $ = (id) => document.getElementById(id);

async function loadPublished() {
  try {
    const plugins = await api('/admin/published');
    const body = $('published-body');
    $('count').textContent = `${plugins.length} ${plugins.length === 1 ? 'plugin' : 'plugins'}`;

    if (plugins.length === 0) {
      body.innerHTML = `<tr><td class="empty" colspan="6">no published plugins yet</td></tr>`;
      return;
    }

    body.innerHTML = plugins.map(p => `
      <tr data-slug="${escapeHtml(p.slug)}">
        <td class="name"><a href="publish.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.name)}</a></td>
        <td>${escapeHtml(p.slug)}</td>
        <td>${escapeHtml(p.current_version || '—')}</td>
        <td>—</td>
        <td>${formatDate(p.updated_at)}</td>
        <td class="row-actions">
          <a href="publish.html?slug=${encodeURIComponent(p.slug)}">edit</a>
          <button class="danger" data-delete="${escapeHtml(p.slug)}">delete</button>
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => deletePlugin(btn.dataset.delete));
    });
  } catch (err) {
    $('published-body').innerHTML = `<tr><td class="empty" colspan="6">error: ${err.message}</td></tr>`;
  }
}

async function createPlugin() {
  const slug = $('f-slug').value.trim();
  const name = $('f-name').value.trim();
  if (!slug || !name) {
    setStatus('slug and name required', 'err');
    return;
  }

  const body = {
    slug,
    name,
    tagline: $('f-tagline').value,
    description_md: $('f-description').value,
    mc_versions: $('f-mc-versions').value,
    source_url: $('f-source-url').value,
    support_url: $('f-support-url').value,
  };

  setStatus('creating...', '');
  $('create-btn').disabled = true;

  try {
    await api('/admin/published', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setStatus('created', 'ok');
    ['f-slug', 'f-name', 'f-tagline', 'f-description', 'f-mc-versions', 'f-source-url', 'f-support-url']
      .forEach(id => { $(id).value = ''; });
    loadPublished();
  } catch (err) {
    setStatus(`error: ${err.message}`, 'err');
  } finally {
    $('create-btn').disabled = false;
  }
}

async function deletePlugin(slug) {
  if (!confirm(`delete plugin "${slug}" and all its versions and files? this cannot be undone.`)) return;
  try {
    await api(`/admin/published/${encodeURIComponent(slug)}`, { method: 'DELETE' });
    loadPublished();
  } catch (err) {
    alert(`delete failed: ${err.message}`);
  }
}

function setStatus(text, kind) {
  const el = $('create-status');
  el.textContent = text;
  el.className = 'count ' + (kind || '');
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

$('create-btn').addEventListener('click', createPlugin);
loadPublished();
