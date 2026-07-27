import React, { useState } from 'react';
import { BidangType, Complaint, AttachmentFile, OfficerConfig } from '../types';
import { BIDANG_LIST } from '../data/constants';
import { generateTicketNumber, addComplaint, updateComplaintEmailStatus, getOfficerForBidang } from '../utils/storage';
import { generateComplaintReceiptPDF } from '../utils/pdfGenerator';
import { buildOfficerWhatsappLink } from '../utils/whatsappHelper';
import { sendComplaintConfirmationEmail } from '../utils/emailService';
import { 
  Send, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckSquare, 
  HelpCircle, 
  FileCheck, 
  Info, 
  Trash2,
  Lock,
  MailCheck
} from 'lucide-react';

interface ComplaintFormProps {
  selectedBidang: BidangType;
  officerConfig: OfficerConfig;
  onSubmitSuccess: (complaint: Complaint, waLink: string) => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  selectedBidang,
  officerConfig,
  onSubmitSuccess
}) => {
  const currentBidangInfo = BIDANG_LIST.find(b => b.id === selectedBidang) || BIDANG_LIST[0];

  // Form states
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nik, setNik] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [dokumenUtamaType, setDokumenUtamaType] = useState(currentBidangInfo.examples[0] || 'Kartu Keluarga (KK)');
  const [permasalahan, setPermasalahan] = useState('');
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const [syaratAccepted, setSyaratAccepted] = useState(false);

  // Validation & Loading states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // Max 5MB
      setErrors(prev => ({ ...prev, attachment: 'Ukuran file maksimal adalah 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string
      });
      setErrors(prev => ({ ...prev, attachment: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!namaLengkap.trim()) {
      newErrors.namaLengkap = 'Nama lengkap sesuai KTP wajib diisi';
    }

    const cleanNik = nik.replace(/\D/g, '');
    if (!cleanNik) {
      newErrors.nik = 'NIK wajib diisi';
    } else if (cleanNik.length !== 16) {
      newErrors.nik = `NIK harus persis 16 digit angka (saat ini ${cleanNik.length} digit)`;
    }

    const cleanWa = noWhatsapp.replace(/\D/g, '');
    if (!cleanWa) {
      newErrors.noWhatsapp = 'Nomor WhatsApp wajib diisi';
    } else if (cleanWa.length < 10) {
      newErrors.noWhatsapp = 'Nomor WhatsApp tidak valid (minimal 10 digit)';
    }

    if (!email.trim()) {
      newErrors.email = 'Alamat email wajib diisi (tiket akan dikirim ke email)';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format alamat email tidak valid';
    }

    if (!permasalahan.trim()) {
      newErrors.permasalahan = 'Deskripsi permasalahan pengaduan wajib diisi';
    } else if (permasalahan.trim().length < 15) {
      newErrors.permasalahan = 'Jelaskan permasalahan dengan lebih detail (minimal 15 karakter)';
    }

    if (!syaratAccepted) {
      newErrors.syarat = 'Anda harus menyetujui Syarat dan Ketentuan keabsahan data';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketId = generateTicketNumber();
      const newComplaint: Complaint = {
        id: ticketId,
        nik: nik.replace(/\D/g, ''),
        namaLengkap: namaLengkap.trim(),
        noWhatsapp: noWhatsapp.trim(),
        email: email.trim(),
        bidang: selectedBidang,
        permasalahan: permasalahan.trim(),
        dokumenUtamaType,
        attachment: attachment || undefined,
        syaratKetentuanAccepted: true,
        tanggalPengaduan: new Date().toISOString(),
        status: 'menunggu'
      };

      // 1. Store in database (LocalStorage / Cloud)
      addComplaint(newComplaint);

      // 2. Dispatch Confirmation Email Notification Service
      const emailResult = await sendComplaintConfirmationEmail(newComplaint, currentBidangInfo.title);
      let finalComplaint = newComplaint;
      
      if (emailResult.success) {
        const updated = updateComplaintEmailStatus(newComplaint.id, true, emailResult.messageId);
        if (updated) {
          finalComplaint = updated;
        }
      }

      // Resolve officer configuration specific to the selected bidang
      const targetOfficer = getOfficerForBidang(selectedBidang) || officerConfig;

      // 3. Generate PDF document automatically
      generateComplaintReceiptPDF(finalComplaint, targetOfficer, 'download');

      // 4. Build WhatsApp Direct Link to Officer
      const waLink = buildOfficerWhatsappLink(finalComplaint, targetOfficer);

      // 5. Callback to trigger success modal with email status
      onSubmitSuccess(finalComplaint, waLink);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      alert('Terjadi kesalahan saat menyimpan data pengaduan. Silahkan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Form Header Banner */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">
              Langkah 2 Dari 2
            </span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Formulir Pengaduan: {currentBidangInfo.shortTitle}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Isi data diri dan uraian permasalahan dengan jujur dan lengkap.
            </p>
          </div>
          <div className="bg-slate-800/90 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data Anda Terjamin Kerahasiannya</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {/* Identitas Pemohon Section */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Data Identitas Pemohon
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap (Sesuai KTP/KK) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Petrus Lerebulan"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all ${
                  errors.namaLengkap
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.namaLengkap && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.namaLengkap}
                </p>
              )}
            </div>

            {/* NIK */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={16}
                  placeholder="81030xxxxxxxxxxx"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-3.5 py-2.5 text-sm font-mono tracking-wider rounded-xl border transition-all ${
                    errors.nik
                      ? 'border-red-500 bg-red-50/50 focus:ring-red-200'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <span className="absolute right-3 top-3 text-[11px] font-mono text-slate-400">
                  {nik.length}/16
                </span>
              </div>
              {errors.nik ? (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.nik}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Wilayah Kab. Kepulauan Tanimbar biasanya diawali NIK 8103.
                </p>
              )}
            </div>

            {/* No WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="081234567890"
                value={noWhatsapp}
                onChange={(e) => setNoWhatsapp(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all ${
                  errors.noWhatsapp
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.noWhatsapp && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.noWhatsapp}
                </p>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                Nomor ini akan menerima pesan update status aduan dari petugas.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Aktif <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all ${
                  errors.email
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.email ? (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              ) : (
                <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Tiket pengaduan & bukti registrasi akan terkirim ke email ini.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detail Rincian Pengaduan Section */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Detail Permasalahan & Jenis Layanan
          </h4>

          <div className="space-y-4">
            {/* Jenis Dokumen / Sub-layanan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Dokumen / Layanan Terkait <span className="text-red-500">*</span>
              </label>
              <select
                value={dokumenUtamaType}
                onChange={(e) => setDokumenUtamaType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {currentBidangInfo.examples.map((ex, idx) => (
                  <option key={idx} value={ex}>{ex}</option>
                ))}
                <option value="Lainnya">Lainnya (Tuliskan di deskripsi)</option>
              </select>
            </div>

            {/* Deskripsi Uraian Permasalahan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Uraian Permasalahan / Aduan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Jelaskan secara rinci permasalahan dokumen kependudukan Anda (misal: kronologi, tanggal pendaftaran, kendala NIK tidak sinkron di bank/BPJS, dll)..."
                value={permasalahan}
                onChange={(e) => setPermasalahan(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all ${
                  errors.permasalahan
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.permasalahan && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.permasalahan}
                </p>
              )}
            </div>

            {/* Upload Dokumen Pendukung */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Dokumen Pendukung (Foto/Scan KK, KTP, Surat Pengantar, dll)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-5 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {!attachment ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700">Pilih file</span> atau tarik file ke sini
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Format disarankan: JPG, PNG, atau PDF (Maksimal 5MB).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-3 text-left">
                      <FileCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-xs">{attachment.name}</p>
                        <p className="text-[11px] text-slate-500">{Math.round(attachment.size / 1024)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachment(null);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Lampiran"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {errors.attachment && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.attachment}
                </p>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                *Dokumen yang diunggah akan digenerate otomatis dalam rangkuman PDF pengaduan agar dapat langsung dibuka pada WhatsApp pejabat pengaduan.
              </p>
            </div>
          </div>
        </div>

        {/* Syarat & Ketentuan Checkbox */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={syaratAccepted}
              onChange={(e) => setSyaratAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Saya menyatakan dengan sesungguhnya bahwa data dan keterangan yang saya berikan adalah <strong>benar dan sah</strong>. Apabila di kemudian hari terbukti tidak benar, saya bersedia bertanggung jawab sesuai dengan peraturan perundang-undangan yang berlaku di Kabupaten Kepulauan Tanimbar.
            </span>
          </label>
          {errors.syarat && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.syarat}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Info Alur:</span> Data tersimpan, tiket terkirim ke Email & WhatsApp Pejabat.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            id="btn-kirim-pengaduan"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Mengirim Email & Generasi PDF...
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Pengaduan & Notifikasi Email</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
