# 求職者送客の窓口 コラム記事 数値クレーム監査レポート

- 対象: /soukyaku-madoguchi/column/ 配下 143 記事（数値クレーム抽出 1460 件）
- 要修正: **62 記事 / 146 箇所**、修正不要: 81 記事
- 機械可読な修正リスト: `column_audit.json`（`find` はHTMLソースからの完全一致文字列。一部は `</strong>` 等のタグを含むため、置換時は `replace` 側も同じタグを保持している）
- 判定基準: 当社の正（canonical facts）＞ 記事間の整合 ＞ 出典の有無。出典がなく当社値もない数値は「目安」注記または定性表現を推奨。

## 1. メトリクス別の矛盾一覧

凡例: **(a)** 記事間の矛盾 / **(b)** 当社の正（canonical）との矛盾 / **(c)** 出典なしで「業界平均・標準・相場」と断定。
「正」= 当社が事実として扱う値。引用は記事本文からの抜粋（一部要約）。

### 1-1. 成約率／決定率（面談→決定）
- 正: 求職者送客の窓口 15%、業界の目安 10〜15%（業界平均 8〜12%）。
- 主張されている値と記事:
  - 10〜15%: recruitment-decision-rate「業界平均10〜15%」、recruitment-referral-acquisition「通常10〜15%」、recruitment-latent-candidates（顕在層）、recruitment-agriculture-acquisition、recruitment-construction-acquisition、recruitment-professional-license-acquisition、recruitment-retargeting-ads、recruitment-cost-per-hire（第二新卒）
  - 8〜12%: recruitment-job-search-engine-comparison（Indeed）、recruitment-soukyaku-comparison「業界平均8〜12%」／ 12%: recruitment-funnel-design「着座→決定率12%」
  - 8〜18%: recruitment-cpa-calculation「面談着座 → 決定率：8〜18%」 **(b)**
  - 10〜20%: recruitment-agent-startup-guide「標準歩留まりは10〜20%」**(b)**、recruitment-media-comparison（着座成果報酬型送客「決定率10〜20%」）**(b: 当社は15%)**、recruitment-valid-application-definition「決定率10〜20%想定」
  - 12〜20%: recruitment-monthly-volume-planning「着座→決定 12〜20%が業界標準レンジ」**(b)(c)**
  - 5〜15%: recruitment-inbound-lead-qualification「着座から決定までの決定率は5〜15%が相場」**(b)(c)**
  - 5〜10%: recruitment-persona-design「（標準着座率は80%前後、決定率は5〜10%）」**(b)**
  - 15〜25%: recruitment-casual-interview-acquisition「本面談型と同等の15〜25%」**(b)**
  - 20〜35%: recruitment-specialized-vs-generalist「業界特化型：面談〜決定率20〜35%」**(b)(c)**
  - 25〜30%: recruitment-education-industry-acquisition「面談後の決定率も25〜30%と良好」**(c)**
  - 25〜35%: recruitment-latent-candidates「潜在層を丁寧にナーチャリングした場合の決定率は25〜35%」**(c)**
  - 30%超: recruitment-medical-care-acquisition「面談着座後の決定率が30%超に乗ります」**(c)**
  - 汎用3〜7%: recruitment-game-entertainment-acquisition「着座からの決定率は8〜15%（汎用の3〜7%より高い）」**(a)(b)**（業界平均8〜12%と矛盾）
  - 推薦社数別 5〜8%／12〜18%／20〜28%: recruitment-job-order-development **(c)**
- 判定: 「面談→決定」の一般値は 10〜15%（業界平均8〜12%）に統一。セグメント固有値（教育25〜30%、医療30%超、特化型20〜35%、潜在層25〜35%）は出典がなく、定性表現または「目安」注記に変更。

### 1-2. 着座率／面談実施率
- 正: 窓口 80〜90%（第二新卒 80%実績、新卒 90%実績）。登録課金型リードの面談実施率 20〜35%（Manly&Cool: 登録課金型は約30%、HRX: 導入前20%、Nexil: 導入前35%前後）。
- 「業界平均・標準」として提示されている値（すべて出典なし **(c)**、相互に矛盾 **(a)**）:
  - 30〜50%: recruitment-inbound-lead-qualification / 35〜70%: recruitment-cpa-calculation、recruitment-funnel-design / 40〜60%: recruitment-ghosting-prevention「離脱率は業界平均で40〜60%」、recruitment-line-marketing「標準で40〜60%」、recruitment-indeed-acquisition / 50%: recruitment-funnel-design（若手） / 50〜60%: recruitment-restaurant-acquisition「業界平均は50〜60%」 / 50〜65%: interview-show-rate「標準レンジ」、recruitment-media-comparison / 50〜70%: recruitment-monthly-volume-planning / 55〜70%: recruitment-kpi-dashboard / 60〜75%: recruitment-ryomen-vs-bungyou、recruitment-specialized-vs-generalist（総合型） / 70〜80%: recruitment-middle-acquisition「若手で70〜80%」 / 80%前後: recruitment-persona-design「標準着座率は80%前後」 / 80〜90%が健全: recruitment-candidate-experience / 目標80〜90%: recruitment-crm-comparison
  - 80%前後・80〜90%を一般値として書いている3記事は当社送客の実績値を業界標準と混同 **(b)**。
- チャネル別の矛盾 **(a)**:
  - リスティング: 55〜70%（recruitment-20s-acquisition）／75〜85%（recruitment-attribution-analysis）／40〜60%（recruitment-monthly-volume-planning）
  - SNS: 30〜45%（recruitment-20s-acquisition）／40〜60%（recruitment-meta-ads）／55〜70%（recruitment-attribution-analysis、recruitment-logistics-acquisition）／50〜65%（recruitment-restaurant-acquisition）
- 登録・応募課金型リードの着座率 **(b)**: recruitment-insourcing-vs-outsourcing「応募課金型で着座率が30〜50%」、recruitment-soukyaku-comparison「面談着座率は事業者次第（30〜60%が現実値）」→ 20〜35%へ。
- 「保証」表現 **(b)**（実績であり保証ではない）: recruitment-cancellation-rate、recruitment-funnel-design、recruitment-line-marketing、recruitment-pre-counseling「面談着座率80〜90%がデフォルトで保証されている」→「実績として維持している」。
- 判定: 一般値は「チャネルと運用で大きく変動」とし、数値を出す場合は「目安」明記＋当社実績（登録課金型リード20〜35%、事前カウンセリング付き送客80〜90%）を併記。

### 1-3. 決定単価（用語の二重使用に注意）
「決定単価」が (i) 決定1件あたりの集客コスト（決定CPA）と (ii) 決定1件あたりの紹介手数料売上 の両方の意味で使われている。記事ごとに定義を明示することを推奨。
- (i) 決定CPA（若手・第二新卒）— 正: 窓口 16.7万円〜（2.5万円÷15%）
  - 16.7万円〜: recruitment-soukyaku-comparison（正） / 10〜20万円台: recruitment-scout-media-comparison「1着座1〜3万円…決定率10〜20%…決定単価10〜20万円台」**(b)** / 15〜30万円: recruitment-cost-per-hire、recruitment-agent-branding「150,000〜300,000円」**(a)** / 18〜32万円: recruitment-education-industry-acquisition / 20〜50万円台: recruitment-cpa-calculation、recruitment-acquisition-complete-guide、recruitment-cpa-rising、recruitment-30s-acquisition / 25〜50万円: second-shinsotsu-acquisition / 27〜48万円: recruitment-budget-allocation（粗利率90%を掛け忘れ、正しくは約24〜43万円）**(c)** / 15〜40万円: recruitment-valid-application-definition / 30〜80万円: recruitment-fee-structure「獲得コストは30〜80万円」**(a)** / 50〜150万円: recruitment-attribution-analysis「決定単価は50万〜150万円が標準レンジ」**(a)(c)** / 医療: 10〜30万円（recruitment-medical-care-acquisition）vs 30〜80万円（recruitment-cost-per-hire）**(a)**
- (ii) 紹介手数料単価（若手）: 60〜100万円（recruitment-agent-startup-guide、recruitment-agency-ma-trends、recruitment-market-size-2026、recruitment-ryomen-vs-bungyou）、75〜120万円（recruitment-fee-structure）、80〜120万円（recruitment-candidate-ltv、recruitment-offline-event-acquisition、recruitment-engineer-acquisition、recruitment-backoffice-acquisition）、80〜130万円（recruitment-agent-business-model）、90〜120万円（recruitment-specialized-vs-generalist）、120〜140万円（recruitment-soukyaku-comparison, 年収400万円帯）。概ね整合（年収300〜400万円×30〜35%）。例外: recruitment-manufacturing-acquisition「現場職は紹介手数料が30〜60万円」（年収300〜450万円×30〜35%＝90〜160万円と不整合）**(a)**。

