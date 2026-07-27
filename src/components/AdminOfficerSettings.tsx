import React, { useState } from 'react';
import { OfficerConfig, BidangOfficerConfigs, BidangType } from '../types';
import { saveOfficerConfigs, getStoredOfficerConfigs } from '../utils/storage';
import { BIDANG_LIST } from '../data/constants';
import { Settings, Save, Phone, User, Mail, MapPin, ShieldCheck, FileText, Award, Database } from 'lucide-react';

interface AdminOfficerSettingsProps {
  officerConfigs: BidangOfficerConfigs;
  onConfigsSaved: (newConfigs: BidangOfficerConfigs) => void;
}

export const AdminOfficerSettings: React.FC<AdminOfficerSettingsProps> = ({
  officerConfigs,
  onConfigsSaved
}) => {
  const [activeBidang, setActiveBidang] = useState<BidangType>('pendaftaran_penduduk');
  const [configsState, setConfigsState] = useState<BidangOfficerConfigs>(officerConfigs || getStoredOfficerConfigs());
  const [isSaved, setIsSaved] = useState(false);

  const currentOfficer = configsState[activeBidang] || {
    namaPejabat: '',
    jabatanPejabat: '',
    nomorWhatsapp: '',
    emailDinas: '',
    alamatKantor: ''
  };

  const handleFieldChange = (field: keyof OfficerConfig, value: string) => {
    setConfigsState(prev => ({
      ...prev,
      [activeBidang]: {
        ...prev[activeBidang],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean whatsapp numbers for all 3 bidang
    const cleanedConfigs: BidangOfficerConfigs = { ...configsState };
    (Object.keys(cleanedConfigs) as BidangType[]).forEach((key) => {
      let wa = cleanedConfigs[key].nomorWhatsapp.replace(/\D/g, '');
      if (wa.startsWith('0')) {
        wa = '62' + wa.slice(1);
      }
      cleanedConfigs[key].nomorWhatsapp = wa;
    });

    saveOfficerConfigs(cleanedConfigs);
    onConfigsSaved(cleanedConfigs);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const getBidangIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">
            Konfigurasi Pejabat Pengaduan (3 Bidang)
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            Pengaturan WhatsApp & Pejabat Pengaduan per Bidang
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Atur pejabat penerima pengaduan WhatsApp & verifikator khusus untuk masing-masing bidang pelayanan.
          </p>
        </div>
      </div>

      {/* Tabs for 3 Bidang */}
      <div className="bg-slate-100 p-3 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-2">
        {BIDANG_LIST.map((bidang) => {
          const isActive = activeBidang === bidang.id;
          const officer = configsState[bidang.id];
          return (
            <button
              key={bidang.id}
              type="button"
              onClick={() => setActiveBidang(bidang.id)}
              className={`p-3 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                isActive
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/10'
                  : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {getBidangIcon(bidang.iconName)}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                  {bidang.shortTitle}
                </span>
                <span className="font-bold text-xs text-slate-900 block truncate">
                  {officer?.namaPejabat || 'Belum Diatur'}
                </span>
                <span className="text-[11px] font-mono text-emerald-700 block truncate">
                  WA: {officer?.nomorWhatsapp || '-'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 text-xs">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
              Mengedit Pejabat Untuk:
            </span>
            <h4 className="font-bold text-blue-900 text-sm">
              {BIDANG_LIST.find(b => b.id === activeBidang)?.title}
            </h4>
          </div>
          <span className="bg-blue-600 text-white font-mono text-xs px-2.5 py-1 rounded-lg font-bold">
            Bidang {activeBidang.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor WhatsApp Pejabat Direct (Format: 628xxxx) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Contoh: 6282198765431"
                value={currentOfficer.nomorWhatsapp}
                onChange={(e) => handleFieldChange('nomorWhatsapp', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Setiap aduan bidang ini akan langsung ter-direct ke WhatsApp nomor pejabat di atas.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Pejabat / Kepala Bidang: <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
              <input
                type="text"
                value={currentOfficer.namaPejabat}
                onChange={(e) => handleFieldChange('namaPejabat', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jabatan Pejabat:
            </label>
            <input
              type="text"
              value={currentOfficer.jabatanPejabat}
              onChange={(e) => handleFieldChange('jabatanPejabat', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Dinas Bidang:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-600 absolute left-3 top-2.5" />
              <input
                type="email"
                value={currentOfficer.emailDinas}
                onChange={(e) => handleFieldChange('emailDinas', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Alamat Kantor Pelayanan:
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
            <input
              type="text"
              value={currentOfficer.alamatKantor}
              onChange={(e) => handleFieldChange('alamatKantor', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {isSaved && (
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Konfigurasi Pejabat Pengaduan 3 Bidang Berhasil Disimpan ke Firestore Database!</span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Konfigurasi Pejabat Pengaduan (Semua Bidang)</span>
          </button>
        </div>
      </form>
    </div>
  );
};

