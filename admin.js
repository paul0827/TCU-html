// 維護後台：編輯 content.js 內的團隊、出版品與空間資料。
// 伺服器模式（python admin-server.py）：登入由伺服器驗證，儲存直接寫入 content.js，可上傳圖片。
// 網頁模式（直接開檔或純靜態主機）：登入僅為瀏覽器端的簡易檢查，儲存寫入此瀏覽器的 localStorage，
// 由 overrides.js 套用到網站；另可匯出 content.js 供重新部署。
(() => {
'use strict';
const STATIC_LOGIN = { user: 'admin', pass: 'admin' };
const CATS = ['思想', '四大志業', '社會實踐', '生活與環境'];
const SLUG = /^[A-Za-z0-9_-]+$/;
const LOCAL_KEY = 'tcs-content';
const hasLocal = () => { try { return localStorage.getItem(LOCAL_KEY) !== null; } catch { return false; } };
const $ = s => document.querySelector(s);
const clone = v => JSON.parse(JSON.stringify(v));

const data = { team: clone(team), books: clone(books), spaces: clone(spaces) };
let mode = 'static', tab = 'books', dirty = false, toastTimer;

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k !== 'list' && k in el) el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  el.append(...kids.flat().filter(k => k != null && k !== false));
  return el;
}

function toast(message, bad = false) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.toggle('bad', bad);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, bad ? 7000 : 4500);
}

// ---- 登入狀態 ----------------------------------------------------------
const store = {
  get: k => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* 無法儲存時僅維持本頁登入 */ } },
  del: k => { try { sessionStorage.removeItem(k); } catch { /* ignore */ } }
};
let token = store.get('admin-token') || '';
const auth = () => (token ? { Authorization: 'Bearer ' + token } : {});

