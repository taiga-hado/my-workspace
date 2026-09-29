/* check.js - 要件診断 */
(function () {
  'use strict';
  const form = document.getElementById('checkForm');
  const result = document.getElementById('result');
  const state = LT.get();
  if (state.check) LT.populate(form, state.check);
  if (state.entityType && !form.querySelector('[name=entityType]:checked')) {
    const r = form.querySelector(`[name=entityType][value=${state.entityType}]`); if (r) r.checked = true;
  }

  function syncEntity() {
    const et = (form.querySelector('[name=entityType]:checked') || {}).value;
    form.querySelectorAll('[data-only]').forEach((el) => el.classList.toggle('hidden', el.dataset.only !== et));
  }
  form.addEventListener('change', syncEntity);
  syncEntity();

  function diagnose(c) {
    const fails = [], warns = [], oks = [];
    const n = Number(c.officeCount || 1);
    const needAssets = 500 * n, needCash = 150 + 60 * (n - 1);
    if (Number(c.netAssets) >= needAssets) oks.push(`基準資産額 ${c.netAssets}万円（必要額 ${needAssets}万円）`);
    else fails.push(`基準資産額が不足しています（${c.netAssets || 0}万円、必要額 ${needAssets}万円）。増資または利益の積み上げ後に、貸借対照表で証明できる状態にしてから申請してください。`);
    if (Number(c.cash) >= needCash) oks.push(`自己名義の現預金 ${c.cash}万円（必要額 ${needCash}万円）`);
    else fails.push(`現預金が不足しています（${c.cash || 0}万円、必要額 ${needCash}万円）。`);
    if (c.entityType === 'corp' && c.purpose !== 'yes') fails.push('定款の事業目的に「職業紹介事業」の記載が必要です。目的変更登記を済ませてから申請します（申請時に登記事項証明書と定款の写しを添付）。');
    if (!c.noDisqualification) fails.push('欠格事由に該当する役員がいる場合は許可を受けられません。');
    if (c.officeType === 'none') warns.push('事業所が決まっていません。申請には賃貸借契約書（転貸の場合は所有者の承諾書も）が必要です。');
    else if (c.officeType === 'home') warns.push('自宅を事業所にする場合は、生活空間と区分された専用の部屋と、来客が生活空間を通らない動線が求められます。レイアウト図で示してください。');
    else if (c.officeType === 'rental') warns.push('レンタルオフィスは個室であること、契約書に利用範囲が明記されていることを確認してください。フリーアドレス型は認められません。');
    if (!c.privacyOk) warns.push('面談スペースのプライバシー確保と、鍵のかかる保管場所は審査で確認されます。事業所レイアウト図に位置を記載してください。');
    if (c.course === 'none') warns.push('職業紹介責任者講習を受講してください。受講証明書の写しがないと申請できません（各実施機関で月数回開催、受講料1万円前後）。');
    else if (c.course === 'booked') warns.push('受講後に受講証明書の写しを添付します。受講日が申請より前になるよう日程を組んでください。');
    else oks.push('職業紹介責任者講習 受講済み');
    return { fails, warns, oks };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!LT.validate(form)) { LT.toast('未入力の必須項目があります'); return; }
    const c = LT.collect(form);
    LT.set({ check: c, entityType: c.entityType });
    const r = diagnose(c);
    const pass = r.fails.length === 0;
    let html = `<div class="result ${pass ? '' : 'ng'}"><h3>${pass ? '申請できる見込みです' : '申請前に解消が必要な項目があります'}</h3>`;
    if (r.fails.length) html += '<ul>' + r.fails.map((s) => `<li>${s}</li>`).join('') + '</ul>';
    if (r.oks.length) html += '<p style="margin:8px 0 0"><strong>確認済み：</strong>' + r.oks.join('　／　') + '</p>';
    html += '</div>';
    if (r.warns.length) html += '<div class="warn"><strong>申請までに準備すること</strong><ul style="margin:6px 0 0;padding-left:20px">' + r.warns.map((s) => `<li>${s}</li>`).join('') + '</ul></div>';
    html += '<div class="note" style="margin-top:14px">2025年1月1日施行の許可条件の追加（東京労働局の案内）があります。申請前に管轄労働局の最新案内を確認してください。</div>';
    html += '<div class="wizard-nav">';
    if (pass) html += '<span></span><a class="btn btn-primary" href="form.html">このまま書類を作成する</a>';
    else html += '<a class="btn btn-secondary" href="form.html">要件を整えてから使う（書類作成へ）</a><a class="btn btn-primary" href="https://soukyaku-cloud.com/#contact" target="_blank" rel="noopener">社労士の紹介を相談する</a>';
    html += '</div>';
    result.innerHTML = html; result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
