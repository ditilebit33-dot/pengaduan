import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { OfficerConfig } from '../types';

interface FooterProps {
  officerConfig: OfficerConfig;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ officerConfig, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-10 pb-6 border-t border-slate-800 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-sm">
        {/* Col 1: Disdukcapil Tanimbar Info */}
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-bold mb-3 text-base">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Disdukcapil Kab. Kepulauan Tanimbar</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Layanan Pengaduan Masyarakat Online resmi Dinas Kependudukan dan Pencatatan Sipil Kabupaten Kepulauan Tanimbar. Berkomitmen memberikan pelayanan publik yang transparan, efisien, dan akuntabel.
          </p>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 p-2.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Terintegrasi Database Internal & WhatsApp Pejabat Pengaduan</span>
          </div>
        </div>

        {/* Col 2: Contact & Office Location */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm border-b border-slate-800 pb-2">
            Kontak & Alamat Kantor
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{officerConfig.alamatKantor}</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>WhatsApp Pejabat Aduan: +{officerConfig.nomorWhatsapp}</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{officerConfig.emailDinas}</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>Senin - Jumat: 08:00 - 16:00 WIT (Pelayanan Loket & Online)</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Bidang Layanan & Admin Access */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm border-b border-slate-800 pb-2">
            3 Bidang Layanan Pengaduan
          </h4>
          <ul className="space-y-2 text-xs text-slate-400 mb-4">
            <li className="hover:text-amber-300 transition-colors">
              • Bidang Pelayanan Pendaftaran Penduduk (KK, KTP-el, KIA, SKPWNI)
            </li>
            <li className="hover:text-amber-300 transition-colors">
              • Bidang Pelayanan Pencatatan Sipil (Akta Kelahiran, Kematian, Perkawinan)
            </li>
            <li className="hover:text-amber-300 transition-colors">
              • Bidang Pengelolaan Informasi Administrasi Kependudukan (Sinkronisasi Data NIK)
            </li>
          </ul>

          <button
            onClick={onOpenAdmin}
            className="w-full text-center bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Masuk Panel Admin / Petugas Verifikasi</span>
          </button>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="border-t border-slate-900 pt-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Dinas Kependudukan dan Pencatatan Sipil Kabupaten Kepulauan Tanimbar. All rights reserved.</p>
      </div>
    </footer>
  );
};
