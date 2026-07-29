// =============================================================================
// 【ミラー / バックアップ】求職者送客の窓口 - 問い合わせフォーム受信 GAS（v8）
// -----------------------------------------------------------------------------
// 本番GASの参照用ミラー（ここで実行されるコードではありません）。
// 正本: スプレッドシート「求職者送客の窓口DB」にバインドされたコンテナバウンドGAS『コード.gs』。
// SLACK_WEBHOOK_URL は秘密情報のため伏字。復元時は GAS エディタ側の実値を使うこと。
//
// v8 (2026-07-29): フォームに「ライトプラン（応募課金型）」チェックボックスを追加したことに対応。
//   - buildBody_ に service「ライトプラン」選択時の案内文を追加
//     （料金・提供条件は面談で案内する方針のため、動画ではなく面談誘導の一文のみ）
//   - 手動リード追加ダイアログ・previewBody にもライトプランを追加
//   - Slack通知・submissions書込は p.service に値が流れるだけなので変更なし
// v7 (2026-07-28): 返信メールを「動画1本＋返信/面談の2択」に簡素化。
//   - 動画視聴率が低かったため、リンクを説明動画のみに絞り「サービス説明はこの動画」と明示
//   - Canva資料・インタビュー記事・【ご契約をご希望の場合】の3択案内を本文から削除
//     （DOC_CHUTO / DOC_SHINSOTSU 定数は復活用に残置。本文では未使用）
//   - 相談・質問は「本メールへ返信」または「オンライン面談（日程調整URL）」の2択に
// v6 (2026-07-09): 領域別のサービス説明資料（Canva）を返信メールに追加。
//   - 中途・新卒の各ブロック冒頭に「▼サービス説明資料」を追加（DOC_CHUTO / DOC_SHINSOTSU）
//   - 冒頭の案内文を「サービス説明資料・面談動画・インタビュー記事」に更新
// v5 (2026-06-10): 返信メール文面を「面談誘導のみ」から3択案内に変更。
//   - 【面談をご希望の場合】日程調整URL ／【ご質問がある場合】メール返信で受付
//   - 【ご契約をご希望の場合】希望条件を返信いただければ契約書雛形を作成して送付
//   - 冒頭の動画・記事案内も面談前提の文言（「面談に先立ちまして」）をやめ中立な表現に
//   - 2026-06-09の貼り付け時に伏字のままになっていた SLACK_WEBHOOK_URL を実値に復旧
//     （v4反映〜v5反映の間、Slack通知は不達だった）
// v4 (2026-06-09): 2026-06-05のコード.gs全文書き換えで消えた営業ダッシュボード機能を再統合。
//   - doPost に STEP4（autoClassifyAll + refreshLeadList）を復活 → シート1が自動更新される
//   - doPost に draftCreated 記録を復活 → ステータス自動分類が機能
//   - refreshLeadList / autoClassifyAll / onEdit / onOpen(メニュー) / 手動リード追加 を同梱
//   - getLastRow を lastDataRow_（A列ベース）に置換し、AB:AD のARRAYFORMULA行ズレに強くした
// 詳細は apps-script/README.md を参照。
// =============================================================================

const SHEET_NAME = 'submissions';
const SLACK_WEBHOOK_URL = '__SET_IN_GAS_EDITOR__'; // 秘密情報のため伏字（実値はGASエディタ側のみ）
const DRAFT_SUBJECT = '求職者送客の窓口のお打ち合わせについて';
const SCHEDULE_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3I3OA0rCgTVGeRd0dgFnZX4-qzPcwhYerfWLX4yPs40cETVoq51xu1UGucxzUNu7TgWf9gfldD';

// 領域別 面談動画（tldv）
const VIDEO_CHUTO = 'https://tldv.io/app/meetings/6a21f138311684001393d03b/';
const VIDEO_SHINSOTSU = 'https://tldv.io/app/meetings/6a21f878b2719f0013b6ea5a/';

