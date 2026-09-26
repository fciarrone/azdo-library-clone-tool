import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar';
import { PageHeader } from './PageHeader';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function AppShell({ children, sidebar, header, headerActions }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarWidth = isSidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)';

  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Mobile sidebar overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[var(--z-index-modal-backdrop)] bg-neutral-1000/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-[var(--z-index-sticky)] bg-background-primary border-r border-border transition-all duration-normal flex flex-col',
          isMobile ? 'transform lg:transform-none' : '',
          isMobile && !isMobileSidebarOpen ? '-translate-x-full' : 'translate-x-0',
          isSidebarCollapsed && !isMobile ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]'
        )}
        aria-label="Main navigation"
      >
        {sidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={setIsSidebarCollapsed}
            isMobile={isMobile}
          >
            {sidebar}
          </Sidebar>
        )}
      </aside>

      {/* Main content */}
      <div className={clsx('flex-1 flex flex-col min-w-0 lg:ml-[var(--sidebar-width)]', isSidebarCollapsed && !isMobile && 'lg:ml-[var(--sidebar-width-collapsed)]')}>
        {/* Header */}
        <header className="sticky top-0 z-[var(--z-index-sticky)] bg-background-primary border-b border-border header-height flex-shrink-0">
          {header ? (
            header
          ) : (
            <PageHeader
              title=""
              subtitle=""
              actions={headerActions}
              onMenuClick={isMobile ? () => setIsMobileSidebarOpen(true) : undefined}
              showMenuButton={isMobile}
            />
          )}
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto content-max-width mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}