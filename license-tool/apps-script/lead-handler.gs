// =============================================================================
// 免許申請書類 無料作成ツール - リード受信 GAS（v1）
// -----------------------------------------------------------------------------
// スプレッドシート「免許ツールDB」にバインドして使う。シート 'leads' に追記し、
// Day0 メール（TODO とロードマップ第1章）を送る。時間主導トリガーで sendNurture() を
// 毎日1回実行すると Day1 / Day7 / Day14 / 許可確認 のメールを順に送る。
//
// セットアップ:
//   1. スプレッドシートを作成し、シート名を 'leads' にする（1行目は自動で作られる）
//   2. 拡張機能 > Apps Script にこのファイルを貼り付け、SLACK_WEBHOOK_URL を設定
//   3. デプロイ > 新しいデプロイ > ウェブアプリ（実行ユーザー: 自分 / アクセス: 全員）
//   4. 発行された URL を license-tool/js/app.js の GAS_URL に設定
//   5. トリガー > sendNurture を「時間主導型・日付ベース・午前9〜10時」で追加
// =============================================================================

const SHEET_NAME = 'leads';
const SLACK_WEBHOOK_URL = '__SET_IN_GAS_EDITOR__'; // Slack Incoming Webhook の URL。秘密情報のためリポジトリでは伏字（実値はGASエディタ側のみ）
const NOTIFY_EMAIL = 't.tanaka@hadoinc.com'; // 新規リード・許可到達の通知先メール（Slack未設定でも届く）
const FROM_NAME = '求職者送客クラウド（免許申請ツール）';
const REPLY_TO = 'info@hado.co.jp';
const TOOL_URL = 'https://soukyaku-cloud.com/license/';
const CLOUD_URL = 'https://soukyaku-cloud.com/';
const ROADMAP_PDF = TOOL_URL + 'assets/roadmap.pdf';
const TODO_PDF = TOOL_URL + 'assets/todo-sheet.pdf';
const SCHEDULE_URL = 'https://calendar.app.google/9TdLRYotegY6JZCy5'; // 無料相談の日程調整URL

const HEADER = ['受信日時', 'id', 'event', 'email', 'company', 'roadmap', 'entityType', 'segment', 'channel', 'startMonth',
  'expectedJobseekers', 'staffCount', 'feeRate', 'scope', 'pref', 'score', 'rank', 'reasons', 'userAgent', 'referer',
  'day1', 'day7', 'day14', 'licenseCheck', 'licensedAt', 'memo', 'payload', 'step'];
const COL = {}; HEADER.forEach((h, i) => { COL[h] = i + 1; });

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADER);
  return sh;
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const sh = sheet_();
  try {
    if (p.event === 'licensed') return licensed_(sh, p);
    if (p.event === 'progress') {
      const r = findRow_(sh, p.id, p.email);
      if (r) { sh.getRange(r, COL.payload).setValue(p.payload || ''); sh.getRange(r, COL.step).setValue(p.step || ''); }
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }
    // 'register'（入力途中の一時保存登録）→ 行を追加し再開案内。'lead'（書類完成）→ 同じidの行があれば更新、なければ追加
    const existing = findRow_(sh, p.id, '');
    if (p.event === 'lead' && existing) {
      ['entityType', 'segment', 'channel', 'startMonth', 'expectedJobseekers', 'staffCount', 'feeRate', 'scope', 'pref', 'score', 'rank', 'reasons'].forEach((h) => { if (p[h]) sh.getRange(existing, COL[h]).setValue(String(p[h])); });
      sh.getRange(existing, COL.event).setValue('lead');
      if (p.payload) sh.getRange(existing, COL.payload).setValue(p.payload);
      sh.getRange(existing, COL.memo).setValue('書類完成 ' + new Date().toISOString().slice(0, 10));
      if (p.email) sendDay0_(p);
    } else {
      const row = HEADER.map((h) => (h === '受信日時' ? new Date() : (p[h] == null ? '' : String(p[h]))));
      sh.appendRow(row);
      if (p.email) { if (p.event === 'register') sendResume_(p); else sendDay0_(p); }
    }
    notifySlack_('免許ツール 新規リード [' + (p.rank || '-') + ']\n会社: ' + (p.company || '') + '\nメール: ' + p.email +
      '\n領域: ' + (p.segment || '') + ' / 集客: ' + (p.channel || '') + ' / 開業: ' + (p.startMonth || '') +
      '\n見込求職者: ' + (p.expectedJobseekers || '') + '人 / 料率: ' + (p.feeRate || '') + '% / ロードマップ希望: ' + (p.roadmap === '1' ? 'あり' : 'なし'));
  } catch (err) {
    console.error(err);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function findRow_(sh, id, email) {
  const values = sh.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    if ((id && values[i][COL.id - 1] === id) || (email && values[i][COL.email - 1] === email)) return i + 1;
  }
  return 0;
}

