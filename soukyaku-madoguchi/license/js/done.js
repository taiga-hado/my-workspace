/* done.js - メール登録 → 書類プレビュー・ダウンロード → 免許取得までの工程図 → 添付書類 */
(function () {
  'use strict';
  const gate = document.getElementById('gate');
  const downloads = document.getElementById('downloads');
  const data = LT.get();

  if (!data.repName) { location.replace('form.html'); return; }

  /* ---------- 書類 ---------- */
  const DOCS = [
    { k: 'form1', tag: '様式第1号', name: '職業紹介事業許可申請書', desc: '第1面・第2面。申請者・役員・事業所・責任者を記載。' },
    { k: 'form2', tag: '様式第2号', name: '有料職業紹介事業計画書', desc: '取扱職種の範囲、有効求職者見込数、従事者数。' },
    { k: 'form3', tag: '様式第3号', name: '届出制手数料届出書', desc: '手数料表を別紙として届け出る書類。' },
    { k: 'fee', tag: '様式例第3号', name: '手数料表（一般登録型）', desc: '成功報酬の料率と負担者。' },
    { k: 'rules', tag: '様式例第1号', name: '業務の運営に関する規程', desc: '求人・求職・紹介の運営ルール。事業所に備え付け。' },
    { k: 'privacy', tag: '規程', name: '個人情報適正管理規程', desc: '個人情報の取扱責任者と管理方法。' },
    { k: 'notice', tag: '明示書面', name: '求人者・求職者の皆様へ', desc: '取扱職種・手数料・返戻金・苦情窓口の明示用。Web掲載にも。' },
  ];
  const busy = {};
  async function gen(key) {
    if (busy[key]) return; busy[key] = true;
    const btns = document.querySelectorAll(`[data-gen="${key}"]`);
    btns.forEach((b) => { b.disabled = true; b.dataset.label = b.textContent; b.textContent = '生成中…'; });
    try {
      const blob = await DocGen.generate(key, LT.get(), LT.config.TEMPLATE_DIR);
      LT.download(blob, DocGen.DOCS[key].name);
    } catch (e) {
      console.error(e); LT.toast('生成に失敗しました。ページを再読み込みしてください');
    } finally {
      busy[key] = false;
      btns.forEach((b) => { b.disabled = false; b.textContent = b.dataset.label || 'ダウンロード'; });
    }
  }
  function previewHtml(k) { try { return DocPreview[k](LT.get()); } catch (e) { console.error(e); return '<div class="pv">プレビューを表示できません</div>'; } }
  function renderDocs() {
    const grid = document.getElementById('docGrid');
    grid.innerHTML = DOCS.map((d) => `
      <div class="doc-card">
        <div class="doc-thumb" data-pv="${d.k}" title="クリックで拡大"><div class="pv-scale">${previewHtml(d.k)}</div><span class="zoom">拡大</span></div>
        <div class="doc-body"><span class="k">${d.tag}</span><h3>${d.name}</h3><div class="desc">${d.desc}</div>
          <div class="row"><button type="button" class="btn btn-secondary" data-pv="${d.k}">プレビュー</button><button type="button" class="btn btn-primary" data-gen="${d.k}">ダウンロード</button></div></div>
      </div>`).join('');
    grid.addEventListener('click', (e) => {
      const g = e.target.closest('[data-gen]'); if (g) { gen(g.dataset.gen); return; }
      const p = e.target.closest('[data-pv]'); if (p) openPreview(p.dataset.pv);
    });
    document.getElementById('allBtn').addEventListener('click', async () => {
      for (const d of DOCS) { await gen(d.k); await new Promise((r) => setTimeout(r, 400)); }
    });
    if (/claude\.ai$/.test(location.hostname)) {
      grid.insertAdjacentHTML('beforebegin', '<div class="note" style="margin:0 0 12px">プレビュー環境（claude.ai）ではファイルのダウンロードが動きません。本番サイトでは各ボタンからWordファイルが保存されます。</div>');
    }
  }
  /* プレビュー拡大 */
  const modal = document.getElementById('pvModal');
  let pvKey = null;
  function openPreview(k) {
    pvKey = k;
    const d = DOCS.find((x) => x.k === k);
    document.getElementById('pvTitle').textContent = `${d.tag}　${d.name}`;
    document.getElementById('pvBody').innerHTML = previewHtml(k);
    modal.classList.remove('hidden'); document.body.classList.add('modal-open');
  }
  function closePreview() { modal.classList.add('hidden'); document.body.classList.remove('modal-open'); }
  document.getElementById('pvClose').addEventListener('click', closePreview);
  modal.addEventListener('click', (e) => { if (e.target === modal) closePreview(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closePreview(); });
  document.getElementById('pvDl').addEventListener('click', () => { if (pvKey) gen(pvKey); });

  /* ---------- 添付書類チェックリスト ---------- */
  function renderChecklist() {
    const corp = data.entityType === 'corp';
    const submit = [
      '様式第1号 職業紹介事業許可申請書（第1面・第2面）3部',
      '様式第2号 有料職業紹介事業計画書 3部（事業所ごと）',
      '様式第3号 届出制手数料届出書 3部＋手数料表',
      data.scopeDefined ? '様式第6号 取扱職種範囲等届出書（取扱職種の範囲を限定するため必要）' : null,
      '業務の運営に関する規程', '個人情報適正管理規程',
    ].filter(Boolean);
    const attach = corp ? [
      '定款（事業目的に職業紹介事業の記載があるもの。変更後の定款が未作成なら株主総会議事録も）',
      '登記事項証明書（履歴事項全部証明書）',
      '代表者・役員全員の住民票の写し（本籍地または国籍・在留資格の記載あり、マイナンバー記載なし）',
      '代表者・役員全員の履歴書（氏名・生年月日・住所・最終学歴・職歴・賞罰の有無。空白期間なし）',
      '最近の事業年度の貸借対照表・損益計算書・株主資本等変動計算書',
      '法人税の納税申告書（別表1・別表4）',
      '法人税の納税証明書（その2 所得金額用）',
    ] : [
      '住民票の写し（本籍地または国籍・在留資格の記載あり、マイナンバー記載なし）',
      '履歴書（氏名・生年月日・住所・最終学歴・職歴・賞罰の有無）',
      '最近の事業年度の貸借対照表・損益計算書',
      '所得税の確定申告書（第1表）の写し',
      '所得税の納税証明書（その2 総所得金額用）',
      '預貯金の残高証明書（預貯金を資産とする場合）／登記事項証明書と固定資産税評価証明書（不動産の場合）',
    ];
    const office = [
      '事業所の賃貸借契約書（転貸の場合は原契約書・転貸借契約書・所有者の承諾書。自己所有なら建物の登記事項証明書）',
      '事業所のレイアウト図（職業紹介責任者席・個人情報保管場所・面談スペースの位置を記載）',
      '職業紹介責任者講習 受講証明書の写し（申請受理日前5年以内）',
      '職業紹介責任者の住民票の写しと履歴書（役員が兼務する場合は不要）',
    ];
    const cost = ['登録免許税 9万円（税務署または金融機関で納付し、領収証書の原本を提出）', '収入印紙 5万円（申請書に貼らずに持参）', '提出先：本店（事業主の住所）を管轄する都道府県労働局 需給調整事業部（課・室）', '申請から許可まで通常2〜3ヶ月。事業開始予定の3ヶ月前までの申請が目安'];
    const block = (title, items) => `<h3>${title}</h3>${items.map((s, i) => `<label class="check"><input type="checkbox" data-ck="${title}${i}"><span>${s}</span></label>`).join('')}`;
    const el = document.getElementById('checklist');
    el.innerHTML = block('提出書類（本ツールで作成）', submit) + block(corp ? '添付書類（法人）' : '添付書類（個人）', attach) + block('事業所・責任者の書類', office) + block('費用・提出先', cost);
    const ck = LT.get().checklist || {};
    el.querySelectorAll('[data-ck]').forEach((c) => { c.checked = !!ck[c.dataset.ck]; c.addEventListener('change', () => { const s = LT.get().checklist || {}; s[c.dataset.ck] = c.checked; LT.set({ checklist: s }); }); });
  }

  /* ---------- 免許取得までの工程図 ---------- */
  const TODOS = [
    { k: 'course', t: '職業紹介責任者講習を受講する', d: '受講証明書の写しが必要。実施機関のサイトで日程を確認（受講料1万円前後）。', img: '01' },
    { k: 'submit', t: '労働局に申請書を提出する', d: '3部そろえ、登録免許税9万円の領収証書と収入印紙5万円を持参。窓口で内容確認があります。', img: '02' },
    { k: 'fix', t: '補正連絡に対応する', d: '書類の修正や追加資料の依頼が来たら期限内に対応。ここが遅れると許可も遅れます。', img: '03' },
    { k: 'jobdb', t: '求人DBを契約する', d: '許可前に比較して決めておく。agent bank、circusAGENT、転職AGENT Naviなど。', img: '04' },
    { k: 'channel', t: '求職者の集客経路を決める', d: '自社集客、送客サービス、求人媒体のどれで最初の面談を作るか。許可前に準備。', img: '05' },
    { k: 'disclose', t: '手数料表・規程を備え付け、Webにも掲載', d: '「明示書面」を求職者・求人者に示せる状態にする。自社サイトがあれば掲載。', img: '06' },
    { k: 'licensed', t: '許可証を受け取る', d: '許可証が届いたら「許可が出た」を押してください。開業初月の準備に進みます。', img: '07', milestone: true },
    { k: 'start', t: '開業初月の求人開拓と面談を始める', d: '求人3〜5社と求職者面談10件を最初の30日で。ロードマップの「許可後30日」の章を参照。', img: '08' },
  ];
  function renderTodo() {
    const wrap = document.getElementById('todo');
    const done = LT.get().todo || {};
    const n = TODOS.filter((t) => done[t.k]).length;
    wrap.innerHTML = `<div class="rm-progress" style="grid-column:1/-1"><span>進捗 ${n}／${TODOS.length}</span><div class="bar"><i style="width:${Math.round(n / TODOS.length * 100)}%"></i></div></div>` +
      TODOS.map((t, i) => `<div class="rm-step ${done[t.k] ? 'done' : ''} ${t.milestone ? 'milestone' : ''}" data-step="${t.k}"><span class="no">${i + 1}</span><img src="img/todo/${t.img}.webp" alt="" width="480" height="480" loading="lazy"><div class="t">${t.t}</div><div class="d">${t.d}</div><label><input type="checkbox" data-todo="${t.k}" ${done[t.k] ? 'checked' : ''}> ${done[t.k] ? '完了' : '完了にする'}</label></div>`).join('');
    wrap.querySelectorAll('[data-todo]').forEach((c) => c.addEventListener('change', () => {
      const s = LT.get().todo || {}; s[c.dataset.todo] = c.checked; LT.set({ todo: s });
      if (c.dataset.todo === 'licensed' && c.checked) markLicensed();
      renderTodo();
    }));
    renderLicensed();
  }
  function markLicensed() {
    const s = LT.get();
    if (s.licensedAt) return;
    LT.set({ licensedAt: new Date().toISOString() });
    const lead = s.lead || {};
    LT.postLead({ event: 'licensed', id: lead.id || '', email: lead.email || '', company: lead.company || LT.entityName(s) });
    renderLicensed();
  }
  function renderLicensed() {
    const s = LT.get();
    const box = document.getElementById('licensedBox');
    if (s.licensedAt) {
      box.innerHTML = `<div class="result"><h3>許可おめでとうございます</h3><p style="margin:0 0 10px">開業初月の求職者面談は、履歴書を書き終えた求職者を1件単位で受け取れる送客サービスで埋めるのが最短です。</p><a class="btn btn-primary" href="${LT.config.CLOUD_URL}" target="_blank" rel="noopener">求職者送客クラウドを見る</a></div>`;
    } else {
      box.innerHTML = `<button type="button" class="btn btn-secondary" id="licensedBtn">許可が出た</button>`;
      document.getElementById('licensedBtn').addEventListener('click', () => {
        const t = LT.get().todo || {}; t.licensed = true; LT.set({ todo: t });
        markLicensed(); renderTodo();
      });
    }
  }

  /* ---------- メール登録 ---------- */
  function showDownloads() {
    gate.classList.add('hidden'); downloads.classList.remove('hidden');
    renderDocs(); renderChecklist(); renderTodo();
  }
  function completionPost(lead) {
    const sc = LT.score(data); const c = data.check || {};
    LT.postLead({ event: 'lead', id: lead.id, email: lead.email, company: lead.company || LT.entityName(data), roadmap: lead.roadmap === false ? '0' : '1',
      entityType: data.entityType || '', segment: c.segment || '', channel: c.channel || '', startMonth: c.startMonth || '',
      expectedJobseekers: data.expectedJobseekers || '', staffCount: data.staffCount || '', feeRate: data.feeRate || '',
      scope: data.scopeDefined ? `${data.scopeJobs || ''}/${data.scopeArea || ''}` : '全職種・国内',
      pref: (data.address || '').slice(0, 4), score: sc.score, rank: sc.rank, reasons: sc.reasons.join('、'), payload: LT.capture(),
      userAgent: navigator.userAgent, referer: document.referrer || '' });
  }
  if (data.lead && data.lead.email) {
    if (!data.lead.completedAt) { LT.set({ lead: Object.assign({}, data.lead, { completedAt: new Date().toISOString() }) }); completionPost(data.lead); }
    showDownloads();
  } else {
    gate.classList.remove('hidden');
    const gf = document.getElementById('gateForm');
    gf.company.value = LT.entityName(data);
    gf.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!LT.validate(gf)) { LT.toast(gf.agree.checked ? 'メールアドレスと会社名を入力してください' : '利用規約への同意が必要です'); return; }
      const v = LT.collect(gf);
      const sc = LT.score(data);
      const lead = { id: LT.uid(), email: v.email, company: v.company, roadmap: !!v.roadmap, at: new Date().toISOString(), rank: sc.rank, completedAt: new Date().toISOString() };
      LT.set({ lead });
      completionPost(lead);
      showDownloads();
      LT.toast('登録しました。書類をダウンロードできます');
    });
  }
})();
