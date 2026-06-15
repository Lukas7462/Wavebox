// ===== STATE =====
const STORAGE_KEY = 'wm2026_sticker_state';
const STATUS = { MISSING: 0, OWNED: 1, DOUBLE: 2 };
const STATUS_LABELS = ['Fehlend', 'Vorhanden', 'Doppelt'];
const STATUS_ICONS = ['', '✓', '2×'];

let allStickers = getAllStickers();
let state = {}; // { [nr]: 0|1|2 }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch { state = {}; }
  // Ensure all stickers exist in state
  for (const s of allStickers) {
    if (state[s.nr] === undefined) state[s.nr] = STATUS.MISSING;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ===== STATS =====
function calcStats() {
  let owned = 0, double = 0, missing = 0;
  const total = allStickers.length;
  for (const s of allStickers) {
    const v = state[s.nr];
    if (v === STATUS.OWNED) owned++;
    else if (v === STATUS.DOUBLE) { owned++; double++; }
    else missing++;
  }
  return { owned, double, missing, total, collected: owned };
}

function updateStats() {
  const { owned, double, missing, total, collected } = calcStats();
  document.querySelector('#statOwned span').textContent = owned;
  document.querySelector('#statDouble span').textContent = double;
  document.querySelector('#statMissing span').textContent = missing;
  const pct = Math.round((collected / total) * 100);
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';
}

// ===== ALBUM RENDERING =====
let currentFilter = { section: 'all', status: 'all', search: '' };

function populateSectionFilter() {
  const sel = document.getElementById('sectionFilter');
  sel.innerHTML = '<option value="all">Alle Sektionen</option>';
  for (const sec of WM2026_SECTIONS) {
    const opt = document.createElement('option');
    opt.value = sec.id;
    opt.textContent = sec.emoji + ' ' + sec.name;
    sel.appendChild(opt);
  }
}

function stickerMatchesFilter(sticker) {
  const { section, status, search } = currentFilter;
  if (section !== 'all' && sticker.sectionId !== section) return false;
  if (status !== 'all') {
    const v = state[sticker.nr];
    if (status === 'missing' && v !== STATUS.MISSING) return false;
    if (status === 'owned' && v !== STATUS.OWNED) return false;
    if (status === 'double' && v !== STATUS.DOUBLE) return false;
  }
  if (search) {
    const q = search.toLowerCase();
    const matchName = sticker.name.toLowerCase().includes(q);
    const matchNr = String(sticker.nr).includes(q);
    const matchTeam = sticker.teamName ? sticker.teamName.toLowerCase().includes(q) : false;
    if (!matchName && !matchNr && !matchTeam) return false;
  }
  return true;
}

function renderAlbum() {
  const container = document.getElementById('albumContainer');
  container.innerHTML = '';

  for (const section of WM2026_SECTIONS) {
    // Determine stickers in this section
    let sectionStickers = [];
    if (section.stickers) {
      sectionStickers = section.stickers.map(s => ({ ...s, sectionId: section.id, sectionName: section.name }));
    }
    if (section.teams) {
      for (const team of section.teams) {
        for (const s of team.stickers) {
          sectionStickers.push({ ...s, sectionId: section.id, sectionName: section.name, teamName: team.name, teamFlag: team.flag });
        }
      }
    }

    const visible = sectionStickers.filter(stickerMatchesFilter);
    if (visible.length === 0 && currentFilter.section !== 'all' && currentFilter.section !== section.id) continue;
    if (visible.length === 0 && (currentFilter.search || currentFilter.status !== 'all')) continue;

    const block = document.createElement('div');
    block.className = 'section-block';
    block.dataset.sectionId = section.id;

    const total = sectionStickers.length;
    const collected = sectionStickers.filter(s => state[s.nr] !== STATUS.MISSING).length;

    block.innerHTML = `
      <div class="section-header">
        <span>${section.emoji}</span>
        <h2>${section.name}</h2>
        <span class="section-badge">${collected}/${total}</span>
      </div>
    `;

    if (section.stickers) {
      const grid = document.createElement('div');
      grid.className = 'sticker-grid';
      for (const sticker of sectionStickers) {
        if (!stickerMatchesFilter(sticker)) continue;
        grid.appendChild(createStickerCard(sticker));
      }
      if (grid.children.length === 0) {
        grid.innerHTML = '<div class="no-results">Keine Sticker gefunden.</div>';
      }
      block.appendChild(grid);
    } else if (section.teams) {
      for (const team of section.teams) {
        const teamStickers = team.stickers.map(s => ({ ...s, sectionId: section.id, sectionName: section.name, teamName: team.name, teamFlag: team.flag }));
        const teamVisible = teamStickers.filter(stickerMatchesFilter);
        if (teamVisible.length === 0) continue;

        const teamBlock = document.createElement('div');
        teamBlock.className = 'team-block';
        teamBlock.innerHTML = `<div class="team-label">${team.flag} ${team.name}</div>`;

        const grid = document.createElement('div');
        grid.className = 'sticker-grid';
        for (const sticker of teamStickers) {
          if (!stickerMatchesFilter(sticker)) continue;
          grid.appendChild(createStickerCard(sticker));
        }
        teamBlock.appendChild(grid);
        block.appendChild(teamBlock);
      }
    }

    container.appendChild(block);
  }
}

function createStickerCard(sticker) {
  const card = document.createElement('div');
  const v = state[sticker.nr];
  const statusClass = v === STATUS.OWNED ? 'owned' : v === STATUS.DOUBLE ? 'double' : '';
  card.className = 'sticker-card' + (statusClass ? ' ' + statusClass : '') + (sticker.special ? ' special' : '');
  card.dataset.nr = sticker.nr;
  card.title = `#${sticker.nr} ${sticker.name}\nKlicken: Status ändern`;

  card.innerHTML = `
    <span class="sticker-nr">#${sticker.nr}</span>
    <span class="sticker-name">${sticker.name}</span>
    <span class="sticker-status-icon">${STATUS_ICONS[v]}</span>
  `;

  card.addEventListener('click', () => {
    const cur = state[sticker.nr];
    state[sticker.nr] = (cur + 1) % 3;
    saveState();
    updateStats();
    updateCard(card, sticker);
    updateTauschboerse();
    updateShareUrl();
  });

  return card;
}

function updateCard(card, sticker) {
  const v = state[sticker.nr];
  card.className = 'sticker-card' + (v === STATUS.OWNED ? ' owned' : v === STATUS.DOUBLE ? ' double' : '') + (sticker.special ? ' special' : '');
  card.querySelector('.sticker-status-icon').textContent = STATUS_ICONS[v];
}

// ===== TAUSCHBÖRSE =====
function updateTauschboerse() {
  const doubles = allStickers.filter(s => state[s.nr] === STATUS.DOUBLE);
  const missing = allStickers.filter(s => state[s.nr] === STATUS.MISSING);

  const dEl = document.getElementById('tauschDoppelte');
  const wEl = document.getElementById('tauschWunsch');

  if (doubles.length === 0) {
    dEl.innerHTML = '<em class="empty-hint">Noch keine doppelten Sticker markiert.</em>';
  } else {
    dEl.innerHTML = doubles.map(s =>
      `<span title="${s.name}"><b>#${s.nr}</b> ${s.teamFlag || ''}${s.name}</span><br/>`
    ).join('');
  }

  if (missing.length === 0) {
    wEl.innerHTML = '<em class="empty-hint">Alle Sticker vorhanden – Glückwunsch! 🎉</em>';
  } else {
    wEl.innerHTML = missing.map(s =>
      `<span title="${s.name}"><b>#${s.nr}</b> ${s.teamFlag || ''}${s.name}</span><br/>`
    ).join('');
  }
}

// ===== SHARE URL =====
function encodeStateToHash() {
  // Compact encoding: list of "nr:status" pairs only for non-missing stickers
  const entries = [];
  for (const [nr, v] of Object.entries(state)) {
    if (v !== STATUS.MISSING) entries.push(`${nr}:${v}`);
  }
  return entries.join(',');
}

function decodeHashToState(hash) {
  const result = {};
  if (!hash) return result;
  for (const part of hash.split(',')) {
    const [nr, v] = part.split(':');
    if (nr && v !== undefined) result[parseInt(nr)] = parseInt(v);
  }
  return result;
}

function updateShareUrl() {
  const hash = encodeStateToHash();
  const url = window.location.origin + window.location.pathname + '#sticker=' + hash;
  document.getElementById('shareUrl').value = url;
}

function loadFromHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#sticker=')) return false;
  const encoded = hash.slice('#sticker='.length);
  const decoded = decodeHashToState(encoded);
  for (const s of allStickers) {
    state[s.nr] = decoded[s.nr] ?? STATUS.MISSING;
  }
  saveState();
  return true;
}

