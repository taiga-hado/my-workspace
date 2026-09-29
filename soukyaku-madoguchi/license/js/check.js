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

  function timeline(c) {
    const now = new Date();
    const fmt = (d) => `${d.getFullYear()}年${d.getMonth() + 1}月${c.startWish === 'later' ? '' : d.getDate() <= 15 ? '上旬' : '下旬'}`;
    const add = (days) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
    const prep = c.course === 'done' ? 7 : c.course === 'booked' ? 21 : 35;
    const rows = [
      ['書類準備・責任者講習', fmt(now) + '〜', c.course === 'done' ? '講習は受講済み。添付書類の収集に1〜2週間。' : '講習の受講と添付書類の収集で2〜5週間。'],
      ['労働局に申請', fmt(add(prep)), '提出時に窓口で内容確認。補正があれば1〜2週間延びます。'],
      ['許可（目安）', fmt(add(prep + 75)), '審査は通常2〜3ヶ月。許可証が届いたら営業開始できます。'],
      ['開業', fmt(add(prep + 80)), '許可待ちの間に求人DBと集客経路を決めておくと、初月から面談を組めます。'],
    ];
    return '<div class="card" style="margin-top:14px"><h3>許可までの目安スケジュール</h3><p class="muted" style="font-size:.88rem">今日から準備を始めた場合の目安です。書類の「開業予定」欄はこのスケジュールから自動で入ります。</p><table class="plain">' +
      rows.map((r) => `<tr><th>${r[0]}</th><td><strong>${r[1]}</strong><br><span class="muted" style="font-size:.85rem">${r[2]}</span></td></tr>`).join('') + '</table></div>';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!LT.validate(form)) { LT.toast('未入力の必須項目があります'); return; }
    const c = LT.collect(form);
    // 希望時期 → 開業予定月（目安）を逆算。asap: 講習(2週)+申請(1週)+審査(2.5ヶ月)
    const now = new Date();
    const monthsAhead = { asap: 3, '3m': 3, '6m': 6, later: 9 }[c.startWish] || 3;
    const sm = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);
    c.startMonth = sm.getFullYear() + '-' + String(sm.getMonth() + 1).padStart(2, '0');
    LT.set({ check: c, entityType: c.entityType });
    const r = diagnose(c);
    const pass = r.fails.length === 0;
    let html = `<div class="result ${pass ? '' : 'ng'}"><h3>${pass ? '申請できる見込みです' : '申請前に解消が必要な項目があります'}</h3>`;
    if (r.fails.length) html += '<ul>' + r.fails.map((s) => `<li>${s}</li>`).join('') + '</ul>';
    if (r.oks.length) html += '<p style="margin:8px 0 0"><strong>確認済み：</strong>' + r.oks.join('　／　') + '</p>';
    html += '</div>';
    if (r.warns.length) html += '<div class="warn"><strong>申請までに準備すること</strong><ul style="margin:6px 0 0;padding-left:20px">' + r.warns.map((s) => `<li>${s}</li>`).join('') + '</ul></div>';
    html += timeline(c);
    html += '<div class="note" style="margin-top:14px">2025年1月1日施行の許可条件の追加（東京労働局の案内）があります。申請前に管轄労働局の最新案内を確認してください。</div>';
    html += '<div class="wizard-nav">';
    if (pass) html += '<span></span><a class="btn btn-primary" href="form.html">このまま書類を作成する</a>';
    else html += '<span></span><a class="btn btn-primary" href="form.html">要件を整えながら書類を作成する</a>';
    html += '</div>';
    result.innerHTML = html; result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
