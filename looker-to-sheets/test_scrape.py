"""スクレイピングのみテスト（スプレッドシート書き込みなし）"""
from main import scrape_looker_studio, LOOKER_STUDIO_URL

data = scrape_looker_studio(LOOKER_STUDIO_URL)

if data:
    print(f"\n✅ {len(data)} 行取得できました！\n")
    print(f"{'姓':<8} {'名':<8} {'面談予定日時':<24} {'面談実施のご状況'}")
    print("-" * 70)
    for row in data[:5]:  # 先頭5行だけ表示
        print(f"{row[0]:<8} {row[1]:<8} {row[2]:<24} {row[3]}")
    if len(data) > 5:
        print(f"... 他 {len(data) - 5} 行")
else:
    print("\n❌ データが取得できませんでした")
    print("Looker Studioのページ構造を確認する必要があります")
