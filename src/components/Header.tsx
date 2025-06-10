// src/components/Header.tsx

import React from 'react';

const Header = () => {
  return (
    <div className="sticky top-0 z-50 flex flex-row items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b w-full">
      <img
        src="/transcends.png"
        alt="Transcends Logo"
        className="hidden md:block h-10 w-auto"
      />
      <img
        src="/transcends-icon.png"
        alt="Transcends Logo"
        className="md:hidden h-10 w-auto"
      />
    </div>
  );
};

export default Header;