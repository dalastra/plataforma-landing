'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Users,
  FolderGit2,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Target,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Encontrar negócios', href: '/descoberta', icon: Compass },
  { name: 'Oportunidades', href: '/oportunidades', icon: Sparkles },
  { name: 'Meus leads', href: '/leads', icon: Users },
  { name: 'Meus projetos', href: '/projetos', icon: FolderGit2 },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
  { name: 'Meu perfil', href: '/perfil', icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/cadastro' ||
    pathname === '/esqueci-senha' ||
    pathname === '/redefinir-senha';

  if (isAuthPage) return null;

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const displayEmail = user?.email || '';
  const avatarUrl = profile?.avatar_url || null;

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0c0c0e] border-b border-[#27272a] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Target className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">LeadCraft AI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile drawer */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0c0c0e] border-r border-[#27272a]
          flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div>
          {/* Brand header */}
          <div className="hidden md:flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold tracking-tight text-white text-base leading-none">
                LeadCraft AI
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-medium">
                Prospecção & Landing Pages
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />
                  <span>{item.name}</span>
                  {item.href === '/oportunidades' && (
                    <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      IA
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account / Footer Profile Bar */}
        <div className="pt-4 border-t border-zinc-800/80 px-1">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
              <Link
                href="/perfil"
                className="flex items-center gap-2.5 overflow-hidden flex-1 group"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    displayName[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {displayEmail}
                  </div>
                </div>
              </Link>

              <button
                onClick={() => signOut()}
                className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors ml-1"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Fazer Login
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </>
  );
}