### 1-4. 面談単価／着座CPA（着座課金の単価）
- 正: 窓口 2.5万円〜（2026年6月値下げ）、市場相場 1.4〜3.8万円（recruitment-soukyaku-comparison）。
- 矛盾 **(a)(b)**: recruitment-fee-structure「面談着座1件あたり3〜8万円」「着座単価5万円…送客コストは約39万円」（着座課金なのに着座率85%で割る計算誤りも含む）／seat-performance-fee「第二新卒25,000〜45,000円」「新卒25,000〜50,000円」「相場は25,000〜60,000円」／recruitment-media-comparison「着座CPA 25,000〜45,000円」／recruitment-valid-application-definition「着座課金は25,000〜50,000円/件」／recruitment-insourcing-vs-outsourcing「外注（着座課金型）：20,000〜40,000円」／recruitment-startup-acquisition「面談着座1件20,000〜40,000円」／recruitment-scout-media-comparison「1着座1〜3万円」（下限が市場下限1.4万円を下回る）／shinsotsu-pool-formation「面談実施までの単価は30,000〜80,000円」。
- 自社集客の着座CPA目安（出典なし **(c)**、概ね25,000〜50,000円で整合）: recruitment-cpa-calculation、recruitment-acquisition-complete-guide、recruitment-latent-candidates、inexperienced-talent-acquisition（30,000〜55,000円）、second-shinsotsu-acquisition（30,000〜60,000円）。recruitment-insourcing-vs-outsourcing は同一記事内で「内製15,000〜25,000円」と「実コスト25,000〜50,000円」が矛盾 **(a)**。

### 1-5. 応募CPA／獲得単価
- 正なし（当社は非公開）。すべて出典なし **(c)**。主なレンジ:
  - 若手未経験 8,000〜15,000円（recruitment-cpa-calculation、recruitment-acquisition-complete-guide、recruitment-cpa-rising）
  - 第二新卒 10,000〜18,000円（second-shinsotsu-acquisition、inexperienced-talent-acquisition、recruitment-cpa-calculation）／12,000〜25,000円（recruitment-listing-ads）／15,000〜25,000円（recruitment-agent-branding）**(a)**／3,000〜8,000円（recruitment-valid-application-definition）**(a)**
  - 汎用 15,000〜30,000円（recruitment-budget-allocation、recruitment-agriculture-acquisition、recruitment-referral-acquisition、recruitment-retargeting-ads）、20,000〜35,000円（recruitment-casual-interview-acquisition、recruitment-career-diagnosis-content）、20,000〜40,000円（recruitment-candidate-db-reactivation）、25,000〜40,000円（recruitment-mid-career-trends-2026）
  - SNS 3,000〜8,000円（recruitment-20s-acquisition、recruitment-retail-apparel-acquisition、recruitment-working-mom-acquisition、recruitment-inside-sales-acquisition）、5,000〜15,000円（recruitment-meta-ads、recruitment-market-size-2026）
- 判定: 大きく外れる2件（agent-branding、valid-application-definition）のみ修正。他は「媒体・時期で変動する目安」であることを本文で明示（任意）。

### 1-6. 紹介手数料率・金額
- 正: 理論年収の30〜35%。
- 30〜35%: 約20記事で整合（recruitment-fee-structure、recruitment-direct-recruiting-comparison、recruitment-job-ad-vs-agent、recruitment-rpo-comparison、recruitment-licensing 他）。
- 矛盾 **(b)**: recruitment-agent-business-model「手数料率（25〜35%）」×2、recruitment-shoukai-fee「一般職：25〜30%」「業界標準は25〜35%」、recruitment-fee-structure「第二新卒・若手未経験層：25〜30%」、recruitment-it-industry-acquisition「紹介手数料35%が標準」。
- セグメント固有（出典なし **(c)**、今回は注記推奨のみ）: recruitment-senior-acquisition 20〜30%、recruitment-medical-care-acquisition 看護師20〜30%／介護士20〜25%、recruitment-alumni-recruitment 20〜25%、recruitment-logistics-acquisition ドライバー25〜30%、recruitment-education-industry-acquisition 学校法人25〜30%、recruitment-shoukai-fee 難易度高35〜50%、recruitment-executive-search-acquisition リテイナー33〜40%。

### 1-7. 返戻金（返金規定）
- 正: 1ヶ月以内80%／3ヶ月以内50%／6ヶ月以内20%（任意規定の一般例）。
- 矛盾 **(a)(b)**: recruitment-shoukai-fee「1ヶ月以内100%／3ヶ月以内80〜100%／6ヶ月以内30〜50%」「3ヶ月100%、6ヶ月50%が標準」、recruitment-agent-business-model「3ヶ月以内100%返金、6ヶ月以内50%返金」、recruitment-fee-structure「6ヶ月以内20〜30%」、recruitment-rpo-comparison「3ヶ月以内の早期離職で50〜80%返金が標準」、recruitment-executive-search-acquisition「3ヶ月以内50%・6ヶ月以内25%が業界標準」、recruitment-medical-care-acquisition「90日以内50%、180日以内30%」。recruitment-hotel-tourism-acquisition「90日または180日が主流」は期間のみで許容。

### 1-8. CA1人あたりの月間面談数／決定数
- 正: 面談 月20〜40件（SmartForce: 月40件）、決定 月2〜6件。
- 面談数の矛盾 **(b)**: recruitment-ca-productivity「40〜80件が標準」、recruitment-crm-comparison「40〜60件」、recruitment-ryomen-vs-bungyou「月40〜60件」×2、recruitment-media-comparison「30〜50件が標準」、recruitment-ai-utilization「40〜60件から80〜100件へ」、recruitment-online-interview-tools「1日5〜8件」「月80件」、recruitment-candidate-scoring「1日3〜5件」。整合: recruitment-specialized-vs-generalist「月20〜30件」、recruitment-ryomen-vs-bungyou 両面型「月20〜30件」。
- 決定数の矛盾 **(b)**: recruitment-agent-business-model「月10〜15件の決定が標準的」（同文の年商1,200〜2,000万円とも不整合）、recruitment-ca-productivity「4〜15件」「月10件 vs 月5件」、recruitment-specialized-vs-generalist「年間10〜15件／8〜12件／5〜8件」（月1件前後で過小）、recruitment-finance-acquisition「年12〜18件が標準」。整合: recruitment-ryomen-vs-bungyou（分業3〜6件、両面1.5〜3件）、recruitment-hr-tech-trends-2026（月2→4件）、recruitment-agent-startup-guide（月3〜4件）。
- 出典なし **(c)**: recruitment-agency-ma-trends「CA1人あたり年間売上 業界平均2,500〜3,500万円」、recruitment-kpi-dashboard「CA1名あたり月間売上250〜500万円が標準」。

### 1-9. 市場規模／事業所数
- 正: 有料職業紹介事業所数 30,561（厚労省 令和6年度 職業紹介事業報告書の集計結果（速報））、市場規模 4,490億円・前年度比+12.0%（矢野経済研究所）。
- recruitment-market-size-2026 **(b)(a)**: 「市場規模は3,000億円超」（同記事内の「4,200〜4,500億円」とも矛盾）、「2024年度（推計）：約4,200〜4,500億円、事業所数 約31,000」、「1事業所あたりの平均手数料収入は1,000万円前後」（4,490億÷30,561≒1,470万円）、「過去10年で約2.3倍／約1.6倍」「2015〜2022年度の系列」「倒産件数140件規模」「実質的な競合1.2〜1.5万社」（いずれも出典不明 **(c)**）。
- recruitment-agent-startup-guide「3万事業所を超え、直近10年で1.5倍」→ 30,561に統一、1.5倍は出典なし。
- recruitment-soukyaku-comparison「約4,490億円規模（2025年・矢野経済研究所推計）」は整合。ただし「送客サービスを活用する事業者数は年率30%超で増加」は出典なし **(c)**。
- recruitment-specialized-vs-generalist「厚労省の職業紹介事業報告によると、新規許可を取得する事業者の70〜80%が特化型」— 当該報告に特化型／総合型の区分はなく **出典の誤帰属**。同記事冒頭「9割以上が特化型」とも矛盾 **(a)**。

### 1-10. ROAS
- 正: 導入事例 SmartForce ROAS 400%。一般値はなし。
- 記事間で成立ラインが矛盾 **(a)(c)**: 200%以上（recruitment-attribution-analysis）、250〜350%（recruitment-budget-allocation）、3倍以上（recruitment-fee-structure、recruitment-market-size-2026「3.0以上に集中、2.0未満は撤退」）、5倍目標（recruitment-candidate-ltv・試算前提）、500〜1,000%が黒字ライン（recruitment-kpi-dashboard）。
- 判定: 「粗利率・返金率で異なるため自社で設定（導入事例では400%）」に統一。candidate-ltv・market-size は試算前提／判断基準の例示として許容。

