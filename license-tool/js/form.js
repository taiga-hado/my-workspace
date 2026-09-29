/* form.js - 書類入力ウィザード。入力は localStorage に自動保存し、done.html で書類を生成する。 */
(function () {
  'use strict';
  const form = document.getElementById('wizard');
  const steps = Array.from(form.querySelectorAll('[data-step]'));
  const progress = document.getElementById('progress');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const TOTAL = steps.length;
  let current = 1;

  /* 役員入力欄（3名分） */
  const officersEl = document.getElementById('officers');
  for (let i = 1; i <= 3; i++) {
    officersEl.insertAdjacentHTML('beforeend', `
      <h3 style="margin-top:8px">役員${i}</h3>
      <div class="inline">
        <div class="field"><label>氏名</label><input type="text" name="officer${i}Name" placeholder="鈴木 良男"></div>
        <div class="field"><label>ふりがな</label><input type="text" name="officer${i}Kana" placeholder="すずき よしお"></div>
      </div>
      <div class="inline">
        <div class="field"><label>住所（住民票のとおり）</label><input type="text" name="officer${i}Address" placeholder="東京都港区六本木３－２－１－２０１"></div>
        <div class="field"><label>住所のふりがな</label><input type="text" name="officer${i}AddressKana" placeholder="とうきょうとみなとくろっぽんぎ"></div>
      </div>`);
  }

  /* 保存済みデータの復元 */
  const st = LT.get();
  const flat = Object.assign({}, st);
  (st.officers || []).forEach((o, i) => {
    flat[`officer${i + 1}Name`] = o.name; flat[`officer${i + 1}Kana`] = o.kana;
    flat[`officer${i + 1}Address`] = o.address; flat[`officer${i + 1}AddressKana`] = o.addressKana;
  });
  (st.sideBusinesses || []).forEach((s, i) => { flat[`sb${i + 1}`] = s; });
  if (st.scopeDefined !== undefined) flat.scopeDefinedRadio = st.scopeDefined ? 'yes' : 'no';
  if (!flat.submissionDate) {
    const d = new Date(); d.setDate(d.getDate() + 7);
    flat.submissionDate = d.toISOString().slice(0, 10);
  }
  if (flat.officeSame === undefined) flat.officeSame = true;
  if (flat.managerSame === undefined) flat.managerSame = true;
  if (flat.refundEnabled === undefined) flat.refundEnabled = true;
  LT.populate(form, flat);
  if (st.check && st.check.entityType && !form.querySelector('[name=entityType]:checked')) {
    const r = form.querySelector(`[name=entityType][value=${st.check.entityType}]`); if (r) r.checked = true;
  }

  function entity() { return (form.querySelector('[name=entityType]:checked') || {}).value || ''; }

  function syncVisibility() {
    const et = entity();
    form.querySelectorAll('[data-only]').forEach((el) => el.classList.toggle('hidden', el.dataset.only !== et));
    form.querySelectorAll('[data-label-corp]').forEach((el) => el.classList.toggle('hidden', et === 'individual'));
    form.querySelectorAll('[data-label-individual]').forEach((el) => el.classList.toggle('hidden', et !== 'individual'));
    form.querySelectorAll('[data-req]').forEach((el) => { el.required = el.dataset.req === et; });
    document.getElementById('officeBlock').classList.toggle('hidden', form.officeSame.checked);
    form.officeName.required = !form.officeSame.checked;
    document.getElementById('contactBlock').classList.toggle('hidden', form.managerSame.checked);
    document.getElementById('contactTitleOnly').classList.toggle('hidden', !form.managerSame.checked);
    document.getElementById('scopeBlock').classList.toggle('hidden', form.scopeDefinedRadio.value !== 'yes');
    document.getElementById('refundBlock').classList.toggle('hidden', !form.refundEnabled.checked);
  }

  /** フォーム値 → docgen 用データ */
  function toData() {
    const v = LT.collect(form);
    const d = Object.assign({}, LT.get(), v);
    d.officers = [1, 2, 3].map((i) => ({ name: v[`officer${i}Name`] || '', kana: v[`officer${i}Kana`] || '', address: v[`officer${i}Address`] || '', addressKana: v[`officer${i}AddressKana`] || '' })).filter((o) => o.name);
    d.sideBusinesses = [v.sb1, v.sb2, v.sb3].map((s) => (s || '').trim()).filter(Boolean);
    d.scopeDefined = v.scopeDefinedRadio === 'yes';
    if (v.officeSame) { d.officeName = d.officeName || ''; d.officePostal = v.postal; d.officeAddress = v.address; d.officeTel = v.tel; }
    if (!d.officeName) d.officeName = LT.entityName(d);
    if (v.managerSame) { d.contactName = v.managerName; d.contactTitle = v.contactTitle2 || ''; }
    if (d.entityType === 'individual') { d.repAddress = v.address; d.repAddressKana = v.addressKana; d.repTitle = ''; }
    if (!d.feeRateFixed) d.feeRateFixed = d.feeRate;
    [1, 2, 3].forEach((i) => ['Name', 'Kana', 'Address', 'AddressKana'].forEach((k) => delete d[`officer${i}${k}`]));
    ['sb1', 'sb2', 'sb3', 'scopeDefinedRadio'].forEach((k) => delete d[k]);
    return d;
  }
  function persist() { LT.set(toData()); }

  function renderProgress() {
    progress.innerHTML = steps.map((s, i) => `<span class="${i + 1 < current ? 'done' : i + 1 === current ? 'current' : ''}"></span>`).join('');
  }
  function show(n) {
    current = Math.min(Math.max(1, n), TOTAL);
    steps.forEach((s) => s.classList.toggle('hidden', Number(s.dataset.step) !== current));
    prevBtn.style.visibility = current === 1 ? 'hidden' : 'visible';
    nextBtn.textContent = current === TOTAL ? '書類を生成する' : '次へ';
    renderProgress();
    if (current === TOTAL) renderSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try { location.hash = 'step' + current; } catch (e) { /* noop */ }
  }
  function renderSummary() {
    const d = toData();
    const rows = [
      ['申請者', d.entityType === 'corp' ? `${d.companyName}（${d.repTitle} ${d.repName}）` : d.repName],
      ['所在地', `〒${d.postal}　${d.address}　TEL ${d.tel}`],
      ['役員', (d.officers || []).map((o) => o.name).join('、') || '（なし）'],
      ['事業所', `${d.officeName}　〒${d.officePostal}　${d.officeAddress}`],
      ['職業紹介責任者', `${d.managerName}（${d.managerAddress}）`],
      ['担当者', `${d.contactTitle || ''} ${d.contactName || ''}`],
      ['取扱職種の範囲', d.scopeDefined ? `職業：${d.scopeJobs || '全職種'}　地域：${d.scopeArea || '国内'}` : '限定しない（全職種・国内）'],
      ['有効求職者見込数／従事者数', `${d.expectedJobseekers || 0}人／${d.staffCount || 1}人`],
      ['手数料', `成功報酬 ${d.feeRate}％（有期 ${d.feeRateFixed}％）　事務費用 ${d.feeAdmin || 0}円`],
      ['返戻金', d.refundEnabled ? `1か月未満 ${d.refundRate1}％／3か月未満 ${d.refundRate3}％／6か月未満 ${d.refundRate6}％` : '設けない'],
    ];
    document.getElementById('summary').innerHTML = '<table class="plain">' + rows.map(([k, v]) => `<tr><th>${k}</th><td>${v || ''}</td></tr>`).join('') + '</table>';
  }

  form.addEventListener('change', () => { syncVisibility(); persist(); });
  form.addEventListener('input', () => { clearTimeout(form._t); form._t = setTimeout(persist, 400); });
  prevBtn.addEventListener('click', () => { persist(); show(current - 1); });
  nextBtn.addEventListener('click', () => {
    const sec = steps[current - 1];
    if (!LT.validate(sec)) { LT.toast('未入力または形式が正しくない項目があります'); return; }
    persist();
    LT.postProgress(current);
    if (current === TOTAL) { location.href = 'done.html'; return; }
    show(current + 1);
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('入力内容をすべて削除しますか？')) { LT.reset(); location.reload(); }
  });

  /* 郵便番号 → 住所（zipcloud）。失敗しても入力は続けられる */
  form.querySelectorAll('[data-zipbtn]').forEach((btn) => btn.addEventListener('click', async () => {
    const input = form[btn.dataset.zipbtn];
    const zip = (input.value || '').replace(/[^0-9０-９]/g, '').replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    if (zip.length !== 7) { LT.toast('郵便番号を7桁で入力してください'); return; }
    btn.disabled = true;
    try {
      const res = await fetch('https://zipcloud.ibsnet.co.jp/api/search?zipcode=' + zip);
      const j = await res.json();
      const r = j.results && j.results[0];
      if (!r) { LT.toast('該当する住所が見つかりませんでした'); return; }
      const target = input.dataset.zip;
      const addr = r.address1 + r.address2 + r.address3;
      if (!form[target].value || form[target].value.length < addr.length) form[target].value = addr;
      const kanaField = form[target + 'Kana'];
      if (kanaField && !kanaField.value) kanaField.value = toHira(r.kana1 + r.kana2 + r.kana3);
      input.value = zip.slice(0, 3) + '-' + zip.slice(3);
      form[target].focus();
      persist();
    } catch (e) { LT.toast('住所の取得に失敗しました。手入力してください'); }
    finally { btn.disabled = false; }
  }));
  function toHira(k) { return String(k || '').replace(/[ァ-ン]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/ヶ/g, 'が'); }

  /* 有効求職者見込数の計算補助 */
  const calcBtn = document.getElementById('calcBtn');
  if (calcBtn) calcBtn.addEventListener('click', () => {
    const m = Number(document.getElementById('calcMonthly').value || 0), n = Number(document.getElementById('calcMonths').value || 0);
    if (!m || !n) { LT.toast('月の登録人数と月数を入力してください'); return; }
    form.expectedJobseekers.value = m * n; persist(); LT.toast(`${m * n}人を入力しました`);
  });

  /* 一時保存（登録） */
  const saveState = document.getElementById('saveState');
  function refreshSaveState() {
    const l = LT.get().lead;
    saveState.textContent = l && l.email ? '一時保存オン（' + l.email + '）' : '自動保存中';
    saveState.classList.toggle('on', !!(l && l.email));
  }
  document.getElementById('saveBtn').addEventListener('click', () => {
    persist();
    const l = LT.get().lead;
    if (l && l.email) { LT.toast('保存済みです。このブラウザで form.html を開けば続きから再開できます'); return; }
    LT.saveModal({ step: current, onDone: () => { refreshSaveState(); } });
  });
  refreshSaveState();

  syncVisibility();
  const m = location.hash.match(/step(\d)/);
  show(m ? Number(m[1]) : 1);
  const st0 = LT.get();
  if (!(st0.lead && st0.lead.email) && !st0.skipRegister) {
    LT.saveModal({ step: 1, onDone: () => refreshSaveState() });
  }
})();
