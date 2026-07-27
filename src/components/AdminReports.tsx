import React, { useState } from 'react';
import { Complaint, OfficerConfig } from '../types';
import { BIDANG_LIST } from '../data/constants';
import { formatDateShort, formatDateID, generateReportPDF } from '../utils/pdfGenerator';
import { exportComplaintsToExcel } from '../utils/excelExporter';
import { 
  FileSpreadsheet, 
  FileCheck, 
  Download, 
  Calendar, 
  Filter, 
  Building2, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

interface AdminReportsProps {
  complaints: Complaint[];
  officerConfig: OfficerConfig;
}

export const AdminReports: React.FC<AdminReportsProps> = ({ complaints, officerConfig }) => {
  // Report filter states
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(monthAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [bidangFilter, setBidangFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredComplaints = complaints.filter(c => {
    const cDate = c.tanggalPengaduan.slice(0, 10);
    const inDateRange = (!startDate || cDate >= startDate) && (!endDate || cDate <= endDate);
    const matchesBidang = bidangFilter === 'all' || c.bidang === bidangFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return inDateRange && matchesBidang && matchesStatus;
  });

  const getBidangName = (key: string) => {
    if (key === 'all') return 'Semua Bidang Layanan';
    const b = BIDANG_LIST.find(i => i.id === key);
    return b ? b.title : key;
  };

  const getStatusName = (key: string) => {
    switch (key) {
      case 'all': return 'Semua Status';
      case 'menunggu': return 'Menunggu Verifikasi';
      case 'proses': return 'Dalam Proses';
      case 'terverifikasi': return 'Terverifikasi';
      case 'selesai': return 'Selesai';
      case 'ditolak': return 'Ditolak';
      default: return key;
    }
  };

  const handleExportExcel = () => {
    const filterInfo = {
      startDate: startDate || 'Awal',
      endDate: endDate || 'Hari Ini',
      bidangTitle: getBidangName(bidangFilter),
      statusTitle: getStatusName(statusFilter)
    };

    exportComplaintsToExcel(filteredComplaints, filterInfo, officerConfig);
  };

  const handleExportPDF = () => {
    const filterInfo = {
      startDate: startDate || 'Awal',
      endDate: endDate || 'Hari Ini',
      bidangTitle: getBidangName(bidangFilter),
      statusTitle: getStatusName(statusFilter)
    };

    generateReportPDF(filteredComplaints, filterInfo, officerConfig);
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Laporan Rekapitulasi Pengaduan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cetak laporan resmi bulanan/periodik pengaduan masyarakat dalam format Excel (.xlsx) dan PDF (.pdf) lengkap dengan Kop Surat.
          </p>
        </div>

        {/* Quick Export Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            id="btn-export-excel"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Ke Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            id="btn-export-pdf"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Cetak PDF Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Filter Options Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Filter className="w-4 h-4 text-blue-600" />
          Filter Periode & Kategori Laporan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Start Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tanggal Mulai:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tanggal Selesai:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Bidang */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kategori Bidang:
            </label>
            <select
              value={bidangFilter}
              onChange={(e) => setBidangFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Semua Bidang Layanan</option>
              <option value="pendaftaran_penduduk">1. Pendaftaran Penduduk</option>
              <option value="pencatatan_sipil">2. Pencatatan Sipil</option>
              <option value="piak">3. PIAK / Sinkronisasi Data</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Status Aduan:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu">Menunggu Verifikasi</option>
              <option value="proses">Dalam Proses</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            Menampilkan <strong className="text-slate-900">{filteredComplaints.length}</strong> data aduan berdasarkan filter di atas.
          </div>
          <div className="font-semibold text-blue-700">
            Output PDF dilengkapi Kop Surat Resmi & Kolom Tanda Tangan Disdukcapil Tanimbar
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Pratinjau Tabel Laporan
          </h4>
          <span className="text-[11px] text-slate-300">
            Saumlaki, Kab. Kepulauan Tanimbar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3 pl-4">No</th>
                <th className="p-3">No. Tiket</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Nama Pemohon</th>
                <th className="p-3">NIK</th>
                <th className="p-3">Bidang Layanan</th>
                <th className="p-3">Deskripsi Permasalahan</th>
                <th className="p-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 pl-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">{c.id}</td>
                    <td className="p-3 text-slate-500">{formatDateShort(c.tanggalPengaduan)}</td>
                    <td className="p-3 font-semibold text-slate-900">{c.namaLengkap}</td>
                    <td className="p-3 font-mono text-slate-700">{c.nik}</td>
                    <td className="p-3 font-medium text-slate-800">{getBidangName(c.bidang)}</td>
                    <td className="p-3 text-slate-600 truncate max-w-xs">{c.permasalahan}</td>
                    <td className="p-3 pr-4 font-bold uppercase text-[10px]">
                      {c.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada data aduan yang sesuai filter periode tanggal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
