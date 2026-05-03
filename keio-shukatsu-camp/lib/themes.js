export const themes = {
  monday: {
    pillar: '自己分析・ガクチカ',
    examples: [
      '2年生からの自己分析ロードマップ',
      'ガクチカに使える経験9選',
      'ES通過率を上げる自己分析の深さ',
      '慶應生のガクチカ評価ポイント',
    ],
  },
  tuesday: {
    pillar: '業界研究',
    examples: [
      '3分でわかる総合商社の全体像',
      'コンサル業界マップ完全版',
      '外資投資銀行の選考フロー',
      'デベロッパー業界の特徴と魅力',
    ],
  },
  wednesday: {
    pillar: 'サマーインターン対策',
    examples: [
      'サマーインターンES通過率を上げる構成テンプレ',
      'グルディスで見られる7つのポイント',
      'インターンと本選考の連動関係',
      '夏インターン申し込みカレンダー',
    ],
  },
  thursday: {
    pillar: 'Webテスト・SPI',
    examples: [
      '2年生から始めるSPIロードマップ',
      '玉手箱頻出問題TOP10',
      'TG-WEB対策完全ガイド',
      'Webテストで詰まる人の共通点',
    ],
  },
  friday: {
    pillar: '長期インターン',
    examples: [
      '2年生から応募できる長期インターン10選',
      'Wantedly徹底活用ガイド',
      '長期インターンで身につく3つの力',
      '長期インターン選考の通り方',
    ],
  },
  saturday: {
    pillar: 'OB訪問・キャリア',
    examples: [
      '2年生でOB訪問する意味',
      '三田会OBOGに刺さる質問15',
      '慶應生のキャリア5パターン',
      'OB訪問のアポ取りテンプレ',
    ],
  },
  sunday: {
    pillar: '体験談・週次まとめ',
    examples: [
      '慶應生の就活密着DAY',
      '今週の人気投稿TOP3',
      '外銀インターン参加記',
      '商社内定者がやってた早期準備',
    ],
  },
};

export function getThemeForToday(date = new Date()) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return { key: days[date.getDay()], ...themes[days[date.getDay()]] };
}

export function pickRandomExample(theme) {
  return theme.examples[Math.floor(Math.random() * theme.examples.length)];
}
