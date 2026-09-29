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
    /** 一時保存のための登録モーダル。opts: { onDone(registered), allowSkip } */
    saveModal(opts) {
      opts = opts || {};
      const st = state;
      let el = document.getElementById('ltModal');
      if (el) el.remove();
      el = document.createElement('div');
      el.id = 'ltModal'; el.className = 'modal-backdrop';
      el.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="ltModalTitle">
          <div class="modal-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg></div>
          <h2 id="ltModalTitle">入力内容を一時保存して、<br>あとから再開できるようにしますか？</h2>
          <p class="muted">メールアドレスを登録すると、入力の途中で閉じても続きから再開できます。再開用のリンクと、許可までのTODOをメールでお送りします。</p>
          <form id="ltModalForm" novalidate>
            <div class="field"><label>メールアドレス<span class="req">必須</span></label><input type="email" name="email" required placeholder="you@example.com" autocomplete="email"></div>
            <div class="field"><label>会社名・屋号<span class="muted" style="font-weight:400;font-size:.8rem;margin-left:6px">任意</span></label><input type="text" name="company" placeholder="株式会社○○" autocomplete="organization"></div>
            <button type="submit" class="btn btn-save btn-block">登録して一時保存をオンにする</button>
          </form>
          ${opts.allowSkip === false ? '' : '<button type="button" class="btn-skip" id="ltModalSkip">登録せずに進める</button>'}
          <p class="modal-note">書類の内容（住所・住民票の情報・決算内容など）は送信されません。送信されるのはメールアドレスと会社名だけです。</p>
        </div>`;
      document.body.appendChild(el);
      document.body.classList.add('modal-open');
      const form = el.querySelector('#ltModalForm');
      form.company.value = (st.lead && st.lead.company) || LT.entityName(st) || '';
      if (st.lead && st.lead.email) form.email.value = st.lead.email;
      const close = (registered) => { el.remove(); document.body.classList.remove('modal-open'); if (opts.onDone) opts.onDone(registered); };
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!LT.validate(form)) { LT.toast('メールアドレスを確認してください'); return; }
        const v = LT.collect(form);
        const lead = Object.assign({}, st.lead || {}, { id: (st.lead && st.lead.id) || LT.uid(), email: v.email, company: v.company, at: new Date().toISOString(), roadmap: true });
        LT.set({ lead, skipRegister: false });
        const c = state.check || {};
        LT.postLead({ event: 'register', id: lead.id, email: lead.email, company: lead.company, roadmap: '1', entityType: state.entityType || '', segment: c.segment || '', channel: c.channel || '', startMonth: c.startMonth || '', step: opts.step || '', userAgent: navigator.userAgent, referer: document.referrer || '' });
        LT.toast('登録しました。入力内容は保存され、いつでも再開できます');
        close(true);
      });
      const skip = el.querySelector('#ltModalSkip');
      if (skip) skip.addEventListener('click', () => { LT.set({ skipRegister: true }); close(false); });
      setTimeout(() => form.email.focus(), 50);
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