### 1-11. 離職率／定着率／返金率
- 出典なしで「業界平均」と断定 **(c)**: recruitment-job-ad-vs-agent「求人広告経由 1年以内離職率20〜30%（業界平均）、紹介経由10〜15%」。
- 記事間矛盾 **(a)**: 返金率 recruitment-quality-of-hire「若手未経験層で15〜25%…が相場」 vs recruitment-agent-startup-guide「返金率5〜10%を見込む」（第二新卒特化モデル）、recruitment-fee-structure「第二新卒層の3ヶ月以内離職率10〜15%」。
- 出典ありで許容: 医療（看護師10〜11%等）、小売・アパレル（厚労省・業界統計）、ホテル（新卒3年以内50%超）、農業（農水省）。出典なし・注記推奨（任意）: recruitment-real-estate-acquisition 15〜20%、recruitment-ryomen-vs-bungyou CA離職30〜50%、recruitment-reference-check 定着率85→92%、recruitment-candidate-ltv 再転職率40〜50%。

### 1-12. 通電率／返信率／応募率
- 正: ライトプラン試算 応募→通電36%、通電→面談72%（応募→面談26%）、クラウド 通電35%→面談40%。
- スカウト返信率の「業界平均」が不一致 **(a)(c)**: 送信ベース2〜5%・3%前後（recruitment-scout-mail-reply-rate、recruitment-media-comparison）／3〜8%（recruitment-scout-media-comparison、recruitment-wantedly-marketing）／5〜10%（recruitment-20s-acquisition）／2〜3%（recruitment-mid-career-trends-2026）。→ 2〜5%（パーソナライズで5〜10%）に統一。
- 通電: recruitment-20s-acquisition「電話架電中心の運用は繋がり率20〜30%」は当社試算（36%）より低いが運用条件が異なるため今回は据え置き（注記任意）。
- recruitment-lead-response-time の応答時間別テーブル（5分以内 65〜80% … 翌営業日15〜25%）は出典なし **(c)** → 「運用現場の目安」注記。
- フォーム完了率30〜50%（recruitment-chatbot-lead-generation）と離脱率50〜70%（recruitment-form-optimization）は整合。

### 1-13. 許可申請の費用／期間／要件
- 正: 登録免許税9万円＋手数料5万円、許可まで2〜3ヶ月、基準資産額500万円・現預金150万円、有効期間 初回3年・以後5年。
- 整合: recruitment-licensing（全項目）、recruitment-agent-startup-guide（費用14万円・2〜3ヶ月・500/150万円）、recruitment-haken-vs-agent（手数料・登録免許税）。
- 矛盾 **(a)(b)**: recruitment-agent-startup-guide「事業所1つ増えるごとに+350万円/+60万円」（正: +500万円/+60万円）、「面積20㎡以上が目安（緩和運用あり）」（面積要件は2017年撤廃、licensing・haken記事と矛盾）、recruitment-haken-vs-agent「現預金150万円以上×事業所数」（正: 150万円＋60万円×追加事業所数）。
- 出典なし（任意注記）: recruitment-licensing「代行費用は20〜40万円が相場」、recruitment-agent-startup-guide「講習受講料約1.3万円」。

### 1-14. その他
- 粗利率の定義・数値が不統一 **(a)**: 40〜60%（recruitment-candidate-ltv）、60〜70%（recruitment-fee-structure、recruitment-executive-search-acquisition「一般紹介より15〜20pt高い」）、70〜90%・80%（recruitment-agent-startup-guide）、90%（recruitment-budget-allocation）。集客費比率も「売上の20〜35%」（recruitment-agent-branding）vs「コスト構造の40〜60%」（recruitment-agent-business-model）。→ 定義（何を控除するか）を明示。
- 内定承諾率 **(a)**: 50〜70%が健全（recruitment-kpi-dashboard）／60〜70%・優良80〜85%（recruitment-offer-acceptance-rate）／70〜85%（recruitment-funnel-design、recruitment-monthly-volume-planning）／目標70%以上（recruitment-decision-rate）／60〜70%（recruitment-job-order-development）。→ 60〜70%（優良80%以上）を目安に統一。
- NPS「業界平均」**(a)(c)**: 0〜+20（recruitment-candidate-experience）vs -10〜+20（recruitment-candidate-nps）。
- 出典のない導入事例 **(c)**: recruitment-hr-tech-trends-2026「中堅エージェント（CA30名規模）…2.1件→3.4件…報告されています」→ 試算例に変更。
- 出典のない統計 **(c)**: recruitment-30s-acquisition「結婚（85%）、子供あり（45%）、住宅購入検討中（40%）」、recruitment-20s-acquisition「SNS起点…60%超」、recruitment-sns-marketing「SNSを挙げる比率は80%以上」、recruitment-agency-ma-trends「M&A件数は年率15〜20%増」、recruitment-side-job-agent「副業マッチング市場900億→2,000億円」、recruitment-international-acquisition「年率20〜30%で拡大」、recruitment-cs-acquisition／recruitment-saas-sales-acquisition「5年で5〜10倍」、recruitment-education-industry-acquisition「市場規模2.8兆円」など。→ 任意で出典追記または「〜とされる」等の緩和表現（今回のJSON対象外）。
- 計算ミス **(a)**: recruitment-candidate-experience「離脱15%→5%改善で決定数は月2〜3件増加、月160〜240万円」（月50名×10pt＝5名×成約率10〜15%＝0.5〜0.75件、月40〜60万円）。recruitment-budget-allocation「27〜48万円」（粗利率90%の掛け忘れ）。recruitment-fee-structure 着座課金の送客コストを着座率で割っている。
- 補足: recruitment-cost-per-hire/index.html は修正前から `<strong>` の開閉数が不一致（38対39）。今回の修正とは無関係だが、HTML修正時に確認推奨。


## 2. 記事別の修正リスト

各項目: **変更前**（HTMLソースの完全一致文字列）→ **変更後** ／ 理由。

### interview-show-rate（1箇所）
1. 変更前: ` — 一般的な広告経由の応募者で、最低限のオペレーションがある状態`
   変更後: ` — 一般的な広告経由の応募者で、最低限のオペレーションがある状態（レンジはいずれも目安。登録課金型リードの面談実施率は20〜35%程度）`
   理由: 着座率の「標準レンジ」に出典がないため目安と明記し、当社実績値（登録課金型リード20〜35%）を併記

### recruitment-20s-acquisition（1箇所）
1. 変更前: `返信率は業界平均5〜10%、面談確約率はさらに低く`
   変更後: `返信率は送信ベースで2〜5%程度が一般的な目安で、面談確約率はさらに低く`
   理由: スカウト返信率の「業界平均」が他記事（2〜5%・3%前後）と矛盾。出典もないため統一

### recruitment-30s-acquisition（1箇所）
1. 変更前: `結婚（85%）、子供あり（45%）、住宅購入検討中（40%）`
   変更後: `結婚・子どもあり・住宅購入検討中の比率が20代より格段に高い`
   理由: 出典のない統計値を事実として提示。定性表現に変更

### recruitment-acquisition-complete-guide（1箇所）
1. 変更前: `業界の標準CPAレンジ（若手未経験領域）`
   変更後: `若手未経験領域のCPAの一般的な目安`
   理由: 出典のないCPAレンジを「業界の標準」と断定。目安と明記

### recruitment-agency-ma-trends（1箇所）
1. 変更前: `CA1人あたりの年間売上（＝生産性）は、業界平均で2,500〜3,500万円`
   変更後: `CA1人あたりの年間売上（＝生産性）は、一般に2,500〜3,500万円程度が目安とされ`
   理由: 出典のない「業界平均」。目安に変更

### recruitment-agent-branding（1箇所）
1. 変更前: `第二新卒領域では応募CPA15,000〜25,000円、決定単価に換算すると150,000〜300,000円が一般的なレンジになり`
   変更後: `第二新卒領域では応募CPA10,000〜18,000円、決定CPAに換算すると20〜50万円台が一般的な目安になり`
   理由: 応募CPA・決定CPAがCPA計算記事（第二新卒 応募10,000〜18,000円／決定25〜50万円台）と矛盾

### recruitment-agent-business-model（4箇所）
1. 変更前: `成功報酬 = 想定年収 × 手数料率（25〜35%）`
   変更後: `成功報酬 = 想定年収 × 手数料率（30〜35%）`
   理由: 紹介手数料率は理論年収の30〜35%（正）。25〜35%は他記事とも不整合
2. 変更前: `人材紹介の収益は「成功報酬＝想定年収×手数料率（25〜35%）」が標準`
   変更後: `人材紹介の収益は「成功報酬＝想定年収×手数料率（30〜35%）」が標準`
   理由: 同上（SUMMARY）