// 領域別 サービス説明資料（Canva）※v7で本文から削除。復活用に残置（本文では未使用）
const DOC_CHUTO = 'https://canva.link/p11v6pj204p3f09';
const DOC_SHINSOTSU = 'https://canva.link/hggmjv7lkgkj7cb';

// A列ベースで最終データ行を返す（AB:AD列のARRAYFORMULAで getLastRow が膨らむ問題を回避）
function lastDataRow_(sh) {
  var colA = sh.getRange('A1:A').getValues();
  for (var i = colA.length - 1; i >= 0; i--) {
    if (colA[i][0] !== '' && colA[i][0] !== null) return i + 1;
  }
  return 1;
}

// ---------------------------------------------------------------------------
// 返信メール本文（選択された領域だけ説明動画を出し分け）
// ---------------------------------------------------------------------------
function buildBody_(p) {
  // フォームは複数選択（checkbox）。値は読点「、」区切りで届く（例: 第二新卒・未経験領域、新卒領域）。
  var svc = p.service || '';
  // 部分一致で判定。「第二新卒・未経験領域」に「新卒」が含まれるため、
  // 新卒は必ず「新卒領域」という連続文字列で判定する（誤マッチ防止）。旧「両方」値にも後方互換。
  var both = svc.indexOf('両方') !== -1;
  var showChuto = both || svc.indexOf('第二新卒') !== -1;
  var showShinsotsu = both || svc.indexOf('新卒領域') !== -1;
  var showLite = svc.indexOf('ライトプラン') !== -1;

  var videos = [];
  if (showChuto) videos.push('▼サービス説明動画（第二新卒・未経験領域）\n' + VIDEO_CHUTO);
  if (showShinsotsu) videos.push('▼サービス説明動画（新卒領域）\n' + VIDEO_SHINSOTSU);

  var videoSection = '';
  if (videos.length) {
    videoSection =
      '\n\nサービスの内容につきましては、下記の説明動画にまとめております。\n' +
      'まずはこちらをご覧いただけますと幸いです。\n\n' +
      videos.join('\n\n');
  }

  // ライトプラン（応募課金型）は料金・提供条件を面談で案内する方針のため、動画ではなく一文のみ
  var liteSection = '';
  if (showLite) {
    liteSection =
      '\n\n応募課金型の「求職者送客の窓口 ライト」につきましては、\n' +
      '料金・ご提供条件を含む詳細を、オンライン面談にて直接ご案内しております。';
  }

  return (p.company || '') + '\n' + (p.lastName || '') + ' ' + (p.firstName || '') + ' 様\n\n' +
    'お世話になっております。\n株式会社HADOの田中でございます。\n\n' +
    'この度は、弊社の求職者送客サービス「求職者送客の窓口」にご関心をお寄せいただき、誠にありがとうございます。' +
    videoSection +
    liteSection +
    '\n\nご相談やご質問がございましたら、本メールへのご返信にてお気軽にお寄せください。\n\n' +
    'また、オンライン面談にて直接ご説明・ご相談させていただくことも可能でございます。\n' +
    'ご希望の場合は、下記の日程調整URLよりご都合のよろしい日時をご選択ください。\n\n' +
    '▼オンライン面談の日程調整はこちら\n' + SCHEDULE_URL + '\n\n' +
    'それでは、ご連絡をお待ちしております。\n引き続きどうぞよろしくお願いいたします。\n\n' +
    '--\n' +
    '＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n' +
    '株式会社　HADO\n' +
    '代表取締役　田中大雅  / Tanaka Taiga\n' +
    '〒150-0031　 東京都渋谷区桜丘町２１−４　渋谷桜丘ビル3F\n' +
    'TEL: 09053233246\n' +
    'Mail：t.tanaka@hadoinc.com\n' +
    'Web： https://hado.co.jp/\n' +
    '＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝';
}

