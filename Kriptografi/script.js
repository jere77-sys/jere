let mode = 'enc';
let currentKey = 3;
const history = [];
const DEMO_WORD = 'HALO';

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function setMode(m) {
  mode = m;
  document.getElementById('btn-enc').classList.toggle('active', m === 'enc');
  document.getElementById('btn-dec').classList.toggle('active', m === 'dec');
  document.getElementById('inLabel').textContent = m === 'enc' ? 'TEKS ASLI (PLAINTEXT)' : 'TEKS TERENKRIPSI (CIPHERTEXT)';
  document.getElementById('outLabel').textContent = m === 'enc' ? 'HASIL ENKRIPSI (CIPHERTEXT)' : 'HASIL DEKRIPSI (PLAINTEXT)';
  document.getElementById('runLabel').textContent = m === 'enc' ? 'Jalankan Enkripsi' : 'Jalankan Dekripsi';
  resetOutput();
}

function onKey(v) {
  currentKey = parseInt(v);
  document.getElementById('keyDisplay').innerHTML = v + ' <small>posisi</small>';
  document.getElementById('tblKey').textContent = v;
  document.querySelectorAll('.preset').forEach(b => {
    b.classList.toggle('sel', parseInt(b.textContent) === currentKey ||
      (b.textContent.includes('Caesar') && currentKey === 3) ||
      (b.textContent.includes('ROT13') && currentKey === 13));
  });
  buildAlphaTable();
  buildDemo();
  document.getElementById('demoKey').textContent = v;
}

function setPre(n) {
  document.getElementById('keySlider').value = n;
  onKey(n);
}

function caesar(text, shift, decrypt) {
  if (decrypt) shift = (26 - shift) % 26;
  return text.split('').map(ch => {
    if (ch >= 'A' && ch <= 'Z') return String.fromCharCode((ch.charCodeAt(0) - 65 + shift) % 26 + 65);
    if (ch >= 'a' && ch <= 'z') return String.fromCharCode((ch.charCodeAt(0) - 97 + shift) % 26 + 97);
    return ch;
  }).join('');
}

function runCipher() {
  const txt = document.getElementById('inputText').value;
  if (!txt.trim()) { showToast('⚠ Masukkan teks terlebih dahulu!'); return; }
  const isDecrypt = mode === 'dec';
  const result = caesar(txt, currentKey, isDecrypt);
  const area = document.getElementById('outputArea');
  area.innerHTML = '';
  area.textContent = result;

  const letters = txt.replace(/[^a-zA-Z]/g, '').length;
  const spaces = (txt.match(/ /g) || []).length;
  const nums = txt.replace(/[^0-9]/g, '').length;
  document.getElementById('infoStrip').innerHTML =
    `<div class="info-pill">Huruf: <b>${letters}</b></div>
     <div class="info-pill">Spasi: <b>${spaces}</b></div>
     <div class="info-pill">Angka: <b>${nums}</b> (tidak diubah)</div>
     <div class="info-pill">Kunci: <b>${currentKey}</b></div>
     <div class="info-pill">Mode: <b>${isDecrypt ? 'DEKRIPSI' : 'ENKRIPSI'}</b></div>`;

  addHistory(txt, result, currentKey, isDecrypt);
  showToast(isDecrypt ? '✔ Dekripsi berhasil!' : '✔ Enkripsi berhasil!');
}

function resetOutput() {
  document.getElementById('outputArea').innerHTML = '<span class="output-placeholder">— hasil akan muncul setelah proses —</span>';
  document.getElementById('infoStrip').innerHTML = '';
}

function copyOutput() {
  const txt = document.getElementById('outputArea').textContent;
  if (!txt || txt.includes('—')) { showToast('Tidak ada hasil untuk disalin'); return; }
  navigator.clipboard.writeText(txt).then(() => showToast('✔ Disalin ke clipboard!'));
}

function swapText() {
  const out = document.getElementById('outputArea').textContent;
  if (!out || out.includes('—')) { showToast('Tidak ada hasil untuk ditukar'); return; }
  document.getElementById('inputText').value = out;
  setMode(mode === 'enc' ? 'dec' : 'enc');
  resetOutput();
  showToast('✔ Teks ditukar & mode diubah!');
}

function clearAll() {
  document.getElementById('inputText').value = '';
  resetOutput();
}

