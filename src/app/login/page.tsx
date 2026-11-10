'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Target, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Vercel Direct Login State
  const [showVercelModal, setShowVercelModal] = useState(false);
  const [vercelToken, setVercelToken] = useState('');
  const [vercelLoading, setVercelLoading] = useState(false);
  const [vercelError, setVercelError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get('vercel') === 'true') {
      setShowVercelModal(true);
    }
  }, [searchParams]);

  async function handleLoginWithVercel(e: React.FormEvent) {
    e.preventDefault();
    setVercelError(null);
    if (!vercelToken.trim()) {
      setVercelError('Por favor, informe seu token da Vercel.');
      return;
    }

    try {
      setVercelLoading(true);
      const res = await fetch('/api/auth/vercel-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: vercelToken.trim() }),
      });

      const data = await res.json();
      if (!data.success) {
        setVercelError(data.error || 'Falha ao autenticar com a Vercel.');
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setVercelError(err.message || 'Erro inesperado ao conectar com a Vercel.');
    } finally {
      setVercelLoading(false);
    }
  }

  function handleFillDemo() {
    setEmail('demo@leadcraft.com');
    setPassword('Demo@123456');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Por favor, confirme seu endereço de e-mail antes de entrar.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.session) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#09090b] text-[#f4f4f5] relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25 mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            LeadCraft AI
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Entre na sua conta para gerenciar prospecções e landing pages
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-7">
          {/* Quick Demo Credentials Pill */}
          <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-zinc-900 border border-blue-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Conta de Teste Pronta</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                demo@leadcraft.com • Demo@123456
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition-colors"
            >
              Preencher
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* E-mail field */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Acessar Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#121215] px-2 text-zinc-500 font-semibold tracking-wider">
                Ou acesse com
              </span>
            </div>
          </div>

          {/* Vercel Individual Access Button */}
          <button
            type="button"
            onClick={() => {
              setVercelError(null);
              setShowVercelModal(true);
            }}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-black hover:bg-zinc-900 text-white font-semibold text-xs border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 1155 1000">
              <path d="m577.3 0 577.4 1000H0z" />
            </svg>
            <span>Entrar com sua Conta Vercel</span>
          </button>

          {/* Create Account Link */}
          <div className="pt-5 mt-5 border-t border-zinc-800 text-center">
            <span className="text-xs text-zinc-400">Ainda não possui uma conta? </span>
            <Link
              href="/cadastro"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </div>

      {/* Vercel Login Modal */}
      {showVercelModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-black border border-zinc-700 text-white flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 1155 1000">
                    <path d="m577.3 0 577.4 1000H0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Login com sua Conta Vercel</h3>
                  <p className="text-[11px] text-zinc-400">Autenticação individual e isolada</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVercelModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              Cole o seu <strong>Personal Access Token</strong> da Vercel. O LeadCraft AI conectará a sua conta individual para que suas landing pages fiquem publicadas exclusivamente no seu perfil Vercel.
            </p>

            {vercelError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {vercelError}
              </div>
            )}

            <form onSubmit={handleLoginWithVercel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Token de Acesso Vercel
                </label>
                <input
                  type="password"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  placeholder="Cole seu token (ex: vercel_tok_...)"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
                <div className="flex justify-end mt-1.5">
                  <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-zinc-400 hover:text-white underline"
                  >
                    Onde encontro meu token na Vercel?
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVercelModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={vercelLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {vercelLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <span>Entrar com Vercel</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
