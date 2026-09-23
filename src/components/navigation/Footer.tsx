'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-bg-surface/50 text-text-muted text-[11px] font-mono py-4 px-4 sm:px-6 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-4">
          <span className="text-text-secondary font-medium">KeyArena</span>
          <span>•</span>
          <Link href="/about" className="hover:text-text-primary transition-colors">
            About
          </Link>
          <Link href="/faq" className="hover:text-text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/practice" className="hover:text-text-primary transition-colors">
            Practice
          </Link>
          <Link href="/challenge" className="hover:text-text-primary transition-colors">
            Daily Sprint
          </Link>
          <Link href="/settings" className="hover:text-text-primary transition-colors">
            Settings
          </Link>
        </div>

        <div className="flex items-center space-x-3 text-text-muted">
          <span>Esc: Command Palette</span>
          <span>•</span>
          <span>Tab: Restart</span>
          <span>•</span>
          <span className="text-accent/80 font-mono">100% Local Persistence</span>
        </div>
      </div>
    </footer>
  );
};