// ---------------------------------------------------------------------------
// フォーム受信
// ---------------------------------------------------------------------------
function doPost(e) {
  var p = (e && e.parameter) || {};
  var writeOk = false, writeErr = '', targetRow = 0;

  // STEP 1: submissions 書き込み（A列ベースで最終行検出）
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    targetRow = lastDataRow_(sheet) + 1;
    var newRow = [
      new Date(),
      p.id || '', p.company || '', p.department || '',
      p.lastName || '', p.firstName || '', p.email || '',
      p.service || '', p.monthly || '', p.message || '',
      p.userAgent || '', p.referer || '', '',
      p.utm_source || '', p.utm_medium || '', p.utm_campaign || '',
      p.utm_term || '', p.utm_content || '',
      p.gclid || '', p.yclid || '', p.landing_page || ''
    ];
    sheet.getRange(targetRow, 1, 1, newRow.length).setValues([newRow]);
    writeOk = true;
  } catch (err) {
    writeErr = String(err);
    console.error('sheet append error:', err);
  }

  // STEP 2: Slack通知
  try {
    if (writeOk && p.email) {
      var text = '新規問い合わせ\n会社: ' + p.company + '\nお名前: ' + p.lastName + ' ' + p.firstName +
        '\nメール: ' + p.email + '\nサービス: ' + p.service + '\n月間件数: ' + p.monthly + '\nメッセージ: ' + p.message;
      UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
        method: 'post', contentType: 'application/json',
        payload: JSON.stringify({ text: text }), muteHttpExceptions: true
      });
    }
  } catch (err) {
    console.error('slack notify error:', err);
  }

  // STEP 3: Gmail下書き（領域別出し分け）＋ draftCreated 記録
  try {
    if (writeOk && p.email) {
      GmailApp.createDraft(p.email, DRAFT_SUBJECT, buildBody_(p));
      if (targetRow > 0) {
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
          .getRange(targetRow, 13).setValue('下書き作成済み'); // M列=draftCreated
      }
    }
  } catch (err) {
    console.error('gmail draft error:', err);
  }

  // STEP 4: ダッシュボード同期（新規ステータス自動分類 → シート1リード一覧を再生成）
  try {
    if (writeOk) {
      autoClassifyAll();
      refreshLeadList();
    }
  } catch (err) {
    console.error('dashboard sync error:', err);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: writeOk, error: writeErr }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// 営業ダッシュボード（シート1）関連
// ---------------------------------------------------------------------------
function ensureExtraColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sub = ss.getSheetByName('submissions');
  if (!sub) return;
  var headers = sub.getRange(1, 1, 1, sub.getLastColumn()).getValues()[0];
  if (headers.indexOf('tldvURL') === -1) {
    var nc = sub.getLastColumn() + 1;
    sub.getRange(1, nc).setValue('tldvURL').setFontWeight('bold');
  }
}

// 空ステータスの行だけを自動分類（既存ステータスは上書きしない）
function autoClassifyAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sub = ss.getSheetByName('submissions');
  var allHeaders = sub.getRange(1, 1, 1, sub.getLastColumn()).getValues()[0];
  var si = allHeaders.indexOf('ステータス') + 1;
  var di = allHeaders.indexOf('draftCreated') + 1;
  var ei = allHeaders.indexOf('email') + 1;
  var ci = allHeaders.indexOf('company') + 1;
  var bi = allHeaders.indexOf('id') + 1;
  var lr = lastDataRow_(sub);
  if (si === 0 || lr <= 1) return;

  var data = sub.getRange(2, 1, lr - 1, sub.getLastColumn()).getValues();
  for (var r = 0; r < data.length; r++) {
    var ex = String(data[r][si - 1]);
    if (ex && ex !== '' && ex !== 'undefined') continue; // 既存ステータスは保持

    var sa = String(data[r][0]);
    if (sa === '' || sa === 'undefined') continue;

    var em = String(data[r][ei - 1]).toLowerCase();
    var co = String(data[r][ci - 1]);
    var id = String(data[r][bi - 1]);
    var dr = String(data[r][di - 1]);

    var st;
    if (id === '' || id === 'undefined' || id.indexOf('test') === 0 || em.indexOf('hadoinc.com') > -1 ||
        em === 'test@example.com' || em === 'test@gmail.com' || co.indexOf('テスト') > -1 ||
        co.indexOf('E2E') > -1 || co === 'ああ' || co.indexOf('サンクス') > -1 || dr.indexOf('スキップ') > -1) {
      st = '対象外';
    } else if (dr === '下書き作成済み') {
      st = 'メール送信済';
    } else {
      st = '新規';
    }
    sub.getRange(r + 2, si).setValue(st);
  }
}