async function api(path, options = {}) {
  const res = await fetch(path, { cache: 'no-store', ...options, headers: { ...auth(), ...(options.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== 'api/login') {
    showLogin('登入已逾時，請重新登入。尚未儲存的修改仍保留在此頁。');
    throw new Error('請重新登入');
  }
  if (!res.ok) throw new Error(body.error || '操作失敗（' + res.status + '）');
  return body;
}

async function detect() {
  if (location.protocol === 'file:') return false;
  try {
    const res = await fetch('api/session', { cache: 'no-store', headers: auth() });
    if (!(res.headers.get('content-type') || '').includes('application/json')) return false;
    const body = await res.json();
    if (body.server !== true) return false;
    mode = 'server';
    return body.ok === true;
  } catch { return false; }
}

function showLogin(message = '') {
  token = '';
  store.del('admin-token');
  store.del('admin-static');
  $('#app').hidden = true;
  $('#login').hidden = false;
  $('#login-error').textContent = message;
  $('#login-pass').value = '';
  $('#login-user').focus();
}

function showApp() {
  $('#login').hidden = true;
  $('#app').hidden = false;
  $('#mode').textContent = mode === 'server'
    ? '本機維護模式：按「儲存變更」會直接更新網站的 content.js，並自動保留前一版備份。'
    : '網頁維護模式：按「儲存變更」後，修改會存在這個瀏覽器，並立即顯示在此瀏覽器的網站上。要讓所有訪客看到，請「匯出 content.js」取代網站資料夾內的同名檔案後重新部署。';
  $('#reset').hidden = mode === 'server' || !hasLocal();
  render();
}

$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const user = $('#login-user').value.trim(), pass = $('#login-pass').value;
  $('#login-error').textContent = '';
  try {
    if (mode === 'server') {
      token = (await api('api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user, pass }) })).token;
      store.set('admin-token', token);
    } else {
      if (user !== STATIC_LOGIN.user || pass !== STATIC_LOGIN.pass) throw new Error('帳號或密碼不正確');
      store.set('admin-static', '1');
    }
    showApp();
  } catch (err) { $('#login-error').textContent = err.message; $('#login-pass').select(); }
});

$('#logout').addEventListener('click', async () => {
  if (dirty && !confirm('尚有未儲存的修改，確定要登出嗎？')) return;
  if (mode === 'server') { try { await api('api/logout', { method: 'POST' }); } catch { /* 已登出 */ } }
  dirty = false;
  showLogin();
});

// ---- 資料結構定義 ------------------------------------------------------
const schemas = {
  books: {
    label: '出版品', unit: '本', key: 'n',
    title: b => b.title, meta: b => `印證叢書 ${b.n} · ${b.cat}${b.sub ? ' · ' + b.sub : ''}`,
    blank: () => ({ n: '', title: '', sub: '', cat: CATS[0], image: '', theme: '', direction: '' }),
    fields: [
      { name: 'n', label: '叢書編號', required: true, slug: true, hint: '例如 013；僅限英數字，不可重複。' },
      { name: 'title', label: '書名', required: true },
      { name: 'sub', label: '副題' },
      { name: 'cat', label: '分類', type: 'select', options: CATS },
      { name: 'theme', label: '閱讀主題', hint: '例如：慈善與關懷' },
      { name: 'direction', label: '閱讀方向', type: 'textarea' },
      { name: 'image', label: '書封圖片', type: 'image', required: true }
    ]
  },
  team: {
    label: '核心團隊', unit: '位', key: 'id',
    title: p => `${p.name} ${p.title}`, meta: p => p.role,
    blank: () => ({ id: '', name: '', title: '', role: '', english: '', image: '', phone: '', dial: '', ext: '', email: '',
      sections: ['職務', '學歷', '經歷', '學術專長'].map(title => ({ title, items: [] })) }),
    fields: [
      { name: 'id', label: '代號', required: true, slug: true, hint: '用於網址，例如 cheng；僅限英數字，不可重複。' },
      { name: 'name', label: '姓名', required: true },
      { name: 'title', label: '職稱', hint: '例如：助理教授' },
      { name: 'role', label: '中心角色', hint: '例如：研究中心主持人' },
      { name: 'english', label: '英文姓名' },
      { name: 'phone', label: '電話', hint: '例如：+886-3-8572677' },
      { name: 'ext', label: '分機' },
      { name: 'email', label: '電子郵件' },
      { name: 'image', label: '照片', type: 'image', required: true },
      { name: 'sections', label: '簡歷區塊', type: 'sections', hint: '每行一個項目。「學術專長」會固定顯示在姓名下方，請保留此區塊。' }
    ]
  },
  spaces: {
    label: '空間場域', unit: '張照片',
    title: s => s.caption || s.name, meta: s => s.name,
    blank: () => ({ image: '', name: '', caption: '' }),
    fields: [
      { name: 'name', label: '場域名稱', required: true, suggest: () => [...new Set(data.spaces.map(s => s.name))], hint: '相同名稱的照片會歸在同一個分類。' },
      { name: 'caption', label: '照片說明', required: true },
      { name: 'image', label: '照片', type: 'image', required: true }
    ]
  }
};

// ---- 清單 --------------------------------------------------------------
function setDirty(value) {
  dirty = value;
  $('#save').disabled = !value;
  $('#save').textContent = value ? '儲存變更 •' : '儲存變更';
}

function thumb(name) {
  if (!name) return h('span', { class: 'no-img' });
  const img = h('img', { src: 'assets/' + name, alt: '', loading: 'lazy' });
  img.addEventListener('error', () => img.replaceWith(h('span', { class: 'no-img' })));
  return img;
}

function render() {
  const schema = schemas[tab], items = data[tab];
  document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $('#panel-title').textContent = `${schema.label}（${items.length} ${schema.unit}）`;
  $('#empty').hidden = items.length > 0;
  $('#list').replaceChildren(...items.map((item, i) => h('li', { class: 'row' },
    thumb(item.image),
    h('div', { class: 'row-text' }, h('strong', {}, schema.title(item) || '（未命名）'), h('small', {}, schema.meta(item) || '')),
    h('div', { class: 'row-actions' },
      h('button', { class: 'ghost', type: 'button', disabled: i === 0, 'aria-label': '上移', onclick: () => move(i, -1) }, '↑'),
      h('button', { class: 'ghost', type: 'button', disabled: i === items.length - 1, 'aria-label': '下移', onclick: () => move(i, 1) }, '↓'),
      h('button', { class: 'ghost', type: 'button', onclick: () => openEditor(i) }, '編輯'),
      h('button', { class: 'ghost danger', type: 'button', onclick: () => remove(i) }, '刪除'))
  )));
}

function move(i, step) {
  const items = data[tab];
  [items[i], items[i + step]] = [items[i + step], items[i]];
  setDirty(true);
  render();
}

function remove(i) {
  const schema = schemas[tab];
  if (!confirm(`確定要刪除「${schema.title(data[tab][i])}」嗎？`)) return;
  data[tab].splice(i, 1);
  setDirty(true);
  render();
}

document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
$('#add').addEventListener('click', () => openEditor(-1));

// ---- 編輯視窗 ----------------------------------------------------------
let editing = null;

function imageField(field, value, id) {
  const input = h('input', { id, value, placeholder: '例如 book-11.png', spellcheck: false });
  const preview = h('img', { alt: '' });
  const refresh = () => { preview.style.visibility = input.value.trim() ? 'visible' : 'hidden'; preview.src = input.value.trim() ? 'assets/' + input.value.trim() : ''; };
  preview.addEventListener('error', () => { preview.style.visibility = 'hidden'; });
  input.addEventListener('change', refresh);
  refresh();
  const side = h('div', {}, input);
  if (mode === 'server') {
    const file = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif', 'aria-label': '上傳' + field.label });
    file.addEventListener('change', async () => {
      if (!file.files[0]) return;
      try {
        const res = await api('api/upload?name=' + encodeURIComponent(file.files[0].name), { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file.files[0] });
        input.value = res.name;
        refresh();
        toast('圖片已上傳：' + res.name);
      } catch (err) { toast(err.message, true); }
      file.value = '';
    });
    side.append(file, h('p', { class: 'hint' }, '可直接上傳圖片，或填入 assets 資料夾內既有的檔名。'));
  } else {
    side.append(h('p', { class: 'hint' }, '請先把圖片放進網站的 assets 資料夾，再填入檔名。'));
  }
  return { el: h('div', { class: 'image-field' }, preview, side), get: () => input.value.trim() };
}

function sectionsField(value) {
  const box = h('div', { class: 'sections' });
  const block = (sec = { title: '', items: [] }) => {
    const el = h('div', { class: 'section-block' },
      h('div', { class: 'section-block-head' },
        h('input', { value: sec.title, placeholder: '區塊標題，例如：學歷', 'aria-label': '區塊標題' }),
        h('button', { class: 'ghost danger', type: 'button', onclick: () => el.remove() }, '移除')),
      h('textarea', { value: sec.items.join('\n'), rows: Math.min(8, Math.max(3, sec.items.length + 1)), 'aria-label': '區塊內容，每行一項' }));
    return el;
  };
  box.append(...value.map(block));
  const add = h('button', { class: 'ghost', type: 'button', onclick: () => { const el = block(); box.append(el); el.querySelector('input').focus(); } }, '＋ 新增區塊');
  return {
    el: h('div', {}, box, h('p', {}, add)),
    get: () => [...box.children].map(el => ({
      title: el.querySelector('input').value.trim(),
      items: el.querySelector('textarea').value.split('\n').map(s => s.trim()).filter(Boolean)
    })).filter(sec => sec.title)
  };
}

function buildField(field, value, id) {
  if (field.type === 'image') return imageField(field, value || '', id);
  if (field.type === 'sections') return sectionsField(value || []);
  if (field.type === 'select') {
    const options = field.options.includes(value) || !value ? field.options : [value, ...field.options];
    const el = h('select', { id }, options.map(o => h('option', { value: o, selected: o === value }, o)));
    return { el, get: () => el.value };
  }
  if (field.type === 'textarea') {
    const el = h('textarea', { id, value: value || '', rows: 4 });
    return { el, get: () => el.value.trim() };
  }
  const el = h('input', { id, value: value || '', list: field.suggest ? id + '-list' : null });
  const extra = field.suggest ? h('datalist', { id: id + '-list' }, field.suggest().map(o => h('option', { value: o }))) : null;
  return { el: extra ? h('div', {}, el, extra) : el, get: () => el.value.trim() };
}

function openEditor(index) {
  const schema = schemas[tab];
  const item = index < 0 ? schema.blank() : data[tab][index];
  const controls = schema.fields.map(field => {
    const id = 'f-' + field.name;
    return { field, control: buildField(field, item[field.name], id), id };
  });
  editing = { index, controls };
  $('#editor-title').textContent = (index < 0 ? '新增' : '編輯') + schema.label;
  $('#editor-error').textContent = '';
  $('#editor-fields').replaceChildren(...controls.flatMap(({ field, control, id }) => [
    h('label', { for: id }, field.label + (field.required ? ' *' : '')),
    control.el,
    field.hint ? h('p', { class: 'hint' }, field.hint) : null
  ].filter(Boolean)));
  $('#editor').showModal();
}

$('#editor-cancel').addEventListener('click', () => $('#editor').close());
$('#editor-form').addEventListener('submit', e => {
  e.preventDefault();
  const schema = schemas[tab], { index, controls } = editing;
  const next = index < 0 ? schema.blank() : clone(data[tab][index]);
  for (const { field, control } of controls) {
    const value = control.get();
    if (field.required && !value) return fail(`請填寫「${field.label}」。`);
    if (field.slug && !SLUG.test(value)) return fail(`「${field.label}」僅能使用英文字母、數字、- 與 _。`);
    next[field.name] = value;
  }
  if (schema.key && data[tab].some((x, i) => i !== index && x[schema.key] === next[schema.key])) {
    return fail(`${schema.fields[0].label}「${next[schema.key]}」已被使用。`);
  }
  if (tab === 'team') {
    next.dial = next.phone.replace(/[^\d+]/g, '');
    if (!next.sections.some(s => s.title === '學術專長')) next.sections.push({ title: '學術專長', items: [] });
  }
  if (index < 0) data[tab].push(next); else data[tab][index] = next;
  setDirty(true);
  render();
  $('#editor').close();
});
function fail(message) { $('#editor-error').textContent = message; $('#editor-error').scrollIntoView({ block: 'nearest' }); }

// ---- 儲存 --------------------------------------------------------------
const toJs = d => `const team=${JSON.stringify(d.team, null, 1)};\nconst books=${JSON.stringify(d.books, null, 1)};\nconst spaces=${JSON.stringify(d.spaces, null, 1)};\n`;

$('#save').addEventListener('click', async () => {
  if (mode === 'server') {
    $('#save').disabled = true;
    try {
      await api('api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      try { localStorage.removeItem(LOCAL_KEY); } catch { /* ignore */ }
      setDirty(false);
      toast('已儲存，網站內容已更新。');
    } catch (err) { $('#save').disabled = !dirty; toast(err.message, true); }
    return;
  }
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {
    toast('此瀏覽器無法儲存資料，請改用「匯出 content.js」。', true);
    return;
  }
  setDirty(false);
  $('#reset').hidden = false;
  toast('已儲存，此瀏覽器的網站已顯示新內容。');
});

$('#export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([toJs(data)], { type: 'text/javascript' }));
  h('a', { href: url, download: 'content.js' }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('已下載 content.js，請用它取代網站資料夾內的同名檔案。');
});

$('#reset').addEventListener('click', () => {
  if (!confirm('確定要捨棄存在此瀏覽器的所有修改，還原為網站原始內容嗎？')) return;
  try { localStorage.removeItem(LOCAL_KEY); } catch { /* ignore */ }
  dirty = false;
  location.reload();
});

window.addEventListener('beforeunload', e => { if (dirty) e.preventDefault(); });

// ---- 啟動 --------------------------------------------------------------
detect().then(loggedIn => {
  if (loggedIn || (mode === 'static' && store.get('admin-static') === '1')) showApp();
  else showLogin();
});
})();
