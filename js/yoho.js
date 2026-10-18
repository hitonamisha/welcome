// 水上ビル ひとなみ予報（data/yoho.json を1時間おきに読む）
const DATA_URL = './data/yoho.json';
const SHOPPING_AREA = ['A棟','B棟','C棟','D棟'];

function bar(n, max) {
  const pct = n / Math.max(max, 1);
  if (pct >= 0.9) return '█████';
  if (pct >= 0.7) return '████░';
  if (pct >= 0.5) return '███░░';
  if (pct >= 0.3) return '██░░░';
  if (pct >  0  ) return '█░░░░';
  return '░░░░░';
}

function renderYoho(data) {
  const el = document.getElementById('yoho-body');
  if (!data) { el.innerHTML = '<span class="y-error">データ取得失敗</span>'; return; }

  const shopRows  = data.rows.filter(r =>  SHOPPING_AREA.includes(r.loc_id));
  const otherRows = data.rows.filter(r => !SHOPPING_AREA.includes(r.loc_id));
  const shopTotal = shopRows.reduce((s, r) => s + r.visitor_count, 0);
  const otherTotal= otherRows.reduce((s, r) => s + r.visitor_count, 0);
  const maxCount  = Math.max(...data.rows.map(r => r.visitor_count), 1);
  const topLoc    = shopRows.reduce((a, b) => b.visitor_count > a.visitor_count ? b : a, shopRows[0] || {loc_id:''});

  let html = `<span class="y-title">📍 水上ビル ひと気予報</span><br>`;
  html += `<span class="y-dim">${data.hour}時台（${data.date}）</span><br><br>`;

  html += `<span class="y-head">🏪 商店街エリア（計 ${shopTotal}人）</span><br>`;
  shopRows.forEach(r => {
    const crown = r.loc_id === topLoc.loc_id ? ' 👑' : '';
    const stay  = r.stay_count > 0 ? ` <span class="y-dim">滞在${r.stay_count}人</span>` : '';
    html += `<span class="y-bar">${bar(r.visitor_count, maxCount)}</span> ${r.loc_id}${crown}: <b>${r.visitor_count}人</b>${stay}<br>`;
  });

  if (otherRows.length > 0) {
    html += `<br><span class="y-head">📌 その他エリア（計 ${otherTotal}人）</span><br>`;
    otherRows.forEach(r => {
      const stay = r.stay_count > 0 ? ` <span class="y-dim">滞在${r.stay_count}人</span>` : '';
      html += `<span class="y-bar">${bar(r.visitor_count, maxCount)}</span> ${r.loc_id}: <b>${r.visitor_count}人</b>${stay}<br>`;
    });
  }

  if (data.flows && data.flows.length > 0) {
    html += `<br><span class="y-head">🚶 移動の流れ</span><br>`;
    data.flows.forEach(f => {
      html += `${f.from} → ${f.to}&nbsp;&nbsp;${f.cnt}人<br>`;
    });
  }

  html += `<br><span class="y-credit">Powered by mizunoue data center</span>`;
  el.innerHTML = html;
}

function loadYoho() {
  fetch(DATA_URL + '?t=' + Date.now())
    .then(r => r.json())
    .then(res => {
      if (res.status === 'ok') {
        renderYoho(res.data);
      } else {
        document.getElementById('yoho-body').innerHTML = '<span class="y-dim">データ準備中... しばらくお待ちください</span>';
      }
    })
    .catch(() => {
      document.getElementById('yoho-body').innerHTML = '<span class="y-error">データ取得エラー</span>';
    });
}

loadYoho();
setInterval(loadYoho, 3600000);
