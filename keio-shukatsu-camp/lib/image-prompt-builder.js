const BASE_STYLE = `Style: Premium magazine-style data-driven design for Instagram carousel. Vertical 4:5 portrait orientation (1024x1536). Deep navy blue (#0B1B3D) gradient background with subtle white grid pattern and warm gold (#FFC93A) radial glow in upper-right corner. High contrast, professional editorial quality, like Tokyo financial magazine.

Color palette strictly: Navy #0B1B3D, Keio Red #C8102E, Gold #FFC93A, Cream #FFF8E7, White #FFFFFF.
Typography: Heavy bold Noto Sans JP for Japanese text, Bebas Neue style for big numbers.
Footer with thin gold top border: @keioshukatsucamp on left (white bold, 26pt).`;

export function buildCoverPrompt(content) {
  const previewLines = (content.preview_items || [])
    .map((p) => `${p.rank} — ${p.main} / ${p.category}`)
    .join('\n');
  const badges = (content.badges || []).map((b, i) =>
    `${i === 0 ? 'red' : 'gold'} rectangular badge "${b}"`
  ).join(' next to ');

  return `${BASE_STYLE}
Footer right side: スワイプ → in gold bold (24pt).

Top: ${badges}.

Thin gold pretitle: ${content.hook}

Main title in huge bold Japanese sans-serif:
- Line 1 (white, ~76pt): ${content.title}
- Line 2 on solid gold highlight bar (navy text, ~84pt): ${content.subtitle}

Translucent navy preview card with gold border, rounded corners:
▼ ${content.preview_card_label || 'プレビュー'}
${previewLines}
▼ ${content.preview_card_more || 'スワイプして続きを見る →'}`;
}

export function buildSlidePrompt(slide, totalSlides = 10) {
  const pageBadge = `${String(slide.id).padStart(2, '0')} / ${totalSlides}`;

  let itemsBlock = '';
  switch (slide.type) {
    case 'list':
      itemsBlock = (slide.items || []).map((it) =>
        `${it.id} — ${it.title} / ${it.description}`
      ).join('\n');
      break;
    case 'feature':
      itemsBlock = (slide.items || []).map((it) =>
        `${it.id} — ${it.title}\n"${it.description}"`
      ).join('\n\n');
      break;
    case 'actions':
      itemsBlock = (slide.items || []).map((it) =>
        `ACTION ${it.id} / ${it.title}\n"${it.description}"`
      ).join('\n\n');
      break;
    case 'warnings':
      itemsBlock = (slide.items || []).map((it) =>
        `× ${it.title}\n"${it.description}"`
      ).join('\n\n');
      break;
    case 'summary':
      itemsBlock = (slide.items || []).map((it) =>
        `${it.title}\n${it.description}`
      ).join('\n\n');
      break;
    default:
      itemsBlock = (slide.items || []).map((it) =>
        `${it.title}: ${it.description}`
      ).join('\n');
  }

  const swipeText = slide.id === totalSlides
    ? '(Last slide — no swipe arrow.)'
    : 'Footer right: スワイプ → in gold bold.';

  return `${BASE_STYLE}
${swipeText}

Top: gold rectangular page badge "${pageBadge}", red small label below "${slide.section_label}".

Main headline (white huge bold, ~80pt): ${slide.title}
${slide.subtitle ? `Below in solid gold highlight bar (navy bold text): ${slide.subtitle}` : ''}

${itemsBlock}`;
}
