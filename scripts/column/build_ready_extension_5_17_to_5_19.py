#!/usr/bin/env python3
"""Extension of pre-written ready files for 2026-05-17 to 2026-05-19.

Writes 3 ready/{date}.json files using the next 3 entries from queue.json
(SaaS営業, 住宅手当・福利厚生, 女性求職者)."""
import json
from pathlib import Path

READY_DIR = Path(__file__).parent / "ready"
READY_DIR.mkdir(parents=True, exist_ok=True)


# ============================================
# 5/17 - SaaS営業の求職者集客
# ============================================
ARTICLE_5_17 = {
    "slug": "recruitment-saas-sales-acquisition",
    "title": "SaaS営業の求職者集客｜キャリアアップ訴求の設計",
    "description": "SaaS営業（インサイドセールス・フィールドセールス・カスタマーサクセス）に特化した求職者集客の実務ガイド。市場の特殊性、キャリアアップ訴求の設計、未経験から経験者への分岐、高単価決定を狙うチャネル設計までを、SaaS企業の急成長を背景にした集客機会の捉え方として解説します。",
    "keywords": "SaaS営業 集客,SaaS営業 転職,インサイドセールス 集客,フィールドセールス 集客,SaaS求人,SaaS人材紹介",
    "category": "セグメント別",
    "read_time": "11分",
    "image_prompt": "Modern editorial illustration about SaaS sales talent acquisition. Clean SaaS-style flat illustration showing an abstract upward arrow rising through stylized dashboard/metric tiles. Deep navy blue (#1a3a8a) primary with gold (#f5b400) accent on the arrow tip. Soft white background with subtle blue gradient mesh. Premium business publication aesthetic, minimalist, no text or letters or numbers in the image. Wide aspect 3:2.",
    "summary": [
        "SaaS営業市場はSaaS企業数の急増を背景に年率20〜40%で需要が拡大。経験者の絶対数が不足する希少セグメント",
        "求職者の主要動機は「キャリアアップ」「ノルマの軽さ」「ITスキル獲得」の3軸。年収より長期的キャリアの価値提案が刺さる",
        "未経験から経験者への分岐設計が重要。未経験はBDR/SDRから入りやすく、経験者はAE/CS/CSMで決定単価が一段上がる",
        "決定単価レンジは未経験で120〜180万円、2-4年経験者で200〜280万円、ハイクラスは300万円超"
    ],
    "bridge_title": "SaaS営業経験者の母集団を「希少性の中で確保したい」場合",
    "bridge": [
        "SaaS営業の経験者は市場での絶対数が少なく、リスティング広告だけでは十分な母集団を作るのが極めて難しいセグメントです。Bizreach等のハイクラス媒体投資、SaaSコミュニティからのリファラル設計、そして外部送客サービスを併用するポートフォリオ運用が現実的な戦略になります。",
        "「求職者送客の窓口」は、SNSを軸とした独自集客で20代〜30代の若手・第二新卒・経験者層を集め、事前カウンセリング込みで送客する着座成果報酬型サービスです。<strong>初期費用0円・月額費用0円・最低契約期間なし</strong>のため、SaaS営業領域でCS未経験者からの転換を狙うルートとしても、希少な経験者の補完ルートとしても、リスクなく活用できる選択肢になります。"
    ],
    "body_html": """
    <div class="art-lead">
      <p>SaaS（Software as a Service）市場の急成長に伴い、SaaS営業職の求人需要はこの5年で5〜10倍に拡大しました。一方で、SaaS営業の経験者は市場における絶対数が極めて少なく、「需要は強いが供給が圧倒的に不足している」というギャップが拡がっています。専門エージェントとして差別化しやすい一方、適切な集客チャネル戦略なしでは十分な母集団を確保できないセグメントでもあります。</p>
      <p>本記事では、SaaS営業に特化した求職者集客を、市場の特殊性・キャリアアップ訴求の設計・未経験から経験者への分岐・高単価決定を狙うチャネル設計の観点から実務レベルで整理します。</p>
    </div>

    <nav class="art-toc">
      <h3>目次</h3>
      <ol>
        <li><a href="#market">SaaS営業市場の特殊性</a></li>
        <li><a href="#career">キャリアアップ訴求の作り方</a></li>
        <li><a href="#branching">未経験から経験者への分岐設計</a></li>
        <li><a href="#channels">高単価決定を狙うチャネル</a></li>
      </ol>
    </nav>

    <h2 id="market">SaaS営業市場の特殊性</h2>

    <p>SaaS営業は、従来型の法人営業と以下の点で構造的に異なります：</p>

    <ul>
      <li><strong>サブスクモデルが前提</strong>：新規受注より顧客の継続利用（リテンション）が収益の中心</li>
      <li><strong>役割の細分化</strong>：BDR/SDR（リード獲得）、AE/IS（クロージング）、CSM（既存顧客育成）に明確に分業</li>
      <li><strong>データドリブン</strong>：パイプライン管理ツール（Salesforce等）でKPIが定量化されている</li>
      <li><strong>セールスイネーブルメント</strong>：研修・教材・ツールへの投資が手厚く、未経験者の立ち上がりが速い</li>
    </ul>

    <p>市場規模はSaaS企業数の増加と組織拡大により、<strong>年率20〜40%で求人需要が伸びている</strong>のが現状。一方で、SaaS営業の経験者は5年前にはほぼ存在せず、市場で経験を積んだ人材プールがまだ十分に育っていない構造です。</p>

    <h2 id="career">キャリアアップ訴求の作り方</h2>

    <p>SaaS営業へのキャリアチェンジを検討する求職者の動機は、年収より<strong>「キャリアの将来性」「働き方」「スキル獲得」</strong>に偏ります。訴求軸の優先順位：</p>

    <h3>動機1｜キャリアの将来性</h3>

    <p>「SaaS市場は今後10年伸びる」「BDR→AE→CSM→マネージャーのキャリアパスが明確」など、5〜10年スパンでのキャリア像が見える訴求が効きます。<strong>「市場の伸びに乗る」</strong>がZ世代・ミレニアル世代に最も刺さるメッセージです。</p>

    <h3>動機2｜働き方の質</h3>

    <p>SaaS営業は新規飛び込み・テレアポ中心ではなく、<strong>マーケが集めたリードに対するインバウンド営業</strong>が主流。「ノルマの過酷さがない」「リモートワーク可能」「成果評価が定量的」など、従来型営業との差別化訴求が刺さります。</p>

    <h3>動機3｜スキル獲得</h3>

    <p>Salesforce・HubSpot・Outreach等のSaaSツール、データ分析、英語、グロースハック等、SaaS営業でしか得られないスキルセットの訴求。<strong>「市場価値が上がる」</strong>という長期的なメリット提示が決定打になります。</p>

    <h2 id="branching">未経験から経験者への分岐設計</h2>

    <p>SaaS営業の求職者集客では、応募者を<strong>「経験有無」と「狙う役割」</strong>の2軸で明確に分岐させる設計が必要です：</p>

    <h3>未経験者の入口</h3>

    <ul>
      <li><strong>BDR/SDR（インサイドセールス）</strong>：未経験から最も入りやすい役割。テレアポではなくメール・電話・SNSでのリードナーチャリングが中心</li>
      <li><strong>カスタマーサクセス未経験枠</strong>：法人営業経験者・接客経験者から転換しやすい</li>
      <li>応募CPA相場：15,000〜25,000円</li>
    </ul>

    <h3>経験者の入口</h3>

    <ul>
      <li><strong>AE（アカウントエグゼクティブ）</strong>：BDR/SDR経験1〜2年でステップアップ</li>
      <li><strong>CSM（カスタマーサクセスマネージャー）</strong>：CS経験 + 営業経験のハイブリッド</li>
      <li><strong>セールスマネージャー</strong>：5年以上の経験でハイクラス領域</li>
      <li>応募CPA相場：25,000〜50,000円</li>
    </ul>

    <div class="art-callout">
      <p><strong>セグメント別LPの分岐が必須</strong>：未経験者LP・経験者LP・ハイクラスLPの3パターンに分けないと、応募者の温度感のミスマッチで歩留まりが半減します。広告セットと1対1で対応させる運用が前提です。</p>
    </div>

    <h2 id="channels">高単価決定を狙うチャネル</h2>

    <p>SaaS営業領域は決定単価が高い分（経験者で200〜280万円、ハイクラスで300万円超）、母集団の質を上げることのROIが他セグメントより大きい。主要チャネルと特性：</p>

    <h3>1. リスティング・指名検索広告</h3>

    <p>「SaaS営業 転職」「インサイドセールス 求人」「BDR 未経験」などのキーワード。検索ボリュームは中程度だがCVRが高い。応募CPAは15,000〜30,000円。</p>

    <h3>2. ハイクラス転職媒体</h3>

    <p>Bizreach・LinkedIn・JACリクルートメントなど。経験者を引き抜く設計で、<strong>スカウト型運用が中心</strong>。返信率を上げるメッセージング設計が肝。</p>

    <h3>3. SaaSコミュニティからのリファラル</h3>

    <p>Pivot SaaS・SaaSGrid・CS HACK等の業界コミュニティ、SaaS企業の元社員ネットワーク。<strong>CPAは極めて低く、決定率も高い</strong>が、規模を作るのに時間がかかります。</p>

    <h3>4. X（旧Twitter）でのSaaS発信</h3>

    <p>SaaS業界の議論はXに集中。CAやマーケ担当者の個人アカウント運用、業界イベント連動の発信などで認知形成。立ち上げに半年〜1年。</p>

    <h3>5. 着座成果報酬型の送客サービス</h3>

    <p>SaaS営業未経験から経験者への転換を狙う層を効率的に補完できるチャネル。<strong>面談着座率の高い母集団を固定単価で確保</strong>できるため、SaaS経験者の希少さによる単価高騰を相殺できます。</p>
""",
}


