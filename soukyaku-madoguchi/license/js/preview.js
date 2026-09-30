/* preview.js - 入力内容を反映した書類のプレビュー（HTMLで紙面を再現）。ダウンロード画面のサムネイルと拡大表示に使う。 */
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const U = () => (window.DocGen && DocGen.util) || {};
  const wareki = (d) => (U().wareki ? U().wareki(d) : d || '');
  const zen = (s) => (U().zen ? U().zen(s) : s);
  const telJp = (t) => (U().telJp ? U().telJp(t) : t || '');
  const commas = (n) => (U().commas ? U().commas(n) : n);
  const name = (d) => (d.entityType === 'corp' ? d.companyName : d.repName) || '';
  const applicant = (d) => (d.entityType === 'corp' ? `${d.companyName}　${d.repTitle || '代表取締役'}　${d.repName}` : d.repName || '');
  const scope = (d) => (d.scopeDefined ? `職業：${d.scopeJobs || '全職種'}、地域：${d.scopeArea || '国内'}` : '全職種・国内');
  const office = (d) => d.officeName || name(d);
  const rate = (d) => String(d.feeRate || '30').replace(/[^0-9.]/g, '');

  const row = (label, value, extra) => `<tr><th>${label}</th><td>${value || '&nbsp;'}</td>${extra || ''}</tr>`;
  const strike = (t) => `<s>${t}</s>`;

  function form1(d) {
    const officers = (d.entityType === 'corp' ? d.officers || [] : []).slice(0, 3);
    return `<div class="pv">
      <div class="pv-head"><span>様式第１号（第１面）</span><span>（日本産業規格Ａ列４）</span></div>
      <div class="pv-title">有料${strike('・無料')}<br>職業紹介事業許可申請書<br>${strike('職業紹介事業許可有効期間更新申請書')}</div>
      <div class="pv-right">①　${esc(wareki(d.submissionDate))}</div>
      <div>　厚 生 労 働 大 臣　殿</div>
      <div class="pv-right">${esc(d.entityType === 'corp' ? d.companyName : '')}<br><small>(ふりがな)　${esc(d.repKana)}</small><br>②申請者　氏　名　${esc(d.entityType === 'corp' ? (d.repTitle || '代表取締役') + '　' + d.repName : d.repName)}</div>
      <div class="pv-small">１．職業安定法第30条第１項の規定により下記のとおり許可の申請をします。<br>${strike('２．職業安定法第33条第１項の規定により下記のとおり許可の申請をします。')}<br>${strike('３．職業安定法第32条の６第２項の規定により下記のとおり更新申請をします。')}</div>
      <div class="pv-center">記</div>
      <table class="pv-table">
        ${row('③許可番号', '（　　　　）')}
        ${row('④氏名又は名称', `<small>${esc(d.entityType === 'corp' ? d.companyKana : d.repKana)}</small><br>${esc(name(d))}`)}
        ${row('⑤所在地', `〒${esc(d.postal)}　電話 ${esc(telJp(d.tel))}<br><small>${esc(d.addressKana)}</small><br>${esc(d.address)}`)}
        ${d.entityType === 'corp' ? row('⑥代表者氏名等', `<small>${esc(d.repKana)}</small><br>${esc(d.repName)}`, `<td><small>${esc(d.repAddressKana)}</small><br>${esc(d.repAddress)}</td>`) : row('⑥代表者氏名等', '')}
        ${officers.length ? officers.map((o, i) => row(i === 0 ? '⑦役員氏名等（法人のみ）' : '', `<small>${esc(o.kana)}</small><br>${esc(o.name)}`, `<td><small>${esc(o.addressKana)}</small><br>${esc(o.address)}</td>`)).join('') : row('⑦役員氏名等（法人のみ）', '')}
      </table>
      <div class="pv-stamp">収入印紙<br><small>消印してはならない</small></div>
      <div class="pv-head" style="margin-top:18px"><span>様式第１号（第２面）</span></div>
      <table class="pv-table">
        ${row('⑧兼業の種類・内容', (d.sideBusinesses || []).map((s, i) => `${i + 1}.${esc(s)}`).join('　') || '1.　2.　3.')}
        ${row('⑨事業所 名称／所在地', `${esc(office(d))}<br>〒${esc(d.officePostal || d.postal)}　${esc(d.officeAddress || d.address)}`)}
        ${row('⑩職業紹介責任者氏名等', `${esc(d.managerName)}<br><small>${esc(d.managerAddress)}</small>`, `<td>⑪担当者職・氏名・電話番号<br>${esc(d.contactTitle || '')}　${esc(d.contactName || d.managerName)}<br>${esc(telJp(d.officeTel || d.tel))}</td>`)}
        ${row('⑫取次機関', '')}
      </table>
      <p class="pv-small">申請者（法人にあっては役員を含む。）については、職業安定法第32条各号のいずれにも該当しないこと、また職業紹介責任者が同法第32条の14の規定による基準に適合することを誓約します。</p>
    </div>`;
  }
  function form2(d) {
    const ind = d.entityType === 'individual';
    const yen = (v) => (v === '' || v == null ? '' : `${commas(v)}円`);
    return `<div class="pv">
      <div class="pv-head"><span>様式第２号（表面）</span><span>（日本工業規格Ａ列４）</span></div>
      <div class="pv-title">有料職業紹介事業計画書<br>${strike('無料職業紹介事業計画書')}<br>${strike('特別の法人無料職業紹介事業計画書')}</div>
      <table class="pv-table">
        ${row('１　許可・届出番号', '')}
        ${row('２　事業所名', esc(office(d)))}
        ${row('３　職業紹介計画（年間）（国内）', `①区分：${esc(d.scopeDefined ? scope(d) : '')}<br>②有効求職者見込数：<strong>${esc(zen(commas(d.expectedJobseekers || 0)))}　人</strong>`)}
        ${row('４　職業紹介の業務に従事する者の数', `<strong>${esc(zen(commas(d.staffCount || 1)))}　人</strong>`)}
        ${row('５　資産等の状況（個人のみ）', ind ? `現金・預金 ${esc(yen(d.assetCash))}／土地・建物 ${esc(yen(d.assetLand))}／その他 ${esc(yen(d.assetOther))}／負債 ${esc(yen(d.liabilities))}` : '（法人は記入不要）')}
      </table>
    </div>`;
  }
  function form3(d) {
    return `<div class="pv">
      <div class="pv-head"><span>様式第３号（表面）</span><span>（日本工業規格Ａ列４）</span></div>
      <div class="pv-title">届出制手数料届出書<br>${strike('届出制手数料変更届出書')}</div>
      <div class="pv-right">①　${esc(wareki(d.submissionDate))}</div>
      <div>　厚生労働大臣　殿</div>
      <div class="pv-right"><small>（ふりがな）${esc(d.repKana)}</small><br>②届出者　氏名　${esc(applicant(d))}</div>
      <p class="pv-small">職業安定法第３２条の３第１項第２号の規定により下記の届出制手数料に係る届出をします。</p>
      <div class="pv-center">記</div>
      <table class="pv-table">
        ${row('③許可番号', '')}
        ${row('④氏名又は名称', `<small>${esc(d.entityType === 'corp' ? d.companyKana : d.repKana)}</small><br>${esc(name(d))}`)}
        ${row('⑤所在地', `〒${esc(d.postal)}　電話 ${esc(telJp(d.tel))}<br>${esc(d.address)}`)}
        ${row('⑥適用開始・変更予定日', '　　年　　月　　日')}
        ${row('⑦届出・変更届出内容', '別紙手数料表による')}
        ${row('⑧備考', `${esc(office(d))}に適用する。<br>担当者　${esc(d.contactTitle || '')}　${esc(d.contactName || d.managerName)}　電話 ${esc(telJp(d.officeTel || d.tel))}`)}
      </table>
    </div>`;
  }
  function fee(d) {
    const admin = Number(String(d.feeAdmin || 0).replace(/[^0-9]/g, '')) || 0;
    return `<div class="pv">
      <div class="pv-head"><span>様式例第３号－１　【一般登録型】</span></div>
      <div class="pv-title">手　数　料　表</div>
      <table class="pv-table pv-grid">
        <tr><th>サービスの種類及び内容</th><th>手数料の額及び負担者</th></tr>
        <tr><td>求人受理時の事務費用</td><td>${admin ? esc(commas(admin)) + '円' : '０円（徴収しない）'}<br>手数料負担者は　求人者　とします。</td></tr>
        <tr><td>求人受理後、求人者に求職者を紹介するサービス<br>【職業紹介サービス】</td><td>成功報酬<br>（期間の定めのない雇用契約の紹介の場合）当該求職者の就職後１年間に支払われる賃金の <strong>${esc(zen(rate(d)))}％</strong><br>（期間の定めのある雇用契約の紹介の場合）雇用契約期間中の賃金の <strong>${esc(zen(String(d.feeRateFixed || rate(d)).replace(/[^0-9.]/g, '')))}％</strong><br>手数料負担者は　求人者　とします。</td></tr>
      </table>
      <p class="pv-small">上記手数料には、消費税は含まれておりません。別途加算となります。</p>
      <div class="pv-right">許可番号　<br>事業所の名称及び所在地　${esc(office(d))}　〒${esc(d.officePostal || d.postal)}　${esc(d.officeAddress || d.address)}</div>
    </div>`;
  }
  function rules(d) {
    return `<div class="pv pv-text">
      <div class="pv-title">業務の運営に関する規程</div>
      <div class="pv-right">事業所名　${esc(office(d))}</div>
      <h4>第１　求　　　人</h4>
      <p>１　本所は、${esc(scope(d))}に関する限り、いかなる求人の申し込みについてもこれを受理します。ただし、その申込みの内容が法令に違反したり、賃金、労働時間等の労働条件が通常の労働条件と比べて著しく不適当である場合、一定の労働関係法令違反のある場合及び暴力団員などによる求人である場合には受理しません。</p>
      <p>２　求人の申込みは、求人者又はその代理人が直接来所されて、所定の求人票により、お申込みください。直接来所できないときは、郵便、電話、ファクシミリ又は電子メール等でも差し支えありません。</p>
      <p>３　求人申込みの際には、業務内容、賃金、労働時間、その他の労働条件をあらかじめ書面の交付、ファクシミリの利用又は電子メール等により明示してください。</p>
      <p>４　求人受付の際には、求人受理時の事務費用を、別表の手数料表に基づき申し受けます。</p>
      <h4>第２　求　　　職</h4>
      <p>１　本所は、${esc(scope(d))}に関する限り、いかなる求職の申込みについてもこれを受理します。ただし、その申込みの内容が法令に違反する場合には受理しません。</p>
      <p>２　求職申込みは、本人が直接来所されて、所定の求職票によりお申込みください。</p>
      <h4>第３　紹　　　介</h4>
      <p>１　求職の方には、職業選択の自由の趣旨を踏まえ、その御希望と能力に応ずる職業に速やかに就くことができるよう極力お世話いたします。</p>
      <p>７　就職が決定しましたら求人者又は関係雇用主から別表の手数料表に基づき、紹介手数料を申し受けます。</p>
      <h4>第４　そ　の　他</h4>
      <p>３　本所は、求職者又は求人者から知り得た個人的な情報は個人情報適正管理規程に基づき、適正に取り扱います。</p>
      <p>６　本所の取扱職種の範囲等は、${esc(scope(d))}です。</p>
      <div class="pv-right">${esc(wareki(d.submissionDate))}<br>代表者　${esc(applicant(d))}</div>
      <p class="pv-small">（プレビューは抜粋です。Wordには全文が入ります）</p>
    </div>`;
  }
  function privacy(d) {
    const m = esc(d.managerName || '');
    return `<div class="pv pv-text">
      <div class="pv-title">個人情報適正管理規程</div>
      <div class="pv-right">事業所名　${esc(office(d))}</div>
      <p>１　個人情報を取り扱う事業所内の職員の範囲は${esc(d.staffScope || '職業紹介業務に従事する全職員')}とする。個人情報取扱責任者は職業紹介責任者${m}とする。</p>
      <p>２　職業紹介責任者は、１に記載する事業所内の職員に対し、個人情報の取扱いに関する教育・指導を年１回実施することとする。また、職業紹介責任者は、少なくとも５年に１回は職業紹介責任者講習会を受講するものとする。</p>
      <p>３　取扱者は、個人の情報に関して、当該情報に係る本人から情報の開示請求があった場合は、その請求に基づき本人が有する資格や職業経験等客観的事実に基づく情報の開示を遅滞なく行うものとする。</p>
      <p>４　求職者等の個人情報に関して、当該情報に係る本人からの苦情の申出があった場合については、苦情処理担当者は誠意を持って適切な処理をすることとする。なお、個人情報の取扱いに係る苦情処理の担当者は、職業紹介責任者${m}とする。</p>
      <p>５　個人情報は、鍵のかかる保管庫に保管し、電子データについてはパスワードの設定及びアクセス権限の制限により、事業所内の職員以外が閲覧できないよう管理する。</p>
      <div class="pv-right">${esc(wareki(d.submissionDate))}<br>${esc(applicant(d))}</div>
    </div>`;
  }
  function notice(d) {
    const refund = d.refundEnabled
      ? `当事業所は返戻金制度を設けています。紹介した人材が自己の都合により1カ月未満で退職した場合は紹介手数料の${esc(d.refundRate1 || '80')}％相当額、3カ月未満で退職した場合は${esc(d.refundRate3 || '50')}％相当額、6カ月未満で退職した場合には${esc(d.refundRate6 || '20')}％相当額を返金します。`
      : '当事業所は返戻金制度を設けていません。';
    return `<div class="pv pv-text">
      <div class="pv-title">求人者・求職者の皆様へ</div>
      <div class="pv-right">事業所名　${esc(office(d))}　　許可番号　${esc(d.licenseNo || '（申請中）')}</div>
      <h4>●取扱職種の範囲等に関する事項</h4><p>・職種は　${esc(d.scopeDefined ? d.scopeJobs || '全職種' : '全職種')}　　・地域は　${esc(d.scopeDefined ? d.scopeArea || '国内' : '国内')}</p>
      <h4>●手数料に関する事項</h4>
      <table class="pv-table pv-grid"><tr><th>サービスの種類及び内容</th><th>手数料の額及び負担者</th></tr><tr><td>求人受理時の事務費用</td><td>${Number(String(d.feeAdmin || 0).replace(/[^0-9]/g, '')) ? esc(commas(d.feeAdmin)) + '円' : '徴収しない（０円）'}　※手数料負担者は求人者とします。</td></tr><tr><td>求人受理後、求人者に求職者を紹介するサービス【職業紹介サービス】</td><td>成功報酬　当該求職者の就職後１年間に支払われる賃金の${esc(rate(d))}％　※手数料負担者は求人者とします。</td></tr></table>
      <p>・求職者からは手数料は徴収いたしません。</p>
      <h4>●返戻金制度に関する事項</h4><p>${refund}</p>
      <h4>●苦情の処理に関する事項</h4><p>求職者または求人者からの苦情については、誠意をもって対応いたします。苦情申出先：職業紹介責任者　${esc(d.managerName)}　連絡先　${esc(d.officeTel || d.tel)}</p>
      <h4>●個人情報の取扱いに関する事項</h4><p>当事業所は、求職者又は求人者から知り得た個人的な情報は、「個人情報適正管理規程」に基づき、適正に取り扱います。</p>
    </div>`;
  }

  window.DocPreview = { form1, form2, form3, fee, rules, privacy, notice };
})();
