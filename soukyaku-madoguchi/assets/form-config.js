// ================================================================
// Google Forms / Sheets 連携設定
// ----------------------------------------------------------------
// 1) Googleフォームを作成（質問タイプ・並び順は下記コメントを参照）
// 2) [回答] → [スプレッドシートにリンク] でSheetへ出力
// 3) Sheetを [ファイル] → [共有] → [ウェブに公開] → CSVで公開
// 4) フォームの事前入力URLから各質問の entry.xxxxx ID を取得し、
//    下の FIELD_ENTRIES に貼り付ける
// 5) フォームURL（/formResponse）と公開SheetのCSV URLも貼り付ける
// ================================================================
window.MADOGUCHI_CONFIG = {
  // 例: https://docs.google.com/forms/d/e/1FAIpQLScXXXXXXXXXXXXX/formResponse
  GOOGLE_FORM_ACTION: '',

  // Googleフォームの "事前入力リンクを取得" で取得できる entry.xxxx
  FIELD_ENTRIES: {
    company:    '',  // 会社名
    department: '',  // 部署名・役職
    lastName:   '',  // 姓
    firstName:  '',  // 名
    email:      '',  // メールアドレス
    service:    '',  // ご興味のあるサービス
    monthly:    '',  // 月間希望送客数
    message:    ''   // ご要望・ご質問
  },

  // ダッシュボード用 - Sheet [ファイル]→[共有]→[ウェブに公開] → CSV URL
  // 例: https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv
  SHEET_CSV_URL: ''
};