# ============================================
# 5/18 - 住宅手当・福利厚生を訴求軸にした集客
# ============================================
ARTICLE_5_18 = {
    "slug": "recruitment-housing-allowance-appeal",
    "title": "住宅手当・福利厚生を訴求軸にした求職者集客の設計",
    "description": "年収訴求の頭打ち時代に、住宅手当・福利厚生・働き方を集客の主訴求軸として設計する実務ガイド。Z世代・第二新卒のホワイト企業志向と価値観の変化に合わせた訴求パターン、競合との差別化、応募率・面談着座率への影響まで解説します。",
    "keywords": "福利厚生 採用,住宅手当 採用訴求,ホワイト企業 訴求,働き方 採用,福利厚生 求職者集客",
    "category": "ハウツー",
    "read_time": "10分",
    "image_prompt": "Modern editorial illustration about benefits-focused recruitment. Clean flat illustration showing a stylized house icon surrounded by abstract comfort symbols (clock, leaf, coin). Deep navy blue (#1a3a8a) primary with gold (#f5b400) accent on the house. Soft white background, premium SaaS publication aesthetic, minimalist, no text or letters or numbers in the image. Wide aspect 3:2.",
    "summary": [
        "Z世代・第二新卒の転職動機は「年収UP」から「ホワイトな働き方」「ライフプランとの両立」へとシフト。年収訴求の効果は鈍化傾向",
        "住宅手当（月3-5万円）・通勤費全額支給・自己啓発費支給は具体的な金額が見える訴求になりやすい",
        "残業時間・休日数・リモート可否は応募率を直接動かす要素。広告クリエイティブの主訴求に置くとCTRが30-50%改善するケース多数",
        "「ホワイト訴求」だけだと競合と埋もれるため、自社の固有の制度・実態と組み合わせて差別化する設計が前提"
    ],
    "bridge_title": "「ホワイト訴求」を真に伝える母集団チャネルを探している場合",
    "bridge": [
        "住宅手当や福利厚生を訴求軸にした集客は、Z世代・第二新卒に対して強力な反応を引き出せる一方で、競合エージェントも同じ訴求軸を取り始めており差別化が難しくなりつつあります。「自社にしか提案できないホワイト企業の求人を持っている」という実態を確実に求職者に伝える集客チャネルが、決定率を上げる鍵になります。",
        "「求職者送客の窓口」は、SNSを中心とした独自集客で第二新卒・若手未経験・新卒の求職者を集め、事前カウンセリング段階で「何を重視するか」を丁寧にヒアリングしてからエージェント様に送客します。<strong>初期費用0円・月額費用0円・面談着座率80〜90%</strong>で、ホワイト訴求にマッチする求職者を質の高い母集団として確保できます。"
    ],
    "body_html": """
    <div class="art-lead">
      <p>「年収UPを訴求しても以前ほど反応が取れなくなった」——人材紹介業の現場で、ここ2〜3年で急速に共有されるようになった肌感です。Z世代・ミレニアル世代の転職動機は、年収という単一の数字ではなく、<strong>「働き方の質」「ライフプランとの両立」「精神的な余裕」</strong>といった複合的な要素へとシフトしています。</p>
      <p>本記事では、住宅手当・福利厚生・働き方を集客の主訴求軸として設計する実務を、Z世代の価値観変化・訴求の作り方・差別化のポイント・歩留まりへの影響の観点から整理します。</p>
    </div>

    <nav class="art-toc">
      <h3>目次</h3>
      <ol>
        <li><a href="#values">Z世代の価値観の変化</a></li>
        <li><a href="#housing">住宅手当訴求の作り方</a></li>
        <li><a href="#worktime">残業時間・休日訴求の見せ方</a></li>
        <li><a href="#differentiation">ホワイト訴求の差別化</a></li>
      </ol>
    </nav>

    <h2 id="values">Z世代の価値観の変化</h2>

    <p>2026年時点で20代前半〜後半のZ世代は、就業観に以下の特徴があります：</p>

    <ul>
      <li><strong>「がむしゃらに働く」が美徳ではない</strong>：年収より時間・余裕の価値が上がっている</li>
      <li><strong>「会社に依存しない」前提</strong>：終身雇用を期待せず、5〜10年でキャリアを再設計する想定</li>
      <li><strong>ライフイベントへの早い意識</strong>：結婚・出産・住宅購入を見据えた選択を20代から</li>
      <li><strong>SNSでの企業情報接触</strong>：「ホワイトかどうか」を入社前にSNS・口コミで確認</li>
      <li><strong>転職の早さ</strong>：1〜3年で「合わない」と判断したら次へ動く</li>
    </ul>

    <p>この変化を踏まえると、年収訴求一本足では応募温度が上がらず、<strong>「ホワイトな働き方の実態」を可視化する訴求</strong>が応募数と歩留まりの両方を引き上げます。</p>

    <h2 id="housing">住宅手当訴求の作り方</h2>

    <p>住宅手当は、Z世代の経済的不安に直接刺さる訴求要素です。家賃が手取りの30〜40%を占める東京勤務の若手にとって、月3〜5万円の住宅手当は実質年収+36〜60万円に相当します。</p>

    <h3>効く見せ方</h3>

    <ul>
      <li><strong>具体的金額を出す</strong>：「住宅手当あり」より「住宅手当 月5万円」</li>
      <li><strong>実質年収換算</strong>：「年収400万円＋住宅手当60万円＝実質460万円」</li>
      <li><strong>条件の明確化</strong>：「会社から2駅以内」「30歳まで支給」など、後出しの条件をなくす</li>
      <li><strong>競合比較</strong>：「業界平均月2万円、当社は月5万円」のように差別化</li>
    </ul>

    <div class="art-callout">
      <p><strong>住宅手当訴求のNG例</strong>：「家賃補助あり」だけだと月数千円程度の名ばかり制度に見えるため反応が落ちます。<strong>金額・条件を一行で言い切る</strong>のが鉄則です。</p>
    </div>

    <h2 id="worktime">残業時間・休日訴求の見せ方</h2>

    <p>残業時間・休日数・リモート可否は、応募率を最も直接的に動かす要素です。同じ求人でも、これらを主訴求に置くとCTRが30〜50%改善するケースが頻発します。</p>

    <h3>残業時間</h3>

    <ul>
      <li><strong>「残業少なめ」より「平均残業10時間/月」</strong>：数字で出す</li>
      <li><strong>みなし残業の有無</strong>：含むなら「みなし20時間込み」と明記、隠さない</li>
      <li><strong>21時退社の運用</strong>：制度ではなく実態を伝える</li>
    </ul>

    <h3>休日数・休暇</h3>

    <ul>
      <li><strong>年間休日128日以上が一つの目安</strong>：120日台と差別化できる</li>
      <li><strong>有給取得率</strong>：「平均15日取得（取得率80%超）」など実数値</li>
      <li><strong>夏季・年末年始休暇</strong>：別途付与日数を明示</li>
    </ul>

    <h3>リモート・働き方</h3>

    <ul>
      <li><strong>リモート可否と頻度</strong>：「週3リモート可」「月8日まで」など条件</li>
      <li><strong>フレックスタイム</strong>：コアタイム有無</li>
      <li><strong>副業可否</strong>：可能なら積極訴求</li>
    </ul>

    <h2 id="differentiation">ホワイト訴求の差別化</h2>

    <p>「ホワイト企業」「働きやすい」「成長できる」だけだと、競合と完全に埋もれます。<strong>自社・自求人の固有要素</strong>と組み合わせて初めて訴求が立ちます。</p>

    <h3>差別化軸</h3>

    <ul>
      <li><strong>定量データ</strong>：「離職率3%」「育休復帰率100%」「平均勤続8年」など客観指標</li>
      <li><strong>固有制度</strong>：「読書手当 月1万円」「ペット手当」「シエスタ制度」など他社にない要素</li>
      <li><strong>役職者・若手の声</strong>：実際の社員の発言を訴求素材に</li>
      <li><strong>非定量的な文化</strong>：「Slack絵文字100種類」「金曜は早上がり推奨」など雰囲気</li>
    </ul>

    <p>これらを訴求素材として整理することで、<strong>「数あるホワイト企業の中で、なぜここを選ぶか」の理由</strong>が応募者に伝わります。</p>
""",
}


