import React from 'react';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function Layout({ children, sidebar }: LayoutProps) {
  return (
    <>
      <ThemeToggle />
      <div className="w-full max-w-[1200px] mx-auto my-10 px-5">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] gap-6 items-start">
          <main className="flex flex-col gap-6">
            {children}
          </main>
          {sidebar && (
            <aside className="sticky top-6 flex flex-col gap-6">
              {sidebar}
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
