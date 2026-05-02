import { api, API, formatBytes, formatDate } from '../assets/app.js';
import { marked } from 'marked';

const $ = (id) => document.getElementById(id);

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
if (!slug) {
  document.body.innerHTML = '<p style="padding:40px">no slug specified.</p>';
  throw new Error('no slug');
}

marked.setOptions({ breaks: true });

async function loadPlugin() {
  try {
    const plugin = await api(`/public/plugins/${encodeURIComponent(slug)}`);

    document.title = `${plugin.name} / command-block`;
    $('crumb-slug').textContent = plugin.slug;
    $('header-title').textContent = plugin.name;
    $('header-tagline').textContent = plugin.tagline || '';
    $('header-meta').textContent = `command-block · plugin · ${plugin.download_count ?? 0} downloads`;

    $('description').innerHTML = plugin.description_md
      ? marked.parse(plugin.description_md)
      : `<p class="dim">no description.</p>`;

    const current = (plugin.versions || []).find(v => v.id === plugin.current_version_id);
    if (current) {
      $('version-info').textContent = `v${current.version}${current.mc_version ? ` · mc ${current.mc_version}` : ''} · ${formatBytes(current.size_bytes)}`;
      $('download-btn').href = `${API}/public/plugins/${encodeURIComponent(plugin.slug)}/download`;
      $('download-btn').textContent = `download v${current.version}`;
    } else {
      $('version-info').textContent = 'no current version';
      $('download-btn').style.display = 'none';
    }

    renderVersions(plugin, plugin.versions || []);
    renderLinks(plugin);
  } catch (err) {
    $('header-title').textContent = `error loading: ${err.message}`;
    $('description').innerHTML = '';
    $('version-info').textContent = '';
    document.getElementById('download-btn').style.display = 'none';
  }
}

function renderVersions(plugin, versions) {
  const body = $('versions-body');
  $('versions-count').textContent = `${versions.length} ${versions.length === 1 ? 'release' : 'releases'}`;

  if (versions.length === 0) {
    body.innerHTML = `<tr><td class="empty" colspan="6">no versions yet</td></tr>`;
    return;
  }

  body.innerHTML = versions.map(v => {
    const isCurrent = v.id === plugin.current_version_id;
    return `
      <tr data-vid="${v.id}">
        <td class="name">${escapeHtml(v.version)}${isCurrent ? ' <span class="dim">(current)</span>' : ''}</td>
        <td>${escapeHtml(v.mc_version || '—')}</td>
        <td>${formatBytes(v.size_bytes)}</td>
        <td>${v.download_count ?? 0}</td>
        <td>${formatDate(v.created_at)}</td>
        <td class="row-actions">
          <a href="${API}/public/plugins/${encodeURIComponent(plugin.slug)}/versions/${encodeURIComponent(v.version)}/download">download</a>
          ${v.changelog_md ? `<button class="btn-link" data-changelog="${v.id}">changelog</button>` : ''}
        </td>
      </tr>
      ${v.changelog_md ? `
        <tr class="changelog-row" id="changelog-${v.id}" hidden>
          <td colspan="6"><div class="markdown changelog-body">${marked.parse(v.changelog_md)}</div></td>
        </tr>
      ` : ''}
    `;
  }).join('');

  body.querySelectorAll('[data-changelog]').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = document.getElementById(`changelog-${btn.dataset.changelog}`);
      if (row) row.hidden = !row.hidden;
    });
  });
}

function renderLinks(plugin) {
  const items = [];
  if (plugin.source_url) items.push(`<a href="${escapeHtml(plugin.source_url)}" target="_blank" rel="noopener">source</a>`);
  if (plugin.support_url) items.push(`<a href="${escapeHtml(plugin.support_url)}" target="_blank" rel="noopener">support</a>`);
  $('links').innerHTML = items.length
    ? items.join('<span class="link-sep">·</span>')
    : '<div class="catalog-empty">—</div>';
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

loadPlugin();
