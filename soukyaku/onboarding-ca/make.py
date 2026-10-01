#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CA向け初回オンボーディング資料（中途／新卒）を組み立てる。

  python3 make.py           # deck-chuto.html と deck-shinsotsu.html を書き出す
  ./build.sh deck-chuto.html chuto.pdf

hado-deck-template/template.html の <style> をそのまま取り込むので、
デザインシステム（3色・カード1種・共通骨格）は自動的に揃う。
本文の編集は生成後の deck-*.html を直接いじってよい（このスクリプトは初回組版用）。
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.abspath(os.path.join(ROOT, "..", "..", "hado-deck-template", "template.html"))

EXTRA_CSS = """
  /* --- CA向けオンボ資料の追加パーツ --- */
  .ag-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
  .ag-row { display: grid; grid-template-columns: 62px 1fr 92px; align-items: center; gap: 18px;
            background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 11px 20px; }
  .ag-row .n { font-size: 13px; font-weight: 800; color: #fff; background: var(--blue);
               border-radius: 6px; padding: 4px 0; text-align: center; letter-spacing: 1px; }
  .ag-row .ttl { font-size: 17px; font-weight: 700; color: var(--navy); }
  .ag-row .ttl small { display: block; font-size: 12.5px; font-weight: 500; color: var(--gray); margin-top: 3px; }
  .ag-row .tm { font-size: 14px; font-weight: 700; color: var(--gray); text-align: right; }
  .ag-row.acc .n { background: var(--accent); }

  .okng { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 20px; align-items: start; }
  .okng .col { padding: 20px 24px; display: flex; flex-direction: column; }
  .okng h3 { font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .okng h3 .b { font-size: 11px; font-weight: 800; color: #fff; border-radius: 5px; padding: 3px 9px; letter-spacing: 1px; }
  .okng .ok .b { background: var(--green); } .okng .ng .b { background: var(--gray); }
  .okng ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }
  .okng li { font-size: 13.5px; color: var(--ink); line-height: 1.6; padding-left: 17px; position: relative; }
  .okng li::before { position: absolute; left: 0; top: 0; font-weight: 900; font-size: 13px; }
  .okng .ok li::before { content: "○"; color: var(--green); }
  .okng .ng li::before { content: "×"; color: var(--gray); }
  .okng li b { color: var(--navy); }

  .tbl { width: 100%; border-collapse: collapse; font-size: 14px; background: #fff; }
  .tbl th { font-size: 11.5px; letter-spacing: 1.5px; color: var(--gray); font-weight: 700;
            text-align: left; padding: 10px 14px; border-bottom: 2px solid var(--line); }
  .tbl td { padding: 12px 14px; border-bottom: 1px solid var(--line); color: var(--ink); line-height: 1.6; }
  .tbl td.k { font-weight: 800; color: var(--navy); white-space: nowrap; }
  .tbl td b { color: var(--navy); }
  .tbl tr:last-child td { border-bottom: 0; }
  .tblwrap { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; margin-top: 18px; }

  .warn { background: #FFF4F2; border: 1px solid #F6CFC8; border-left: 4px solid var(--red);
          border-radius: 0 12px 12px 0; padding: 16px 20px; }
  .warn .t { font-size: 12px; font-weight: 800; color: var(--red); letter-spacing: 1.5px; margin-bottom: 6px; }
  .warn p { font-size: 14.5px; color: var(--ink); line-height: 1.7; }
  .warn p b { color: var(--red); }

  .stepbox { display: flex; gap: 12px; margin-top: 18px; }
  .stepbox .sb { flex: 1; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; position: relative; }
  .stepbox .sb .n { font-size: 11px; font-weight: 800; color: var(--blue); letter-spacing: 1.5px; margin-bottom: 7px; }
  .stepbox .sb h4 { font-size: 15.5px; color: var(--navy); line-height: 1.45; margin-bottom: 6px; }
  .stepbox .sb p { font-size: 12.5px; color: var(--gray); line-height: 1.65; }
  .stepbox .sb.acc { border-color: #FFD2BC; background: #FFF7F2; }
  .stepbox .sb.acc .n { color: var(--accent); }

  .three { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px; align-items: stretch; }
  .three .c { padding: 20px 22px; display: flex; flex-direction: column; }
  .three .c .lb { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: var(--blue); margin-bottom: 8px; }
  .three .c h4 { font-size: 17px; color: var(--navy); line-height: 1.4; margin-bottom: 10px; }
  .three .c p { font-size: 13px; color: var(--gray); line-height: 1.7; }
  .three .c .say { margin-top: 14px; padding-top: 12px; font-size: 12.5px; color: var(--ink);
                   line-height: 1.7; border-top: 1px dashed var(--line); }
  .three .c .say b { color: var(--accent); }

  .keybox { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
  .keybox .k { padding: 20px 24px; }
  .keybox .k .lb { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: var(--accent); margin-bottom: 8px; }
  .keybox .k h4 { font-size: 17.5px; color: var(--navy); line-height: 1.45; margin-bottom: 8px; }
  .keybox .k p { font-size: 13.5px; color: var(--gray); line-height: 1.7; }

  .final { display: grid; grid-template-columns: 1fr 440px; gap: 24px; margin-top: 22px; flex: 1; }
  .urlcard { background: var(--navy); border-radius: 16px; padding: 26px 28px; color: #fff; display: flex; flex-direction: column; justify-content: center; }
  .urlcard .lb { font-size: 11px; letter-spacing: 2px; color: #9DB4FF; font-weight: 700; margin-bottom: 10px; }
  .urlcard h4 { font-size: 22px; margin-bottom: 14px; line-height: 1.4; }
  .urlcard .u { font-family: "SF Mono", Menlo, monospace; font-size: 13.5px; color: #C7D2EA;
                background: rgba(255,255,255,.07); border-radius: 8px; padding: 10px 12px; word-break: break-all; }
  .urlcard .pw { margin-top: 10px; font-size: 13.5px; color: #fff; }
  .urlcard .pw b { color: #FFB38A; font-family: "SF Mono", Menlo, monospace; }
  .contact { position: absolute; left: 80px; bottom: 90px; color: #C7D2EA; font-size: 17px; line-height: 1.9; }
  .contact img { height: 26px; display: block; margin-bottom: 18px; }
  .contact b { color: #fff; }
  .closer { margin-top: auto; background: var(--navy); border-radius: 14px; padding: 18px 26px;
            color: #fff; font-size: 16px; line-height: 1.75; }
  .closer b { color: #FFB38A; }
  .closer .t { font-size: 11px; letter-spacing: 2px; color: #9DB4FF; font-weight: 800; margin-bottom: 6px; }
  /* 表紙のコピーは1行に収める（96pxだと12文字で折り返して重なる） */
  .cover h1 { font-size: 84px; top: 196px; }
"""