3. 変更前: `入社後3ヶ月以内100%返金、6ヶ月以内50%返金、といった条件設定が一般的`
   変更後: `入社1ヶ月以内80%・3ヶ月以内50%・6ヶ月以内20%返金、といった条件設定が一般例（任意規定）`
   理由: 返戻金の一般例（1ヶ月以内80%／3ヶ月以内50%／6ヶ月以内20%）と矛盾。手数料設計記事とも不一致
4. 変更前: `CA1人あたり月10〜15件の決定が標準的な生産性で、年商ベースで1人あたり1,200〜2,000万円を生み出します`
   変更後: `CA1人あたり月2〜6件の決定が一般的な目安で、決定単価80〜130万円なら年商ベースで1人あたり約2,000〜9,000万円（件数と単価により幅）を生み出します`
   理由: CA1人あたりの決定は月2〜6件が目安。月10〜15件は過大で、同文中の年商1,200〜2,000万円とも計算が合わない

### recruitment-agent-startup-guide（6箇所）
1. 変更前: `（事業所1つ増えるごとに+350万円/+60万円）`
   変更後: `（事業所1つ増えるごとに+500万円/+60万円）`
   理由: 基準資産額は500万円×事業所数。免許記事（licensing）とも矛盾
2. 変更前: `個室または間仕切り。面積20㎡以上が目安（緩和運用あり）`
   変更後: `個室または間仕切り。面積要件は2017年に撤廃済み（プライバシー確保が要件）`
   理由: 面積要件は撤廃済み。licensing記事・派遣比較記事と矛盾
3. 変更前: `面談着座から決定までの標準歩留まりは10〜20%`
   変更後: `面談着座から決定までの標準的な歩留まりは10〜15%（業界平均8〜12%程度）`
   理由: 面談→決定の成約率目安は10〜15%（業界平均8〜12%）
4. 変更前: `有料職業紹介事業者数は2024年時点で3万事業所を超え、直近10年で1.5倍に拡大しました`
   変更後: `有料職業紹介事業所数は30,561（令和6年度 職業紹介事業報告書の集計結果（速報））と3万事業所を超え、この10年で大きく拡大しました`
   理由: 事業所数は厚労省速報値30,561に統一。「1.5倍」は出典なし
5. 変更前: `粗利率が高い（決定単価の70〜90%が粗利）`
   変更後: `変動費が少なく粗利率が高い`
   理由: 粗利率の数値が記事間で40〜60%／60〜70%／70〜90%／90%とばらつき、定義も不統一。定性表現に
6. 変更前: `返金規定を契約に組み込む前提で、返金率5〜10%を見込む`
   変更後: `返金規定を契約に組み込む前提で、返金率5〜10%程度を仮置きで見込む（実績で更新する）`
   理由: QoH記事の返金率（若手15〜25%）と矛盾。計画上の仮定であることを明記

### recruitment-ai-utilization（2箇所）
1. 変更前: `CA1人あたりの月間カウンセリング処理件数は40〜60件から80〜100件まで引き上げられる、というのが先行導入エージェントの実績値です`
   変更後: `CA1人あたりの月間面談処理件数（一般に月20〜40件が目安）を1.5〜2倍に引き上げられる、というのが先行導入エージェントの声です`
   理由: CA1人あたりの面談は月20〜40件が目安。40〜60→80〜100件は過大
2. 変更前: `CA1人月間処理件数を40〜60件から80〜100件へ`
   変更後: `CA1人あたりの月間面談処理件数を1.5〜2倍へ`
   理由: 同上（SUMMARY）

### recruitment-attribution-analysis（5箇所）
1. 変更前: `決定単価は50万〜150万円が標準レンジ`
   変更後: `決定CPAは若手未経験領域で20〜50万円台が目安（セグメントで大きく異なる）`
   理由: 決定CPA 50〜150万円はCPA計算記事（20〜50万円台）・他記事と大きく矛盾
2. 変更前: `ROAS 200%以上が事業として成立するライン`
   変更後: `成立ラインは粗利率・返金率を織り込んで自社で設定する（導入事例ではROAS400%の例もある）`
   理由: ROASの成立ラインが記事間で200%／250〜350%／300%／500〜1,000%と矛盾。出典なし
3. 変更前: `SNS経由の応募者は着座率が55〜70%と高い一方、決定までの検討期間が長い`
   変更後: `SNS経由の応募者は温度感にばらつきがあり決定までの検討期間が長い`
   理由: SNS経由の着座率55〜70%は20代記事（30〜45%）・Meta広告記事（40〜60%）と矛盾
4. 変更前: `リスティング経由は着座率75〜85%と高く、比較的短期決定`
   変更後: `リスティング経由は顕在層のため着座率が比較的高く、短期決定になりやすい`
   理由: リスティングの着座率75〜85%は20代記事（55〜70%）・月次計画記事（40〜60%）と矛盾
5. 変更前: `SEO経由は着座率が40〜60%と幅があるが`
   変更後: `SEO経由は着座率に幅があるが`
   理由: 出典のない着座率。定性表現に

### recruitment-budget-allocation（4箇所）
1. 変更前: `粗利の30〜40%、つまり27〜48万円`
   変更後: `粗利の30〜40%程度、つまり約24〜43万円`
   理由: 「業界の一般的なライン」は出典なし。計算も粗利率90%を掛け忘れ（90〜120万円×0.9×30〜40%＝約24〜43万円）
2. 変更前: `決定CPAは粗利の30〜40%（27〜48万円）が業界の一般ライン`
   変更後: `決定CPAは粗利の30〜40%（約24〜43万円）が一つの目安`
   理由: 同上（SUMMARY）
3. 変更前: `ROAS（決定売上 ÷ 広告費）</strong>：目安は250〜350%`
   変更後: `ROAS（決定売上 ÷ 広告費）</strong>：目標水準は粗利率・返金率を踏まえて自社で設定（導入事例ではROAS400%の例もある）`
   理由: ROAS目安が他記事（200%／300%／500〜1,000%）と矛盾
4. 変更前: `経営説明は決定CPA・ROAS250〜350%・マーケ経由決定件数`
   変更後: `経営説明は決定CPA・ROAS目標・マーケ経由決定件数`
   理由: 同上（SUMMARY）

### recruitment-ca-productivity（4箇所）
1. 変更前: `CA1人月10件の決定を出すチームと、月5件しか出せないチームでは`
   変更後: `CA1人月6件の決定を出すチームと、月3件しか出せないチームでは`
   理由: CA1人あたりの決定は月2〜6件が目安。例示を目安レンジ内に
2. 変更前: `月間面談数</strong>：CA1人あたり40〜80件が標準`
   変更後: `月間面談数</strong>：CA1人あたり20〜40件が目安`
   理由: CA1人あたりの面談は月20〜40件が目安（SmartForce社事例：月40件）
3. 変更前: `<strong>月間決定数</strong>：4〜15件`
   変更後: `<strong>月間決定数</strong>：2〜6件が目安`
   理由: CA1人あたりの決定は月2〜6件が目安
4. 変更前: `CA1人あたりの月間決定数（4〜15件）と決定単価`
   変更後: `CA1人あたりの月間決定数（2〜6件が目安）と決定単価`
   理由: 同上（SUMMARY）

### recruitment-cancellation-rate（4箇所）
1. 変更前: `の業界平均は20〜40%。この数値が大きいほど`
   変更後: `は、一般に20〜40%程度が目安とされます。この数値が大きいほど`
   理由: 出典のない「業界平均」。目安に変更
2. 変更前: `<p>業界平均値（若手未経験領域）：</p>`
   変更後: `<p>目安となる水準（若手未経験領域、出典なしの参考値）：</p>`
   理由: 同上
3. 変更前: `面談キャンセル率の業界平均は20〜40%。要因は`
   変更後: `面談キャンセル率は20〜40%程度が目安。要因は`
   理由: 同上（SUMMARY）
4. 変更前: `がデフォルトで保証されているため、キャンセル対策`
   変更後: `を実績として維持しているため、キャンセル対策`
   理由: 「保証」は実績ではなく保証を意味し誤解を招く。実績表現に

### recruitment-candidate-experience（4箇所）
1. 変更前: `リマインド送信率、面談着座率（80〜90%が健全）`
   変更後: `リマインド送信率、面談着座率（事前カウンセリング付き送客では80〜90%、広告経由の自社集客では50〜65%程度が目安）`
   理由: 80〜90%は当社送客の実績値であり、一般的な「健全値」ではない
2. 変更前: `15%→5%に改善すると、決定数は月2〜3件増加`
   変更後: `15%→5%に改善すると、決定数は月0.5〜1件程度増加`
   理由: 月50名×離脱改善10pt＝5名増→成約率10〜15%で決定0.5〜0.75件。月2〜3件は計算が合わない
3. 変更前: `決定単価80万円換算で月160〜240万円の売上増`
   変更後: `決定単価80万円換算で月40〜60万円の売上増`
   理由: 同上の再計算