function downloadResult() {
  const inp = document.getElementById('inputText').value;
  const out = document.getElementById('outputArea').textContent;
  if (!out || out.includes('—')) { showToast('Jalankan proses terlebih dahulu'); return; }
  const isDecrypt = mode === 'dec';
  const content = `CaesarCrypt — Hasil ${isDecrypt ? 'Dekripsi' : 'Enkripsi'}\n${'='.repeat(40)}\nKunci: ${currentKey}\nMode: ${isDecrypt ? 'DEKRIPSI' : 'ENKRIPSI'}\n\n[INPUT]\n${inp}\n\n[OUTPUT]\n${out}`;
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
  a.download = `caesarcrypt_k${currentKey}.txt`;
  a.click();
  showToast('✔ File diunduh!');
}

function addHistory(inp, out, key, isDecrypt) {
  history.unshift({ inp, out, key, isDecrypt, time: new Date().toLocaleTimeString('id-ID') });
  if (history.length > 10) history.pop();
  renderHistory();
}

function renderHistory() {
  const el = document.getElementById('histList');
  if (!history.length) { el.innerHTML = '<div class="hist-empty">Belum ada operasi yang dilakukan.</div>'; return; }
  el.innerHTML = history.map(h =>
    `<div class="hist-item">
      <span class="hist-badge ${h.isDecrypt ? 'dec' : 'enc'}">${h.isDecrypt ? 'DEC' : 'ENC'}</span>
      <span class="hist-key">k=${h.key}</span>
      <span class="hist-text">${h.inp.slice(0, 30)}${h.inp.length > 30 ? '…' : ''}</span>
      <span class="hist-arrow">→</span>
      <span class="hist-result">${h.out.slice(0, 30)}${h.out.length > 30 ? '…' : ''}</span>
      <span style="font-family:var(--mono);font-size:11px;color:var(--muted);flex-shrink:0;">${h.time}</span>
    </div>`
  ).join('');
}

function buildAlphaTable() {
  const k = currentKey;
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const shifted = alpha.map(c => String.fromCharCode((c.charCodeAt(0) - 65 + k) % 26 + 65));
  document.getElementById('alphaBody').innerHTML =
    `<tr>${alpha.map((c, i) => `<td class="idx" style="background:var(--bg3);color:var(--muted);font-size:10px;">${i}</td>`).join('')}</tr>
     <tr>${alpha.map(c => `<td class="orig">${c}</td>`).join('')}</tr>
     <tr>${shifted.map(c => `<td class="shifted">${c}</td>`).join('')}</tr>`;
  // fix first cell
  document.getElementById('alphaBody').rows[0].insertCell(0).textContent = '';
  document.getElementById('alphaBody').rows[0].cells[0].style.cssText = 'background:var(--bg3)';
  document.getElementById('alphaBody').rows[1].insertAdjacentHTML('afterbegin', '<td style="color:var(--muted);font-size:11px;letter-spacing:1px;white-space:nowrap;">ASLI</td>');
  document.getElementById('alphaBody').rows[2].insertAdjacentHTML('afterbegin', `<td style="color:var(--accent);font-size:11px;letter-spacing:1px;white-space:nowrap;">+${k}</td>`);
}

function buildDemo() {
  const k = currentKey;
  const chars = DEMO_WORD.split('');
  const plain = document.getElementById('demoPlain');
  const cipher = document.getElementById('demoCipher');
  plain.innerHTML = chars.map(c => `<div class="demo-char plain">${c}</div>`).join('');
  cipher.innerHTML = chars.map(c => {
    const shifted = String.fromCharCode((c.charCodeAt(0) - 65 + k) % 26 + 65);
    return `<div class="demo-char cipher">${shifted}</div>`;
  }).join('');
}

// Mobile nav toggle
function toggleNav() {
  const links = document.getElementById('navLinks');
  const toggle = document.getElementById('navToggle');
  links.classList.toggle('open');
  toggle.classList.toggle('open');
}

// Smooth scroll for nav (also closes mobile menu)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    // Close mobile menu
    document.getElementById('navLinks')?.classList.remove('open');
    document.getElementById('navToggle')?.classList.remove('open');
  });
});

// Active nav on scroll
const sections = ['tool', 'table', 'cara', 'riwayat'];
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(id => {
    const s = document.getElementById(id);
    if (s && s.getBoundingClientRect().top < 100) cur = id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
  });
});

// Init
buildAlphaTable();
buildDemo();