def head():
    with open(TEMPLATE, encoding="utf-8") as f:
        s = f.read()
    css = s[s.index("<style>"):s.index("</style>") + len("</style>")]
    return css.replace("</style>", EXTRA_CSS + "</style>")


def slide(body, kicker=None, title=None, page=None, cls=""):
    """通常スライド1枚。"""
    k = '<div class="kicker">%s</div>' % kicker if kicker else ""
    h = "<h2>%s</h2>" % title if title else ""
    return """<section class="slide %s">
  <div class="topbar"></div><img class="logo" src="assets/logo_black.png" alt="HADO">
  <div class="content">
    %s%s
%s
  </div>
  <div class="footer"><span>© 2026 HADO, Inc.</span><span class="pageno">%s</span></div>
</section>""" % (cls, k, h, body, page)


def kick(num, name):
    return '<span class="ag">%s</span>%s' % (num, name)


# ---------------------------------------------------------------- 共通パーツ

def s_agenda(rows, lead):
    body = '<p style="font-size:15px;color:var(--gray);line-height:1.7;margin-top:8px">%s</p>' % lead
    body += '<div class="ag-list">'
    for i, (n, t, sub, tm, acc) in enumerate(rows):
        body += ('<div class="ag-row%s"><div class="n">%s</div>'
                 '<div class="ttl">%s<small>%s</small></div><div class="tm">%s</div></div>'
                 % (" acc" if acc else "", n, t, sub, tm))
    body += "</div>"
    return body


def s_chakuza(who, ok, ng):
    body = ('<div class="quote" style="margin-top:16px"><b>定義</b>　%sが初回面談に出席したこと。'
            '<b>面談ツールへの入室・応答をもって成立</b>します（電話面談は架電への応答時点）。</div>' % who)
    body += '<div class="okng">'
    body += '<div class="card col ok"><h3><span class="b">請求対象</span>着座になる</h3><ul>'
    for x in ok:
        body += "<li>%s</li>" % x
    body += '</ul></div>'
    body += '<div class="card col ng"><h3><span class="b">対象外</span>着座にならない</h3><ul>'
    for x in ng:
        body += "<li>%s</li>" % x
    body += '</ul></div></div>'
    body += ('<div class="closer"><div class="t">判断に迷ったら</div>'
             '自己判断で「対象外」と入力せず、<b>先に窓口担当へご相談ください</b>。'
             '対象外の申請には事前連絡とエビデンスが必要です。</div>')
    return body


def s_houkoku(who):
    body = ('<p style="font-size:15.5px;color:var(--gray);line-height:1.8;margin-top:10px">'
            '面談実施後、「結果」列に次の4つのいずれかを<b style="color:var(--navy)">2営業日以内</b>にご入力ください。</p>')
    body += '<div class="tblwrap"><table class="tbl"><tr><th style="width:150px">入力値</th><th>意味</th></tr>'
    for k, v in [("着座", "予定どおり面談を実施した"),
                 ("事前キャンセル", "面談前に%sから辞退の連絡があった" % who),
                 ("当日未入室", "ノーショー（連絡なし不参加）"),
                 ("請求対象外", "対象外条件に該当。<b>要事前連絡</b>")]:
        body += '<tr><td class="k">%s</td><td>%s</td></tr>' % (k, v)
    body += "</table></div>"
    body += ('<div class="warn" style="margin-top:18px"><div class="t">ここだけは外さない</div>'
             '<p>入力がないまま<b>5営業日が経過すると「みなし承認」として自動的に着座扱い</b>になります。'
             '請求対象外として申請する場合は、<b>必ず担当者へ事前連絡＋エビデンスのご提出</b>をお願いします。</p></div>')
    return body


