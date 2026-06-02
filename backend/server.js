import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const DATA_DIR = '/data';
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const COVERS_DIR = path.join(DATA_DIR, 'covers');
const ARTIST_IMAGES_DIR = path.join(DATA_DIR, 'artist-images');
const CATALOG_COVERS_DIR = path.join(DATA_DIR, 'catalog-covers');
const DB_FILE = path.join(DATA_DIR, 'db.json');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(COVERS_DIR, { recursive: true });
fs.mkdirSync(ARTIST_IMAGES_DIR, { recursive: true });
fs.mkdirSync(CATALOG_COVERS_DIR, { recursive: true });

const ADMIN_EMAIL = 'lukas@kerscher.at';
const ADMIN_PASS = '#Ill128#A2f,9Luk';
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!data.artists) data.artists = {};
      if (!data.playCounts) data.playCounts = {};
      if (!data.catalog) data.catalog = [];
      if (!data.tracks) data.tracks = getDefaultTracks();
      if (!data.users) data.users = [];
      if (!data.likes) data.likes = {};
      if (!data.playlists) data.playlists = [];
      if (!data.sessions) data.sessions = {};
      return data;
    }
  } catch(e) { console.error('DB load error:', e); }
  return { tracks: getDefaultTracks(), users: [], likes: {}, playlists: [], sessions: {}, artists: {}, playCounts: {}, catalog: [] };
}
function saveDB(db) {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch(e) { console.error('DB save error:', e); }
}
function getDefaultTracks() {
  return [
    { id:'t1',title:'Midnight Drive',artist:'Neon Waves',album:'After Hours',duration:187,genre:'Synthwave',addedAt:Date.now()-86400000*5,isDemo:true,lyrics:null },
    { id:'t2',title:'Golden Hour',artist:'Solar Drift',album:'Daybreak',duration:224,genre:'Chillout',addedAt:Date.now()-86400000*3,isDemo:true,lyrics:null },
    { id:'t3',title:'Deep Blue',artist:'Ocean Floor',album:'Depths',duration:198,genre:'Ambient',addedAt:Date.now()-86400000*2,isDemo:true,lyrics:null },
    { id:'t4',title:'City Lights',artist:'Neon Waves',album:'After Hours',duration:245,genre:'Synthwave',addedAt:Date.now()-86400000,isDemo:true,lyrics:null },
    { id:'t5',title:'Freefall',artist:'Gravity Well',album:'Zero G',duration:176,genre:'Electronic',addedAt:Date.now(),isDemo:true,lyrics:null },
    { id:'t6',title:'Velvet Skies',artist:'Dreamstate',album:'Horizons',duration:210,genre:'Ambient',addedAt:Date.now()-86400000*4,isDemo:true,lyrics:null },
    { id:'t7',title:'Neon Rain',artist:'Neon Waves',album:'After Hours',duration:195,genre:'Synthwave',addedAt:Date.now()-86400000*6,isDemo:true,lyrics:null },
    { id:'t8',title:'Pulse',artist:'Gravity Well',album:'Zero G',duration:163,genre:'Electronic',addedAt:Date.now()-86400000*1.5,isDemo:true,lyrics:null },
  ];
}
let db = loadDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/audio', express.static(UPLOADS_DIR, { maxAge: '7d', immutable: true }));
app.use('/api/covers', express.static(COVERS_DIR, { maxAge: '7d', immutable: true }));
app.use('/api/artist-images', express.static(ARTIST_IMAGES_DIR, { maxAge: '7d', immutable: true }));
app.use('/api/catalog-covers', express.static(CATALOG_COVERS_DIR, { maxAge: '7d', immutable: true }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.diskStorage({
    destination: (r, file, cb) => cb(null,
      file.fieldname === 'cover' ? COVERS_DIR :
      file.fieldname === 'artistImage' ? ARTIST_IMAGES_DIR :
      file.fieldname === 'catalogCover' ? CATALOG_COVERS_DIR : UPLOADS_DIR),
    filename: (r, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (r, file, cb) => {
    if (file.fieldname === 'cover' || file.fieldname === 'artistImage' || file.fieldname === 'catalogCover') {
      cb(null, /image/.test(file.mimetype));
    } else {
      const audioExts = /\.(mp3|m4a|aac|ogg|opus|wav|flac|wma|webm|amr|3gp)$/i;
      const videoExts = /\.(mp4|mkv|avi|mov|webm|3gp|m4v|wmv)$/i;
      const byMime = /audio|video|octet-stream/.test(file.mimetype);
      const byExt = audioExts.test(file.originalname) || videoExts.test(file.originalname);
      cb(null, byMime || byExt);
    }
  }
});

function getSession(req) { const t = req.headers.authorization?.replace('Bearer ', ''); return t ? db.sessions[t] || null : null; }
function isAdmin(req) { return getSession(req)?.isAdmin === true; }
function requireAuth(req, res) { const s = getSession(req); if (!s) { res.status(401).json({ error: 'Nicht angemeldet' }); return null; } return s; }

// ─── Auth ───
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Felder erforderlich' });
  if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASS) {
    const token = uuidv4();
    db.sessions[token] = { name: 'Lukas', email: ADMIN_EMAIL, isAdmin: true, createdAt: Date.now() };
    saveDB(db);
    return res.json({ token, user: { name: 'Lukas', email: ADMIN_EMAIL, isAdmin: true } });
  }
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    const token = uuidv4();
    db.sessions[token] = { name: user.name, email: user.email, isAdmin: false, createdAt: Date.now() };
    saveDB(db);
    return res.json({ token, user: { name: user.name, email: user.email, isAdmin: false } });
  }
  res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Alle Felder erforderlich' });
  if (password.length < 6) return res.status(400).json({ error: 'Passwort mind. 6 Zeichen' });
  if (email.toLowerCase() === ADMIN_EMAIL) return res.status(400).json({ error: 'E-Mail reserviert' });
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) return res.status(400).json({ error: 'E-Mail bereits registriert' });
  db.users.push({ name, email, password, registeredAt: Date.now() });
  const token = uuidv4();
  db.sessions[token] = { name, email, isAdmin: false, createdAt: Date.now() };
  saveDB(db);
  res.json({ token, user: { name, email, isAdmin: false } });
});

