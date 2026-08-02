import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

interface FooterProps {
  hidden?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ hidden = false }) => {
  if (hidden) return null;

  return (
    <footer className="w-full bg-ink-900 border-t border-ink-700 py-4 px-4 mt-auto mb-16 text-bone-400 text-xs text-center">
      <div className="max-w-md mx-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-ink-800 border border-brass-600/40 flex items-center justify-center text-brass-400 font-display font-semibold text-[11px]">
            PD
          </div>
          <span className="font-semibold text-bone-200">Karya Prajurit Digital</span>
        </div>

        <p className="text-[11px] text-bone-400">
          Aplikasi Catur HP Ringan, Cepat & Terang
        </p>

        <div className="flex items-center gap-3 text-[10px] text-bone-400 font-notation">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-brass-400" />
            engine: stockfish
          </span>
          <span>•</span>
          <a
            href="https://prajuritdigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brass-400 font-semibold transition-colors flex items-center gap-1"
          >
            prajuritdigital.com
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