4. 変更前: `NPS目標値</strong>：人材紹介業界平均は0〜+20。`
   変更後: `NPS目標値</strong>：人材紹介業界では-10〜+20程度に収まることが多い（目安）。`
   理由: NPS記事（-10〜+20）と数値が不一致、出典なし

### recruitment-candidate-scoring（1箇所）
1. 変更前: `60〜80件、面談実施可能数は3〜5件が現実的な上限`
   変更後: `60〜80件、面談実施数は月20〜40件（1日1〜2件程度）が現実的な目安`
   理由: 1日3〜5件＝月60〜100件はCA面談の目安（月20〜40件）を大きく超える

### recruitment-casual-interview-acquisition（1箇所）
1. 変更前: `決定率（本面談以降）</strong>：本面談型と同等の15〜25%`
   変更後: `決定率（本面談以降）</strong>：本面談型と同等の10〜15%`
   理由: 面談→決定の成約率目安は10〜15%。15〜25%は過大

### recruitment-cost-per-hire（2箇所）
1. 変更前: `：決定単価15〜30万円。母集団は比較的作りやすいが`
   変更後: `：決定単価20〜50万円台。母集団は比較的作りやすいが`
   理由: 決定CPAがCPA計算記事（第二新卒25〜50万円台）と矛盾
2. 変更前: `業界相場は第二新卒15〜30万円、営業20〜40万円`
   変更後: `業界相場は第二新卒20〜50万円台、営業20〜40万円`
   理由: 同上（SUMMARY）

### recruitment-cpa-calculation（3箇所）
1. 変更前: `：8〜18%（求人ポートフォリオの質で変動）`
   変更後: `：8〜15%（求人ポートフォリオの質で変動。業界平均8〜12%、10〜15%が目安）`
   理由: 面談→決定の成約率目安10〜15%（業界平均8〜12%）に統一
2. 変更前: `：35〜70%（事前カウンセリング有無で大きく変動）`
   変更後: `：35〜70%（事前カウンセリング有無で大きく変動。登録課金型リードでは20〜35%程度）`
   理由: 当社実績（登録課金型リードの面談実施率20〜35%）を併記
3. 変更前: `業界平均は若手未経験で応募CPA 8,000〜15,000円`
   変更後: `一般的な目安は若手未経験で応募CPA 8,000〜15,000円`
   理由: 出典のない「業界平均」を目安に

### recruitment-crm-comparison（2箇所）
1. 変更前: `CA1名あたりの月間面談件数40〜60件`
   変更後: `CA1名あたりの月間面談件数20〜40件`
   理由: CA1人あたりの面談は月20〜40件が目安
2. 変更前: `<strong>面談着座率(目標80〜90%)</strong>`
   変更後: `<strong>面談着座率(目標値はチャネル別に設定。事前カウンセリング付き送客では80〜90%)</strong>`
   理由: 80〜90%は当社送客の実績値であり自社集客の一般目標ではない

### recruitment-decision-rate（1箇所）
1. 変更前: `看護・介護など専門職領域では15〜25%が相場感です`
   変更後: `看護・介護など専門職領域では15〜25%が相場感です（公開統計はなく目安として扱ってください）`
   理由: セグメント別決定率に出典がない

### recruitment-education-industry-acquisition（2箇所）
1. 変更前: `EdTech志向人材の含有率が高く、面談後の決定率も25〜30%と良好`
   変更後: `EdTech志向人材の含有率が高く、面談後の決定率も比較的高い`
   理由: 面談→決定25〜30%は目安（10〜15%）を大きく超え出典なし
2. 変更前: `：50〜65%（一般業界の55〜70%比でやや低め）`
   変更後: `：50〜65%（他業界と同程度〜やや低め）`
   理由: 「一般業界55〜70%」は他記事の着座率レンジと不一致

### recruitment-executive-search-acquisition（1箇所）
1. 変更前: `3ヶ月以内50%・6ヶ月以内25%が業界標準`
   変更後: `3ヶ月以内50%・6ヶ月以内20%程度が一般例`
   理由: 返戻金の一般例（6ヶ月以内20%）に合わせ、「業界標準」を一般例に

### recruitment-fee-structure（9箇所）
1. 変更前: `：25〜30%（理論年収300〜400万円のため、決定単価は75〜120万円）`
   変更後: `：30〜35%が基本（理論年収300〜400万円のため、決定単価は90〜140万円。契約により25%程度まで下がる例もある）`
   理由: 紹介手数料率は理論年収の30〜35%。25〜30%を標準とするのは不整合
2. 変更前: `第二新卒層は25〜30%、ハイクラスは35〜40%が相場`
   変更後: `第二新卒層も30〜35%が基本（契約により25%程度に下がる例あり）、ハイクラスは35〜40%が相場`
   理由: 同上（SUMMARY）
3. 変更前: `<strong>3〜6ヶ月以内退職</strong>：20〜30%返金`
   変更後: `<strong>3〜6ヶ月以内退職</strong>：20%返金`
   理由: 返戻金の一般例は6ヶ月以内20%
4. 変更前: `返金規定は1ヶ月以内80%・3ヶ月以内50%・6ヶ月以内20〜30%が標準`
   変更後: `返金規定は1ヶ月以内80%・3ヶ月以内50%・6ヶ月以内20%が一般例（任意規定）`
   理由: 同上（SUMMARY）
5. 変更前: `<strong>面談着座1件あたり3〜8万円</strong>の成果報酬`
   変更後: `<strong>面談着座1件あたり1.4〜3.8万円（求職者送客の窓口は2.5万円〜）</strong>の成果報酬`
   理由: 着座課金の面談単価は市場1.4〜3.8万円、当社2.5万円〜。3〜8万円は誤り
6. 変更前: `着座単価5万円、面談着座率85%、面談〜決定率15%とすると、決定1件あたりの送客コストは約39万円`
   変更後: `着座単価2.5万円、面談〜決定率15%とすると、決定1件あたりの送客コストは約16.7万円（着座課金では着座率はコストに影響しない）`
   理由: 面談単価2.5万円〜・成約率15%→決定単価16.7万円〜。着座課金なのに着座率で割る計算も誤り
7. 変更前: `決定単価120万円なら粗利は81万円、ROAS換算で約3.0倍`
   変更後: `決定単価120万円なら送客コスト控除後の粗利は約103万円、ROAS換算で約7倍`
   理由: 前項の再計算（120÷16.7≒7.2）
8. 変更前: `決定までの歩留まりを考慮すると獲得コストは30〜80万円`
   変更後: `決定までの歩留まりを考慮すると獲得コストは20〜50万円台`
   理由: 決定CPAはCPA計算記事（20〜50万円台）と統一
9. 変更前: `決定1件あたりの獲得コストを30〜80万円のレンジに収め、ROAS3倍以上を維持する`
   変更後: `決定1件あたりの獲得コストを20〜50万円台のレンジに収め、ROASを高水準で維持する`
   理由: 同上。ROASの目安は記事間で矛盾するため定性表現に

### recruitment-finance-acquisition（2箇所）
1. 変更前: `CA1人あたりの担当決定数は年12〜18件が標準です`
   変更後: `CA1人あたりの年間決定数は若手領域（月2〜6件が目安）より少なく、年12〜18件程度にとどまる事業者もあります`
   理由: CA決定の一般目安（月2〜6件）との関係を明示。「標準」は出典なし
2. 変更前: `長期戦。年間決定数はCA1人12〜18件が標準`
   変更後: `長期戦。年間決定数はCA1人12〜18件程度と若手領域より少ない`
   理由: 同上（SUMMARY）

### recruitment-funnel-design（1箇所）
1. 変更前: `がデフォルトで保証されているため、自社ファネルの`
   変更後: `を実績として維持しているため、自社ファネルの`
   理由: 「保証」表現を実績表現に

### recruitment-game-entertainment-acquisition（2箇所）
1. 変更前: `着座からの決定率は8〜15%（汎用の3〜7%より高い）`
   変更後: `着座からの決定率は8〜15%（業界平均8〜12%と同等〜やや高い）`
   理由: 汎用エージェントの決定率3〜7%は業界平均8〜12%と矛盾
2. 変更前: `着座決定率8〜15%と汎用の2倍。決定単価250万円超`
   変更後: `着座決定率8〜15%と業界平均（8〜12%）と同等以上。決定単価250万円超`
   理由: 同上（SUMMARY）

### recruitment-ghosting-prevention（1箇所）
1. 変更前: `応募から面談着座までの離脱率は業界平均で40〜60%`
   変更後: `応募から面談着座までの離脱率は一般に40〜60%程度（登録課金型リードでは面談実施率が20〜35%にとどまる例も多い）`
   理由: 出典のない「業界平均」。目安に変更し当社実績を併記

### recruitment-haken-vs-agent（1箇所）
1. 変更前: `基準資産額500万円以上×事業所数、現預金150万円以上×事業所数`
   変更後: `基準資産額500万円以上×事業所数、現預金150万円以上＋60万円×（事業所数−1）`
   理由: 現預金要件は150万円＋60万円×追加事業所数。licensing記事と矛盾

