/*
 * docgen.js - fills the official 労働局 Word templates (様式第1号・第2号・第3号、手数料表、業務運営規程)
 * entirely on the client. Works in the browser (global JSZip) and in Node (require('jszip')).
 *
 * The engine addresses paragraphs by their index in word/document.xml, in document order,
 * using the same tokenization as tools/paramap.py. Every write keeps the original paragraph
 * properties (pPr) and the first run's properties, so the official layout is preserved.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('jszip'));
  } else {
    root.DocGen = factory(root.JSZip);
  }
})(typeof self !== 'undefined' ? self : this, function (JSZip) {
  'use strict';

  /* ----------------------------------------------------------------------
   * text helpers
   * -------------------------------------------------------------------- */
  const ZEN = { '0': '０', '1': '１', '2': '２', '3': '３', '4': '４', '5': '５', '6': '６', '7': '７', '8': '８', '9': '９', '-': '－', '(': '（', ')': '）', ' ': '　' };
  function zen(s) {
    return String(s == null ? '' : s).replace(/[0-9\-() ]/g, (c) => ZEN[c] || c);
  }
  function han(s) {
    return String(s == null ? '' : s).replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[－‐―]/g, '-');
  }
  function digits(s) {
    return han(s).replace(/[^0-9]/g, '');
  }
  function commas(n) {
    const v = Number(han(n).replace(/[^0-9.]/g, ''));
    if (!isFinite(v)) return '';
    return v.toLocaleString('ja-JP');
  }
  function escapeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function unescapeXml(s) {
    return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  }
  /** 和暦 (令和) の年月日。date は 'YYYY-MM-DD' か Date。 */
  function wareki(date) {
    const d = date instanceof Date ? date : new Date(String(date || '').replace(/-/g, '/'));
    if (isNaN(d.getTime())) return '　　　年　　月　　日';
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    let era = '令和', ey = y - 2018;
    if (y < 2019 || (y === 2019 && m < 5)) { era = '平成'; ey = y - 1988; }
    return `${era}${zen(ey === 1 ? '元' : ey)}年${zen(m)}月${zen(day)}日`;
  }
  /** '03-3452-1471' → { area:'03', local:'3452', num:'1471' } */
  function splitTel(tel) {
    const t = han(tel).replace(/[^0-9]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (t.length >= 3) return { area: t[0], local: t[1], num: t.slice(2).join('') };
    const d = digits(tel);
    if (d.length === 10) return { area: d.slice(0, 2), local: d.slice(2, 6), num: d.slice(6) };
    if (d.length === 11) return { area: d.slice(0, 3), local: d.slice(3, 7), num: d.slice(7) };
    return { area: '', local: '', num: d };
  }
  function telJp(tel) {
    const t = splitTel(tel);
    if (!t.area) return zen(t.num);
    return `${zen(t.area)}（${zen(t.local)}）${zen(t.num)}`;
  }

  /* ----------------------------------------------------------------------
   * paragraph engine
   * -------------------------------------------------------------------- */
  const P_RE = /(<w:p(?:\s[^>]*[^\/>])?>[\s\S]*?<\/w:p>|<w:p(?:\s[^>]*)?\/>)/;

  class Doc {
    constructor(xml) {
      this.parts = xml.split(P_RE);
      // parts[1], parts[3], ... are paragraphs
      this.idx = [];
      for (let i = 1; i < this.parts.length; i += 2) this.idx.push(i);
    }
    get count() { return this.idx.length; }
    raw(i) { return this.parts[this.idx[i]]; }
    text(i) {
      const p = this.raw(i);
      let out = '';
      const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>|<w:br\/>|<w:tab\/>/g;
      let m;
      while ((m = re.exec(p))) out += m[0].startsWith('<w:t') ? unescapeXml(m[1]) : (m[0] === '<w:br/>' ? '\n' : '\t');
      return out;
    }
    /** Replace all runs of paragraph i with the given runs (array of {text, strike?, sz?}). */
    setRuns(i, runs) {
      const p = this.raw(i);
      const selfClosing = p.match(/^<w:p(?:\s[^>]*)?\/>$/);
      if (selfClosing) {
        const openTag = p.replace(/\/>$/, '>');
        this.parts[this.idx[i]] = openTag + runs.map((r) => this._run(r, '')).join('') + '</w:p>';
        return;
      }
      const open = p.match(/^<w:p(?:\s[^>]*[^\/>])?>/)[0];
      const pPrM = p.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
      const pPr = pPrM ? pPrM[0] : '';
      let rPr = '';
      const firstRun = p.match(/<w:r(?:\s[^>]*)?>([\s\S]*?)<\/w:r>/);
      if (firstRun) {
        const m = firstRun[1].match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
        if (m) rPr = m[0];
      }
      if (!rPr && pPr) {
        const m = pPr.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
        if (m) rPr = m[0];
      }
      this.parts[this.idx[i]] = open + pPr + runs.map((r) => this._run(r, rPr)).join('') + '</w:p>';
    }
    _run(r, rPr) {
      let props = rPr;
      if (r.strike) props = props ? props.replace('</w:rPr>', '<w:strike/></w:rPr>') : '<w:rPr><w:strike/></w:rPr>';
      if (r.sz) {
        const szXml = `<w:sz w:val="${r.sz}"/><w:szCs w:val="${r.sz}"/>`;
        props = props ? props.replace(/<w:sz w:val="\d+"\/>/, '').replace(/<w:szCs w:val="\d+"\/>/, '').replace('</w:rPr>', szXml + '</w:rPr>') : `<w:rPr>${szXml}</w:rPr>`;
      }
      const lines = String(r.text == null ? '' : r.text).split('\n');
      const body = lines.map((l) => `<w:t xml:space="preserve">${escapeXml(l)}</w:t>`).join('<w:br/>');
      return `<w:r>${props}${body}</w:r>`;
    }
    set(i, text) { this.setRuns(i, [{ text }]); }
    append(i, text) { this.set(i, this.text(i).replace(/[\s　]+$/, '') + text); }
    replace(i, from, to) { this.set(i, this.text(i).replace(from, to)); }
    /** Strike the whole paragraph (二重線の代わりの取消線). */
    strike(i) { this.setRuns(i, [{ text: this.text(i), strike: true }]); }
    /** Remove everything from paragraph i up to (not including) the final body sectPr. */
    truncateFrom(i) {
      const keep = this.parts.slice(0, this.idx[i]);
      const rest = this.parts.slice(this.idx[i]).join('');
      const sect = rest.lastIndexOf('<w:sectPr');
      const tail = sect >= 0 ? rest.slice(sect) : '</w:body></w:document>';
      this.parts = keep.concat([tail]);
      this.idx = [];
      for (let k = 1; k < this.parts.length; k += 2) if (P_RE.test(this.parts[k])) this.idx.push(k);
    }
    toString() { return this.parts.join(''); }
  }

  async function loadTemplate(src) {
    if (typeof src === 'string') {
      if (typeof fetch === 'function' && !(typeof process !== 'undefined' && process.versions && process.versions.node)) {
        const res = await fetch(src);
        if (!res.ok) throw new Error('template load failed: ' + src);
        src = await res.arrayBuffer();
      } else {
        src = require('fs').readFileSync(src);
      }
    }
    return JSZip.loadAsync(src);
  }

  async function render(templateSrc, fn) {
    const zip = await loadTemplate(templateSrc);
    const xml = await zip.file('word/document.xml').async('string');
    const doc = new Doc(xml);
    fn(doc);
    zip.file('word/document.xml', doc.toString());
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    return zip.generateAsync({ type: isNode ? 'nodebuffer' : 'blob', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  /* ----------------------------------------------------------------------
   * data helpers shared by the forms
   * -------------------------------------------------------------------- */
  function applicantLine(d) {
    // 法人: 名称 + 代表者役職氏名 / 個人: 氏名
    if (d.entityType === 'corp') return `${d.companyName}　${d.repTitle || '代表取締役'}　${d.repName}`;
    return d.repName;
  }
  function applicantKana(d) {
    return d.entityType === 'corp' ? (d.repKana || '') : (d.repKana || '');
  }
  function entityName(d) { return d.entityType === 'corp' ? d.companyName : d.repName; }
  function entityKana(d) { return d.entityType === 'corp' ? (d.companyKana || '') : (d.repKana || ''); }
  function postalParts(postal) {
    const p = digits(postal).padEnd(7, ' ');
    return { a: p.slice(0, 3).split(''), b: p.slice(3, 7).split('') };
  }
  function fillPostal(doc, idxA, idxB, postal) {
    const p = postalParts(postal);
    idxA.forEach((i, k) => doc.set(i, zen(p.a[k].trim())));
    idxB.forEach((i, k) => doc.set(i, zen(p.b[k].trim())));
  }

  /* ----------------------------------------------------------------------
   * 様式第1号 職業紹介事業許可申請書
   * -------------------------------------------------------------------- */
  function fillForm1(doc, d) {
    // 表題の抹消（有料の新規申請）
    doc.setRuns(4, [{ text: '　　　　　　　　　　　　　　有料' }, { text: '・無料', strike: true }]);
    doc.strike(6);
    [18, 19, 20, 21].forEach((i) => doc.strike(i));
    // ① 提出日
    doc.replace(9, '①　　　年　　月　　日', '①　' + wareki(d.submissionDate));
    // ② 申請者（名称・ふりがな・代表者）
    doc.set(12, '　'.repeat(28) + (d.entityType === 'corp' ? d.companyName : ''));
    doc.replace(13, '(ふりがな)', '(ふりがな)　' + applicantKana(d));
    doc.set(14, '　'.repeat(20) + '②申請者　氏　名　' + (d.entityType === 'corp' ? `${d.repTitle || '代表取締役'}　${d.repName}` : d.repName));
    // ④ 氏名又は名称
    doc.set(77, entityKana(d));
    doc.set(81, entityName(d));
    // ⑤ 所在地
    fillPostal(doc, [92, 94, 96], [98, 100, 102, 104], d.postal);
    doc.replace(105, '電話　　　（　　　）', '電話　' + telJp(d.tel));
    doc.set(109, d.addressKana || '');
    doc.set(113, d.address || '');
    // ⑥ 代表者氏名等（法人のみ）
    if (d.entityType === 'corp') {
      doc.set(136, d.repKana || '');
      doc.set(137, d.repAddressKana || '');
      doc.set(141, d.repName || '');
      doc.set(142, d.repAddress || '');
    }
    // ⑦ 役員（法人のみ・代表者以外・最大3名。4名以上は別紙）
    const rows = [[157, 158, 162, 163], [167, 168, 172, 173], [177, 178, 182, 183]];
    const officers = d.entityType === 'corp' ? (d.officers || []).filter((o) => o && o.name) : [];
    officers.slice(0, 3).forEach((o, k) => {
      const [kn, ka, n, a] = rows[k];
      doc.set(kn, o.kana || '');
      doc.set(ka, o.addressKana || '');
      doc.set(n, o.name || '');
      doc.set(a, o.address || '');
    });
    if (officers.length > 3) doc.set(182, '（以下、別紙のとおり）');
    // ⑧ 兼業
    const sb = (d.sideBusinesses || []).map((s) => String(s || '').trim()).filter(Boolean);
    const cell = (n) => `${n}.${sb[n - 1] || ''}`.padEnd(20, ' ');
    doc.set(216, ` ${cell(1)} ${cell(2)} ${cell(3)}`);
    doc.set(218, ` ${cell(4)} ${cell(5)} ${cell(6)}`);
    // ⑨ 事業所
    doc.set(238, d.officeName || entityName(d));
    doc.set(239, `〒${han(d.officePostal || d.postal)}　${d.officeAddress || d.address}`);
    // ⑩ 職業紹介責任者 / ⑪ 担当者
    doc.set(248, `${d.contactTitle || ''}　${d.contactName || d.managerName}`);
    const t = splitTel(d.officeTel || d.tel);
    doc.set(250, `（${zen(t.area)}）${zen(t.local)}－${zen(t.num)}`);
    doc.set(253, d.managerName || '');
    doc.set(254, d.managerAddress || '');
  }

  /* ----------------------------------------------------------------------
   * 様式第2号 有料職業紹介事業計画書
   * -------------------------------------------------------------------- */
  function fillForm2(doc, d) {
    doc.strike(5);
    doc.strike(6);
    doc.append(11, '　' + (d.officeName || entityName(d)));
    if (d.scopeDefined) {
      doc.set(44, `職業：${d.scopeJobs || '全職種'}`);
      doc.set(45, `地域：${d.scopeArea || '国内'}`);
    }
    doc.set(52, `${zen(commas(d.expectedJobseekers || 0))}　人`);
    doc.set(102, `${zen(commas(d.staffCount || 1))}　人`);
    if (d.entityType === 'individual') {
      const yen = (v) => (v === '' || v == null ? '' : `${commas(v)}円`);
      doc.set(143, yen(d.assetCash));
      doc.set(145, d.assetCashNote || '');
      doc.set(158, yen(d.assetLand));
      doc.set(165, yen(d.assetOther));
      const total = ['assetCash', 'assetLand', 'assetOther'].reduce((s, k) => s + (Number(han(d[k] || 0).replace(/[^0-9.]/g, '')) || 0), 0);
      doc.set(173, yen(total));
      doc.set(188, yen(d.liabilities || 0));
    }
  }

  /* ----------------------------------------------------------------------
   * 様式第3号 届出制手数料届出書
   * -------------------------------------------------------------------- */
  function fillForm3(doc, d) {
    doc.strike(3);
    doc.replace(5, /①\s*年\s*月\s*日/, '①　' + wareki(d.submissionDate));
    doc.append(8, '　' + applicantKana(d));
    doc.append(9, '　' + applicantLine(d));
    doc.set(20, entityKana(d));
    doc.set(22, entityName(d));
    fillPostal(doc, [35, 37, 39], [41, 43, 45, 47], d.postal);
    doc.replace(48, /電話\s*（\s*）/, '電話　' + telJp(d.tel));
    doc.set(50, d.addressKana || '');
    doc.set(52, d.address || '');
    doc.set(62, '別紙手数料表による');
    const t = splitTel(d.officeTel || d.tel);
    doc.set(64, `${d.officeName || entityName(d)}に適用する。\n担当者　${d.contactTitle || ''}　${d.contactName || d.managerName}\n電話　${zen(t.area)}（${zen(t.local)}）${zen(t.num)}`);
  }

  /* ----------------------------------------------------------------------
   * 手数料表（様式例第3号-1 一般登録型）
   * -------------------------------------------------------------------- */
  function fillFee(doc, d) {
    const rate = han(d.feeRate || '30').replace(/[^0-9.]/g, '');
    const rateFixed = han(d.feeRateFixed || rate).replace(/[^0-9.]/g, '');
    const admin = Number(han(d.feeAdmin || 0).replace(/[^0-9]/g, '')) || 0;
    doc.set(8, admin ? `${commas(admin)}円` : '０円（徴収しない）');
    doc.set(9, '手数料負担者は　求人者　とします。');
    doc.set(32, `${zen(rate)}％（または　　　　　円）`);
    doc.set(36, `${zen(rateFixed)}％（または　　　　　円）`);
    doc.set(38, '手数料負担者は　求人者　とします。');
    if (d.feeAddRate) {
      doc.set(43, `${zen(han(d.feeAddRate).replace(/[^0-9.]/g, ''))}％（または　　　　　円）`);
      doc.set(45, '手数料負担者は　求人者　とします。');
    }
    doc.append(48, '　' + (d.officeName || entityName(d)) + '　〒' + han(d.officePostal || d.postal) + '　' + (d.officeAddress || d.address));
    doc.truncateFrom(49);
  }

  /* ----------------------------------------------------------------------
   * 業務の運営に関する規程（様式例第1号）
   * -------------------------------------------------------------------- */
  function fillRules(doc, d) {
    const scope = scopeText(d);
    doc.append(3, '　' + (d.officeName || entityName(d)));
    [6, 14, 37].forEach((i) => doc.replace(i, '（※取扱職種の範囲等を記載する。）', scope));
    doc.replace(11, '（※求人受理時の事務費用又は上限制手数料と組み合わせて徴収する受付手数料のいずれかを記載する。）', '求人受理時の事務費用');
    doc.replace(40, /年\s*月\s*日/, wareki(d.submissionDate));
    doc.append(41, '　' + applicantLine(d));
  }

  /* ----------------------------------------------------------------------
   * {{TOKEN}} templates (個人情報適正管理規程・明示書面)
   * -------------------------------------------------------------------- */
  function fillTokens(doc, map) {
    for (let i = 0; i < doc.count; i++) {
      const t = doc.text(i);
      if (t.indexOf('{{') < 0) continue;
      doc.set(i, t.replace(/\{\{(\w+)\}\}/g, (m, k) => (map[k] == null ? '' : String(map[k]))));
    }
  }
  function scopeText(d) {
    return d.scopeDefined ? `職業：${d.scopeJobs || '全職種'}、地域：${d.scopeArea || '国内'}` : '全職種・国内';
  }
  function tokenMap(d) {
    const rate = han(d.feeRate || '30').replace(/[^0-9.]/g, '');
    const admin = Number(han(d.feeAdmin || 0).replace(/[^0-9]/g, '')) || 0;
    let refund = '当事業所は返戻金制度を設けていません。';
    if (d.refundEnabled) {
      refund = `当事業所は返戻金制度を設けています。紹介した人材が自己の都合により${d.refund1m || '1'}カ月未満で退職した場合は紹介手数料の${d.refundRate1 || '80'}％相当額、${d.refund3m || '3'}カ月未満で退職した場合は${d.refundRate3 || '50'}％相当額、${d.refund6m || '6'}カ月未満で退職した場合には${d.refundRate6 || '20'}％相当額を返金します。`;
    }
    return {
      OFFICE: d.officeName || entityName(d),
      LICENSE_NO: d.licenseNo || '（申請中）',
      SCOPE_JOBS: d.scopeDefined ? (d.scopeJobs || '全職種') : '全職種',
      SCOPE_AREA: d.scopeDefined ? (d.scopeArea || '国内') : '国内',
      FEE_ADMIN: admin ? `${commas(admin)}円` : '徴収しない（０円）',
      FEE_RATE: rate,
      FEE_RATE_FIXED: han(d.feeRateFixed || rate).replace(/[^0-9.]/g, ''),
      REFUND: refund,
      MANAGER: d.managerName || '',
      TEL: han(d.officeTel || d.tel || ''),
      STAFF_SCOPE: d.staffScope || '職業紹介業務に従事する全職員',
      DATE: wareki(d.submissionDate),
      APPLICANT: applicantLine(d),
    };
  }
  function fillPrivacy(doc, d) { fillTokens(doc, tokenMap(d)); }
  function fillNotice(doc, d) { fillTokens(doc, tokenMap(d)); }

  /* ----------------------------------------------------------------------
   * public API
   * -------------------------------------------------------------------- */
  const DOCS = {
    form1: { file: 'form1.docx', name: '様式第1号_職業紹介事業許可申請書.docx', fill: fillForm1 },
    form2: { file: 'form2.docx', name: '様式第2号_有料職業紹介事業計画書.docx', fill: fillForm2 },
    form3: { file: 'form3.docx', name: '様式第3号_届出制手数料届出書.docx', fill: fillForm3 },
    fee: { file: 'fee.docx', name: '手数料表_一般登録型.docx', fill: fillFee },
    rules: { file: 'rules.docx', name: '業務の運営に関する規程.docx', fill: fillRules },
    privacy: { file: 'privacy.docx', name: '個人情報適正管理規程.docx', fill: fillPrivacy },
    notice: { file: 'notice.docx', name: '求人者・求職者への明示書面.docx', fill: fillNotice },
  };

  async function generate(key, data, templateDir) {
    const spec = DOCS[key];
    if (!spec) throw new Error('unknown doc ' + key);
    const dir = templateDir == null ? 'templates/' : templateDir;
    return render(dir + spec.file, (doc) => spec.fill(doc, data));
  }

  return { generate, DOCS, Doc, render, util: { zen, han, wareki, telJp, splitTel, commas } };
});
