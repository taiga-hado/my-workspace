import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-600">ハックツ就職</span>
          <span className="text-sm text-gray-500">コラム</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-sm">
          <Link href="/" className="text-gray-600 hover:text-green-600">
            コラム一覧
          </Link>
          <a
            href="https://hakkutu-career.com"
            className="rounded-full bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            無料相談はこちら
          </a>
        </nav>
      </div>
    </header>
  );
}
