"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShellContext = createContext(false);

export function AppShell({ children }: AppShellProps) {
  const alreadyInsideShell = useContext(AppShellContext);

  /**
   * Some pages already use route layouts that wrap children in AppShell,
   * while the page component itself also wraps with AppShell.
   *
   * This guard prevents duplicated sidebars, duplicated fixed containers,
   * layout shifting, and extra spacing without forcing us to rewrite every page.
   */
  if (alreadyInsideShell) {
    return <>{children}</>;
  }

  return (
    <AppShellContext.Provider value>
      <AppShellFrame>{children}</AppShellFrame>
    </AppShellContext.Provider>
  );
}

function AppShellFrame({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;

      if (isDesktop) {
        setSidebarOpen(true);
        setMobileSidebarOpen(false);
      } else {
        setSidebarOpen(false);
        setMobileSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen overflow-hidden bg-navy-primary text-white">
        <div className="p-4">
          <div className="min-h-[80vh] rounded-3xl border border-navy-border bg-navy-card/80 shadow-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-navy-primary text-white">
      <div className="hidden lg:block">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((current) => !current)}
          isMobile={false}
        />
      </div>

      <div className="lg:hidden">
        <Sidebar
          isOpen={mobileSidebarOpen}
          onToggle={() => setMobileSidebarOpen((current) => !current)}
          isMobile
        />
      </div>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-navy-border bg-navy-primary/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-border bg-navy-card text-white transition hover:border-gold/40 hover:text-gold"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="text-right">
          <p className="text-sm font-black uppercase tracking-widest text-white">
            GM Dynasty
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
            Lite
          </p>
        </div>
      </header>

      <main
        className={[
          "min-h-screen overflow-x-hidden transition-all duration-300 ease-in-out",
          "lg:fixed lg:bottom-0 lg:right-0 lg:top-0",
          sidebarOpen ? "lg:left-[280px]" : "lg:left-[80px]",
        ].join(" ")}
      >
        <div className="min-h-screen w-full max-w-[1920px] overflow-x-hidden px-3 py-4 sm:px-4 lg:px-5 lg:py-5 xl:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppShell;