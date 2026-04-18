import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/company", label: "Company" },
  { href: "/service", label: "Service" },
  { href: "/message", label: "Message" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-100 mt-24">
      <div className="container-max py-16">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div className="font-serif text-3xl font-semibold tracking-wider2">
              Corte
            </div>
            <p className="mt-4 text-sm text-navy-200 leading-relaxed">
              株式会社Corte
              <br />
              東京都渋谷区桜丘町21-4 渋谷桜丘町ビル3F
            </p>
          </div>
          <div className="flex md:justify-end">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-navy-100 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-navy-800 text-xs text-navy-300">
          © {new Date().getFullYear()} Corte Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