### recruitment-hr-tech-trends-2026（2箇所）
1. 変更前: `成果事例として、中堅エージェント（CA30名規模）でAIマッチングを導入した企業では、`
   変更後: `試算例として、CA30名規模のエージェントでAIマッチングを導入し、`
   理由: 出典のない導入事例を「報告されている」と断定。試算例に変更
2. 変更前: `AIマッチング導入でCA1人あたり月間決定数が2.1件→3.4件（62%増）、書類通過率も18%→27%へ改善する事例`
   変更後: `AIマッチング導入でCA1人あたり月間決定数が2.1件→3.4件（62%増）、書類通過率が18%→27%へ改善した場合の効果を試算`
   理由: 同上（SUMMARY）

### recruitment-inbound-lead-qualification（1箇所）
1. 変更前: `応募から面談着座までの歩留まりは平均30〜50%、着座から決定までの決定率は5〜15%が相場で`
   変更後: `応募から面談着座までの歩留まりは一般に30〜50%程度（登録課金型リードでは20〜35%）、着座から決定までの決定率は10〜15%（業界平均8〜12%）が目安で`
   理由: 決定率5〜15%は成約率目安（10〜15%、業界平均8〜12%）と不一致。着座率も当社実績を併記

### recruitment-insourcing-vs-outsourcing（3箇所）
1. 変更前: `内製：軌道に乗れば15,000〜25,000円まで下がる`
   変更後: `内製：広告費ベースでは軌道に乗れば15,000〜25,000円まで下がるが、人件費込みの実コストは25,000〜50,000円`
   理由: 同記事内で内製の着座CPAが15,000〜25,000円と25,000〜50,000円で矛盾
2. 変更前: `外注（着座課金型）：20,000〜40,000円で安定`
   変更後: `外注（着座課金型）：14,000〜38,000円（求職者送客の窓口は25,000円〜）で安定`
   理由: 着座課金の面談単価は市場1.4〜3.8万円、当社2.5万円〜
3. 変更前: `応募課金型で着座率が30〜50%だと、実質CPAは`
   変更後: `応募課金型・登録課金型で着座率が20〜35%程度だと、実質CPAは`
   理由: 登録課金型リードの面談実施率は20〜35%（当社実績）

### recruitment-it-industry-acquisition（1箇所）
1. 変更前: `決定年収（紹介手数料35%が標準）に強く依存します`
   変更後: `決定年収（紹介手数料は理論年収の30〜35%が一般的）に強く依存します`
   理由: 紹介手数料率は30〜35%

### recruitment-job-ad-vs-agent（1箇所）
1. 変更前: `<strong>20〜30%</strong>（業界平均）`
   変更後: `<strong>20〜30%</strong>程度（公開統計はなく目安）`
   理由: 出典のない「業界平均」

### recruitment-job-order-development（1箇所）
1. 変更前: `：決定率20〜28%（求職者の意思決定が加速）`
   変更後: `：決定率20〜28%（求職者の意思決定が加速。いずれも目安で、面談→決定の業界平均は8〜12%）`
   理由: 推薦社数別の決定率に出典なし。業界平均との関係を明示

### recruitment-kpi-dashboard（2箇所）
1. 変更前: `（オファー受諾率）</strong>：50〜70%が健全`
   変更後: `（オファー受諾率）</strong>：60〜70%程度が目安（優良で80%以上）`
   理由: 内定承諾率が承諾率記事（60〜70%、優良80〜85%）と不一致
2. 変更前: `ROAS（広告投資対売上）</strong>：500〜1000%が黒字ライン`
   変更後: `ROAS（広告投資対売上）</strong>：黒字ラインは粗利率・返金率で異なる（導入事例では400%の例もある）`
   理由: ROASの黒字ラインが他記事（200%／250〜350%／300%）と矛盾

### recruitment-latent-candidates（1箇所）
1. 変更前: `潜在層を丁寧にナーチャリングした場合の決定率は25〜35%`
   変更後: `潜在層を丁寧にナーチャリングした場合の決定率は顕在層を上回る水準`
   理由: 決定率25〜35%は成約率目安（10〜15%）を大きく超え出典なし

### recruitment-lead-response-time（1箇所）
1. 変更前: `：着信応答率 8〜12%、面談着座率 15〜25%`
   変更後: `：着信応答率 8〜12%、面談着座率 15〜25%（いずれも運用現場の目安であり公開統計ではない）`
   理由: 応答時間別の着座率に出典なし

### recruitment-line-marketing（2箇所）
1. 変更前: `歩留まりが標準で40〜60%にとどまる中`
   変更後: `歩留まりが一般に40〜60%程度（登録課金型リードでは20〜35%）にとどまる中`
   理由: 出典のない「標準」。当社実績を併記
2. 変更前: `がデフォルトで保証されているため、LINE運用の立ち上げ`
   変更後: `を実績として維持しているため、LINE運用の立ち上げ`
   理由: 「保証」表現を実績表現に

### recruitment-manufacturing-acquisition（2箇所）
1. 変更前: `現場職は紹介手数料が30〜60万円に下がるため`
   変更後: `現場職は理論年収が低い分だけ紹介手数料も相対的に低くなるため`
   理由: 紹介手数料30〜60万円は年収300〜450万円×30〜35%（90〜160万円）と整合しない
2. 変更前: `現場職はCPA5,000〜10,000円・決定単価30〜60万円が相場`
   変更後: `現場職はCPA5,000〜10,000円・決定単価も相対的に低いのが相場`
   理由: 同上（SUMMARY）

### recruitment-market-size-2026（7箇所）
1. 変更前: `市場規模は3,000億円超まで拡大しました`
   変更後: `市場規模は4,490億円（前年度比+12.0%、矢野経済研究所）まで拡大しました`
   理由: 市場規模は4,490億円（矢野経済研究所）。3,000億円超は同記事内の4,200〜4,500億円とも矛盾
2. 変更前: `厚生労働省「職業紹介事業報告書」および各種調査会社のデータを総合すると、以下のような推移をたどっています`
   変更後: `矢野経済研究所の推計および厚生労働省「職業紹介事業報告書」によると、以下のような推移をたどっています（過去年度の金額は概数）`
   理由: 出典の明示。年次系列の数値は出典不明のため概数と明記
3. 変更前: `<strong>2024年度（推計）</strong>：手数料収入合計 約4,200〜4,500億円、事業所数 約31,000`
   変更後: `<strong>2024年度</strong>：市場規模 約4,490億円（前年度比+12.0%、矢野経済研究所）、事業所数 30,561（厚生労働省 令和6年度 職業紹介事業報告書の集計結果（速報））`
   理由: 市場規模4,490億円・事業所数30,561に統一
4. 変更前: `過去10年で市場規模は約2.3倍、事業者数は約1.6倍に拡大しました。1事業所あたりの平均手数料収入は1,000万円前後で推移しており`
   変更後: `過去10年で市場規模・事業者数ともに大きく拡大しました。1事業所あたりの平均市場規模は約1,470万円（4,490億円÷30,561事業所）で`
   理由: 「2.3倍／1.6倍」は出典不明。1事業所あたり1,000万円は4,490億円÷30,561≒1,469万円と矛盾
5. 変更前: `注意すべき構造</strong>：事業者数31,000のうち`
   変更後: `注意すべき構造</strong>：事業所数30,561のうち`
   理由: 事業所数を厚労省速報値に統一
6. 変更前: `人材紹介市場は約4,200〜4,500億円規模、事業者数は約31,000`
   変更後: `人材紹介市場は約4,490億円規模（矢野経済研究所）、事業所数は30,561（厚労省 令和6年度速報）`
   理由: 同上（SUMMARY）
7. 変更前: `倒産件数は2023年以降140件規模で過去最多水準`
   変更後: `倒産・廃業件数は2023年以降、過去最多水準で推移`
   理由: 「140件」に出典がない

### recruitment-media-comparison（2箇所）
1. 変更前: `着座CPA 25,000〜45,000円（着座課金）、着座率80〜90%、決定率10〜20%`
   変更後: `着座CPA 14,000〜38,000円（着座課金。求職者送客の窓口は25,000円〜）、着座率80〜90%、成約率15%程度`
   理由: 着座課金の面談単価は市場1.4〜3.8万円・当社2.5万円〜、成約率15%
2. 変更前: `CA1人あたり月間着座件数（30〜50件が標準）`
   変更後: `CA1人あたり月間着座件数（20〜40件が目安）`
   理由: CA1人あたりの面談は月20〜40件が目安

### recruitment-medical-care-acquisition（3箇所）
1. 変更前: `決定単価ベースでは100,000〜300,000円という相場感`
   変更後: `決定CPAベースでは30〜80万円という相場感`
   理由: Cost per Hire記事（医療・介護・看護 決定単価30〜80万円）と矛盾。応募CPA2〜5万円からの逆算とも整合しない