app.post('/api/auth/logout', (req, res) => {
  const t = req.headers.authorization?.replace('Bearer ', '');
  if (t && db.sessions[t]) { delete db.sessions[t]; saveDB(db); }
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const s = getSession(req);
  if (!s) return res.status(401).json({ error: 'Nicht angemeldet' });
  res.json({ user: { name: s.name, email: s.email, isAdmin: s.isAdmin } });
});

// ─── Tracks ───
function trackToRes(t) {
  return { ...t, audioUrl: t.fileName ? `/api/audio/${t.fileName}` : null, coverUrl: t.coverFileName ? `/api/covers/${t.coverFileName}` : null };
}
app.get('/api/tracks', (req, res) => res.json(db.tracks.map(trackToRes)));

const trackUpload = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'cover', maxCount: 1 }]);
app.post('/api/tracks', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  trackUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const { title, artist, album, genre, duration, sourceType } = req.body;
    if (!title || !artist) return res.status(400).json({ error: 'Titel und Künstler erforderlich' });
    const af = req.files?.file?.[0], cf = req.files?.cover?.[0];
    const track = {
      id: uuidv4().slice(0, 12), title, artist, album: album || '',
      genre: genre || 'Electronic', duration: parseInt(duration) || 0,
      sourceType: sourceType || 'audio', fileName: af?.filename || null,
      originalName: af?.originalname || null, fileSize: af?.size || 0,
      coverFileName: cf?.filename || null, addedAt: Date.now(), isDemo: false, lyrics: null
    };
    db.tracks.unshift(track);
    saveDB(db);
    res.json(trackToRes(track));
  });
});

app.put('/api/tracks/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const track = db.tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Nicht gefunden' });
  const { title, artist, album, genre } = req.body;
  if (title) track.title = title;
  if (artist) track.artist = artist;
  if (album !== undefined) track.album = album;
  if (genre) track.genre = genre;
  saveDB(db);
  res.json(trackToRes(track));
});

