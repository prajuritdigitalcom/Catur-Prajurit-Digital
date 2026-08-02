import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

interface FooterProps {
  hidden?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ hidden = false }) => {
  if (hidden) return null;

  return (
    <footer className="w-full bg-white border-t border-slate-200/80 py-4 px-4 mt-auto mb-16 text-slate-500 text-xs text-center">
      <div className="max-w-md mx-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#fe4c6f] flex items-center justify-center text-white font-black text-[10px] shadow-sm">
            PD
          </div>
          <span className="font-bold text-slate-800">Karya Prajurit Digital</span>
        </div>

        <p className="text-[11px] text-slate-500">
          Aplikasi Catur HP Ringan, Cepat & Terang
        </p>

        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#fe4c6f]" />
            Engine Stockfish
          </span>
          <span>•</span>
          <a
            href="https://prajuritdigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#fe4c6f] font-semibold transition-colors flex items-center gap-1"
          >
            prajuritdigital.com
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