2. 変更前: `マッチング精度が上がり、面談着座後の決定率が30%超に乗ります`
   変更後: `マッチング精度が上がり、面談着座後の決定率が業界平均（8〜12%）を大きく上回る水準に乗ります`
   理由: 決定率30%超は出典なしで成約率目安（10〜15%）を大きく超える
3. 変更前: `（90日以内50%、180日以内30%など）`
   変更後: `（例：1ヶ月以内80%・3ヶ月以内50%・6ヶ月以内20%）`
   理由: 返戻金の一般例に統一

### recruitment-middle-acquisition（1箇所）
1. 変更前: `応募〜着座の歩留まりは、若手で70〜80%、ミドル層では50〜65%が相場です`
   変更後: `応募〜着座の歩留まりは、ミドル層では若手より10〜15ポイント低くなるのが一般的です（目安）`
   理由: 若手の着座率70〜80%は他記事（50〜65%）と矛盾、出典なし

### recruitment-monthly-volume-planning（3箇所）
1. 変更前: `歩留まり率の業界標準レンジ（若手未経験領域）：`
   変更後: `歩留まり率の目安レンジ（若手未経験領域。公開統計はなく、チャネルにより大きく変動）：`
   理由: 出典のない「業界標準」
2. 変更前: `<strong>面談着座→内定</strong>：12〜20%（標準15%）`
   変更後: `<strong>面談着座→内定</strong>：10〜15%（標準15%）`
   理由: 面談→決定の成約率目安は10〜15%
3. 変更前: `応募→着座 50〜70%、着座→決定 12〜20%、決定→承諾 70〜85%が業界標準レンジ`
   変更後: `応募→着座 50〜70%、着座→決定 10〜15%、決定→承諾 70〜85%が目安レンジ`
   理由: 同上（SUMMARY）

### recruitment-offer-acceptance-rate（3箇所）
1. 変更前: `業界平均で承諾率は60〜70%、優良エージェントで80〜85%`
   変更後: `一般的な目安として承諾率は60〜70%、優良エージェントで80〜85%`
   理由: 出典のない「業界平均」
2. 変更前: `<strong>業界平均</strong>：おおむね60〜70%のレンジ`
   変更後: `<strong>一般的な目安</strong>：おおむね60〜70%のレンジ`
   理由: 同上
3. 変更前: `承諾率の業界平均は60〜70%、優良で80〜85%`
   変更後: `承諾率の目安は60〜70%、優良で80〜85%`
   理由: 同上（SUMMARY）

### recruitment-online-interview-tools（2箇所）
1. 変更前: `：CA1人が1日5〜8件面談する場合、手動発行は`
   変更後: `：CA1人が1日2〜3件面談する場合、手動発行は`
   理由: 1日5〜8件＝月100件超はCA面談の目安（月20〜40件）を大きく超える
2. 変更前: `：CA1人あたり月80件面談する体制で、専用ツール`
   変更後: `：CA1人あたり月40件面談する体制で、専用ツール`
   理由: CA1人あたりの面談は月20〜40件が目安

### recruitment-persona-design（1箇所）
1. 変更前: `（標準着座率は80%前後、決定率は5〜10%）`
   変更後: `（目安：着座率は事前カウンセリングの有無で大きく変わり、面談→決定率は10〜15%、業界平均8〜12%）`
   理由: 着座率80%前後は当社送客の実績値であり一般の標準ではない。決定率5〜10%は成約率目安（10〜15%）と矛盾

### recruitment-pre-counseling（1箇所）
1. 変更前: `がデフォルトで保証されており、自社のCAは`
   変更後: `を実績として維持しており、自社のCAは`
   理由: 「保証」表現を実績表現に

### recruitment-quality-of-hire（1箇所）
1. 変更前: `若手未経験層で15〜25%、キャリア層で5〜10%が相場`
   変更後: `若手未経験層ほど高く、キャリア層ほど低い傾向（自社実績で把握する）`
   理由: 開業ガイド記事の返金率5〜10%と矛盾、出典なし

### recruitment-restaurant-acquisition（3箇所）
1. 変更前: `<strong>紹介経由の決定率は40〜50%</strong>と極めて高い`
   変更後: `<strong>紹介経由の決定率は極めて高く</strong>、`
   理由: 決定率40〜50%は出典なし
2. 変更前: `業界平均は50〜60%、上位運用で80〜90%まで引き上げ可能です`
   変更後: `一般に50〜60%程度が目安で、上位運用で80〜90%まで引き上げ可能です`
   理由: 出典のない「業界平均」
3. 変更前: `着座率を業界平均50〜60%から80〜90%まで引き上げ可能`
   変更後: `着座率を目安の50〜60%から80〜90%まで引き上げ可能`
   理由: 同上（SUMMARY）

### recruitment-rpo-comparison（1箇所）
1. 変更前: `入社後3ヶ月以内の早期離職で50〜80%返金が標準`
   変更後: `早期離職時に1ヶ月以内80%・3ヶ月以内50%・6ヶ月以内20%程度を返金するのが一般例`
   理由: 返戻金の一般例に統一

### recruitment-ryomen-vs-bungyou（2箇所）
1. 変更前: `1人あたり月40〜60件の面談着座が可能`
   変更後: `1人あたり月20〜40件の面談着座が可能`
   理由: CA1人あたりの面談は月20〜40件が目安
2. 変更前: `分業型が高く、CAは月40〜60件の面談着座が可能`
   変更後: `分業型が高く、CAは月20〜40件の面談着座が可能`
   理由: 同上（SUMMARY）

### recruitment-scout-mail-reply-rate（1箇所）
1. 変更前: `返信率（送信ベース）</strong>：2〜5%（業界平均は3%前後）`
   変更後: `返信率（送信ベース）</strong>：2〜5%（一般的な目安は3%前後）`
   理由: 出典のない「業界平均」

### recruitment-scout-media-comparison（4箇所）
1. 変更前: `：3〜8%（テンプレ運用は3%前後、パーソナライズで7〜10%）`
   変更後: `：2〜5%（テンプレ運用は3%前後、パーソナライズで5〜10%）`
   理由: スカウト返信率記事（送信ベース2〜5%）と不一致
2. 変更前: `スカウト返信率の業界平均は3〜8%、面談化率40〜60%`
   変更後: `スカウト返信率の目安は送信ベース2〜5%、面談化率40〜60%`
   理由: 同上（SUMMARY）
3. 変更前: `1着座1〜3万円 × 面談化率100%（着座済）× 決定率10〜20%</strong>で計算すると決定単価10〜20万円台`
   変更後: `1着座2.5万円 × 面談化率100%（着座済）× 成約率15%</strong>で計算すると決定単価16.7万円〜`
   理由: 面談単価2.5万円〜・成約率15%・決定単価16.7万円〜（正）。1万円は市場下限1.4万円をも下回る
4. 変更前: `送客サービスとの併用で決定単価10〜20万円台まで圧縮可能`
   変更後: `送客サービスとの併用で決定単価16.7万円〜まで圧縮可能`
   理由: 同上（SUMMARY）

### recruitment-shoukai-fee（6箇所）
1. 変更前: `<strong>一般職（事務・営業・販売等）</strong>：想定年収の25〜30%`
   変更後: `<strong>一般職（事務・営業・販売等）</strong>：想定年収の30〜35%が基本（契約により25%程度に下がる例もある）`
   理由: 紹介手数料率は理論年収の30〜35%
2. 変更前: `成功報酬の業界標準は想定年収の25〜35%`
   変更後: `成功報酬の業界標準は想定年収の30〜35%`
   理由: 同上（SUMMARY）
3. 変更前: `<strong>入社後1ヶ月以内離職</strong>：手数料の100%返金`
   変更後: `<strong>入社後1ヶ月以内離職</strong>：手数料の80%返金`
   理由: 返戻金の一般例は1ヶ月以内80%（手数料設計記事とも矛盾）
4. 変更前: `<strong>入社後3ヶ月以内</strong>：80〜100%返金`
   変更後: `<strong>入社後3ヶ月以内</strong>：50%返金`
   理由: 返戻金の一般例は3ヶ月以内50%
5. 変更前: `<strong>入社後6ヶ月以内</strong>：30〜50%返金`
   変更後: `<strong>入社後6ヶ月以内</strong>：20%返金（いずれも任意規定の一般例）`
   理由: 返戻金の一般例は6ヶ月以内20%
6. 変更前: `返金規定は入社後3ヶ月100%、6ヶ月50%が標準`
   変更後: `返金規定は1ヶ月以内80%・3ヶ月以内50%・6ヶ月以内20%が一般例`
   理由: 同上（SUMMARY）