const coverUpload = upload.single('cover');
app.put('/api/tracks/:id/cover', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const track = db.tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Nicht gefunden' });
  coverUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Kein Bild' });
    if (track.coverFileName) { try { const old = path.join(COVERS_DIR, track.coverFileName); if (fs.existsSync(old)) fs.unlinkSync(old); } catch {} }
    track.coverFileName = req.file.filename;
    saveDB(db);
    res.json({ coverUrl: `/api/covers/${track.coverFileName}` });
  });
});

// ─── Lyrics ───
app.put('/api/tracks/:id/lyrics', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const track = db.tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Nicht gefunden' });
  track.lyrics = req.body.lyrics;
  saveDB(db);
  res.json({ ok: true, lyrics: track.lyrics });
});

app.delete('/api/tracks/:id/lyrics', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const track = db.tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Nicht gefunden' });
  track.lyrics = null;
  saveDB(db);
  res.json({ ok: true });
});

app.post('/api/tracks/:id/generate-lyrics', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  if (!OPENROUTER_KEY) return res.status(500).json({ error: 'OPENROUTER_API_KEY nicht konfiguriert! Kostenloser Key: https://openrouter.ai/keys' });
  const track = db.tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Nicht gefunden' });

  try {
    const prompt = `Write original song lyrics inspired by these details:
Title: "${track.title}"
Artist style: ${track.artist}
Genre: ${track.genre}
${track.album ? `Album theme: ${track.album}` : ''}
Duration: ${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}

Write ONLY the lyrics, line by line. No headers like "Verse" or "Chorus". No explanations. About 20-35 lines. The lyrics should be original and creative, matching the genre and mood of the title.`;

    // Try primary free model, fall back to alternative
    const models = ['mistralai/mistral-7b-instruct:free', 'google/gemma-2-9b-it:free', 'meta-llama/llama-3.2-3b-instruct:free'];
    let text = '';
    for (const model of models) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'HTTP-Referer': 'https://wavebox.app',
            'X-Title': 'Wavebox',
          },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.9, max_tokens: 2000 })
        });
        if (response.ok) {
          const data = await response.json();
          text = data.choices?.[0]?.message?.content || '';
          if (text.trim()) break;
        }
      } catch {}
    }

    if (!text.trim()) return res.status(500).json({ error: 'KI hat keinen Text generiert' });

    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('[') && !l.startsWith('(') && !l.endsWith(':')
        && !l.toLowerCase().startsWith('verse') && !l.toLowerCase().startsWith('chorus')
        && !l.toLowerCase().startsWith('bridge'));

    if (lines.length === 0) return res.status(500).json({ error: 'Konnte keine Lyrics generieren' });

    const gap = track.duration / (lines.length + 1);
    const lyrics = lines.map((lineText, i) => ({ time: Math.round((i + 1) * gap * 10) / 10, text: lineText }));
    track.lyrics = lyrics;
    saveDB(db);
    res.json({ lyrics });
  } catch (e) {
    console.error('OpenRouter error:', e);
    res.status(500).json({ error: 'KI-Fehler: ' + e.message });
  }
});

app.delete('/api/tracks/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const track = db.tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Nicht gefunden' });
  if (track.fileName) { try { const f = path.join(UPLOADS_DIR, track.fileName); if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} }
  if (track.coverFileName) { try { const f = path.join(COVERS_DIR, track.coverFileName); if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} }
  db.tracks = db.tracks.filter(t => t.id !== req.params.id);
  Object.keys(db.likes).forEach(e => { if (db.likes[e]) delete db.likes[e][req.params.id]; });
  saveDB(db);
  res.json({ ok: true });
});

// ─── Play Counts ───
app.post('/api/tracks/:id/play', (req, res) => {
  const s = requireAuth(req, res); if (!s) return;
  const key = `${s.email}:${req.params.id}`;
  if (!db.playCounts[key]) db.playCounts[key] = 0;
  db.playCounts[key]++;
  saveDB(db);
  res.json({ count: db.playCounts[key] });
});