// ===== PARTNER COMPARE =====
function loadPartner() {
  const input = document.getElementById('partnerUrl').value.trim();
  const hashIdx = input.indexOf('#sticker=');
  if (hashIdx === -1) {
    showToast('Ungültiger Link – kein #sticker= gefunden.');
    return;
  }
  const encoded = input.slice(hashIdx + '#sticker='.length);
  const partnerState = decodeHashToState(encoded);

  const myDoubles = new Set(allStickers.filter(s => state[s.nr] === STATUS.DOUBLE).map(s => s.nr));
  const myMissing = new Set(allStickers.filter(s => state[s.nr] === STATUS.MISSING).map(s => s.nr));
  const partnerDoubles = new Set(Object.entries(partnerState).filter(([,v]) => v === STATUS.DOUBLE).map(([nr]) => parseInt(nr)));
  const partnerMissing = new Set(Object.entries(partnerState).filter(([,v]) => v === STATUS.MISSING).map(([nr]) => parseInt(nr)));

  // ich bekomme: partner hat doppelt UND ich fehlt
  const iGet = allStickers.filter(s => partnerDoubles.has(s.nr) && myMissing.has(s.nr));
  // ich gebe: ich habe doppelt UND partner fehlt
  const iGive = allStickers.filter(s => myDoubles.has(s.nr) && partnerMissing.has(s.nr));

  const el = document.getElementById('partnerResult');
  if (iGet.length === 0 && iGive.length === 0) {
    el.innerHTML = '<p style="color:var(--c-text-muted);margin-top:10px">Keine Tausch-Matches gefunden.</p>';
    return;
  }

  let html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;">';

  html += '<div style="background:var(--c-owned-bg);border:1px solid var(--c-owned);border-radius:8px;padding:12px;">';
  html += `<b style="color:var(--c-owned)">Du bekommst (${iGet.length})</b><br><br>`;
  html += iGet.length ? iGet.map(s => `<small><b>#${s.nr}</b> ${s.teamFlag || ''}${s.name}</small><br>`).join('') : '<small style="color:var(--c-text-muted)">Nichts</small>';
  html += '</div>';

  html += '<div style="background:var(--c-double-bg);border:1px solid var(--c-double);border-radius:8px;padding:12px;">';
  html += `<b style="color:var(--c-double)">Du gibst (${iGive.length})</b><br><br>`;
  html += iGive.length ? iGive.map(s => `<small><b>#${s.nr}</b> ${s.teamFlag || ''}${s.name}</small><br>`).join('') : '<small style="color:var(--c-text-muted)">Nichts</small>';
  html += '</div>';

  html += '</div>';
  el.innerHTML = html;
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ===== CLIPBOARD =====
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('In Zwischenablage kopiert!')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Kopiert!');
  });
}