### recruitment-soukyaku-comparison（3箇所）
1. 変更前: `面談着座率は事業者次第（30〜60%が現実値）`
   変更後: `面談着座率は事業者次第（20〜35%程度が現実値）`
   理由: 登録課金型リードの面談実施率は20〜35%（当社導入事例ベース）
2. 変更前: `決定単価16.7万円は理論年収比率の約12%`
   変更後: `決定単価16.7万円は紹介手数料に対して約12%`
   理由: 「理論年収比率」は誤り。手数料比の12%
3. 変更前: `送客サービスを活用する事業者数は年率30%超で増加`
   変更後: `送客サービスを活用する事業者数は急増`
   理由: 「年率30%超」に出典がない

### recruitment-specialized-vs-generalist（7箇所）
1. 変更前: `近年の新規参入は9割以上が特化型で立ち上がっており`
   変更後: `近年の新規参入は特化型が大半を占めており`
   理由: 「9割以上」は同記事内の「70〜80%」と矛盾、出典なし
2. 変更前: `厚労省の職業紹介事業報告によると、新規許可を取得する事業者の70〜80%が特化型を標榜`
   変更後: `新規許可を取得する事業者の多くが特化型を標榜しているとみられます（職業紹介事業報告に特化型／総合型の区分はなく、当社の観測ベース）`
   理由: 厚労省の職業紹介事業報告にそのような区分は存在せず、出典の誤帰属
3. 変更前: `：面談着座率60〜75%、面談〜決定率10〜20%</li>`
   変更後: `：面談〜決定率10〜15%程度（業界平均8〜12%）</li>`
   理由: 特化型の決定率20〜35%は成約率目安（10〜15%）を大きく超え出典なし
4. 変更前: `面談着座率75〜85%・決定率20〜35%と歩留まりが良い`
   変更後: `歩留まりが総合型より良い`
   理由: 同上（SUMMARY）
5. 変更前: `：CA1人あたり年間決定数10〜15件、年間売上1,500〜2,000万円`
   変更後: `：CA1人あたり月2〜6件（年24〜72件）の決定が一般的な目安（年間売上は要再計算）`
   理由: CA1人あたりの決定は月2〜6件が目安。年10〜15件（月1件前後）は過小。年間売上の記載も再計算が必要
6. 変更前: `：CA1人あたり年間決定数8〜12件、年間売上2,000〜3,500万円`
   変更後: `：単価が高い分、決定件数は総合型よりやや少なくなる傾向、年間売上2,000〜3,500万円`
   理由: 同上
7. 変更前: `：CA1人あたり年間決定数5〜8件、年間売上2,500〜4,000万円`
   変更後: `：決定件数はさらに少ないが単価が高く、年間売上2,500〜4,000万円`
   理由: 同上

### recruitment-startup-acquisition（2箇所）
1. 変更前: `面談着座1件20,000〜40,000円が相場`
   変更後: `面談着座1件14,000〜38,000円が相場（求職者送客の窓口は25,000円〜）`
   理由: 着座課金の面談単価は市場1.4〜3.8万円、当社2.5万円〜
2. 変更前: `着座単価は20,000〜40,000円が外部送客の相場感`
   変更後: `着座単価は14,000〜38,000円が外部送客の相場感`
   理由: 同上（SUMMARY）

### recruitment-valid-application-definition（3箇所）
1. 変更前: `<li>応募CPA：3,000〜8,000円</li>`
   変更後: `<li>応募CPA：8,000〜15,000円（SNS広告では3,000〜8,000円まで下がる例もある）</li>`
   理由: CPA計算記事（若手未経験 応募CPA8,000〜15,000円）と矛盾
2. 変更前: `有効応募課金は8,000〜15,000円/件、着座課金は25,000〜50,000円/件が相場`
   変更後: `有効応募課金は8,000〜15,000円/件、着座課金は14,000〜38,000円/件（求職者送客の窓口は25,000円〜）が相場`
   理由: 着座課金の面談単価は市場1.4〜3.8万円、当社2.5万円〜
3. 変更前: `有効応募課金は8,000〜15,000円、着座課金は25,000〜50,000円/件が相場`
   変更後: `有効応募課金は8,000〜15,000円、着座課金は14,000〜38,000円/件が相場`
   理由: 同上（SUMMARY）

### recruitment-wantedly-marketing（1箇所）
1. 変更前: `一般的なスカウトメール返信率は3〜8%ですが`
   変更後: `一般的なスカウトメール返信率は送信ベース2〜5%ですが`
   理由: スカウト返信率記事（2〜5%）と不一致

### seat-performance-fee（3箇所）
1. 変更前: `</strong>：1面談あたり25,000〜45,000円</li>`
   変更後: `</strong>：1面談あたり14,000〜38,000円（求職者送客の窓口は25,000円〜）</li>`
   理由: 着座課金の面談単価は市場1.4〜3.8万円、当社2.5万円〜
2. 変更前: `<strong>新卒領域</strong>：1面談あたり25,000〜50,000円`
   変更後: `<strong>新卒領域</strong>：1面談あたり25,000〜35,000円`
   理由: 送客比較記事の新卒対応サービス（2.5万円〜／3〜3.5万円）と整合
3. 変更前: `相場は1面談あたり25,000〜60,000円`
   変更後: `相場は1面談あたり1.4〜3.8万円（第二新卒・新卒領域）`
   理由: 同上（SUMMARY）

### shinsotsu-pool-formation（1箇所）
1. 変更前: `面談実施までの単価は30,000〜80,000円が相場`
   変更後: `面談実施までの単価は25,000〜80,000円と幅がある（着座課金型送客では25,000円〜）`
   理由: 新卒の面談単価は当社2.5万円〜。下限が矛盾


## 3. 修正不要の記事

以下 81 記事は、当社の正および他記事と矛盾する数値クレームは検出されなかった（出典のない「相場」値を含む記事はあるが、1-5／1-11／1-14 の任意注記の対象にとどまる）。

- inexperienced-talent-acquisition
- recruitment-acquisition-services
- recruitment-ad-creative
- recruitment-ad-policy-compliance
- recruitment-affiliate-marketing
- recruitment-agriculture-acquisition
- recruitment-aichi-acquisition
- recruitment-alumni-recruitment
- recruitment-antisocial-check
- recruitment-ats-comparison
- recruitment-backoffice-acquisition
- recruitment-bilingual-acquisition
- recruitment-candidate-db-reactivation
- recruitment-candidate-ltv
- recruitment-candidate-nps
- recruitment-career-diagnosis-content
- recruitment-chatbot-lead-generation
- recruitment-construction-acquisition
- recruitment-consulting-acquisition
- recruitment-content-marketing
- recruitment-conversion-tracking
- recruitment-cookie-regulation
- recruitment-cpa-rising
- recruitment-cs-acquisition
- recruitment-direct-recruiting-comparison
- recruitment-disability-employment-acquisition
- recruitment-employment-security-act
- recruitment-engineer-acquisition
- recruitment-female-acquisition
- recruitment-form-optimization
- recruitment-freelance-agent-acquisition
- recruitment-fukuoka-acquisition
- recruitment-google-analytics-4-setup
- recruitment-google-for-jobs
- recruitment-hotel-tourism-acquisition
- recruitment-housing-allowance-appeal
- recruitment-indeed-acquisition
- recruitment-influencer-marketing
- recruitment-inside-sales-acquisition
- recruitment-instagram-marketing
- recruitment-international-acquisition
- recruitment-jma-acquisition
- recruitment-job-description-writing
- recruitment-job-search-engine-comparison
- recruitment-licensing — 許可要件・費用・期間・有効期間すべて正と一致
- recruitment-linkedin-marketing
- recruitment-listing-ads
- recruitment-logistics-acquisition
- recruitment-lp-ab-testing
- recruitment-lp-cvr-optimization
- recruitment-marketing-automation
- recruitment-meta-ads
- recruitment-mid-career-trends-2026
- recruitment-offline-event-acquisition
- recruitment-osaka-acquisition
- recruitment-personal-information-protection
- recruitment-pmax-google-ads
- recruitment-professional-license-acquisition
- recruitment-real-estate-acquisition
- recruitment-reference-check
- recruitment-referral-acquisition
- recruitment-retail-apparel-acquisition
- recruitment-retargeting-ads
- recruitment-review-management
- recruitment-roas-improvement
- recruitment-saas-sales-acquisition
- recruitment-senior-acquisition
- recruitment-sge-aio-seo
- recruitment-side-job-agent
- recruitment-sms-marketing
- recruitment-sns-marketing — 数値クレーム抽出なし（「SNSを挙げる比率は80%以上」のみ出典なし・任意注記）
- recruitment-success-story-content
- recruitment-talent-pool
- recruitment-tiktok-marketing
- recruitment-uta-acquisition
- recruitment-webinar-acquisition
- recruitment-working-mom-acquisition
- recruitment-x-twitter-marketing
- recruitment-youtube-marketing
- second-shinsotsu-acquisition
- shinsotsu-recruitment-trends