app.get('/api/play-counts', (req, res) => {
  const s = requireAuth(req, res); if (!s) return;
  const counts = {};
  for (const [key, val] of Object.entries(db.playCounts)) {
    if (key.startsWith(s.email + ':')) {
      const tid = key.split(':').slice(1).join(':');
      counts[tid] = val;
    }
  }
  res.json(counts);
});

// ─── Likes ───
app.get('/api/likes', (req, res) => { const s = requireAuth(req, res); if (!s) return; res.json(db.likes[s.email] || {}); });
app.post('/api/likes/:tid', (req, res) => { const s = requireAuth(req, res); if (!s) return; if (!db.likes[s.email]) db.likes[s.email] = {}; db.likes[s.email][req.params.tid] = !db.likes[s.email][req.params.tid]; saveDB(db); res.json(db.likes[s.email]); });

// ─── Playlists ───
app.get('/api/playlists', (req, res) => res.json(db.playlists));
app.post('/api/playlists', (req, res) => {
  const s = requireAuth(req, res); if (!s) return;
  const { name } = req.body; if (!name) return res.status(400).json({ error: 'Name erforderlich' });
  const pl = { id: uuidv4().slice(0, 12), name, trackIds: [], createdBy: s.email, createdAt: Date.now() };
  db.playlists.push(pl); saveDB(db); res.json(pl);
});
app.post('/api/playlists/:id/tracks', (req, res) => {
  const s = requireAuth(req, res); if (!s) return;
  const pl = db.playlists.find(p => p.id === req.params.id);
  if (!pl) return res.status(404).json({ error: 'Nicht gefunden' });
  const { trackId } = req.body; if (!trackId) return res.status(400).json({ error: 'Track ID erforderlich' });
  if (!pl.trackIds.includes(trackId)) { pl.trackIds.push(trackId); saveDB(db); }
  res.json(pl);
});
app.delete('/api/playlists/:id/tracks/:tid', (req, res) => {
  const s = requireAuth(req, res); if (!s) return;
  const pl = db.playlists.find(p => p.id === req.params.id);
  if (!pl) return res.status(404).json({ error: 'Nicht gefunden' });
  pl.trackIds = pl.trackIds.filter(t => t !== req.params.tid); saveDB(db); res.json(pl);
});
app.put('/api/playlists/:id', (req, res) => {
  const s = requireAuth(req, res); if (!s) return;
  const pl = db.playlists.find(p => p.id === req.params.id);
  if (!pl) return res.status(404).json({ error: 'Nicht gefunden' });
  if (pl.createdBy !== s.email && !s.isAdmin) return res.status(403).json({ error: 'Keine Berechtigung' });
  if (req.body.name) pl.name = req.body.name; saveDB(db); res.json(pl);
});
app.delete('/api/playlists/:id', (req, res) => {
  const s = requireAuth(req, res); if (!s) return;
  const pl = db.playlists.find(p => p.id === req.params.id);
  if (!pl) return res.status(404).json({ error: 'Nicht gefunden' });
  if (pl.createdBy !== s.email && !s.isAdmin) return res.status(403).json({ error: 'Keine Berechtigung' });
  db.playlists = db.playlists.filter(p => p.id !== req.params.id); saveDB(db); res.json({ ok: true });
});

// ─── YouTube Helpers ───
const streamCache = {};

function ytDlpSearch(searchQuery, count = 15, extraArgs = []) {
  return new Promise(resolve => {
    execFile('yt-dlp', [
      '--dump-json', '--flat-playlist', '--no-warnings',
      '--extractor-args', 'youtube:player_client=android,web',
      '-I', `1:${count}`,
      ...extraArgs,
      searchQuery
    ], { maxBuffer: 50 * 1024 * 1024, timeout: 30000 }, (err, stdout) => {
      if (err) console.error(`yt-dlp search error [${searchQuery.slice(0, 40)}]:`, err.message?.slice(0, 200));
      if (!stdout?.trim()) return resolve([]);
      try {
        const lines = stdout.trim().split('\n');
        resolve(lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean));
      } catch { resolve([]); }
    });
  });
}