# ============================================
# 5/19 - 女性求職者向け人材紹介の集客戦略
# ============================================
ARTICLE_5_19 = {
    "slug": "recruitment-female-acquisition",
    "title": "女性求職者向け人材紹介の集客戦略｜訴求設計と主要チャネル",
    "description": "女性求職者（特に20〜30代）に特化した人材紹介の集客戦略を、市場特性・ライフイベント配慮の訴求設計・キャリア不安解消の訴求・主要チャネル・LP設計の観点から整理。男女兼用LPでは取れない優良母集団形成のための実務ガイド。",
    "keywords": "女性 求職者 集客,女性 転職 マーケティング,女性向け 人材紹介,女性キャリア 転職,女性 転職エージェント",
    "category": "セグメント別",
    "read_time": "11分",
    "image_prompt": "Modern editorial illustration about female talent acquisition. Clean flat illustration showing abstract professional figures with a path or growth chart. Deep navy blue (#1a3a8a) primary with gold (#f5b400) accent representing aspiration or career growth. Soft white background with subtle gradient. Premium SaaS publication aesthetic, minimalist, no text or letters or numbers in the image. Wide aspect 3:2.",
    "summary": [
        "女性求職者の主要な転職動機は「キャリアの方向性への不安」「ライフイベントとの両立」「働き方の柔軟性」の3軸",
        "Instagram・Pinterest・LINEなどの女性親和性の高いチャネルが集客の主軸になる。男性中心のリスティング運用とは戦略が異なる",
        "ライフイベント（結婚・出産・育休）への配慮を訴求の前提に置く設計が、応募率・面談着座率を大きく改善する",
        "セグメント別LP（職種別 + ライフステージ別）の分岐が標準。男女兼用1枚LPだと女性応募者の歩留まりが半減する"
    ],
    "bridge_title": "女性求職者の母集団を「質の高い状態で確保したい」場合",
    "bridge": [
        "女性求職者の集客は、Instagram・LINE・Pinterestといった女性親和性の高いチャネルの専任運用、ライフイベント配慮の訴求設計、専用LPの整備など、自社で立ち上げると半年以上の時間がかかります。「今すぐ女性求職者の母集団を増やしたい」というフェーズでは、すでに女性層への集客導線を持つ送客サービスの活用が現実的です。",
        "「求職者送客の窓口」は、SNS（Instagram中心）を軸とした独自集客で第二新卒・若手未経験・新卒の女性求職者を集め、事前カウンセリング込みで送客する着座成果報酬型サービスです。<strong>初期費用0円・月額費用0円・面談着座率80〜90%</strong>で、女性層に特化した運用ノウハウを併用しながら自社チャネルの立ち上げと並行できます。"
    ],
    "body_html": """
    <div class="art-lead">
      <p>女性求職者は、男性中心の伝統的な人材紹介集客モデルでは捕捉しきれない特性を持つセグメントです。情報接触経路、訴求への反応、応募の意思決定プロセスが男性と構造的に異なるため、「男女兼用」のLPや広告クリエイティブでは応募率・面談着座率・決定率の全てで男性応募者に比べて2割以上劣化するのが一般的です。</p>
      <p>本記事では、女性求職者（特に20〜30代）に特化した集客戦略を、市場特性・訴求設計・主要チャネル・LP設計の観点から実務レベルで整理します。男女兼用ではなく、女性層に特化した運用ライン構築を検討する事業者向けの実務ガイドです。</p>
    </div>

    <nav class="art-toc">
      <h3>目次</h3>
      <ol>
        <li><a href="#market">女性求職者の市場特性</a></li>
        <li><a href="#life-events">ライフイベント配慮の訴求</a></li>
        <li><a href="#career-anxiety">キャリアの不安解消訴求</a></li>
        <li><a href="#channels">主要チャネルとLP設計</a></li>
      </ol>
    </nav>

    <h2 id="market">女性求職者の市場特性</h2>

    <p>20〜30代女性求職者の転職動機は、男性と以下の点で構造的に異なります：</p>

    <ul>
      <li><strong>「キャリアの方向性への不安」が主動機</strong>：年収UPより「自分に合う仕事か」の悩み</li>
      <li><strong>ライフイベントを見据えた選択</strong>：結婚・出産・育休復帰を5年スパンで意識</li>
      <li><strong>働き方の柔軟性を最優先</strong>：時短・リモート・フレックスの可否で意思決定が動く</li>
      <li><strong>「ロールモデルが見えるか」を重視</strong>：同じ立場の先輩がいるかが入社判断の決め手</li>
      <li><strong>情報接触はSNS・ビジュアル中心</strong>：Instagram・Pinterest・LINEで企業を確認</li>
    </ul>

    <p>これらの特性を踏まえると、男性中心のリスティング広告・年収訴求モデルとは異なる集客戦略の構築が必要です。</p>

    <h2 id="life-events">ライフイベント配慮の訴求</h2>

    <p>ライフイベント（結婚・出産・育休・復職）への配慮を訴求の前提に置くと、応募率・面談着座率の両方が改善します。具体的な訴求要素：</p>

    <h3>育休関連</h3>

    <ul>
      <li><strong>育休取得率と復帰率</strong>：「取得率100%」「復帰率95%」など定量データ</li>
      <li><strong>育休後の働き方</strong>：「時短勤務OK」「子の看護休暇あり」など具体制度</li>
      <li><strong>男性育休</strong>：男性も取得する文化があることをアピール</li>
    </ul>

    <h3>働き方の柔軟性</h3>

    <ul>
      <li><strong>時短勤務</strong>：「6時間勤務OK」「小学校卒業まで対応」など条件</li>
      <li><strong>リモート・フレックス</strong>：頻度・条件を明示</li>
      <li><strong>急なお迎え対応</strong>：保育園からの呼び出しなどへの理解度</li>
    </ul>

    <h3>キャリア継続支援</h3>

    <ul>
      <li><strong>復帰後のキャリアパス</strong>：時短でも昇進可能な制度設計</li>
      <li><strong>資格取得支援</strong>：自己啓発支援制度</li>
      <li><strong>ロールモデル</strong>：実際の女性管理職・育児中社員の事例</li>
    </ul>

    <div class="art-callout">
      <p><strong>訴求の本質</strong>：「制度があるかどうか」ではなく「実際に使われているかどうか」を伝える。<strong>定量データ＋具体事例の2点セット</strong>が決定打になります。</p>
    </div>

    <h2 id="career-anxiety">キャリアの不安解消訴求</h2>

    <p>20代後半〜30代前半の女性に共通する「このまま今の仕事を続けていいのか」という漠然とした不安に、訴求は寄り添う必要があります：</p>

    <ul>
      <li><strong>「自分に合う仕事が分からない」</strong>：適性診断・キャリア面談だけでもOKの導線</li>
      <li><strong>「未経験でも大丈夫？」</strong>：研修体制と未経験から活躍する先輩の事例</li>
      <li><strong>「30代から転職できる？」</strong>：年齢を主訴求にしない、可能性訴求</li>
      <li><strong>「子育てしながら続けられる？」</strong>：両立事例と環境の見せ方</li>
    </ul>

    <p>「ハードな営業職に転換しませんか」「年収倍増を目指せます」のような<strong>男性向けに刺さるが女性には逆効果な訴求</strong>を避けるのが鉄則です。</p>

    <h2 id="channels">主要チャネルとLP設計</h2>

    <h3>1. Instagram</h3>

    <p>女性層の情報接触で最重要チャネル。リール動画で先輩社員の日常、フィードで企業文化、ストーリーズで日常の温度感を発信。<strong>「ロールモデルが見える」運用</strong>が最も効きます。</p>

    <h3>2. Pinterest</h3>

    <p>キャリア・ライフスタイル系の検索で女性が利用するチャネル。ピン投稿・ボード作成でブランド世界観を蓄積。中長期チャネル。</p>

    <h3>3. LINE公式アカウント</h3>

    <p>応募後のフォロー・カウンセリング誘導に効く。リッチメニュー・ステップ配信で温度を上げる運用が標準化。</p>

    <h3>4. 女性向け転職媒体</h3>

    <p>とらばーゆ、女の転職type、Woman Career などの専門媒体への掲載。媒体ブランドの信頼を借りられる。</p>

    <h3>LP設計</h3>

    <p>男女兼用1枚LPではなく、<strong>女性向けに専用LPを用意</strong>するのが必須。ファーストビューに女性のロールモデル写真、ライフイベント配慮の訴求、共感型コピー（「あなたの不安、聞かせてください」など）の3要素を入れる構成が標準です。職種別 × ライフステージ別（独身/既婚/子育て中）でさらに分岐させると、CVRが20〜40%改善します。</p>
""",
}


ARTICLES = [
    ("2026-05-17", ARTICLE_5_17),
    ("2026-05-18", ARTICLE_5_18),
    ("2026-05-19", ARTICLE_5_19),
]


if __name__ == "__main__":
    for date_str, article in ARTICLES:
        out_path = READY_DIR / f"{date_str}.json"
        out_path.write_text(
            json.dumps([article], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"  → {out_path.name} ({article['slug']})")
    print(f"\n✓ Wrote {len(ARTICLES)} ready files extending the buffer to 5/19")