// submissions から有効リード（ステータス非空かつ≠対象外）を抽出してシート1に再描画
function refreshLeadList() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sub = ss.getSheetByName('submissions');
  var dash = ss.getSheetByName('シート1');
  if (!sub || !dash) return;

  ensureExtraColumns();

  var lr = lastDataRow_(sub);
  if (lr <= 1) {
    dash.getRange('B20:L200').clearContent();
    return;
  }

  var headers = sub.getRange(1, 1, 1, sub.getLastColumn()).getValues()[0];
  var data = sub.getRange(2, 1, lr - 1, sub.getLastColumn()).getValues();

  var siIdx = headers.indexOf('ステータス');
  var coIdx = headers.indexOf('company');
  var lnIdx = headers.indexOf('lastName');
  var fnIdx = headers.indexOf('firstName');
  var emIdx = headers.indexOf('email');
  var svIdx = headers.indexOf('service');
  var moIdx = headers.indexOf('monthly');
  var memoIdx = headers.indexOf('メモ');
  var tldvIdx = headers.indexOf('tldvURL');

  var rows = [];
  for (var i = 0; i < data.length; i++) {
    var status = String(data[i][siIdx] || '');
    if (!status || status === '対象外') continue;
    rows.push({
      rowIdx: i + 2,
      submittedAt: data[i][0],
      company: data[i][coIdx],
      lastName: data[i][lnIdx],
      firstName: data[i][fnIdx],
      email: data[i][emIdx],
      service: data[i][svIdx],
      monthly: data[i][moIdx],
      status: status,
      tldvURL: tldvIdx >= 0 ? (data[i][tldvIdx] || '') : '',
      memo: memoIdx >= 0 ? (data[i][memoIdx] || '') : ''
    });
  }

  rows.sort(function(a, b) {
    var da = a.submittedAt instanceof Date ? a.submittedAt.getTime() : new Date(a.submittedAt).getTime();
    var db = b.submittedAt instanceof Date ? b.submittedAt.getTime() : new Date(b.submittedAt).getTime();
    return db - da;
  });

  dash.getRange('B20:L200').clearContent();
  dash.getRange('B20:L200').clearDataValidations();

  dash.getRange('B20:L20').setValues([['登録日', '会社名', '姓', '名', 'メール', 'サービス', '月間件数', 'ステータス', 'tl;dv URL', 'メモ', '_idx']]);
  dash.getRange('B20:K20').setBackground('#4285f4').setFontColor('white').setFontWeight('bold');

  if (rows.length > 0) {
    var output = rows.map(function(r) {
      return [r.submittedAt, r.company, r.lastName, r.firstName, r.email, r.service, r.monthly, r.status, r.tldvURL, r.memo, r.rowIdx];
    });
    dash.getRange(21, 2, output.length, 11).setValues(output);
    dash.getRange(21, 2, output.length, 1).setNumberFormat('yyyy/MM/dd HH:mm');

    var opts = ['新規', 'メール送信済', '返信あり', '商談設定', '商談済', '提案中', '契約', '失注', '対象外'];
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(opts, true).setAllowInvalid(false).build();
    dash.getRange(21, 9, output.length, 1).setDataValidation(rule);
  }

  dash.setColumnWidth(10, 220);
  dash.setColumnWidth(11, 280);
  dash.hideColumns(12);

  SpreadsheetApp.flush();
  ss.toast('リード一覧を更新（' + rows.length + '件）', '完了', 3);
}