// Try ytsearchmusic first, fallback to ytsearch if 0 results
async function ytDlpSearchWithFallback(prefix, q, count) {
  const musicQuery = `ytsearchmusic${count}:${q}`;
  let items = await ytDlpSearch(musicQuery, count);
  if (items.length === 0) {
    console.log(`ytsearchmusic returned 0 for "${q}", falling back to ytsearch`);
    items = await ytDlpSearch(`ytsearch${count}:${q}`, count);
  }
  return items;
}

function parseYtItem(i) {
  return {
    ytId: i.id,
    title: i.title || 'Unbekannt',
    artist: i.artist || i.creator || i.uploader || i.channel || 'Unbekannt',
    album: i.album || '',
    duration: i.duration || 0,
    thumbnail: i.thumbnail || (i.thumbnails?.length > 0 ? i.thumbnails[i.thumbnails.length - 1].url : ''),
  };
}

// Titles that indicate non-song content
const NON_MUSIC_PATTERN = /\b(full album|complete album|full concert|live concert|live tour|official video|music video|musikvideo|video oficial|teaser|trailer|behind the scenes|making of|documentary|interview|podcast|dj set|megamix|nonstop|non-?stop mix|\d+\s*hour|\bvlog\b)\b/i;

// ─── Admin: Direct YouTube Search (for catalog management) ───
app.get('/api/yt/search', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Query erforderlich' });
  ytDlpSearch(`ytsearch20:${q}`, 20).then(items => {
    res.json({ results: items.map(parseYtItem) });
  });
});

// ─── YouTube Music Search (all users, with Spotlight duration filter) ───
// Duration rules: diff = result_duration - spotlight_duration
//   -1s <= diff <= +3s  → ACCEPTED
//   outside that range  → FILTERED OUT
app.get('/api/yt/search-music', async (req, res) => {
  const q = req.query.q;
  const spotlightDuration = parseInt(req.query.spotlightDuration) || 0;

  if (!q) return res.status(400).json({ error: 'Query erforderlich' });

  try {
    // Parallel: YouTube Music main search + covers + albums (with ytsearch fallback)
    const [mainItems, coverItems, albumItems] = await Promise.all([
      ytDlpSearchWithFallback('ytsearchmusic', q, 15),
      ytDlpSearchWithFallback('ytsearchmusic', `${q} cover`, 10),
      ytDlpSearchWithFallback('ytsearchmusic', `${q} album`, 10),
    ]);

    console.log(`search-music "${q}": main=${mainItems.length}, cover=${coverItems.length}, album=${albumItems.length}`);
    const allItems = [...mainItems, ...coverItems, ...albumItems];

    // Deduplicate by YouTube ID
    const seen = new Set();
    const unique = allItems.filter(i => {
      if (!i.id || seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });

    // Step 1: Keep only songs (60s – 600s, no videos/albums/mixes)
    const songsOnly = unique.filter(i => {
      if (!i.duration) return false;
      if (i.duration < 60 || i.duration > 600) return false;
      if (NON_MUSIC_PATTERN.test(i.title || '')) return false;
      return true;
    });

    // Step 2: Duration matching against Spotlight
    let finalResults = songsOnly;
    let filteredByDuration = 0;
    if (spotlightDuration > 0) {
      const minDur = spotlightDuration - 1;  // -1s OK
      const maxDur = spotlightDuration + 3;  // +3s OK
      finalResults = songsOnly.filter(i => {
        const ok = i.duration >= minDur && i.duration <= maxDur;
        if (!ok) filteredByDuration++;
        return ok;
      });
    }

    res.json({
      results: finalResults.map(parseYtItem),
      totalFound: unique.length,
      filteredNonMusic: unique.length - songsOnly.length,
      filteredByDuration,
      spotlightDuration,
    });
  } catch (e) {
    console.error('YT music search error:', e);
    res.json({ results: [], totalFound: 0, filteredNonMusic: 0, filteredByDuration: 0 });
  }
});

// ─── Catalog ───
app.get('/api/catalog', (req, res) => res.json({ catalog: db.catalog || [] }));

async function downloadThumbnail(url, fileId) {
  if (!url) return null;
  try {
    await new Promise((resolve, reject) => {
      execFile('wget', ['-q', '-O', path.join(CATALOG_COVERS_DIR, fileId + '.jpg'), url], { timeout: 10000 }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    return `/api/catalog-covers/${fileId}.jpg`;
  } catch { return null; }
}

app.post('/api/catalog', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const { ytId, title, artist, album, genre, duration, thumbnail } = req.body;
  if (!ytId) return res.status(400).json({ error: 'ytId erforderlich' });
  if (db.catalog.find(c => c.ytId === ytId)) return res.json({ ok: true, msg: 'Bereits im Katalog' });
  const fileId = uuidv4().slice(0, 12);
  const localThumb = await downloadThumbnail(thumbnail, fileId);
  db.catalog.push({
    id: fileId, ytId, title: title || 'Unbekannt', artist: artist || 'Unbekannt',
    album: album || '', genre: genre || 'Pop', duration: duration || 0,
    thumbnail: localThumb || '', coverFile: localThumb ? fileId + '.jpg' : null,
    addedAt: Date.now(), order: db.catalog.length
  });
  saveDB(db);
  res.json({ ok: true });
});

// MUST be before /api/catalog/:id routes
app.get('/api/catalog/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json({ results: db.catalog || [] });
  const results = (db.catalog || []).filter(c =>
    c.title.toLowerCase().includes(q) || c.artist.toLowerCase().includes(q) ||
    (c.album && c.album.toLowerCase().includes(q)) || (c.genre && c.genre.toLowerCase().includes(q))
  );
  res.json({ results });
});

app.post('/api/catalog/reorder', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const { orderedIds } = req.body;
  if (!orderedIds) return res.status(400).json({ error: 'orderedIds erforderlich' });
  const reordered = [];
  for (const id of orderedIds) { const item = db.catalog.find(c => c.id === id); if (item) reordered.push(item); }
  for (const item of db.catalog) { if (!reordered.find(r => r.id === item.id)) reordered.push(item); }
  db.catalog = reordered; saveDB(db); res.json({ ok: true });
});

app.put('/api/catalog/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const item = db.catalog.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Nicht gefunden' });
  if (req.body.title !== undefined) item.title = req.body.title;
  if (req.body.artist !== undefined) item.artist = req.body.artist;
  if (req.body.album !== undefined) item.album = req.body.album;
  if (req.body.genre !== undefined) item.genre = req.body.genre;
  saveDB(db);
  res.json({ ok: true, item });
});

