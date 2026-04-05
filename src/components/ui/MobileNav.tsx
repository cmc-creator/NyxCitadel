'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight } from 'lucide-react';

interface MobileNavProps {
  isLoggedIn: boolean;
}

const navLinks: { label: string; href: string; isAnchor?: boolean; amber?: boolean }[] = [
  { label: 'Features', href: '#features', isAnchor: true },
  { label: 'Intelligence', href: '#intel', isAnchor: true },
  { label: 'Sentry AI', href: '#sentry', isAnchor: true },
  { label: 'Pricing', href: '#pricing', isAnchor: true },
  { label: 'Guide', href: '/guide' },
  { label: 'Partner Portal', href: '/priority-partner-portal', amber: true },
];

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute top-0 right-0 h-full w-72 bg-[#060b16]/98 border-l border-white/8 backdrop-blur-xl flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
              <span className="text-sm font-bold text-white tracking-tight">
                NyxCitadel<sup className="text-[9px] font-normal text-teal-400">™</sup>
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-all"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {navLinks.map(({ label, href, isAnchor, amber }) =>
                isAnchor ? (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      amber
                        ? 'text-amber-300 hover:bg-amber-400/8'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </a>
                ) : (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      amber
                        ? 'text-amber-300 hover:bg-amber-400/8'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </Link>
                )
              )}
            </nav>

            {/* CTA footer */}
            <div className="px-4 py-5 border-t border-white/5 space-y-2">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)' }}
                >
                  Go to Dashboard <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14a4a8 100%)' }}
                  >
                    Get Started <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
