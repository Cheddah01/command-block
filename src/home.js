import { api, formatDate } from '../assets/app.js';

const $ = (id) => document.getElementById(id);

async function loadCatalog() {
  try {
    const plugins = await api('/public/plugins');
    const host = $('catalog');
    $('count').textContent = `${plugins.length} ${plugins.length === 1 ? 'plugin' : 'plugins'}`;

    if (plugins.length === 0) {
      host.innerHTML = `<div class="catalog-empty">no plugins published yet.</div>`;
      return;
    }

    host.innerHTML = plugins.map(p => `
      <a class="catalog-card" href="plugin.html?slug=${encodeURIComponent(p.slug)}">
        <div class="catalog-card-head">
          <div class="catalog-card-name">${escapeHtml(p.name)}</div>
          ${p.current_version ? `<div class="catalog-card-version">v${escapeHtml(p.current_version)}</div>` : ''}
        </div>
        ${p.tagline ? `<div class="catalog-card-tagline">${escapeHtml(p.tagline)}</div>` : ''}
        <div class="catalog-card-meta">
          <span>${p.mc_versions ? `mc ${escapeHtml(p.mc_versions)}` : '—'}</span>
          <span>${p.download_count ?? 0} ${p.download_count === 1 ? 'download' : 'downloads'}</span>
          <span>${formatDate(p.updated_at)}</span>
        </div>
      </a>
    `).join('');
  } catch (err) {
    $('catalog').innerHTML = `<div class="catalog-empty">error: ${escapeHtml(err.message)}</div>`;
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

loadCatalog();
