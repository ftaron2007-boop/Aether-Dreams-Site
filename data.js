async function AD_fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

function AD_escape(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

// Renders either a real uploaded photo (background-image) or falls back
// to the CSS gradient placeholder class if no image was uploaded.
function AD_mediaDiv(baseClass, fallbackClass, imagePath) {
  if (imagePath) {
    return `class="${AD_escape(baseClass)}" style="background-image: url('${AD_escape(imagePath)}')"`;
  }
  return `class="${AD_escape(baseClass)} ${AD_escape(fallbackClass || '')}"`;
}

async function AD_renderReleases() {
  const grid = document.getElementById('release-grid');
  if (!grid) return;
  try {
    const data = await AD_fetchJSON('data/releases.json');
    const releases = data.releases || [];
    grid.innerHTML = releases.map(r => `
      <article class="release">
        <div ${AD_mediaDiv('cover', r.cover, r.coverImage)}></div>
        <div class="release-info">
          <h3>${AD_escape(r.title)}</h3>
          <p>${AD_escape(r.type)} · ${AD_escape(r.year)}</p>
          <span class="availability">Скоро можно будет послушать</span>
        </div>
      </article>
    `).join('');
    if (window.AD_reveal) window.AD_reveal(grid.querySelectorAll('.release'));
  } catch (e) { console.error(e); }
}

async function AD_renderArtists() {
  const grid = document.getElementById('artist-grid');
  if (!grid) return;
  try {
    const data = await AD_fetchJSON('data/artists.json');
    const artists = data.artists || [];
    grid.innerHTML = artists.map(a => `
      <a class="artist-card" href="artist.html?id=${AD_escape(a.slug)}">
        <div ${AD_mediaDiv('artist-photo', a.photo, a.photoImage)}></div>
        <span class="artist-role">${AD_escape(a.role)}</span>
        <h2 class="artist-name">${AD_escape(a.name)}</h2>
        <p class="artist-bio">${AD_escape(a.bio)}</p>
      </a>
    `).join('');
    if (window.AD_reveal) window.AD_reveal(grid.querySelectorAll('.artist-card'));
  } catch (e) { console.error(e); }
}

async function AD_renderJournal() {
  const list = document.getElementById('journal-list');
  if (!list) return;
  try {
    const data = await AD_fetchJSON('data/journal.json');
    const entries = data.entries || [];
    list.innerHTML = entries.map(e => `
      <article class="journal-item">
        <span class="journal-date">${AD_escape(e.date)}</span>
        <div>
          <h2 class="journal-title">${AD_escape(e.title)}</h2>
          <p class="journal-excerpt">${AD_escape(e.excerpt)}</p>
        </div>
      </article>
    `).join('');
    if (window.AD_reveal) window.AD_reveal(list.querySelectorAll('.journal-item'));
  } catch (e) { console.error(e); }
}

async function AD_renderAbout() {
  const root = document.getElementById('about-root');
  if (!root) return;
  try {
    const data = await AD_fetchJSON('data/about.json');
    document.getElementById('about-lede').textContent = data.lede;
    document.getElementById('about-who').textContent = data.whoWeAre;
    document.getElementById('about-what').textContent = data.whatWeMake;
    document.getElementById('about-values').innerHTML = (data.values || [])
      .map((v, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${AD_escape(v)}</li>`)
      .join('');
    document.getElementById('about-contact').textContent = data.contact;
    if (window.AD_reveal) window.AD_reveal(document.querySelectorAll('.about-block'));
  } catch (e) { console.error(e); }
}

async function AD_renderArtistDetail(slug) {
  const root = document.getElementById('artist-detail-root');
  if (!root) return;
  try {
    const [artistsData, releasesData] = await Promise.all([
      AD_fetchJSON('data/artists.json'),
      AD_fetchJSON('data/releases.json')
    ]);
    const artist = (artistsData.artists || []).find(a => a.slug === slug);
    const releases = releasesData.releases || [];
    if (!artist) return;

    const photoEl = document.querySelector('.artist-detail-photo');
    if (artist.photoImage) {
      photoEl.style.backgroundImage = `url('${artist.photoImage}')`;
    } else {
      photoEl.classList.add(artist.photo);
    }
    document.getElementById('artist-detail-role').textContent = artist.role;
    document.getElementById('artist-detail-name').textContent = artist.name;
    document.getElementById('artist-detail-bio').textContent = artist.bio;
    document.getElementById('artist-detail-meta').innerHTML = (artist.meta || [])
      .map(m => `<li><span>${AD_escape(m.label)}</span><span>${AD_escape(m.value)}</span></li>`)
      .join('');
    document.getElementById('release-strip').innerHTML = releases.map(r => `
      <a class="release-strip-item" href="index.html#releases">
        <div ${AD_mediaDiv('release-strip-cover', r.cover, r.coverImage)}></div>
        <span>${AD_escape(r.title)}</span>
      </a>
    `).join('');
    document.title = `${artist.name} — Aether Dreams`;
  } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
  AD_renderReleases();
  AD_renderArtists();
  AD_renderJournal();
  AD_renderAbout();
  const params = new URLSearchParams(window.location.search);
  const artistSlug = params.get('id') || document.body.dataset.artist;
  if (artistSlug) {
    AD_renderArtistDetail(artistSlug);
  }
});