// シート1の I/J/K列（ステータス/tl;dv URL/メモ）編集を submissions に同期
function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== 'シート1') return;

  var col = e.range.getColumn();
  var row = e.range.getRow();
  if (row < 21) return;

  var headerName;
  if (col === 9) headerName = 'ステータス';
  else if (col === 10) headerName = 'tldvURL';
  else if (col === 11) headerName = 'メモ';
  else return;

  var newValue = e.value !== undefined ? e.value : (e.range.getValue() || '');

  var rowIdx = sheet.getRange(row, 12).getValue();
  if (!rowIdx || isNaN(rowIdx)) return;

  var ss = e.source;
  var sub = ss.getSheetByName('submissions');
  if (!sub) return;
  var headers = sub.getRange(1, 1, 1, sub.getLastColumn()).getValues()[0];
  var targetColIdx = headers.indexOf(headerName) + 1;
  if (targetColIdx === 0) return;

  sub.getRange(rowIdx, targetColIdx).setValue(newValue);
}

// ---------------------------------------------------------------------------
// 「リード管理」メニュー / 手動リード追加
// ---------------------------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi().createMenu('リード管理')
    .addItem('新規リード追加（手動）', 'showAddLeadDialog')
    .addItem('リード一覧を更新', 'refreshLeadList')
    .addToUi();
}

function showAddLeadDialog() {
  var html = HtmlService.createHtmlOutput(getAddLeadHtml()).setWidth(460).setHeight(720);
  SpreadsheetApp.getUi().showModalDialog(html, '新規リード追加（手動）');
}

function getAddLeadHtml() {
  return [
    '<style>',
    'body{font-family:Helvetica,Arial,sans-serif;padding:16px;font-size:13px;color:#202124}',
    'label{display:block;margin-top:10px;font-weight:bold;color:#5f6368;font-size:12px}',
    'input,select,textarea{width:100%;padding:7px;margin-top:4px;border:1px solid #dadce0;border-radius:4px;box-sizing:border-box;font-size:13px}',
    'textarea{resize:vertical;min-height:60px;font-family:inherit}',
    '.req{color:#ea4335}',
    '.btn{background:#1a73e8;color:white;border:none;padding:10px 24px;border-radius:4px;cursor:pointer;margin-top:16px;font-size:14px;font-weight:bold;width:100%}',
    '.btn:hover{background:#1557b0}',
    '.btn:disabled{background:#ccc;cursor:not-allowed}',
    '.row{display:flex;gap:10px}',
    '.row>div{flex:1}',
    '.msg{margin-top:12px;padding:8px;border-radius:4px;font-size:13px}',
    '.msg.success{background:#e6f4ea;color:#137333}',
    '.msg.error{background:#fad2cf;color:#c5221f}',
    '</style>',
    '<form id="leadForm" onsubmit="return false">',
    '<label>流入元 <span class="req">*</span></label>',
    '<select name="source" required>',
    '<option value="">選択してください</option>',
    '<option value="circus">circus</option>',
    '<option value="defworks">defworks</option>',
    '<option value="コーポレートサイト">コーポレートサイト</option>',
    '<option value="紹介">紹介</option>',
    '</select>',
    '<label>会社名 <span class="req">*</span></label>',
    '<input name="company" required />',
    '<label>部署・役職</label>',
    '<input name="department" />',
    '<div class="row"><div>',
    '<label>姓 <span class="req">*</span></label>',
    '<input name="lastName" required />',
    '</div><div>',
    '<label>名</label>',
    '<input name="firstName" />',
    '</div></div>',
    '<label>メールアドレス</label>',
    '<input name="email" type="email" />',
    '<label>電話番号</label>',
    '<input name="phone" />',
    '<label>サービス</label>',
    '<select name="service">',
    '<option value="">未指定</option>',
    '<option value="第二新卒・未経験領域">第二新卒・未経験領域</option>',
    '<option value="新卒領域">新卒領域</option>',
    '<option value="ライトプラン（応募課金型）">ライトプラン（応募課金型）</option>',
    '<option value="両方">両方</option>',
    '<option value="相談して決めたい">相談して決めたい</option>',
    '</select>',
    '<label>希望月間件数</label>',
    '<select name="monthly">',
    '<option value="">未指定</option>',
    '<option value="月10〜30件">月10〜30件</option>',
    '<option value="月30〜50件">月30〜50件</option>',
    '<option value="月100件以上">月100件以上</option>',
    '<option value="未定">未定</option>',
    '</select>',
    '<label>メモ・問い合わせ内容</label>',
    '<textarea name="message" rows="3"></textarea>',
    '<button type="button" class="btn" onclick="submitForm()">登録</button>',
    '<div id="msg"></div>',
    '</form>',
    '<script>',
    'function submitForm(){',
    'var btn=document.querySelector(".btn");',
    'var msgEl=document.getElementById("msg");',
    'btn.disabled=true;btn.textContent="登録中...";msgEl.innerHTML="";',
    'var form=document.getElementById("leadForm");',
    'var data={};',
    'for(var i=0;i<form.elements.length;i++){var el=form.elements[i];if(el.name)data[el.name]=el.value}',
    'if(!data.source||!data.company||!data.lastName){',
    'msgEl.innerHTML="<div class=\\"msg error\\">必須項目を入力してください</div>";',
    'btn.disabled=false;btn.textContent="登録";return}',
    'google.script.run',
    '.withSuccessHandler(function(){msgEl.innerHTML="<div class=\\"msg success\\">登録完了しました</div>";setTimeout(function(){google.script.host.close()},1200)})',
    '.withFailureHandler(function(err){msgEl.innerHTML="<div class=\\"msg error\\">エラー: "+err.message+"</div>";btn.disabled=false;btn.textContent="登録"})',
    '.submitNewLead(data)',
    '}',
    '</script>'
  ].join('\n');
}

