// 1ヶ月後〜 scenario images (middle-male). Usage: node images4.mjs [names...]
import fs from 'node:fs/promises';
import path from 'node:path';
const API = 'https://api.openai.com/v1/images/generations';
const KEY = process.env.OPENAI_API_KEY;
const OUT = path.join(import.meta.dirname, 'images');
const Q = `\n\n— Style: premium Japanese recruitment/career-service LINE banner, square 1024x1024. Palette: deep navy (#0f2a4a), white, champagne gold accents, light grey cards. Target audience: Japanese men aged 25-34 in physically demanding or quota-driven jobs who want a weekday office job with weekends off. Photos (if any): realistic Japanese man around 28-33, short black hair, calm confident expression, no model-like smile. Typography: bold modern Gothic, high legibility, tidy layout with generous margins. Render EVERY Japanese character perfectly correct and clean (no garbled/fake glyphs). No English paragraph text, no watermark, no logos except a small text mark 「ハックツ就職」 at top-left. Include EXACTLY the text listed and nothing else. Professional, trustworthy, masculine, not cute, no pink.`;
const J = {
m00_1month: `Calm check-in banner with a large realistic photo of a Japanese male career advisor around 33 in a navy jacket at a cafe table, relaxed, slight nod. Top: mark 「ハックツ就職」, gold tag 「ご登録から1ヶ月」. Headline white on navy band 「その後、いかがですか」. A white card with navy text lines: 「お仕事お疲れさまです。LINEを残してくださり、ありがとうございます」「転職を決めていなくても構いません」「今の条件で狙える求人の確認だけでも」. Small gold-check line 「強引な勧誘はしません」. Bottom: big rounded navy button 「20分だけ話してみる ▶」.`,
m14_peak: `Info banner, no photo. Top: mark 「ハックツ就職」, gold tag 「知らないと損」, headline navy 「30代前半の市場価値が今ピークな理由」. Five numbered white rows with gold numbers:
「1」「未経験可・年収500万以上の枠は34歳までが大半」
「2」「現場経験がポテンシャルとして評価される最後の時期」
「3」「入社後に資格・スキルを積む時間が残っている」
「4」「企業が育成投資してくれる年齢」
「5」「体力が落ちる前に働き方を変えられる」
Bottom strip navy: 「1年遅れると、選べる求人は約3割減ります」. Big rounded navy button 「今の市場価値を聞く ▶」.`,
m30_interview: `Interview-style case banner with a photo of a Japanese man around 33 in a white shirt at an office desk, gold ribbon 「インタビュー」. Top: mark 「ハックツ就職」. Headline navy 「33歳 警備 → 事業企画へ」 sub gold 「年収380万 → 620万」. A white card: 「Before：夜勤シフト・月間休日6日」「After：土日祝休み・定時退社・内勤」「転職活動期間：約1ヶ月半」. Three Q/A lines with gold Q circles: Q「転職を決めた理由は？」A「40歳まで夜勤を続ける自信がなかった」/ Q「不安だったことは？」A「未経験で企画職は無理だと思っていた」/ Q「決め手は？」A「3社から比較できたので納得して選べた」. Bottom: big rounded navy button 「自分の転職可能性を聞く ▶」.`,
m45_3points: `Problem/solution banner, no photo. Top: mark 「ハックツ就職」, headline navy 「転職活動でつまずく3つのポイント」. Three white cards, each with a grey 「不安」 tag on the left and a gold 「解決」 tag on the right:
「経歴・学歴に自信がない」 → 「未経験可の求人を選び、書類は担当が作成」
「在職中で時間がない」 → 「面談はLINE・夜と土日OK・面接は夜オンライン」
「本当に良い求人があるのか」 → 「条件に強いエージェント3社が非公開求人を提案」
Bottom: navy strip 「1人で悩まず、まず20分」. Big rounded navy button 「不安を整理しに行く（無料）▶」.`,
m60_checkin: `Check-in banner, no photo. Top: mark 「ハックツ就職」, gold tag 「3ヶ月チェックイン」, headline navy 「3ヶ月前と、何か変わりましたか」. A white notebook-style card with five checkbox lines (empty square boxes):
「□ 休日は増えた」「□ 残業は減った」「□ 年収は上がった」「□ 身体の負担は減った」「□ 10年後の見通しが立った」
Below: light grey box 「1つも変わっていないなら、変えられるのは環境だけです」. Bottom: big rounded gold button navy text 「3ヶ月後を変える相談をする ▶」.`,
m75_3kyujin: `Premium dark banner, no photo. Top: mark 「ハックツ就職」, gold ribbon 「LINE登録者限定」, headline white 「非公開求人 3社公開」 sub gold 「未経験可・年収500万以上」. Three white cards on navy, each with a gold tag 「非公開」:
「SaaS法人営業 / 上場IT企業」「年収560〜620万」「土日祝休み・リモート可・残り2名」
「ITインフラエンジニア / 大手SIer子会社」「年収480〜560万」「資格取得支援・転勤なし・残り1名」
「人事・採用担当 / 都内サービス業」「年収500〜560万」「定時退社・年休130日・残り1名」
Footnote 「※非公開求人のため、応募には面談が必要です」. Bottom: big rounded gold button navy text 「非公開求人の詳細を聞く ▶」.`,
m90_gap: `Data banner, no photo. Top: mark 「ハックツ就職」, gold tag 「30代前半データ」, headline navy 「同世代の年収格差」 sub 「同じ年齢で200万以上の差」. Horizontal bar chart on white, labels left, gold/navy bars, values right:
「事業企画」「620万」(gold, longest) / 「SaaS営業」「600万」(gold) / 「ITインフラ」「560万」(navy) / 「人事」「520万」(navy) / 「製造・現場」「380万」(grey) / 「配送・警備」「360万」(grey).
Below: navy strip white text 「10年後の差は2,000万円以上」. Bottom: big rounded navy button 「自分の年収相場を知る ▶」.`,
m105_6months: `Future-timeline banner with a small photo of a Japanese man around 30 looking at a city skyline at sunrise. Top: mark 「ハックツ就職」, gold tag 「未来シミュレーション」, headline navy 「今から始めれば、6ヶ月後は」. A horizontal timeline of six gold dots with labels: 「0ヶ月」「無料相談」/「1ヶ月」「3社から求人提案」/「2ヶ月」「面接・内定」/「3ヶ月」「退職交渉・入社」/「4ヶ月」「研修」/「6ヶ月」「土日祝休みが当たり前に」. Three white pills gold checks: 「年収+100万以上」「残業 月10h以下」「体力に頼らない仕事」. Bottom: navy strip 「動かなければ、6ヶ月後も今と同じです」. Big rounded navy button 「半年後を変える相談 ▶」.`,
m120_priority: `Premium notice banner, no photo. Top: mark 「ハックツ就職」, gold ribbon 「特別なお知らせ」, headline navy 「ご登録から5ヶ月の方へ 優先相談枠のご案内」. White card with gold-star lines: 「通常待ち期間：約2週間」「優先枠：3日以内にご案内」「経験豊富な担当が対応」「枠には限りがあります」. Small footnote 「※金銭的な特典等はございません」. Bottom: big rounded gold button navy text 「優先枠で予約する ▶」.`,
m135_letter: `Handwritten-letter style banner on cream paper with subtle ruled lines, masculine and tidy handwriting look, with a small round photo of a Japanese male advisor around 33 in a navy jacket at the top-right labeled 「担当 田中」. Top-left small mark 「ハックツ就職」. Letter lines in dark navy handwriting: 「ご登録から5ヶ月半が経ちました。」「LINEを残していただき、ありがとうございます。」「「相談するほどではない」「まだいい」」「その気持ちはよく分かります。」「ただ、半年経っても状況が変わっていないなら、」「一度だけ話しませんか。」「転職を勧めるための面談ではありません。」「田中」. Bottom: big rounded navy button 「田中に話を聞いてもらう ▶」.`,
m150_last: `Final-message banner with a photo of a Japanese man around 30 standing at a window at dusk, city lights, calm. Top: mark 「ハックツ就職」, gold tag 「ご登録から半年」, headline white on navy 「最後にひとつだけ」. White card text: 「半年間、ありがとうございました。」「「今の働き方を変えたい」「半年経っても状況が変わらない」」「そう思っているなら、動くなら今です。」「年齢が上がるほど、選べる求人は減ります。」. Three white pills gold checks 「完全無料」「強引な勧誘なし」「在職中OK」. Bottom: big rounded gold button navy text 「最後の無料相談を予約する ▶」. Tiny footnote 「※今後LINE配信を希望されない場合はご連絡ください」.`,
};
const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(J);
for (const name of targets) {
  if (!J[name]) { console.warn('skip', name); continue; }
  console.log('→', name);
  for (let a = 1; a <= 2; a++) {
    const res = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-image-2', prompt: J[name] + Q, size: '1024x1024', n: 1 }) });
    if (!res.ok) { console.error('  FAIL', res.status, (await res.text()).slice(0, 200)); continue; }
    const d = await res.json();
    await fs.writeFile(path.join(OUT, `${name}.png`), Buffer.from(d.data[0].b64_json, 'base64'));
    console.log('  ✓', name); break;
  }
}
console.log('done.');
