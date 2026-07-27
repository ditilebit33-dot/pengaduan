import { Complaint, OfficerConfig } from '../types';
import { BIDANG_LIST } from '../data/constants';
import { formatDateID } from './pdfGenerator';

export const buildOfficerWhatsappLink = (
  complaint: Complaint,
  officerConfig: OfficerConfig
): string => {
  const bidangObj = BIDANG_LIST.find(b => b.id === complaint.bidang);
  const bidangTitle = bidangObj ? bidangObj.title : complaint.bidang;

  const lampiranInfo = complaint.attachment 
    ? `Lampiran File: ${complaint.attachment.name} (${Math.round(complaint.attachment.size / 1024)} KB) - [PDF/Dokumen Tergenerate]`
    : 'Dokumen Fisik Diserahkan saat verifikasi di kantor / Tidak mengunggah file';

  const messageText = `*PENGADUAN BARU - DISDUKCAPIL KAB. KEPULAUAN TANIMBAR*

*Nomor Tiket:* ${complaint.id}
*Tanggal:* ${formatDateID(complaint.tanggalPengaduan)}

*DATA PEMOHON:*
• *Nama Lengkap:* ${complaint.namaLengkap}
• *NIK:* ${complaint.nik}
• *No. WA Pemohon:* ${complaint.noWhatsapp}
• *Email:* ${complaint.email}

*BIDANG PENGADUAN:*
_${bidangTitle}_

*JENIS DOKUMEN:*
${complaint.dokumenUtamaType || 'Dokumen Kependudukan'}

*DESKRIPSI PERMASALAHAN:*
"${complaint.permasalahan}"

*DOKUMEN PENDUKUNG:*
${lampiranInfo}

---
_Pesan otomatis dari Sistem Layanan Pengaduan Disdukcapil Kabupaten Kepulauan Tanimbar. Formulir dan Tiket PDF telah tergenerate otomatis dan tersimpan di database._`;

  // Clean WhatsApp phone number (remove +, -, spaces, ensure 62 prefix)
  let cleanNumber = officerConfig.nomorWhatsapp.replace(/\D/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.slice(1);
  }

  const encodedMessage = encodeURIComponent(messageText);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
};

export const buildCitizenNotificationWhatsappLink = (
  complaint: Complaint
): string => {
  let cleanNumber = complaint.noWhatsapp.replace(/\D/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.slice(1);
  }

  let statusTitle = '';
  switch (complaint.status) {
    case 'proses': statusTitle = 'Sedang Diproses'; break;
    case 'terverifikasi': statusTitle = 'Disetujui / Terverifikasi'; break;
    case 'selesai': statusTitle = 'SELESAI DILAYANI'; break;
    case 'ditolak': statusTitle = 'Ditolak / Perlu Perbaikan'; break;
    default: statusTitle = 'Update Status';
  }

  const messageText = `*UPDATE STATUS PENGADUAN - DISDUKCAPIL KEPULAUAN TANIMBAR*

Yth. *${complaint.namaLengkap}* (NIK: ${complaint.nik}),

Memberitahukan status terbaru pengaduan Anda di Dinas Kependudukan dan Pencatatan Sipil Kabupaten Kepulauan Tanimbar:

*No. Tiket:* ${complaint.id}
*Status Terbaru:* *${statusTitle.toUpperCase()}*
${complaint.catatanPetugas ? `*Catatan Petugas:* "${complaint.catatanPetugas}"` : ''}

Terima kasih atas kepercayaan Anda menggunakan Layanan Pengaduan Disdukcapil Kepulauan Tanimbar.

_Disdukcapil Kabupaten Kepulauan Tanimbar - Saumlaki_`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
};
