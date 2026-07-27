import React, { useState, useEffect } from 'react';
import { Complaint, OfficerConfig } from '../types';
import { getStoredComplaints } from '../utils/storage';
import { formatDateID, generateComplaintReceiptPDF } from '../utils/pdfGenerator';
import { BIDANG_LIST } from '../data/constants';
import { Search, FileText, Clock, CheckCircle2, AlertCircle, Download, ExternalLink, ShieldCheck, UserCheck, MailCheck } from 'lucide-react';

interface TrackTicketProps {
  initialSearchQuery?: string;
  officerConfig: OfficerConfig;
  onNewComplaintClick: () => void;
}

export const TrackTicket: React.FC<TrackTicketProps> = ({
  initialSearchQuery = '',
  officerConfig,
  onNewComplaintClick
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [searchResult, setSearchResult] = useState<Complaint[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialSearchQuery) {
      handleSearch(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const handleSearch = (queryStr?: string) => {
    const q = (queryStr !== undefined ? queryStr : searchQuery).trim();
    if (!q) return;

    setHasSearched(true);
    const all = getStoredComplaints();
    const cleanQ = q.toLowerCase().replace(/\s+/g, '');

    const found = all.filter(c => {
      const ticketMatch = c.id.toLowerCase().includes(cleanQ);
      const nikMatch = c.nik.includes(q.replace(/\D/g, ''));
      const nameMatch = c.namaLengkap.toLowerCase().includes(q.toLowerCase());
      return ticketMatch || (q.replace(/\D/g, '').length >= 6 && nikMatch) || (q.length >= 3 && nameMatch);
    });

    setSearchResult(found);
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'menunggu':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi</span>;
      case 'proses':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Dalam Proses</span>;
      case 'terverifikasi':
        return <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Disetujui / Terverifikasi</span>;
      case 'selesai':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai Dilayani</span>;
      case 'ditolak':
        return <span className="bg-red-100 text-red-800 border border-red-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Ditolak / Perlu Perbaikan</span>;
      default:
        return null;
    }
  };

  const getBidangTitle = (key: string) => {
    const b = BIDANG_LIST.find(i => i.id === key);
    return b ? b.title : key;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl text-center relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-xl mx-auto">
          <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
            Layanan Mandiri Masyarakat
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Lacak Status Tiket Pengaduan
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mb-6">
            Masukkan Nomor Tiket (contoh: TK-TNB-20260726-001) atau 16 Digit NIK Anda untuk memantau status tindak lanjut petugas.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Nomor Tiket (TK-TNB-...) atau NIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <span>Cari Aduan</span>
            </button>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Hasil Pencarian ({searchResult ? searchResult.length : 0} Pengaduan Ditemukan)
            </h3>
            {searchResult && searchResult.length > 0 && (
              <span className="text-xs text-slate-500">
                Menampilkan aduan sesuai pencarian
              </span>
            )}
          </div>

          {searchResult && searchResult.length > 0 ? (
            <div className="space-y-6">
              {searchResult.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-5">
                  {/* Top Bar Ticket & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-mono font-semibold block">
                        NOMOR TIKET
                      </span>
                      <span className="text-lg font-mono font-bold text-blue-700">
                        {c.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(c.status)}
                      <button
                        onClick={() => generateComplaintReceiptPDF(c, officerConfig, 'download')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
                        title="Unduh Bukti PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>PDF Bukti</span>
                      </button>
                    </div>
                  </div>

                  {/* Citizen Info & Bidang Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 font-medium block">Nama Pemohon</span>
                      <span className="font-bold text-slate-900 text-sm">{c.namaLengkap}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 font-medium block">NIK Pemohon</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{c.nik}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2 md:col-span-1">
                      <span className="text-slate-400 font-medium block">Tanggal Registrasi</span>
                      <span className="font-semibold text-slate-900">{formatDateID(c.tanggalPengaduan)}</span>
                    </div>
                  </div>

                  {/* Category, Email & Permasalahan */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-blue-50 text-blue-900 font-semibold text-xs px-2.5 py-1 rounded-md border border-blue-200 inline-block">
                        {getBidangTitle(c.bidang)}
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 font-medium text-xs px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                        <MailCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Konfirmasi Email: {c.email}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Uraian Permasalahan:
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed italic">
                        "{c.permasalahan}"
                      </p>
                    </div>
                  </div>

                  {/* Officer Notes & Status Timeline */}
                  {c.catatanPetugas && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Catatan & Tindak Lanjut Petugas Disdukcapil:</span>
                      </div>
                      <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                        {c.catatanPetugas}
                      </p>
                      {c.tanggalVerifikasi && (
                        <span className="text-[10px] text-emerald-700 mt-2 block font-normal">
                          Diperbarui pada: {formatDateID(c.tanggalVerifikasi)} oleh {c.petugasVerifikasi || 'Petugas Disdukcapil'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Tidak Ada Data Pengaduan Ditemukan</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Silahkan periksa kembali Nomor Tiket atau NIK yang Anda masukkan. Pastikan sesuai dengan saat pendaftaran.
                </p>
              </div>
              <button
                onClick={onNewComplaintClick}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-colors inline-block"
              >
                Buat Pengaduan Baru Sekarang
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
