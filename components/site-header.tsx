import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/#nasil-calisir", label: "Nasıl çalışır?", short: null },
  { href: "/pano", label: "Haftanın panosu", short: "Pano" },
  { href: "/#sss", label: "SSS", short: null },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3 ${item.short ? "" : "hidden md:block"}`}
            >
              {item.short ? (
                <>
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </>
              ) : (
                item.label
              )}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2">
            <Link href="/#kontrol">Kontrol et</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
