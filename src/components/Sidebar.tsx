"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  LayoutDashboard, 
  Database, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Layers
} from "lucide-react";

interface SidebarProps {
  children?: React.ReactNode;
}

const navItems = [
  {
    name: "Kalkulator Estimasi",
    href: "/calculator",
    icon: Calculator,
    description: "Hitung biaya proyek",
  },
  {
    name: "Dashboard Proyek",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Ringkasan & riwayat",
  },
  {
    name: "Master Data",
    href: "/master-data",
    icon: Database,
    description: "Atur harga & klien",
  },
];

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Simpan preferensi collapse di localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row selection:bg-indigo-200">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5 font-extrabold text-indigo-600 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Layers size={18} />
          </div>
          <span>JH Builds</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle Menu"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop & Mobile Sidebar */}
      <motion.aside
        animate={{
          width: mounted ? (isCollapsed ? 80 : 260) : 260,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col justify-between shadow-sm md:shadow-none transition-transform md:translate-x-0 shrink-0 ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Header & Brand Section */}
        <div className="flex flex-col">
          <div className={`h-16 border-b border-slate-100 flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
            {isCollapsed ? (
              <button
                onClick={toggleCollapse}
                className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition shadow-sm"
                title="Perluas Sidebar"
              >
                <ChevronRight size={20} />
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                    <Layers size={20} />
                  </div>
                  <div className="flex flex-col whitespace-nowrap overflow-hidden">
                    <span className="font-extrabold text-slate-800 text-base leading-tight tracking-tight">
                      JH Builds
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Agency Pricing
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleCollapse}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition shrink-0 cursor-pointer"
                  title="Sembunyikan Sidebar"
                >
                  <ChevronLeft size={18} />
                </button>
              </>
            )}
          </div>

          {/* Navigation Items */}
          <nav className={`py-4 space-y-1.5 ${isCollapsed ? "px-2" : "px-3"}`}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`group relative flex items-center transition-all duration-150 rounded-xl ${
                    isCollapsed 
                      ? "w-11 h-11 mx-auto justify-center" 
                      : "gap-3 px-3.5 py-3 w-full"
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                      isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-600"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="text-sm truncate">
                      {item.name}
                    </span>
                  )}

                  {/* Tooltip Hover saat Collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100]">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.description}</div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Logout Section */}
        <div className={`p-3 border-t border-slate-100 ${isCollapsed ? "flex flex-col items-center gap-2 px-2" : ""}`}>
          {isCollapsed ? (
            <>
              <div 
                className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm"
                title={session?.user?.name || "Admin Agency"}
              >
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                title="Keluar / Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 min-w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {session?.user?.name || "Admin Agency"}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {session?.user?.email || "admin@agency.com"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer shrink-0"
                title="Keluar / Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