// ===== IMPORT / EXPORT =====
function exportAlbum() {
  const data = JSON.stringify({ version: 1, state }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wm2026-sticker-album.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Album exportiert!');
}

function importAlbum(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.state) {
        for (const [nr, v] of Object.entries(data.state)) {
          const n = parseInt(nr);
          if (state[n] !== undefined) state[n] = v;
        }
        saveState();
        renderAlbum();
        updateStats();
        updateTauschboerse();
        updateShareUrl();
        showToast('Album importiert!');
      }
    } catch { showToast('Fehler beim Importieren.'); }
  };
  reader.readAsText(file);
}

// ===== INIT =====
function init() {
  loadState();

  // Try loading from URL hash first
  const loadedFromHash = loadFromHash();
  if (!loadedFromHash) {
    // ensure all keys exist
    for (const s of allStickers) {
      if (state[s.nr] === undefined) state[s.nr] = STATUS.MISSING;
    }
  }

  populateSectionFilter();
  renderAlbum();
  updateStats();
  updateTauschboerse();
  updateShareUrl();

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'tausch') {
        updateTauschboerse();
        updateShareUrl();
      }
    });
  });

  // Filters
  document.getElementById('sectionFilter').addEventListener('change', e => {
    currentFilter.section = e.target.value;
    renderAlbum();
  });

  document.getElementById('statusFilter').addEventListener('change', e => {
    currentFilter.status = e.target.value;
    renderAlbum();
  });

  document.getElementById('searchInput').addEventListener('input', e => {
    currentFilter.search = e.target.value.trim();
    renderAlbum();
  });

  // Actions
  document.getElementById('btnSelectAll').addEventListener('click', () => {
    if (!confirm('Alle Sticker auf "Vorhanden" setzen?')) return;
    for (const s of allStickers) state[s.nr] = STATUS.OWNED;
    saveState();
    renderAlbum();
    updateStats();
    updateTauschboerse();
    updateShareUrl();
    showToast('Alle Sticker auf Vorhanden gesetzt.');
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    if (!confirm('Wirklich das gesamte Album zurücksetzen?')) return;
    for (const s of allStickers) state[s.nr] = STATUS.MISSING;
    saveState();
    renderAlbum();
    updateStats();
    updateTauschboerse();
    updateShareUrl();
    showToast('Album zurückgesetzt.');
  });

  document.getElementById('btnExport').addEventListener('click', exportAlbum);

  document.getElementById('importFile').addEventListener('change', e => {
    if (e.target.files[0]) importAlbum(e.target.files[0]);
    e.target.value = '';
  });

  // Tauschbörse copy buttons
  document.getElementById('btnCopyDouble').addEventListener('click', () => {
    const doubles = allStickers.filter(s => state[s.nr] === STATUS.DOUBLE);
    if (doubles.length === 0) { showToast('Keine doppelten Sticker vorhanden.'); return; }
    const text = 'Meine doppelten WM 2026 Sticker:\n' + doubles.map(s => `#${s.nr} ${s.name}`).join('\n');
    copyToClipboard(text);
  });

  document.getElementById('btnCopyWish').addEventListener('click', () => {
    const missing = allStickers.filter(s => state[s.nr] === STATUS.MISSING);
    if (missing.length === 0) { showToast('Keine fehlenden Sticker – Album komplett! 🎉'); return; }
    const text = 'Meine WM 2026 Wunschliste:\n' + missing.map(s => `#${s.nr} ${s.name}`).join('\n');
    copyToClipboard(text);
  });

  document.getElementById('btnCopyUrl').addEventListener('click', () => {
    copyToClipboard(document.getElementById('shareUrl').value);
  });

  document.getElementById('btnLoadPartner').addEventListener('click', loadPartner);
}

document.addEventListener('DOMContentLoaded', init);
