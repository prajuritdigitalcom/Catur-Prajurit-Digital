import React from 'react';

interface FooterProps {
  hidden?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ hidden = false }) => {
  if (hidden) return null;

  return (
    <footer className="w-full bg-ink-900 border-t border-ink-700 py-4 px-4 mt-auto mb-16 text-bone-400 text-xs text-center">
      <p>© 2026 Karya Prajurit Digital.</p>
    </footer>
  );
};

