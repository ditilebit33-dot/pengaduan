import React from 'react';
import { FileText, Search, ShieldCheck, PhoneCall, Building2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'buat' | 'lacak' | 'admin';
  setActiveTab: (tab: 'buat' | 'lacak' | 'admin') => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  setIsAdminLoggedIn
}) => {
  return (
    <header className="bg-slate-950 text-white shadow-xl border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold tracking-wide shadow-inner">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <span className="bg-slate-950 text-amber-400 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded shadow-sm">
              PORTAL RESMI
            </span>
            <span className="font-semibold text-[11px] sm:text-xs tracking-tight">
              Sistem Layanan Pengaduan Disdukcapil Kabupaten Kepulauan Tanimbar — Saumlaki
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-slate-900 bg-amber-300/60 px-2.5 py-0.5 rounded-full border border-amber-600/20">
              <PhoneCall className="w-3.5 h-3.5 text-slate-900" /> WhatsApp Direct 3 Pejabat Bidang
            </span>
          </div>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="container mx-auto max-w-6xl px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div 
          className="flex items-center space-x-3.5 cursor-pointer group transition-all" 
          onClick={() => setActiveTab('buat')}
        >
          {/* Emblem Graphic */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 border-2 border-amber-400/90 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Building2 className="w-7 h-7 text-amber-300" />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-400 font-extrabold">
              PEMERINTAH KABUPATEN KEPULAUAN TANIMBAR
            </div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white leading-tight group-hover:text-amber-200 transition-colors">
              Dinas Kependudukan dan Pencatatan Sipil
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Layanan Pengaduan & Aspirasi Administrasi Kependudukan (Saumlaki)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto shadow-inner">
          <button
            id="nav-buat-aduan"
            onClick={() => setActiveTab('buat')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'buat'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md ring-1 ring-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Buat Pengaduan</span>
          </button>

          <button
            id="nav-lacak-tiket"
            onClick={() => setActiveTab('lacak')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'lacak'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md ring-1 ring-blue-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Lacak Tiket</span>
          </button>

          <button
            id="nav-panel-admin"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md font-extrabold ring-1 ring-amber-300/40'
                : 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
            <span>
              Panel Admin {isAdminLoggedIn && <span className="bg-emerald-400 w-2 h-2 rounded-full inline-block ml-1 animate-pulse"></span>}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