function submitNewLead(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sub = ss.getSheetByName('submissions');
  if (!sub) throw new Error('submissionsシートが見つかりません');

  var headers = sub.getRange(1, 1, 1, sub.getLastColumn()).getValues()[0];
  var siIdx = headers.indexOf('ステータス') + 1;

  var message = data.message || '';
  if (data.phone) {
    message = '【TEL】' + data.phone + (message ? '\n' + message : '');
  }

  var manualId = 'manual_' + Date.now();
  var row = [
    new Date(), manualId, data.company || '', data.department || '',
    data.lastName || '', data.firstName || '', data.email || '',
    data.service || '', data.monthly || '', message,
    'manual', data.source || '', '',
    '', '', '', '', '', '', '', ''
  ];

  var newRowNum = lastDataRow_(sub) + 1;
  sub.getRange(newRowNum, 1, 1, row.length).setValues([row]);
  if (siIdx > 0) sub.getRange(newRowNum, siIdx).setValue('新規');

  refreshLeadList();
}

// ---------------------------------------------------------------------------
// 動作確認用
// ---------------------------------------------------------------------------
function testDoPost() {
  var result = doPost({
    parameter: {
      id: 'test-' + Date.now(), company: '株式会社テスト', lastName: 'テスト', firstName: '太郎',
      email: 't.tanaka@hadoinc.com', service: '第二新卒・未経験領域、新卒領域', monthly: '月30〜50件', message: 'v5テスト送信'
    }
  });
  console.log(result.getContent());
}

function previewBody() {
  ['第二新卒・未経験領域', '新卒領域', '第二新卒・未経験領域、新卒領域', 'ライトプラン（応募課金型）', '第二新卒・未経験領域、ライトプラン（応募課金型）', '相談して決めたい'].forEach(function(s) {
    console.log('==================== service = ' + s + ' ====================');
    console.log(buildBody_({ company: '株式会社サンプル', lastName: '山田', firstName: '太郎', service: s }));
  });
}

function diagnose() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sub = ss.getSheetByName(SHEET_NAME);
  console.log('スプシ名:', ss.getName(), '| スプシID:', ss.getId());
  if (!sub) { console.log('submissions が見つかりません'); return; }
  var lr = lastDataRow_(sub);
  console.log('A列ベース最終データ行:', lr, '| getLastRow():', sub.getLastRow());
}
