import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      {/* Kalkan */}
      <path
        d="M16 6.5 23.5 9.3v6.1c0 4.7-3.1 8.3-7.5 9.9-4.4-1.6-7.5-5.2-7.5-9.9V9.3L16 6.5Z"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Zincir halkası (link) */}
      <path
        d="M14.2 17.8l-.9.9a2.1 2.1 0 0 1-3-3l1.5-1.5a2.1 2.1 0 0 1 3 0M17.8 14.2l.9-.9a2.1 2.1 0 0 1 3 3l-1.5 1.5a2.1 2.1 0 0 1-3 0M14.6 17.4l2.8-2.8"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        transform="translate(-0.2 -0.4) scale(0.98)"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}
    >
      <LogoMark />
      <span className="text-[15px]">
        Bu Link Güvenli mi<span className="text-primary">?</span>
      </span>
    </Link>
  );
}
