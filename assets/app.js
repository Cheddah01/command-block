// command-block / shared frontend helpers

export const API = 'https://command-block-api.colbysthickey.workers.dev';

export async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json();
}

export function formatBytes(bytes) {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toISOString().slice(0, 16).replace('T', ' ');
}