app.delete('/api/catalog/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const item = db.catalog.find(c => c.id === req.params.id);
  if (item?.coverFile) { try { fs.unlinkSync(path.join(CATALOG_COVERS_DIR, item.coverFile)); } catch {} }
  db.catalog = db.catalog.filter(c => c.id !== req.params.id);
  saveDB(db); res.json({ ok: true });
});

const catalogCoverUpload = upload.single('catalogCover');
app.put('/api/catalog/:id/cover', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const item = db.catalog.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Nicht gefunden' });
  catalogCoverUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Kein Bild' });
    if (item.coverFile) { try { fs.unlinkSync(path.join(CATALOG_COVERS_DIR, item.coverFile)); } catch {} }
    item.coverFile = req.file.filename;
    item.thumbnail = `/api/catalog-covers/${req.file.filename}`;
    saveDB(db);
    res.json({ ok: true, thumbnail: item.thumbnail });
  });
});

// Recommendations from catalog
app.get('/api/yt/recommend', (req, res) => {
  const { ytId } = req.query;
  const catalog = db.catalog || [];
  if (catalog.length <= 1) return res.json({ results: [] });
  const others = catalog.filter(c => c.ytId !== ytId);
  const shuffled = others.sort(() => Math.random() - 0.5);
  res.json({ results: shuffled.slice(0, 3) });
});