def s_kinshi(who):
    body = ('<div class="warn" style="margin-top:16px"><div class="t">禁止事項</div>'
            '<p>面談が成立する前に、%sへ<b>辞退を誘発する連絡・「紹介が難しい」旨の連絡</b>をすることは'
            'ご契約で禁止されています（日程調整などの事務連絡は除きます）。</p></div>' % who)
    body += '<div class="stepbox">'
    body += ('<div class="sb"><div class="n">CASE 1</div><h4>日程のリマインド</h4>'
             '<p>当社が実施します。貴社からのリマインド連絡は不要です。</p></div>')
    body += ('<div class="sb"><div class="n">CASE 2</div><h4>紹介が難しいと感じた</h4>'
             '<p>ご本人には伝えず、<b>まず当社へご共有ください</b>。そのうえで対応を協議します。</p></div>')
    body += ('<div class="sb acc"><div class="n">違反した場合</div><h4>違約金が発生します</h4>'
             '<p>事前接触が原因で面談が実施されなかった場合、利用料金の10倍または30万円の'
             'いずれか高い額（税別）。</p></div>')
    body += "</div>"
    body += ('<div class="quote" style="margin-top:18px"><b>Point</b>　'
             '良かれと思った一本の連絡が辞退につながった事例があり、条項として明文化されています。'
             '判断に迷ったら、ご本人ではなく窓口担当へ。</div>')
    return body


def s_noshow(who):
    body = '<div class="stepbox" style="margin-top:20px">'
    body += ('<div class="sb"><div class="n">STEP 1</div><h4>予定時刻から10分待機</h4>'
             '<p>入室がなくても、まず10分お待ちください。</p></div>')
    body += ('<div class="sb"><div class="n">STEP 2</div><h4>電話等で連絡を試みる</h4>'
             '<p>お電話などでの連絡試行までをお願いします。</p></div>')
    body += ('<div class="sb acc"><div class="n">STEP 3</div><h4>「当日未入室」で報告</h4>'
             '<p>この手順を経た場合のみ、当日未入室として報告できます。</p></div>')
    body += "</div>"
    body += '<div class="keybox">'
    body += ('<div class="card k"><div class="lb">遅刻</div><h4>予定時刻から30分以内の入室なら着座</h4>'
             '<p>%sの遅刻は、30分以内に入室・応答があれば着座として成立します。</p></div>' % who)
    body += ('<div class="card k"><div class="lb">貴社都合</div><h4>日程変更・10分超の遅刻は「みなし着座」</h4>'
             '<p>貴社都合の日程変更・キャンセル・不参加・10分を超える遅刻は、結果にかかわらず着座扱いです。'
             '日程変更は原則お受けできません。</p></div>')
    body += "</div>"
    return body


def s_memo(items, note):
    body = ('<p style="font-size:15.5px;color:var(--gray);line-height:1.8;margin-top:10px">'
            '当社カウンセラーがヒアリングした内容を<b style="color:var(--navy)">AI議事録</b>として、'
            'シートとあわせてお渡ししています。全部は読まなくて構いません。この3つだけ見てください。</p>')
    body += '<div class="three">'
    for lb, h4, p in items:
        body += ('<div class="card c"><div class="lb">%s</div><h4>%s</h4><p>%s</p></div>' % (lb, h4, p))
    body += "</div>"
    body += '<div class="quote" style="margin-top:18px"><b>Point</b>　%s</div>' % note
    return body


def s_madoguchi():
    body = '<div class="tblwrap"><table class="tbl"><tr><th style="width:230px">内容</th><th>連絡先</th></tr>'
    body += ('<tr><td class="k">通常のお問い合わせ</td>'
             '<td>窓口担当（<b>佐伯・松本</b>）　Slack（推奨）または Chatwork</td></tr>')
    body += ('<tr><td class="k">求職者に関するご相談</td>'
             '<td>同上。紹介が難しいと感じた場合も、ご本人ではなく<b>まずこちらへ</b></td></tr>')
    body += ('<tr><td class="k">緊急トラブル・クレーム</td>'
             '<td>代表 田中　※緊急時のみ</td></tr>')
    body += ('<tr><td class="k">情報漏洩・不正利用の疑い</td>'
             '<td>即時に代表 田中まで</td></tr>')
    body += "</table></div>"
    body += '<div class="keybox">'
    body += ('<div class="card k"><div class="lb">アクセス権限</div><h4>退職者が出たら権限解除のご連絡を</h4>'
             '<p>スプレッドシートはご共有いただいた担当者アカウントのみアクセスできます。'
             '担当者の入れ替わりがあれば速やかにお知らせください。</p></div>')
    body += ('<div class="card k"><div class="lb">送客ペース・条件の変更</div><h4>効力発生日の5営業日前までに</h4>'
             '<p>増減・一時停止は、効力発生日の5営業日前までに窓口へ（規約第6条）。やむを得ない事情のときは、'
             'お早めにご連絡いただければ対応します。月間のご請求額は、申込書の月間予算が上限です。'
             '担当者の追加は最短翌営業日から反映できます。</p></div>')
    body += "</div>"
    return body


def s_final(title, url, pw, points):
    body = '<div class="final">'
    body += '<div class="card" style="padding:26px 30px;display:flex;flex-direction:column"><ul class="pts">'
    for p in points:
        body += "<li>%s</li>" % p
    body += "</ul></div>"
    body += ('<div class="urlcard"><div class="lb">FULL MANUAL</div><h4>%s</h4>'
             '<div class="u">%s</div><div class="pw">パスワード：<b>%s</b></div>'
             '<p style="font-size:12.5px;color:#9DB4FF;line-height:1.7;margin-top:14px">'
             '本日お話しした内容はすべてここに載っています。面談前にスマートフォンからも開けます。</p></div>'
             % (title, url, pw))
    body += "</div>"
    return body


