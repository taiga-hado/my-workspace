/* done.js - メール登録 → 書類ダウンロード → チェックリスト・TODO */
(function () {
  'use strict';
  const gate = document.getElementById('gate');
  const downloads = document.getElementById('downloads');
  const data = LT.get();

  if (!data.repName) { location.replace('form.html'); return; }

  /* ---------- メール登録 ---------- */
  function showDownloads() {
    gate.classList.add('hidden'); downloads.classList.remove('hidden');
    renderDocs(); renderChecklist(); renderTodo();
  }
  if (data.lead && data.lead.email) { if (!data.lead.completedAt) { LT.set({ lead: Object.assign({}, data.lead, { completedAt: new Date().toISOString() }) }); const sc = LT.score(data); const c = data.check || {}; LT.postLead({ event: 'lead', id: data.lead.id, email: data.lead.email, company: data.lead.company || LT.entityName(data), roadmap: '1', entityType: data.entityType || '', segment: c.segment || '', channel: c.channel || '', startMonth: c.startMonth || '', expectedJobseekers: data.expectedJobseekers || '', staffCount: data.staffCount || '', feeRate: data.feeRate || '', scope: data.scopeDefined ? `${data.scopeJobs || ''}/${data.scopeArea || ''}` : '全職種・国内', pref: (data.address || '').slice(0, 4), score: sc.score, rank: sc.rank, reasons: sc.reasons.join('、'), userAgent: navigator.userAgent, referer: document.referrer || '' }); } showDownloads(); }
  else {
    gate.classList.remove('hidden');
    const gf = document.getElementById('gateForm');
    gf.company.value = LT.entityName(data);
    gf.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!LT.validate(gf)) { LT.toast('メールアドレスと会社名を入力してください'); return; }
      const v = LT.collect(gf);
      const sc = LT.score(data);
      const lead = { id: LT.uid(), email: v.email, company: v.company, roadmap: !!v.roadmap, at: new Date().toISOString(), rank: sc.rank };
      LT.set({ lead });
      const c = data.check || {};
      LT.postLead({
        event: 'lead', id: lead.id, email: lead.email, company: lead.company, roadmap: lead.roadmap ? '1' : '0',
        entityType: data.entityType || '', segment: c.segment || '', channel: c.channel || '', startMonth: c.startMonth || '',
        expectedJobseekers: data.expectedJobseekers || '', staffCount: data.staffCount || '', feeRate: data.feeRate || '',
        scope: data.scopeDefined ? `${data.scopeJobs || ''}/${data.scopeArea || ''}` : '全職種・国内',
        pref: (data.address || '').slice(0, 4), score: sc.score, rank: sc.rank, reasons: sc.reasons.join('、'),
        userAgent: navigator.userAgent, referer: document.referrer || '',
      });
      showDownloads();
      LT.toast('登録しました。書類をダウンロードできます');
    });
  }

  /* ---------- 書類 ---------- */
  const DESC = {
    form1: '職業紹介事業許可申請書（第1面・第2面）', form2: '有料職業紹介事業計画書', form3: '届出制手数料届出書',
    fee: '手数料表（様式例第3号-1 一般登録型）', rules: '業務の運営に関する規程', privacy: '個人情報適正管理規程', notice: '求人者・求職者への明示書面（事業所に備え付け・Web掲載用）',
  };
  const busy = {};
  async function gen(key) {
    if (busy[key]) return; busy[key] = true;
    const btn = document.querySelector(`[data-gen="${key}"]`);
    if (btn) { btn.disabled = true; btn.textContent = '生成中…'; }
    try {
      const blob = await DocGen.generate(key, LT.get(), LT.config.TEMPLATE_DIR);
      LT.download(blob, DocGen.DOCS[key].name);
    } catch (e) {
      console.error(e); LT.toast('生成に失敗しました。ページを再読み込みしてください');
    } finally {
      busy[key] = false;
      if (btn) { btn.disabled = false; btn.textContent = 'ダウンロード'; }
    }
  }
  function renderDocs() {
    const ul = document.getElementById('docList');
    if (/claude\.ai$/.test(location.hostname)) {
      ul.insertAdjacentHTML('beforebegin', '<div class="note" style="margin-bottom:12px">プレビュー環境（claude.ai）ではファイルのダウンロードが動きません。本番サイトでは各ボタンからWordファイルが保存されます。</div>');
    }
    ul.innerHTML = Object.keys(DocGen.DOCS).map((k) => `<li><div><div class="name">${DocGen.DOCS[k].name.replace('.docx', '')}</div><div class="desc">${DESC[k] || ''}</div></div><button type="button" class="btn btn-secondary btn-sm" data-gen="${k}">ダウンロード</button></li>`).join('');
    ul.addEventListener('click', (e) => { const b = e.target.closest('[data-gen]'); if (b) gen(b.dataset.gen); });
    document.getElementById('allBtn').addEventListener('click', async () => {
      for (const k of Object.keys(DocGen.DOCS)) { await gen(k); await new Promise((r) => setTimeout(r, 400)); }
    });
  }

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
    const block = (title, items) => `<h3>${title}</h3><ul class="todo">${items.map((s, i) => `<li><input type="checkbox" data-ck="${title}${i}"><span>${s}</span></li>`).join('')}</ul>`;
    const el = document.getElementById('checklist');
    el.innerHTML = block('提出書類（本ツールで作成）', submit) + block(corp ? '添付書類（法人）' : '添付書類（個人）', attach) + block('事業所・責任者の書類', office) + block('費用・提出先', cost);
    const ck = LT.get().checklist || {};
    el.querySelectorAll('[data-ck]').forEach((c) => { c.checked = !!ck[c.dataset.ck]; c.addEventListener('change', () => { const s = LT.get().checklist || {}; s[c.dataset.ck] = c.checked; LT.set({ checklist: s }); }); });
  }

  /* ---------- TODO ---------- */
  const TODOS = [
    { k: 'course', t: '職業紹介責任者講習を予約・受講する', d: '受講証明書の写しが必要。各実施機関のサイトで日程を確認（受講料1万円前後）。' },
    { k: 'submit', t: '労働局に申請書を提出する', d: '3部そろえ、登録免許税9万円の領収証書と収入印紙5万円を持参。提出時に窓口で内容確認があります。' },
    { k: 'fix', t: '補正連絡に対応する', d: '労働局から書類の修正や追加資料の依頼が来たら、期限内に対応。ここが遅れると許可も遅れます。' },
    { k: 'jobdb', t: '求人DBを契約する', d: '許可前に比較して決めておく。agent bank（ROXX）、circusAGENT、転職AGENT Naviなど。許可証が出てから契約が本稼働。' },
    { k: 'channel', t: '求職者の集客経路を決める', d: '自社集客（SNS・Web）、送客サービス、求人媒体のどれで最初の面談を作るか。開業初月から面談が入るよう、許可前に準備。' },
    { k: 'disclose', t: '手数料表・規程を事業所に備え付け、Webにも掲載する', d: '本ツールの「明示書面」を求職者・求人者に明示できる状態にする。自社サイトがあればページとして掲載。' },
    { k: 'licensed', t: '許可通知を受け取る', d: '許可証を受け取ったら下のボタンを押してください。開業初月の準備に進みます。' },
    { k: 'start', t: '開業初月の求人開拓と面談を始める', d: '求人3〜5社と求職者面談10件を最初の30日で。ロードマップの「許可後30日」の章を参照。' },
  ];
  function renderTodo() {
    const ul = document.getElementById('todo');
    const done = LT.get().todo || {};
    ul.innerHTML = TODOS.map((t) => `<li class="${done[t.k] ? 'done' : ''}"><input type="checkbox" data-todo="${t.k}" ${done[t.k] ? 'checked' : ''}><div><div class="t">${t.t}</div><div class="d">${t.d}</div></div></li>`).join('');
    ul.querySelectorAll('[data-todo]').forEach((c) => c.addEventListener('change', () => {
      const s = LT.get().todo || {}; s[c.dataset.todo] = c.checked; LT.set({ todo: s });
      c.closest('li').classList.toggle('done', c.checked);
      if (c.dataset.todo === 'licensed' && c.checked) markLicensed();
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
        const c = document.querySelector('[data-todo=licensed]'); if (c) { c.checked = true; c.closest('li').classList.add('done'); }
        const t = LT.get().todo || {}; t.licensed = true; LT.set({ todo: t });
        markLicensed();
      });
    }
  }
})();
