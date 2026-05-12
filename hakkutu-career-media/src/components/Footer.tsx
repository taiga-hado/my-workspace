import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <span className="text-lg font-bold text-green-600">
              ハックツ就職
            </span>
            <p className="mt-2 text-sm text-gray-500">
              20代の未経験転職・就職をサポートする情報メディア
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700">コラム</span>
              <Link
                href="/"
                className="text-gray-500 hover:text-green-600"
              >
                記事一覧
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700">サービス</span>
              <a
                href="https://hakkutu-career.com"
                className="text-gray-500 hover:text-green-600"
              >
                ハックツ就職トップ
              </a>
              <a
                href="https://hakkutu-career.com/privacypolicy-2"
                className="text-gray-500 hover:text-green-600"
              >
                プライバシーポリシー
              </a>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} 株式会社HADO All rights reserved.
        </p>
      </div>
    </footer>
  );
}
