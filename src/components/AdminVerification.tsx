import React, { useState } from 'react';
import { Complaint, StatusAduan, OfficerConfig } from '../types';
import { updateComplaintStatus } from '../utils/storage';
import { generateComplaintReceiptPDF, formatDateID } from '../utils/pdfGenerator';
import { buildCitizenNotificationWhatsappLink } from '../utils/whatsappHelper';
import { BIDANG_LIST } from '../data/constants';
import { 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  X, 
  FileText,
  Save,
  Send,
  ExternalLink
} from 'lucide-react';

interface AdminVerificationProps {
  complaints: Complaint[];
  initialStatusFilter?: string;
  officerConfig: OfficerConfig;
  onComplaintsUpdated: () => void;
}

export const AdminVerification: React.FC<AdminVerificationProps> = ({
  complaints,
  initialStatusFilter = 'all',
  officerConfig,
  onComplaintsUpdated
}) => {
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [bidangFilter, setBidangFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active detail modal complaint
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Edit fields inside modal
  const [editStatus, setEditStatus] = useState<StatusAduan>('menunggu');
  const [catatanPetugas, setCatatanPetugas] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesBidang = bidangFilter === 'all' || c.bidang === bidangFilter;
    
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      c.id.toLowerCase().includes(q) ||
      c.namaLengkap.toLowerCase().includes(q) ||
      c.nik.includes(q) ||
      c.noWhatsapp.includes(q) ||
      c.permasalahan.toLowerCase().includes(q);

    return matchesStatus && matchesBidang && matchesSearch;
  });

  const openDetailModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setEditStatus(complaint.status);
    setCatatanPetugas(complaint.catatanPetugas || '');
  };

  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsSaving(true);
    try {
      const updated = updateComplaintStatus(
        selectedComplaint.id,
        editStatus,
        catatanPetugas.trim(),
        officerConfig.namaPejabat
      );

      if (updated) {
        setSelectedComplaint(updated);
        onComplaintsUpdated();
        alert(`Status aduan ${updated.id} berhasil diperbarui menjadi ${editStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendWhatsappCitizen = () => {
    if (!selectedComplaint) return;
    const link = buildCitizenNotificationWhatsappLink(selectedComplaint);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status: StatusAduan) => {
    switch (status) {
      case 'menunggu':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-300">Menunggu</span>;
      case 'proses':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-300">Diproses</span>;
      case 'terverifikasi':
        return <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-indigo-300">Terverifikasi</span>;
      case 'selesai':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300">Selesai</span>;
      case 'ditolak':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-300">Ditolak</span>;
    }
  };

  const getBidangName = (key: string) => {
    const b = BIDANG_LIST.find(i => i.id === key);
    return b ? b.shortTitle : key;
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Verifikasi & Tindak Lanjut Pengaduan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola berkas pengaduan kependudukan masuk, ubah status layanan, dan kirim notifikasi ke pemohon.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari Tiket, Nama, NIK, No WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Semua Status ({complaints.length})</option>
              <option value="menunggu">Menunggu ({complaints.filter(c => c.status === 'menunggu').length})</option>
              <option value="proses">Dalam Proses ({complaints.filter(c => c.status === 'proses').length})</option>
              <option value="terverifikasi">Terverifikasi ({complaints.filter(c => c.status === 'terverifikasi').length})</option>
              <option value="selesai">Selesai ({complaints.filter(c => c.status === 'selesai').length})</option>
              <option value="ditolak">Ditolak ({complaints.filter(c => c.status === 'ditolak').length})</option>
            </select>
          </div>

          {/* Bidang Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Bidang:</span>
            <select
              value={bidangFilter}
              onChange={(e) => setBidangFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Semua Bidang</option>
              <option value="pendaftaran_penduduk">Pendaftaran Penduduk</option>
              <option value="pencatatan_sipil">Pencatatan Sipil</option>
              <option value="piak">PIAK / Konsolidasi Data</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-5">No. Tiket</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Pemohon</th>
                <th className="p-3.5">NIK / No WA</th>
                <th className="p-3.5">Bidang & Dokumen</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-blue-700">
                      {item.id}
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {formatDateID(item.tanggalPengaduan)}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {item.namaLengkap}
                      <span className="block text-[11px] font-normal text-slate-500 truncate max-w-xs">{item.email}</span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-mono">
                      <div>{item.nik}</div>
                      <div className="text-slate-500 font-sans text-[11px]">{item.noWhatsapp}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 block">
                        {getBidangName(item.bidang)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.dokumenUtamaType}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => openDetailModal(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail & Verifikasi</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada data pengaduan yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Detail & Status Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-600 font-bold uppercase tracking-wider block">
                  LEMBAR VERIFIKASI PETUGAS DISDUKCAPIL
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-mono">
                  {selectedComplaint.id}
                </h3>
              </div>
              <div>
                {getStatusBadge(selectedComplaint.status)}
              </div>
            </div>

            {/* Citizen Info & Complaint Details */}
            <div className="space-y-4 mb-6 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium block">Nama Pemohon:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedComplaint.namaLengkap}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">NIK Pemohon:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedComplaint.nik}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">WhatsApp:</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.noWhatsapp}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.email}</span>
                </div>
              </div>

              {/* Permasalahan */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">
                  Uraian Permasalahan ({getBidangName(selectedComplaint.bidang)}):
                </span>
                <p className="text-slate-800 leading-relaxed italic">
                  "{selectedComplaint.permasalahan}"
                </p>
              </div>

              {/* File Attachment / Generated PDF Preview Button */}
              <div className="flex items-center justify-between bg-slate-100 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-900 block">Dokumen Pendukung & Form PDF</span>
                    <span className="text-slate-500 text-[11px]">
                      {selectedComplaint.attachment 
                        ? `Lampiran File: ${selectedComplaint.attachment.name}` 
                        : 'Formulir Pengaduan Resmi (Digenerate Otomatis)'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => generateComplaintReceiptPDF(selectedComplaint, officerConfig, 'download')}
                  className="bg-white hover:bg-slate-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm flex items-center gap-1.5 text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen PDF</span>
                </button>
              </div>
            </div>

            {/* Form Update Status & Catatan */}
            <form onSubmit={handleSaveStatusUpdate} className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Ubah Status & Input Catatan Petugas:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Status Baru <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as StatusAduan)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="menunggu">Menunggu Verifikasi</option>
                    <option value="proses">Dalam Proses Diproses</option>
                    <option value="terverifikasi">Disetujui / Terverifikasi</option>
                    <option value="selesai">Selesai Dilayani</option>
                    <option value="ditolak">Ditolak / Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Petugas Verifikasi:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={officerConfig.namaPejabat}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Instuksi Tindak Lanjut Petugas:
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Berkas KTP-el telah disetujui dan siap dicetak di Loket 2 Disdukcapil Saumlaki pada hari Jam Kerja..."
                  value={catatanPetugas}
                  onChange={(e) => setCatatanPetugas(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleSendWhatsappCitizen}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Kirim Notifikasi WA ke Pemohon</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Status Baru</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
