import React from 'react';
import { Complaint } from '../types';
import { BIDANG_LIST } from '../data/constants';
import { formatDateID } from '../utils/pdfGenerator';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Award, 
  Database,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  complaints: Complaint[];
  onNavigateToVerification: (filterStatus?: string) => void;
  onNavigateToReports: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  onNavigateToVerification,
  onNavigateToReports
}) => {
  const total = complaints.length;
  const menunggu = complaints.filter(c => c.status === 'menunggu').length;
  const proses = complaints.filter(c => c.status === 'proses').length;
  const terverifikasi = complaints.filter(c => c.status === 'terverifikasi').length;
  const selesai = complaints.filter(c => c.status === 'selesai').length;
  const ditolak = complaints.filter(c => c.status === 'ditolak').length;

  const countByBidang = (bidangKey: string) => {
    return complaints.filter(c => c.bidang === bidangKey).length;
  };

  const pendingList = complaints.filter(c => c.status === 'menunggu' || c.status === 'proses').slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            Panel Administrator Disdukcapil
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Dashboard Pengaduan Masyarakat
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
            Ringkasan status pengaduan kependudukan dan pencatatan sipil Kabupaten Kepulauan Tanimbar.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateToVerification()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition-colors flex items-center gap-2"
          >
            <span>Verifikasi Aduan ({menunggu})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateToReports}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2"
          >
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Main Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total */}
        <div 
          onClick={() => onNavigateToVerification('all')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Aduan</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <span className="text-[11px] text-slate-500">Semua riwayat pengaduan</span>
        </div>

        {/* Menunggu */}
        <div 
          onClick={() => onNavigateToVerification('menunggu')}
          className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Menunggu</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900">{menunggu}</div>
          <span className="text-[11px] text-amber-700 font-medium">Perlu verifikasi segera</span>
        </div>

        {/* Dalam Proses */}
        <div 
          onClick={() => onNavigateToVerification('proses')}
          className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-blue-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Diproses</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{proses + terverifikasi}</div>
          <span className="text-[11px] text-blue-700">Dalam pengerjaan petugas</span>
        </div>

        {/* Selesai */}
        <div 
          onClick={() => onNavigateToVerification('selesai')}
          className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900">{selesai}</div>
          <span className="text-[11px] text-emerald-700">Telah tuntas dilayani</span>
        </div>

        {/* Ditolak */}
        <div 
          onClick={() => onNavigateToVerification('ditolak')}
          className="bg-red-50/80 p-5 rounded-2xl border border-red-200 shadow-sm hover:shadow-md transition-all cursor-pointer col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-red-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ditolak</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{ditolak}</div>
          <span className="text-[11px] text-red-700">Berkas tidak lengkap/batal</span>
        </div>
      </div>

      {/* Distribution By Bidang Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BIDANG_LIST.map((bidang) => {
          const count = countByBidang(bidang.id);
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={bidang.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {bidang.shortTitle}
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {count} Aduan ({percentage}%)
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm mb-3">
                {bidang.title}
              </h4>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 italic line-clamp-2">
                "{bidang.description}"
              </p>
            </div>
          );
        })}
      </div>

      {/* Urgent Pending Complaints Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Pengaduan Membutuhkan Tindakan ({pendingList.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar pengaduan terbaru dengan status Menunggu atau Dalam Proses
            </p>
          </div>

          <button
            onClick={() => onNavigateToVerification('menunggu')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Lihat Semua Verification Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingList.length > 0 ? (
            pendingList.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {item.id}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {item.namaLengkap} (NIK: {item.nik})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {item.permasalahan}
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    {formatDateID(item.tanggalPengaduan)} | No WA: {item.noWhatsapp}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onNavigateToVerification('menunggu')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                  >
                    Verifikasi Aduan
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Semua aduan telah diverifikasi! Tidak ada antrean pending saat ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
