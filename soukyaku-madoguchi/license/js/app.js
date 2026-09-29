/* app.js - shared state, lead scoring and helpers for the license tool. All data stays in localStorage. */
(function () {
  'use strict';
  const KEY = 'lt.v1';

  const config = {
    // Google Apps Script Web App URL (apps-script/lead-handler.gs をデプロイして設定する)
    GAS_URL: '',
    CLOUD_URL: 'https://soukyaku-cloud.com/',
    MADOGUCHI_URL: 'https://kyusyokusyasokyaku-no-madoguchi.com/',
    TEMPLATE_DIR: 'templates/',
  };

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* private mode */ }
  }
  let state = load();

  const LT = {
    config,
    get() { return state; },
    set(patch) { state = Object.assign({}, state, patch); save(state); return state; },
    reset() { state = {}; save(state); },
    uid() {
      return 'lt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    },
    toast(msg) {
      let el = document.querySelector('.toast');
      if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
      el.textContent = msg; el.classList.add('show');
      clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2600);
    },
    download(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
    },
    /** リード送信（GAS）。no-cors のため結果は読めない。URL未設定なら何もしない。 */
    postLead(obj) {
      if (!config.GAS_URL) return Promise.resolve(false);
      const params = new URLSearchParams();
      Object.keys(obj).forEach((k) => params.append(k, obj[k] == null ? '' : String(obj[k])));
      return fetch(config.GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() })
        .then(() => true).catch(() => false);
    },
    /** 要件診断の入力から送客クラウドとの相性スコアを出す。 */
    score(d) {
      const c = d.check || {};
      let score = 0; const reasons = [];
      const seg = c.segment || '';
      if (/20代|第二新卒|未経験|高卒|新卒/.test(seg)) { score += 3; reasons.push('若手・未経験層'); }
      else if (/ハイクラス|専門職|外国人/.test(seg)) { score -= 1; }
      const ch = c.channel || '';
      if (/未定|SNS|自社/.test(ch)) { score += 2; reasons.push('集客経路が未定・自社集客'); }
      else if (/送客/.test(ch)) { score += 1; }
      if (c.startMonth) {
        const m = new Date(c.startMonth + '-01');
        const diff = (m.getFullYear() - new Date().getFullYear()) * 12 + m.getMonth() - new Date().getMonth();
        if (diff <= 3) { score += 1; reasons.push('開業予定が3ヶ月以内'); }
      }
      const n = Number(String(d.expectedJobseekers || '').replace(/[^0-9]/g, ''));
      if (n >= 50) { score += 1; reasons.push('求職者見込数が多い'); }
      const rank = score >= 5 ? 'A' : score >= 3 ? 'B' : 'C';
      return { score, rank, reasons };
    },
    /** 会社名 or 氏名 */
    entityName(d) { return d.entityType === 'corp' ? (d.companyName || '') : (d.repName || ''); },
    /** フォーム要素 → state。name 属性をキーにする。checkbox は true/false。 */
    collect(root) {
      const out = {};
      root.querySelectorAll('input[name], select[name], textarea[name]').forEach((el) => {
        if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; else if (!(el.name in out)) out[el.name] = out[el.name]; return; }
        if (el.type === 'checkbox') { out[el.name] = el.checked; return; }
        out[el.name] = el.value;
      });
      Object.keys(out).forEach((k) => { if (out[k] === undefined) delete out[k]; });
      return out;
    },
    /** state → フォーム要素 */
    populate(root, data) {
      root.querySelectorAll('input[name], select[name], textarea[name]').forEach((el) => {
        const v = data[el.name];
        if (v === undefined) return;
        if (el.type === 'radio') el.checked = el.value === v;
        else if (el.type === 'checkbox') el.checked = !!v;
        else el.value = v;
      });
    },
    /** 表示中の必須項目だけ検証 */
    validate(root) {
      let ok = true;
      root.querySelectorAll('input, select, textarea').forEach((el) => {
        if (el.closest('.hidden') || el.offsetParent === null) return;
        const field = el.closest('.field');
        const valid = el.checkValidity();
        el.classList.toggle('invalid', !valid);
        if (field) field.classList.toggle('has-error', !valid);
        if (!valid) ok = false;
      });
      return ok;
    },
  };
  window.LT = LT;
})();