function licensed_(sh, p) {
  const r = findRow_(sh, p.id, p.email);
  if (r) sh.getRange(r, COL.licensedAt).setValue(new Date());
  if (p.email) {
    GmailApp.sendEmail(p.email, '【許可おめでとうございます】開業初月の準備について', licensedBody_(p), { name: FROM_NAME, replyTo: REPLY_TO });
  }
  notifySlack_('免許ツール 許可到達 → 送客提案のタイミングです\n会社: ' + (p.company || '') + '\nメール: ' + (p.email || ''));
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------------------------------------------------------------------
 * メール本文
 * ------------------------------------------------------------------------- */
function sig_() {
  return '\n\n――――――――――――――――――――\n株式会社HADO\n求職者送客クラウド / 求職者送客の窓口\n〒153-0051 東京都目黒区上目黒1-1 第2育良ビル4F\n' + CLOUD_URL + '\n';
}
function greet_(p) { return (p.company ? p.company + ' ご担当者様' : 'ご担当者様') + '\n\n'; }

function day0Body_(p) {
  return greet_(p) +
    '免許申請書類 無料作成ツールをご利用いただきありがとうございます。\n' +
    '作成した書類はブラウザからダウンロードできます（入力内容はお使いのブラウザにのみ保存されています）。\n' +
    TOOL_URL + 'done.html\n\n' +
    '■ 許可までのTODO\n' +
    '1. 職業紹介責任者講習を予約・受講する（受講証明書の写しが必要）\n' +
    '2. 添付書類（登記事項証明書・定款・住民票・履歴書・決算書・納税証明書・賃貸借契約書・レイアウト図）をそろえる\n' +
    '3. 管轄労働局に3部提出する（登録免許税9万円の領収証書と収入印紙5万円を持参）\n' +
    '4. 補正連絡に期限内に対応する\n' +
    '5. 許可待ちの2〜3ヶ月で、求人DBの契約と求職者の集客経路を決める\n' +
    '6. 許可証を受け取ったら、ツールの「許可が出た」ボタンを押す\n\n' +
    '■ 特典資料\n' +
    '・免許取得から月商300万円までの完全ロードマップ（PDF・9ページ）\n  ' + ROADMAP_PDF + '\n' +
    '・免許取得までのTODO表（A4・1枚）\n  ' + TODO_PDF + '\n\n' +
    (p.roadmap === '1' ? 'ロードマップの各章のポイントは、明日から数回に分けてメールでもお送りします。\n' : '') +
    'ご不明点はこのメールに返信してください。' + sig_();
}
function day1Body_(p) {
  return greet_(p) +
    'ロードマップ 第1章「免許待ちの2〜3ヶ月でやること」をお送りします。\n\n' +
    '許可が下りるまでは営業活動ができませんが、この期間に「求人」と「求職者」の両方の入口を決めておいた会社ほど、初決定が早く出ています。\n\n' +
    '■ 求人側：求人DBの比較\n' +
    '・agent bank（ROXX）：若手・未経験層の求人が多い。月額制。\n' +
    '・circusAGENT：初期費用・月額ゼロの完全成果報酬。84,000件超。\n' +
    '・転職AGENT Navi：circus運営、成果報酬型。\n' +
    'いずれも許可証の写しが契約に必要なので、資料請求と比較を許可前に済ませておきます。\n\n' +
    '■ 求職者側：集客経路を1つ決める\n' +
    '・自社集客（SNS・Web）：立ち上がりに3〜6ヶ月。\n' +
    '・求人媒体：掲載費が先行。\n' +
    '・送客サービス：履歴書を書き終えた求職者を1件単位で受け取る。初月から面談を作れる。\n' +
    '弊社の求職者送客クラウド（' + CLOUD_URL + '）もこの選択肢の一つです。20代・未経験層が中心のため、対象領域が合う場合はご検討ください。\n\n' +
    '■ 月商300万円の逆算\n' +
    '決定単価100万円なら月3決定。成約率15%なら月20面談、面談着座率80%なら月25件の面談設定が必要です。この数字を集客経路ごとに当てはめると、必要な予算が見えます。\n\n' +
    (SCHEDULE_URL ? '許可取得までの進め方について30分の無料相談を受け付けています。\n' + SCHEDULE_URL + '\n' : '') +
    sig_();
}
function day7Body_(p) {
  return greet_(p) +
    '労働局への提出は進んでいますか。\n\n' +
    '■ 補正でよく指摘される点\n' +
    '・住民票と申請書の住所表記が一字違う（「１丁目」と「１－」など）\n' +
    '・履歴書に空白期間がある（求職活動、法人設立準備などを必ず記載）\n' +
    '・定款の事業目的に「職業紹介事業」がない\n' +
    '・レイアウト図に面談スペースと個人情報保管場所の位置がない\n' +
    '・貸借対照表の資産から繰延資産・営業権を引いていない\n' +
    '・責任者講習の受講日が申請日より後\n\n' +
    '提出前に上記を見直すと、補正1回分（約2〜4週間）を節約できます。' + sig_();
}
function day14Body_(p) {
  return greet_(p) +
    'ロードマップ 第2章「許可後30日の動き方」を先にお送りします。\n\n' +
    '■ 最初の30日でやること\n' +
    '1. 求人開拓：既存の取引先・知人経由で3〜5社の求人を確保する（求人票は必ず書面で条件明示）\n' +
    '2. 求職者面談：初月10件。1件あたり60分、希望条件と職歴の棚卸しをテンプレ化する\n' +
    '3. 明示書面の掲示：手数料表・運営規程・個人情報適正管理規程を事業所に備え付け、Webにも載せる\n' +
    '4. 事業報告の準備：毎年4月に前年度の職業紹介事業報告書（様式第8号）を提出。求人数・求職者数・決定数を月次で記録しておく\n\n' +
    '面談の数が足りない場合は、送客サービスで補うのが最短です。許可証が出た段階でご連絡ください。' + sig_();
}
function licenseCheckBody_(p) {
  return greet_(p) +
    '開業予定月が近づきましたので、許可の状況を伺えればと思います。\n' +
    '許可証が届いていましたら、ツールの「許可が出た」ボタンを押していただくか、このメールにご返信ください。開業初月の求職者面談の作り方をご案内します。\n' +
    TOOL_URL + 'done.html' + sig_();
}
function licensedBody_(p) {
  return greet_(p) +
    '有料職業紹介事業の許可、おめでとうございます。\n\n' +
    '開業初月は「面談の数」がすべてです。履歴書を書き終えた求職者を1件単位で受け取れる求職者送客クラウドでは、初月の送客枠をご用意しています。\n' +
    CLOUD_URL + '\n\n' +
    (SCHEDULE_URL ? '30分の無料相談はこちらから。\n' + SCHEDULE_URL + '\n\n' : '') +
    '許可後の事務手続き（明示書面の備え付け、毎年4月の事業報告、5年ごとの更新）もツールのTODOに載せています。' + sig_();
}

function sendResume_(p) {
  GmailApp.sendEmail(p.email, '【一時保存】免許申請書類の入力を再開するには', greet_(p) +
    '入力内容の一時保存を有効にしました。入力内容は登録時にお使いのブラウザに保存されています。\n' +
    '続きは、同じブラウザで次のページを開くと再開できます。\n' + TOOL_URL + 'form.html\n\n' +
    '特典資料は今すぐご覧いただけます。\n・免許取得から月商300万円までの完全ロードマップ: ' + ROADMAP_PDF + '\n・免許取得までのTODO表: ' + TODO_PDF + '\n\n' +
    '書類が完成すると、許可までのTODOと必要書類の一覧を改めてお送りします。' + sig_(), { name: FROM_NAME, replyTo: REPLY_TO });
}

function sendDay0_(p) {
  GmailApp.sendEmail(p.email, '【書類作成完了】免許申請までのTODOリスト', day0Body_(p), { name: FROM_NAME, replyTo: REPLY_TO });
}

/* ---------------------------------------------------------------------------
 * 日次ナーチャリング（時間主導トリガーで実行）
 * ------------------------------------------------------------------------- */
function sendNurture() {
  const sh = sheet_();
  const values = sh.getDataRange().getValues();
  const now = new Date();
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const email = row[COL.email - 1];
    if (!email || (row[COL.event - 1] !== 'lead' && row[COL.event - 1] !== 'register')) continue;
    const p = {}; HEADER.forEach((h, k) => { p[h] = row[k]; });
    const days = (now - new Date(row[0])) / 86400000;
    const licensed = !!row[COL.licensedAt - 1];
    const send = (col, subject, body) => {
      GmailApp.sendEmail(email, subject, body, { name: FROM_NAME, replyTo: REPLY_TO });
      sh.getRange(i + 1, col).setValue(now);
    };
    try {
      if (days >= 1 && !row[COL.day1 - 1] && String(row[COL.roadmap - 1]) === '1') send(COL.day1, '【ロードマップ1】免許待ちの2〜3ヶ月でやること', day1Body_(p));
      else if (days >= 7 && !row[COL.day7 - 1] && !licensed) send(COL.day7, '労働局への提出前に見直したい6項目', day7Body_(p));
      else if (days >= 14 && !row[COL.day14 - 1] && !licensed) send(COL.day14, '【ロードマップ2】許可後30日の動き方', day14Body_(p));
      else if (!row[COL.licenseCheck - 1] && !licensed && p.startMonth && now >= new Date(p.startMonth + '-01')) send(COL.licenseCheck, '許可は下りましたか？', licenseCheckBody_(p));
    } catch (err) { console.error('nurture error row ' + (i + 1), err); }
  }
}

function notifySlack_(text) {
  if (NOTIFY_EMAIL) {
    try { GmailApp.sendEmail(NOTIFY_EMAIL, '[免許ツール] ' + text.split('\n')[0], text + '\n\nシート: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(), { name: FROM_NAME }); } catch (err) { console.error('notify mail error', err); }
  }
  if (!SLACK_WEBHOOK_URL || SLACK_WEBHOOK_URL.indexOf('http') !== 0) return;
  try {
    UrlFetchApp.fetch(SLACK_WEBHOOK_URL, { method: 'post', contentType: 'application/json', payload: JSON.stringify({ text }) });
  } catch (err) { console.error('slack error', err); }
}
