import React from 'react';
import { Complaint, OfficerConfig } from '../types';
import { generateComplaintReceiptPDF } from '../utils/pdfGenerator';
import { CheckCircle2, Download, MessageSquare, ExternalLink, FileText, Search, X, MailCheck, ShieldCheck } from 'lucide-react';

interface ComplaintSuccessModalProps {
  complaint: Complaint;
  waLink: string;
  officerConfig: OfficerConfig;
  onClose: () => void;
  onTrackTicket: (ticketId: string) => void;
}

export const ComplaintSuccessModal: React.FC<ComplaintSuccessModalProps> = ({
  complaint,
  waLink,
  officerConfig,
  onClose,
  onTrackTicket
}) => {
  const handleDownloadPdf = () => {
    generateComplaintReceiptPDF(complaint, officerConfig, 'download');
  };

  const handleOpenWhatsapp = () => {
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
            Pengaduan Berhasil Dikirim
          </span>
          <h3 className="text-xl font-bold text-slate-900">
            Terima Kasih, {complaint.namaLengkap}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Data aduan Anda telah tersimpan di Database Disdukcapil Kepulauan Tanimbar.
          </p>
        </div>

        {/* Ticket ID Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4 border border-slate-800 text-center shadow-md">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">
            NOMOR TIKET PENGADUAN ANDA
          </p>
          <div className="text-2xl font-mono font-bold text-amber-400 tracking-wider">
            {complaint.id}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Simpan nomor tiket ini untuk mengecek progres layanan.
          </p>
        </div>

        {/* Email Dispatch Alert Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 mb-6 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-blue-900">Email Konfirmasi Terkirim</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Sukses</span>
            </div>
            <p className="text-xs text-blue-800 mt-0.5">
              Rincian registrasi & bukti tiket telah dikirimkan ke <span className="font-semibold">{complaint.email}</span>.
            </p>
          </div>
        </div>

        {/* Status Steps Info */}
        <div className="space-y-3 mb-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
            <div>
              <span className="font-semibold text-slate-900">Tersimpan di Database</span>
              <p className="text-slate-500 text-[11px]">Tiket resmi terdaftar di sistem pengaduan Disdukcapil Saumlaki.</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
            <div>
              <span className="font-semibold text-slate-900">Email Konfirmasi Dikirim</span>
              <p className="text-slate-500 text-[11px]">Surat konfirmasi otomatis dikirimkan ke {complaint.email}.</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
            <div>
              <span className="font-semibold text-slate-900">PDF Bukti Otomatis Dihasilkan</span>
              <p className="text-slate-500 text-[11px]">Dokumen bukti aduan telah di-generate secara otomatis.</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</div>
            <div>
              <span className="font-semibold text-slate-900">Kirim Ke WhatsApp Pejabat Aduan</span>
              <p className="text-slate-500 text-[11px]">Klik tombol hijau di bawah untuk langsung membuka WhatsApp Pejabat Pengaduan.</p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3">
          {/* Main Direct WhatsApp Button */}
          <button
            onClick={handleOpenWhatsapp}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Kirim Pesan Ke WhatsApp Pejabat Pengaduan</span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
          </button>

          {/* Download PDF Receipt */}
          <button
            onClick={handleDownloadPdf}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-4 rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Unduh / Cetak Ulang PDF Bukti Pengaduan</span>
          </button>

          {/* Track Ticket */}
          <button
            onClick={() => {
              onTrackTicket(complaint.id);
              onClose();
            }}
            className="w-full text-slate-600 hover:text-slate-900 text-xs py-2 font-medium flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Lihat Status Tiket Di Halaman Pelacakan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