app.delete('/api/tracks/:id/yt', (req, res) => {
  const s = requireAuth(req, res); if (!s) return;
  const track = db.tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Nicht gefunden' });
  if (track.audioUrl) { try { const f = path.join(UPLOADS_DIR, path.basename(track.audioUrl)); if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} }
  if (track.coverUrl) { try { const f = path.join(COVERS_DIR, path.basename(track.coverUrl)); if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} }
  db.tracks = db.tracks.filter(t => t.id !== req.params.id);
  saveDB(db); res.json({ ok: true });
});

// ─── Stream any YouTube audio (no catalog restriction) ───
app.get('/api/yt/stream/:ytId', (req, res) => {
  const ytId = req.params.ytId;
  if (!/^[a-zA-Z0-9_-]{6,12}$/.test(ytId)) {
    return res.status(400).json({ error: 'Ungültige Video-ID' });
  }
  const cached = streamCache[ytId];
  if (cached && cached.expires > Date.now()) {
    return res.json({ streamUrl: cached.url });
  }
  execFile('yt-dlp', [
    '-f', 'bestaudio[ext=m4a]/bestaudio/best',
    '-g', '--no-warnings', '--no-playlist',
    `https://www.youtube.com/watch?v=${ytId}`
  ], { timeout: 20000 }, (err, stdout) => {
    if (err) {
      console.error('yt-dlp stream error:', err.message);
      return res.status(400).json({ error: 'Stream nicht verfügbar' });
    }
    const streamUrl = stdout.trim().split('\n')[0];
    if (!streamUrl) return res.status(400).json({ error: 'Kein Stream-URL' });
    streamCache[ytId] = { url: streamUrl, expires: Date.now() + 5 * 3600 * 1000 };
    res.json({ streamUrl });
  });
});

