import React from 'react';
import { Search, FileText, Briefcase, BookOpen, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'search' | 'profile' | 'applications' | 'guide';
  setActiveTab: (tab: 'search' | 'profile' | 'applications' | 'guide') => void;
  hasGeminiKey: boolean;
  applicationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasGeminiKey,
  applicationsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('search')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">AutoEmpleo</span>
                <span className="bg-sky-500/10 text-sky-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  Argentina 🇦🇷
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Búsqueda & Postulación Automática por IA</p>
            </div>
          </div>

          {/* AI Status Badge */}
          <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-slate-400">Motor IA Gemini:</span>
            {hasGeminiKey ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Activo (Búsqueda & Cartas)
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Modo Local Guard
              </span>
            )}
          </div>

          {/* Navigation Tabs - Bento Navigation Bar */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80">
            <button
              id="tab-search"
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'search'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Buscar Empleos</span>
            </button>

            <button
              id="tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Perfil / CV</span>
            </button>

            <button
              id="tab-applications"
              onClick={() => setActiveTab('applications')}
              className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'applications'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Postulaciones</span>
              {applicationsCount > 0 && (
                <span className="ml-1 bg-emerald-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {applicationsCount}
                </span>
              )}
            </button>

            <button
              id="tab-guide"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guía Web</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
