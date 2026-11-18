import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
        <SearchX className="size-7" aria-hidden />
      </div>
      <p className="mb-2 font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Bu sayfa bulunamadı</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Bir linkin adresi tuhaf
        görünüyorsa, tıklamadan önce bize sormayı unutma.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Ana sayfaya dön</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pano">Haftanın panosu</Link>
        </Button>
      </div>
    </div>
  );
}