app.post('/api/yt/save', (req, res) => {
  const s = requireAuth(req, res); if (!s) return;
  const { ytId, title, artist, album, duration, thumbnail } = req.body;
  if (!ytId) return res.status(400).json({ error: 'ytId erforderlich' });
  const existing = db.tracks.find(t => t.ytId === ytId);
  if (existing) return res.json({ track: existing, alreadySaved: true });

  const fileId = uuidv4();
  res.json({ status: 'downloading', fileId });

  (async () => {
    try {
      await new Promise((resolve, reject) => {
        execFile('yt-dlp', [
          '-x', '--audio-format', 'mp3', '--audio-quality', '0',
          '--write-thumbnail', '--convert-thumbnails', 'jpg',
          '-o', path.join(UPLOADS_DIR, fileId + '.%(ext)s'),
          '--no-playlist', '--no-warnings',
          `https://www.youtube.com/watch?v=${ytId}`
        ], { timeout: 300000 }, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      let mp3File = fileId + '.mp3';
      const mp3s = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith(fileId) && f.endsWith('.mp3'));
      if (mp3s.length > 0) mp3File = mp3s[0];

      let coverFile = null;
      const thumbs = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith(fileId) && (f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp')));
      if (thumbs.length > 0) {
        const src = path.join(UPLOADS_DIR, thumbs[0]);
        const dst = path.join(COVERS_DIR, fileId + '.jpg');
        try { fs.renameSync(src, dst); coverFile = fileId + '.jpg'; } catch {}
      }

      let realDuration = duration || 0;
      try {
        const d = await new Promise((resolve) => {
          execFile('ffprobe', ['-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(UPLOADS_DIR, mp3File)], (err, stdout) => resolve(stdout?.trim() || '0'));
        });
        realDuration = Math.round(parseFloat(d) || duration || 0);
      } catch {}

      const track = {
        id: fileId, ytId, title: title || 'Unbekannt', artist: artist || 'Unbekannt',
        album: album || '', duration: realDuration, genre: 'Pop', addedAt: Date.now(),
        isDemo: false, sourceType: 'youtube',
        audioUrl: `/api/audio/${mp3File}`,
        coverUrl: coverFile ? `/api/covers/${coverFile}` : null,
        lyrics: null
      };
      db.tracks.unshift(track);
      saveDB(db);
    } catch (e) { console.error('YT save error:', e.message); }
  })();
});

app.get('/api/yt/saved', (req, res) => {
  const saved = db.tracks.filter(t => t.ytId).map(t => t.ytId);
  res.json({ saved });
});

// ─── YouTube Import (adds to catalog, no download) ───
app.post('/api/yt/info', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL erforderlich' });
  try {
    execFile('yt-dlp', ['--dump-json', '--flat-playlist', '--no-warnings', url], { maxBuffer: 50 * 1024 * 1024, timeout: 30000 }, (err, stdout) => {
      if (err) return res.status(400).json({ error: 'Ungültiger Link oder nicht erreichbar' });
      try {
        const lines = stdout.trim().split('\n');
        const items = lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean);
        const tracks = items.map(i => ({
          id: i.id, title: i.title || 'Unbekannt',
          artist: i.artist || i.creator || i.uploader || i.channel || 'Unbekannt',
          album: i.album || '', duration: i.duration || 0,
          thumbnail: i.thumbnail || i.thumbnails?.[0]?.url || '',
          url: i.webpage_url || i.url || url
        }));
        res.json({ tracks, isPlaylist: tracks.length > 1 });
      } catch { res.status(500).json({ error: 'Fehler beim Parsen' }); }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/yt/import-catalog', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const { tracks } = req.body;
  if (!tracks || !tracks.length) return res.status(400).json({ error: 'Keine Tracks' });
  let added = 0;
  for (const t of tracks) {
    if (db.catalog.find(c => c.ytId === t.id)) continue;
    const fileId = uuidv4().slice(0, 12);
    const localThumb = await downloadThumbnail(t.thumbnail, fileId);
    db.catalog.push({
      id: fileId, ytId: t.id, title: t.title || 'Unbekannt', artist: t.artist || 'Unbekannt',
      album: t.album || '', genre: 'Pop', duration: t.duration || 0,
      thumbnail: localThumb || '', coverFile: localThumb ? fileId + '.jpg' : null,
      addedAt: Date.now(), order: db.catalog.length + added
    });
    added++;
  }
  saveDB(db);
  res.json({ ok: true, added, total: db.catalog.length });
});

// ─── Artists ───
app.get('/api/artists', (req, res) => {
  const artistNames = [...new Set(db.tracks.map(t => t.artist))];
  const artists = artistNames.map(name => {
    const data = db.artists[name] || {};
    return { name, imageUrl: data.imageFileName ? `/api/artist-images/${data.imageFileName}` : null, bio: data.bio || '' };
  });
  res.json(artists);
});

const artistImageUpload = upload.single('artistImage');
app.put('/api/artists/:name/image', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const artistName = decodeURIComponent(req.params.name);
  artistImageUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Kein Bild' });
    if (!db.artists[artistName]) db.artists[artistName] = {};
    if (db.artists[artistName].imageFileName) {
      try { const old = path.join(ARTIST_IMAGES_DIR, db.artists[artistName].imageFileName); if (fs.existsSync(old)) fs.unlinkSync(old); } catch {}
    }
    db.artists[artistName].imageFileName = req.file.filename;
    saveDB(db);
    res.json({ imageUrl: `/api/artist-images/${req.file.filename}` });
  });
});

app.delete('/api/artists/:name/image', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const artistName = decodeURIComponent(req.params.name);
  if (db.artists[artistName]?.imageFileName) {
    try { const f = path.join(ARTIST_IMAGES_DIR, db.artists[artistName].imageFileName); if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
    delete db.artists[artistName].imageFileName;
    saveDB(db);
  }
  res.json({ ok: true });
});

app.put('/api/artists/:name', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nur Admin' });
  const artistName = decodeURIComponent(req.params.name);
  if (!db.artists[artistName]) db.artists[artistName] = {};
  if (req.body.bio !== undefined) db.artists[artistName].bio = req.body.bio;
  saveDB(db);
  res.json({ ok: true });
});

// ─── Admin ───
app.get('/api/admin/users', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Nicht berechtigt' });
  res.json(db.users.map(u => ({ name: u.name, email: u.email, registeredAt: u.registeredAt })));
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 WAVEBOX running on port ${PORT}`);
  console.log(`🤖 OpenRouter: ${OPENROUTER_KEY ? '✅ Key gesetzt' : '❌ Kein Key'}`);
});
