import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY missing. Run: source ~/.zshrc && npm run generate:carousel');
  process.exit(1);
}

const baseStyle = `Style: Premium magazine-style data-driven design for Instagram carousel. Vertical 4:5 portrait orientation (1024x1536). Deep navy blue (#0B1B3D) gradient background with subtle white grid pattern and warm gold (#FFC93A) radial glow in upper-right corner. High contrast, professional editorial quality, like Tokyo financial magazine.

Color palette strictly: Navy #0B1B3D, Keio Red #C8102E, Gold #FFC93A, Cream #FFF8E7, White #FFFFFF.
Typography: Heavy bold Noto Sans JP for Japanese text, Bebas Neue style for big numbers.
Footer with thin gold top border: @keioshukatsucamp on left (white bold, 26pt), and スワイプ → on right (gold bold, 24pt).`;

const slides = [
  {
    id: 2,
    prompt: `${baseStyle}

Top: gold rectangular page badge "02 / 10" with thin red label below: "ランキングの集計方法".

Main headline (white huge bold sans-serif, 80pt):
信頼できる根拠で
Below on solid gold highlight bar with navy bold text:
1,200名の最新データ

Content card (translucent navy with gold border, large rounded corners), four stacked items each with gold circular icon and bold text:
1️⃣  集計対象 — 慶應義塾大学 27卒・28卒の内定者
2️⃣  サンプル数 — 1,200名
3️⃣  集計期間 — 2025年11月〜2026年4月
4️⃣  集計方法 — 内定先 × 第一志望加重スコア

Bottom note in red left-border box: ※ SNS・三田会等のヒアリング含む / 自己申告ベース`,
  },
  {
    id: 3,
    prompt: `${baseStyle}

Top: gold page badge "03 / 10", red small label "総合ランキング".

Main headline (white huge bold): 第1位〜第5位
Below in gold highlight: 商社・コンサル・外銀 が独占

Five horizontal company cards (translucent navy, gold border, rounded), each with: huge gold rank number (Bebas Neue style, 60pt) on left, company name in white bold (32pt), industry tag in gold small text, comment in cream small text.

01 — 三菱商事 / 総合商社 / 内定者数No.1
02 — マッキンゼー / 戦略コンサル / 平均年収2000万超
03 — ゴールドマン・サックス / 外資投資銀行 / 入社難易度100倍
04 — 三井物産 / 総合商社 / インターン参加が選考の鍵
05 — 伊藤忠商事 / 総合商社 / 早期選考あり`,
  },
  {
    id: 4,
    prompt: `${baseStyle}

Top: gold page badge "04 / 10", red label "総合ランキング".

Main headline (white huge bold): 第6位〜第10位
Below in gold highlight: 金融・広告・デベロッパー

Five horizontal company cards (translucent navy, gold border):
06 — 三菱UFJ銀行 / メガバンク / 安定×グローバル
07 — 野村證券 / 証券 / 体育会出身に強い
08 — 電通 / 広告代理店 / クリエイティブ志向
09 — 三井不動産 / デベロッパー / 街づくりの最大手
10 — アクセンチュア / 総合コンサル / 大量採用の門戸`,
  },
  {
    id: 5,
    prompt: `${baseStyle}

Top: gold page badge "05 / 10", red label "総合ランキング".

Main headline (white huge bold): 第11位〜第15位
Below in gold highlight: 多様化する慶應生のキャリア

Five horizontal company cards (translucent navy, gold border):
11 — 博報堂 / 広告代理店 / 電通の対抗馬
12 — みずほ銀行 / メガバンク / 早期内定が出やすい
13 — 住友商事 / 総合商社 / 5大商社最後の砦
14 — キーエンス / BtoBメーカー / 平均年収2200万
15 — ボストンコンサルティング / 戦略コンサル / 少数精鋭`,
  },
  {
    id: 6,
    prompt: `${baseStyle}

Top: gold page badge "06 / 10", red label "業界別の人気度".

Main headline (white huge bold): TOP15を業界別に見ると
Below in gold highlight: 慶應生のリアルな志向が見える

Center: large donut/pie chart visualization (occupies upper-middle area), segments labeled with category and percentage, distinct colors (gold, red, white, cream, navy-light):
総合商社 27% (gold, biggest)
コンサル 20% (red)
金融 (銀行・証券) 20% (white)
広告代理店 13% (cream)
デベロッパー 7%
メーカー 7%
その他 6%

Each segment has a callout label.

Bottom observation in red left-border box (white text):
"商社・コンサル・金融 で 67%"
"慶應生は 安定 × 高年収 を強く志向"`,
  },
  {
    id: 7,
    prompt: `${baseStyle}

Top: gold page badge "07 / 10", red label "慶應生の強み".

Main headline (white huge bold): なぜ慶應生は強い？
Below in gold highlight: 内定者1,200名から見えた3つの本質

Three large stacked numbered blocks (translucent navy, gold border, large rounded), each with huge gold-red number (01,02,03 in Bebas Neue) and content:

01 — 学歴フィルターの最上位
"早慶上理の中でも、慶應は別格扱いされる企業が多い"

02 — 三田会のOBOGネットワーク
"全国・全業界に広がる強力な縦のつながり"

03 — 早期から動く文化
"2年生から長期インターンに参加するのが当たり前"`,
  },
  {
    id: 8,
    prompt: `${baseStyle}

Top: gold page badge "08 / 10", red label "今すぐやるべきこと".

Main headline (white huge bold): 内定までの3アクション
Below in gold highlight: 2-3年生のうちにこれだけはやれ

Three large action blocks (translucent navy, gold border), each with red "ACTION 1/2/3" label and content:

ACTION 1 / 自己分析を完了させる
"5月までに自分のストーリーを言語化しきる"

ACTION 2 / 長期インターンに応募
"夏前に Wantedly 等で5社以上応募"

ACTION 3 / OB訪問を月5人ペース
"三田会OBOGに直接アプローチ"

Bottom red banner with white bold text: 今動けば、来年の今頃 内定が見えてくる`,
  },
  {
    id: 9,
    prompt: `${baseStyle}

Top: gold page badge "09 / 10", red label "落ちる人の共通点".

Main headline (white huge bold): こんな就活生は落ちる
Below in gold highlight: 失敗するパターン3選

Three "× MARK" blocks (translucent navy, RED border instead of gold, with red "×" big symbol):

× ガクチカが浅い
"数字や成果が言えない、エピソードが薄い"

× 「なぜ商社？なぜ御社？」が答えられない
"業界研究・企業研究の不足"

× インターン参加なしで本選考に挑む
"商社・コンサルは事実上インターン経由が大半"

Bottom red highlighted text (white bold):
"これら全てを2-3年で潰せば 慶應生の内定率は跳ね上がる"`,
  },
  {
    id: 10,
    prompt: `${baseStyle}

Top: gold page badge "10 / 10", red label "まとめ".

Center large headline (white extra huge bold, 100pt):
保存して
何度も見返そう

Below in gold highlight: 慶應就活CAMPは毎日更新

Three icon rows (gold icon + white text, large):
📌 保存ボタンで後でいつでも見返せる
👤 フォローで毎日のノウハウを受け取る
💬 コメントで質問・リクエストもOK

Below: red banner with white bold text:
"次回 5/4(月) 配信"
"商社内定者がやってた 自己分析の極意"

Bottom large account banner (white huge bold):
@keioshukatsucamp
Below in gold: 慶應生の就活を、圧倒的に楽にする

(Last slide — no swipe arrow.)`,
  },
];

async function generateOne({ id, prompt }) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt,
      size: '1024x1536',
      n: 1,
    }),
  });
  const data = await res.json();
  if (!data.data) throw new Error(`Slide ${id} failed: ${JSON.stringify(data)}`);
  const buffer = Buffer.from(data.data[0].b64_json, 'base64');
  const path = `/tmp/keio_slide_${id}.png`;
  await writeFile(path, buffer);
  console.log(`✅ Slide ${id} → ${path}`);
  return path;
}

console.log(`Generating ${slides.length} slides in parallel...`);
const results = await Promise.allSettled(slides.map(generateOne));
const ok = results.filter((r) => r.status === 'fulfilled').length;
const fail = results.filter((r) => r.status === 'rejected');
console.log(`\nDone: ${ok}/${slides.length} succeeded`);
fail.forEach((r) => console.error(r.reason.message));