def cover(tag, h1, sub, who):
    return """<section class="slide cover">
  <div class="glow"></div><div class="glow2"></div>
  <div class="tag">%s</div>
  <h1>%s</h1>
  <div class="line"></div>
  <div class="sub">%s</div>
  <div class="who">%s</div>
  <img class="logo-big" src="assets/logo_white.png" alt="HADO">
</section>""" % (tag, h1, sub, who)


def closing(lines):
    return """<section class="slide divider">
  <h1 style="position:absolute;left:80px;top:170px;color:#fff;font-size:72px;font-weight:900;line-height:1.3">
    本日は<span style="color:#FFB38A">ありがとうございました。</span></h1>
  <div class="contact"><img src="assets/logo_white.png" alt="HADO">%s</div>
</section>""" % lines


def write(path, title, slides):
    html = ('<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>%s</title>\n%s\n</head>\n<body>\n%s\n</body>\n</html>\n'
            % (title, head(), "\n\n".join(slides)))
    with open(os.path.join(ROOT, path), "w", encoding="utf-8") as f:
        f.write(html)
    print("%s  (%d slides, %d bytes)" % (path, len(slides), len(html)))


# ================================================================ 中途（第二新卒）

def build_chuto():
    S = []
    S.append(cover(
        "求職者送客の窓口　第二新卒・未経験層",
        '読んでから、<span>会う。</span>',
        "キャリアアドバイザー様向け　初回オンボーディング<br>ご契約ありがとうございます。運用開始前に30〜45分だけお時間をください。",
        "株式会社HADO<br><b>求職者送客の窓口　窓口担当</b>"))

    S.append(slide(s_agenda([
        ("01", "この面談に来るのは、どういう方か", "他の流入経路との決定的な違い", "5分", False),
        ("02", "面談前の5分で読むもの", "カウンセリングメモの使いどころ", "8分", False),
        ("03", "やってはいけないこと", "本サービス固有のルール。ここだけは外さない", "5分", True),
        ("04", "着座の定義と結果報告", "請求に直結します", "12分", True),
        ("05", "初回面談の設計", "成果を出されている各社のやり方", "10分", False),
        ("--", "ご質問", "運用の細かい点はこの場で解消してください", "5分", False),
    ], "本日は「他社サービスと同じだと思って運用すると事故る点」に絞ってお話しします。"),
        kicker="AGENDA", title="本日の30〜45分", page="01"))

    body = ('<div class="flow-h" style="margin-top:22px">'
            '<div class="st">SNSで認知<small>TikTok / Instagram / YouTube / X</small></div><div class="arrow">→</div>'
            '<div class="st">ハックツ就職に登録<small>当社の求職者集客サービス</small></div><div class="arrow">→</div>'
            '<div class="st hot">当社CAがカウンセリング<small>転職理由・希望条件を整理</small></div><div class="arrow">→</div>'
            '<div class="st">日程確定・情報共有<small>リマインドも当社</small></div><div class="arrow">→</div>'
            '<div class="st acc">貴社の初回面談<small>ここから</small></div></div>'
            '<ul class="pts" style="margin-top:8px">'
            '<li><b>求人サイトからの応募者ではありません。</b>SNS経由で当社サービスに登録し、当社のカウンセリングを受けた方だけをお繋ぎしています。</li>'
            '<li><b>すでに一度、転職理由と希望条件を話し終えています。</b>「はじめまして、まずご経歴から」で入ると、同じ話を2回させることになります。</li>'
            '<li><b>比較検討が前提です。</b>他社と会っている前提で、初回から差を作りにいく必要があります。</li>'
            '</ul>'
            '<div class="quote" style="margin-top:20px"><b>Point</b>　'
            '冒頭で<b>ご本人がカウンセリングで話した言葉をそのまま引用する</b>だけで、温度がまったく変わります。'
            'それができるように、次のページの情報をお渡ししています。</div>'
            '<div class="closer"><div class="t">つまり</div>'
            '目の前の方は、<b>すでに一度、転職の話をし終えた状態</b>で座っています。'
            'そこから始められるかどうかで、初回の質が変わります。</div>')
    S.append(slide(body, kicker=kick("01", "この面談に来るのは、どういう方か"),
                   title="応募者ではなく、<em>一度話し終えた方</em>が来ます", page="02"))

    body = ('<p style="font-size:15.5px;color:var(--gray);line-height:1.8;margin-top:10px">'
            'ご本人にご記入・お話しいただいた内容は、<b style="color:var(--navy)">すべてそのままお渡しします</b>。'
            '当社側で要約して削ることはしていません。</p>'
            '<div class="tblwrap"><table class="tbl">'
            '<tr><th style="width:170px">カウンセリングメモ</th><th>載っている内容</th></tr>'
            '<tr><td class="k">1　基本情報</td><td>氏名・年齢・学歴・卒業年月</td></tr>'
            '<tr><td class="k">2　職歴</td><td>各社の在籍期間・業務内容・<b>退職理由</b></td></tr>'
            '<tr><td class="k">3　現状の課題</td><td>転職を考えている背景・職場での不満</td></tr>'
            '<tr><td class="k">4　転職希望詳細</td><td>希望職種・<b>NG職種</b>・希望条件</td></tr>'
            '<tr><td class="k">5　希望条件</td><td>エリア・入社希望時期・<b>希望年収</b></td></tr>'
            '</table></div>'
            '<div class="quote" style="margin-top:18px"><b>Point</b>　'
            'スプレッドシートは<b>求職者情報と結果報告が1シートで完結</b>する設計です。シートの切り替えは不要です。</div>')
    S.append(slide(body, kicker=kick("02", "面談前の5分で読むもの"),
                   title="記入いただいた内容は、<em>全項目そのまま</em>お渡しします", page="03"))

    S.append(slide(s_memo([
        ("CHECK 1", "退職理由", "現職・前職の退職理由を把握しておくと、地雷ワードを避けたヒアリングができます。"),
        ("CHECK 2", "NG条件", "飛び込み営業・土日勤務など、ご本人が避けたい条件を事前に確認します。"),
        ("CHECK 3", "希望年収・入社時期", "求人提案のミスマッチを、提案する前に防げます。"),
    ], "この3つを読んでから入るだけで、初回の精度が変わります。所要5分です。"),
        kicker=kick("02", "面談前の5分で読むもの"), title="全部は読まなくていい。<em>この3つ</em>だけ", page="04"))

    S.append(slide(s_kinshi("求職者"),
                   kicker=kick("03", "やってはいけないこと"),
                   title="面談の前に、<em>求職者へ直接ご連絡しない</em>でください", page="05"))

    S.append(slide(s_chakuza("求職者", [
        "面談ツール（Web会議・通話アプリ等）への<b>入室・応答</b>で成立",
        "<b>所要時間・完遂の有無・転職意欲は問いません</b>（着座後の中断・退席・通信障害でも有効）",
        "求職者の遅刻も、<b>予定時刻から30分以内</b>の入室・応答で成立",
        "貴社都合の日程変更・キャンセル・不参加・10分超の遅刻は「<b>みなし着座</b>」",
    ], [
        "求職者都合の事前キャンセル・当日未入室（<b>10分待機＋連絡試行</b>が条件）",
        "障害者手帳を所持していることが判明した場合（無効成果）",
        "外国籍であることが判明した場合（無効成果）",
        "在学中で、卒業・中退予定日が面談予定日から3ヶ月以上先の場合（無効成果）",
        "重複＝過去1ヶ月以内に貴社へ登録済み（原則、面談開始前までのご通知が必要）",
    ]), kicker=kick("04", "着座の定義と結果報告"), title="「着座」は<em>入室・応答</em>で成立します", page="06"))

    S.append(slide(s_noshow("求職者"),
                   kicker=kick("04", "着座の定義と結果報告"),
                   title="現れないときは、<em>10分待って、連絡を試みる</em>", page="07"))

    S.append(slide(s_houkoku("求職者"),
                   kicker=kick("04", "着座の定義と結果報告"),
                   title="結果は<em>2営業日以内</em>に、4つのどれかで", page="08"))

    body = ('<p style="font-size:15.5px;color:var(--gray);line-height:1.8;margin-top:10px">'
            'お繋ぎするのは<b style="color:var(--navy)">ジュニア層</b>が中心です。'
            '20代で社会人経験が浅く（目安3年以内）、専門スキルやキャリアの軸がまだ固まっていない方です。</p>'
            '<div class="card" style="margin-top:20px;padding:24px 28px">'
            '<div style="font-size:11px;font-weight:800;letter-spacing:1.5px;color:var(--blue);margin-bottom:12px">'
            '決定の中心となる4職種</div>'
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">'
            + "".join('<div style="background:var(--blue-soft);border-radius:10px;padding:16px 14px;'
                      'font-size:15.5px;font-weight:700;color:var(--navy);line-height:1.5;text-align:center">%s</div>' % x
                      for x in ["個人営業", "販売接客", "事務", "施工管理"])
            + '<div style="grid-column:1/-1;font-size:12.5px;color:var(--gray);line-height:1.7;margin-top:4px">'
              '雇用形態では<b style="color:var(--navy)">無期雇用派遣系</b>（IT・施工管理・事務・販売）の比率が高くなります。'
              '飲食・製造・建設も未経験の受け入れはありますが、決定数ではこの4職種に及びません。</div>'
            + '</div></div>'
            '<div class="quote" style="margin-top:18px"><b>Point</b>　'
            '未経験で入社できる企業はある程度限られます。<b>面談の前に、この4職種の求人を手元に用意しておく</b>と提案が止まりません。</div>')
    S.append(slide(body, kicker=kick("05", "初回面談の設計"),
                   title="会うのは<em>ジュニア層</em>です", page="09"))

    body = ('<div class="stepbox" style="margin-top:22px">'
            '<div class="sb"><div class="n">RULE 1</div><h4>初回のゴールは<br>「2回目の約束」</h4>'
            '<p>情報を聞き切ることではありません。初回30〜40分で信頼を作り、求人提案は2回目に置く設計が最も安定します。</p></div>'
            '<div class="sb"><div class="n">RULE 2</div><h4>提案は、本人が<br>初回で言った言葉に絡める</h4>'
            '<p>かすっているだけで構いません。「ご自身がおっしゃっていた◯◯に近いのは」と接続するだけで通り方が変わります。</p></div>'
            '<div class="sb acc"><div class="n">RULE 3</div><h4>持ち帰らせない</h4>'
            '<p>この層にとって「検討します」は、ほぼ拒絶です。その場で次のアクションと日程まで決めてください。</p></div>'
            '</div>'
            '<div class="quote" style="margin-top:20px"><b>Point</b>　'
            '全部を覚える必要はありません。<b>この3つを外さなければ、大きくは外しません。</b>'
            '各ステップの具体的な聞き方・言い回しは、後述の完全マニュアルにフルスクリプトで載せています。</div>')
    S.append(slide(body, kicker=kick("05", "初回面談の設計"),
                   title="まず、<em>この3つ</em>だけ", page="10"))

    body = ('<p style="font-size:15.5px;color:var(--gray);line-height:1.8;margin-top:10px">'
            '初回面談で<b style="color:var(--navy)">「自分は大事に扱われている」という確信</b>を作れるかが推薦率を左右します。'
            '最短ルートが、通常との差分を言葉にして宣言することです。</p>'
            '<div class="three">'
            '<div class="card c"><div class="lb">型 A　担当者レベル</div><h4>誰が担当するかを<br>特別化する</h4>'
            '<p>「普段は◯◯／あなたは△△」の対比構造を必ず入れます。</p>'
            '<div class="say">「普段は若手のコンサルタントが担当ですが、<b>ハックツさん経由の方は私（マネージャー）が直接見ています</b>」</div></div>'
            '<div class="card c"><div class="lb">型 B　サポート量</div><h4>数字で差を<br>可視化する</h4>'
            '<p>「無制限」「何度でも」など定量で差を示すと説得力が増します。</p>'
            '<div class="say">「通常は面接対策1〜2回ですが、<b>ハックツさん経由の方は回数無制限</b>。多い方だと10回以上練習しました」</div></div>'
            '<div class="card c"><div class="lb">型 C　スピード・応対</div><h4>即応性で<br>差別化する</h4>'
            '<p>返信スピード・対応時間帯を「ルール」として宣言します。</p>'
            '<div class="say">「普段はお返事が翌営業日ですが、<b>ハックツさん経由の方は当日中に必ず返すルール</b>にしています」</div></div>'
            '</div>'
            '<div class="closer"><div class="t">共通するコツ</div>'
            '<b>「普段は◯◯、あなたは△△」</b>という対比の形にすること。差を数字で言えるとさらに効きます。</div>')
    S.append(slide(body, kicker=kick("05", "初回面談の設計"),
                   title="推薦率を上げる<em>「特別扱いの宣言」</em>", page="11"))

    S.append(slide(s_madoguchi(), kicker=kick("06", "困ったときは"),
                   title="迷ったら、<em>ご本人ではなく窓口へ</em>", page="12"))

    S.append(slide(s_final("面談の設計図　第二新卒",
                           "kyusyokusyasokyaku-no-madoguchi.com/guide/daini-shinsotsu",
                           "hado-madoguchi", [
        "<b>面談前に、カウンセリングメモの3項目を読む</b>（退職理由・NG条件・希望年収と時期）",
        "<b>面談前に、ご本人へ直接連絡しない</b>。紹介が難しいと感じたら、まず窓口へ",
        "<b>面談後2営業日以内に、結果を4つのどれかで入力する</b>",
        "<b>現れないときは10分待機＋連絡試行</b>。この手順を経た場合のみ当日未入室",
        "<b>初回のゴールは「2回目の約束」</b>。持ち帰らせない",
    ]), kicker="TAKEAWAY", title="今日から、この5つだけ", page="13"))

    S.append(closing('株式会社HADO　求職者送客の窓口<br>'
                     '<b>窓口担当　佐伯・松本</b>　Slack（推奨）／ Chatwork<br>'
                     '<span style="font-size:14px">※緊急のトラブル・情報事故のみ　代表 田中</span>'))
    write("deck-chuto.html", "求職者送客の窓口 第二新卒｜CA向けオンボーディング", S)


