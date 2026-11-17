// 套用維護後台存在此瀏覽器的內容（localStorage），覆蓋 content.js 的預設資料。
// 沒有儲存過、或資料不完整時，維持 content.js 原樣。
(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('tcs-content') || 'null');
    if (!saved) return;
    const lists = [['team', team], ['books', books], ['spaces', spaces]];
    const valid = lists.every(([key]) => Array.isArray(saved[key]) && saved[key].every(x => x && typeof x === 'object'))
      && saved.team.every(p => Array.isArray(p.sections) && p.sections.some(s => s && s.title === '學術專長' && Array.isArray(s.items)));
    if (!valid) return;
    for (const [key, target] of lists) target.splice(0, target.length, ...saved[key]);
  } catch { /* 無法讀取時使用預設內容 */ }
})();
