import React from 'react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © 2026 GearKeep. 纯本地、隐私优先的器材管理工具。
          </div>
          <div className="flex space-x-4">
            <a href="https://github.com/Bigbangcell/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <i className="fa fa-github" />
            </a>
            <a href="mailto:bigbangcelllzz@gmail.com" className="text-muted-foreground hover:text-foreground">
              <i className="fa fa-envelope" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}