# ================================================================ 新卒


def build_shinsotsu():
    S = []
    S.append(cover(
        "求職者送客の窓口　新卒（27卒〜28卒）",
        'はじめまして、<span>じゃない。</span>',
        "キャリアアドバイザー様向け　初回オンボーディング<br>ご契約ありがとうございます。運用開始前に30〜45分だけお時間をください。",
        "株式会社HADO<br><b>求職者送客の窓口　窓口担当</b>"))

    S.append(slide(s_agenda([
        ("01", "この面談に来るのは、どういう就活生か", "ナビ媒体・スカウトとの決定的な違い", "5分", False),
        ("02", "面談前の5分で読むもの", "カウンセリングメモの使いどころ", "8分", False),
        ("03", "やってはいけないこと", "本サービス固有のルール。ここだけは外さない", "5分", True),
        ("04", "着座の定義と結果報告", "請求に直結します", "12分", True),
        ("05", "初回面談の設計", "成果を出されている各社のやり方", "10分", False),
        ("--", "ご質問", "運用の細かい点はこの場で解消してください", "5分", False),
    ], "本日は「他社サービスと同じだと思って運用すると事故る点」に絞ってお話しします。"),
        kicker="AGENDA", title="本日の30〜45分", page="01"))

    body = ('<div class="flow-h" style="margin-top:22px">'
            '<div class="st">SNSで認知<small>TikTok / Instagram / YouTube / X</small></div><div class="arrow">→</div>'
            '<div class="st">ハックツ新卒に登録<small>当社の就活生集客サービス</small></div><div class="arrow">→</div>'
            '<div class="st hot">当社CAがカウンセリング<small>就活の軸・希望条件を整理</small></div><div class="arrow">→</div>'
            '<div class="st">日程確定・情報共有<small>リマインドも当社</small></div><div class="arrow">→</div>'
            '<div class="st acc">貴社の初回面談<small>ここから</small></div></div>'
            '<ul class="pts" style="margin-top:8px">'
            '<li><b>就活サイトからの応募者ではありません。</b>SNS経由で当社サービスに登録し、当社のカウンセリングを受けた方だけをお繋ぎしています。</li>'
            '<li><b>対象は27卒〜28卒です。</b>学校種別・希望職種は、ご契約時にすり合わせた受入条件に沿って送客します。</li>'
            '<li><b>希望職種が「相談したい」で届く方も一定数います。</b>軸が固まりきっていない段階なので、'
            '面談で一緒に言語化する前提でご対応ください。</li>'
            '</ul>'
            '<div class="closer"><div class="t">つまり</div>'
            '目の前の就活生は、<b>すでに一度、就活の話をし終えた状態</b>で座っています。'
            '自己紹介からやり直すと、同じ話を2回させることになります。</div>')
    S.append(slide(body, kicker=kick("01", "この面談に来るのは、どういう就活生か"),
                   title="応募者ではなく、<em>一度話し終えた就活生</em>が来ます", page="02"))

    body = ('<p style="font-size:15.5px;color:var(--gray);line-height:1.8;margin-top:10px">'
            'ご本人にご記入・お話しいただいた内容は、<b style="color:var(--navy)">すべてそのままお渡しします</b>。'
            '当社側で要約して削ることはしていません。</p>'
            '<div class="tblwrap"><table class="tbl">'
            '<tr><th style="width:200px">カウンセリングメモ</th><th>載っている内容</th></tr>'
            '<tr><td class="k">1　基本プロフィール</td><td>氏名・学校種別・卒業年度・健康状態</td></tr>'
            '<tr><td class="k">2　現在の活動状況</td><td><b>選考フェーズ</b>・内定状況・利用チャネル</td></tr>'
            '<tr><td class="k">3　就活の軸・希望条件</td><td><b>Must / Want / No 条件</b></td></tr>'
            '<tr><td class="k">4　自己分析・キャリア観</td><td>性格傾向・キャリア形成の方向性</td></tr>'
            '<tr><td class="k">5　担当者へのアドバイス</td><td><b>心理的障壁</b>・リスク管理ポイント</td></tr>'
            '</table></div>'
            '<div class="quote" style="margin-top:18px"><b>Point</b>　'
            'スプレッドシートは<b>就活生情報と結果報告が1シートで完結</b>する設計です。シートの切り替えは不要です。</div>')
    S.append(slide(body, kicker=kick("02", "面談前の5分で読むもの"),
                   title="記入いただいた内容は、<em>全項目そのまま</em>お渡しします", page="03"))

    S.append(slide(s_memo([
        ("CHECK 1", "就活の軸・志望背景", "Must / Want を頭に入れておくと、初回で「軸が明確になった」という実感を作れます。"),
        ("CHECK 2", "心理的障壁・性格傾向", "条件面を自分から言い出せないタイプかどうかで、聞き方を変えます。"),
        ("CHECK 3", "選考フェーズ・併願状況", "内定が出ている相手なら提案ペースを上げ、出ていないなら軸づくりから入ります。"),
    ], "冒頭で<b>ご本人が書いた言葉をそのまま引用する</b>だけで、「ちゃんと見てくれている」と伝わります。"),
        kicker=kick("02", "面談前の5分で読むもの"), title="全部は読まなくていい。<em>この3つ</em>だけ", page="04"))

    S.append(slide(s_kinshi("就活生"),
                   kicker=kick("03", "やってはいけないこと"),
                   title="面談の前に、<em>就活生へ直接ご連絡しない</em>でください", page="05"))

    S.append(slide(s_chakuza("就活生", [
        "面談ツール（Web会議・通話アプリ等）への<b>入室・応答</b>で成立",
        "<b>所要時間・完遂の有無・就職意欲は問いません</b>（着座後の中断・退席・通信障害でも有効）",
        "就活生の遅刻も、<b>予定時刻から30分以内</b>の入室・応答で成立",
        "貴社都合の日程変更・キャンセル・不参加・10分超の遅刻は「<b>みなし着座</b>」",
    ], [
        "就活生都合の事前キャンセル・当日未入室（<b>10分待機＋連絡試行</b>が条件）",
        "障害者手帳を所持していることが判明した場合（無効成果）",
        "外国籍であることが判明した場合（無効成果）",
        "重複＝過去1ヶ月以内に貴社へ登録済み（原則、面談開始前までのご通知が必要）",
    ]), kicker=kick("04", "着座の定義と結果報告"), title="「着座」は<em>入室・応答</em>で成立します", page="06"))

    S.append(slide(s_noshow("就活生"),
                   kicker=kick("04", "着座の定義と結果報告"),
                   title="現れないときは、<em>10分待って、連絡を試みる</em>", page="07"))

    S.append(slide(s_houkoku("就活生"),
                   kicker=kick("04", "着座の定義と結果報告"),
                   title="結果は<em>2営業日以内</em>に、4つのどれかで", page="08"))

    body = ('<p style="font-size:15.5px;color:var(--gray);line-height:1.8;margin-top:10px">'
            '中途の面談と違い、就活生は<b style="color:var(--navy)">まだ比較の基準を持っていません</b>。'
            '求人を並べる前に、基準そのものを一緒に作る面談になります。</p>'
            '<div class="stepbox" style="margin-top:20px">'
            '<div class="sb"><div class="n">GOAL</div><h4>初回のゴールは<br>「軸が明確になった」実感</h4>'
            '<p>情報を聞き切ることでも、その場で求人を出すことでもありません。'
            '面談後に「自分の就活の軸が言葉になった」と感じてもらえるかが基準です。</p></div>'
            '<div class="sb"><div class="n">HOW</div><h4>本人が書いた言葉から<br>始める</h4>'
            '<p>カウンセリングメモのMust / Wantを引用し、「ここは合っていますか」と確認するところから入ると、'
            '一緒に整理している形を作れます。</p></div>'
            '<div class="sb acc"><div class="n">CARE</div><h4>「相談したい」で<br>届く方がいます</h4>'
            '<p>希望職種が固まっていない状態は、失注ではなく前提です。'
            'その場で決めさせようとせず、次回までの宿題と日程を決めて終わります。</p></div>'
            '</div>'
            '<div class="quote" style="margin-top:20px"><b>Point</b>　'
            '学業と並行しているため、<b>連絡が取れる時間帯が社会人と違います</b>。'
            '次回日程はその場で押さえておくと、後追いの手間が大きく減ります。</div>')
    S.append(slide(body, kicker=kick("05", "初回面談の設計"),
                   title="初回のゴールは、<em>「軸が明確になった」</em>", page="09"))

    body = ('<p style="font-size:15.5px;color:var(--gray);line-height:1.8;margin-top:10px">'
            '初回面談で<b style="color:var(--navy)">「自分は大事に扱われている」という確信</b>を作れるかが推薦率を左右します。'
            '最短ルートが、通常との差分を言葉にして宣言することです。</p>'
            '<div class="three">'
            '<div class="card c"><div class="lb">型 A　担当者レベル</div><h4>誰が担当するかを<br>特別化する</h4>'
            '<p>「普段は◯◯／あなたは△△」の対比構造を必ず入れます。</p>'
            '<div class="say">「普段は新卒担当の若手スタッフが対応しますが、'
            '<b>ハックツさん経由の方は内定獲得まで私（マネージャー）が直接サポート</b>しています」</div></div>'
            '<div class="card c"><div class="lb">型 B　サポート量</div><h4>ES添削・面接対策で<br>差を可視化する</h4>'
            '<p>悩みの上位である「面接対策が不安」「ESが書けない」に直接刺さります。</p>'
            '<div class="say">「通常はES添削1往復・面接対策1〜2回ですが、'
            '<b>ハックツさん経由の方は回数無制限</b>。納得いくまで何度でも一緒に作り込みます」</div></div>'
            '<div class="card c"><div class="lb">型 C　スピード・応対</div><h4>学業との両立へ<br>配慮を示す</h4>'
            '<p>学生のスケジュールへの理解を、特別待遇として宣言します。</p>'
            '<div class="say">「普段は土日休みですが、<b>ハックツさん経由の方は授業や課題で平日が難しい時のために、'
            '土日もLINEで相談に応じています</b>」</div></div>'
            '</div>'
            '<div class="closer"><div class="t">共通するコツ</div>'
            '<b>「普段は◯◯、あなたは△△」</b>という対比の形にすること。差を数字で言えるとさらに効きます。</div>')
    S.append(slide(body, kicker=kick("05", "初回面談の設計"),
                   title="推薦率を上げる<em>「特別扱いの宣言」</em>", page="10"))

    S.append(slide(s_madoguchi(), kicker=kick("06", "困ったときは"),
                   title="迷ったら、<em>ご本人ではなく窓口へ</em>", page="11"))

    S.append(slide(s_final("新卒送客の手引き",
                           "kyusyokusyasokyaku-no-madoguchi.com/guide/shinsotsu",
                           "hado-shinsotsu", [
        "<b>面談前に、カウンセリングメモの3項目を読む</b>（就活の軸・心理的障壁・選考フェーズ）",
        "<b>面談前に、ご本人へ直接連絡しない</b>。紹介が難しいと感じたら、まず窓口へ",
        "<b>面談後2営業日以内に、結果を4つのどれかで入力する</b>",
        "<b>現れないときは10分待機＋連絡試行</b>。この手順を経た場合のみ当日未入室",
        "<b>初回のゴールは「軸が明確になった」実感</b>。次回日程はその場で押さえる",
    ]), kicker="TAKEAWAY", title="今日から、この5つだけ", page="12"))

    S.append(closing('株式会社HADO　求職者送客の窓口<br>'
                     '<b>窓口担当　佐伯・松本</b>　Slack（推奨）／ Chatwork<br>'
                     '<span style="font-size:14px">※緊急のトラブル・情報事故のみ　代表 田中</span>'))
    write("deck-shinsotsu.html", "求職者送客の窓口 新卒｜CA向けオンボーディング", S)


if __name__ == "__main__":
    build_chuto()
    build_shinsotsu()
