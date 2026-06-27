import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar as CalendarIcon, 
  Flame, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon, 
  Zap, 
  Menu,
  X 
} from "lucide-react";
import { useState } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: ListTodo },
    { name: "Calendar", path: "/calendar", icon: CalendarIcon },
    { name: "Focus Mode", path: "/focus", icon: Flame },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/5 dark:bg-accent-500/3 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/3 blur-[120px] rounded-full pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass-card border-r border-slate-200/50 dark:border-slate-850/50 m-4 mr-0 rounded-3xl p-5 sticky top-4 h-[calc(100vh-2rem)] z-30">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 py-4 mb-6">
          <span className="p-2 rounded-xl bg-accent-600 text-white flex items-center justify-center shadow-lg shadow-accent-600/30">
            <Zap className="w-5 h-5 fill-white" />
          </span>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Momentum<span className="text-accent-600">AI</span>
          </span>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-accent-600 text-white shadow-lg shadow-accent-600/20" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Actions */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-850/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-700 dark:text-accent-400 font-bold text-xs">
              U
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                Momentum User
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-xs gap-1"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Side */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden glass-card flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-850/50 m-4 mb-0 rounded-2xl z-40">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent-600 text-white flex items-center justify-center">
              <Zap className="w-4 h-4 fill-white" />
            </span>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              Momentum<span className="text-accent-600">AI</span>
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 transition-all"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-24 left-4 right-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 p-5 shadow-2xl z-50 space-y-4">
            <nav className="flex flex-col gap-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-accent-600 text-white" 
                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs gap-1.5"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                Theme
              </button>
            </div>
          </div>
        )}

        {/* Content Box */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
