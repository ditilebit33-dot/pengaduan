import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Complaint, OfficerConfig } from '../types';
import { BIDANG_LIST } from '../data/constants';

// Format Date to Indonesian Local Date
export const formatDateID = (dateString: string): string => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateShort = (dateString: string): string => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getBidangTitle = (bidangKey: string): string => {
  const item = BIDANG_LIST.find(b => b.id === bidangKey);
  return item ? item.title : bidangKey;
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'menunggu': return 'Menunggu Verifikasi';
    case 'proses': return 'Dalam Proses Diproses';
    case 'terverifikasi': return 'Disetujui / Terverifikasi';
    case 'selesai': return 'Selesai Dilayani';
    case 'ditolak': return 'Ditolak';
    default: return status;
  }
};

/**
 * Generates an official PDF receipt & support document summary for individual complaints.
 */
export const generateComplaintReceiptPDF = (
  complaint: Complaint,
  officerConfig: OfficerConfig,
  action: 'download' | 'dataurl' = 'download'
): string | void => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Header / Kop Surat Resmi Disdukcapil Tanimbar ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PEMERINTAH KABUPATEN KEPULAUAN TANIMBAR', pageWidth / 2, 16, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL', pageWidth / 2, 22, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(officerConfig.alamatKantor, pageWidth / 2, 27, { align: 'center' });
  doc.text(`Email: ${officerConfig.emailDinas} | Call Center / WA: +${officerConfig.nomorWhatsapp}`, pageWidth / 2, 31, { align: 'center' });

  // Decorative double line below Kop Surat
  doc.setLineWidth(0.8);
  doc.line(14, 34, pageWidth - 14, 34);
  doc.setLineWidth(0.2);
  doc.line(14, 35.5, pageWidth - 14, 35.5);

  // --- Document Title ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TANDA BUKTI & FORMULIR PENGADUAN LAYANAN KEPENDUDUKAN', pageWidth / 2, 44, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`NO TIKET: ${complaint.id}`, pageWidth / 2, 49, { align: 'center' });

  // Section 1: Informasi Pemohon
  doc.setFillColor(240, 243, 248);
  doc.rect(14, 54, pageWidth - 28, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('I. DATA IDENTITAS PEMOHON', 18, 59);

  doc.setFont('Helvetica', 'normal');
  let y = 67;

  const pemohonData = [
    ['1. Nomor Induk Kependudukan (NIK)', ':', complaint.nik],
    ['2. Nama Lengkap Pemohon', ':', complaint.namaLengkap],
    ['3. Nomor Telepon / WhatsApp', ':', complaint.noWhatsapp],
    ['4. Alamat Email', ':', complaint.email],
    ['5. Tanggal & Waktu Aduan', ':', formatDateID(complaint.tanggalPengaduan)]
  ];

  pemohonData.forEach(([label, sep, val]) => {
    doc.text(label, 18, y);
    doc.text(sep, 85, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(val, 89, y);
    doc.setFont('Helvetica', 'normal');
    y += 6;
  });

  // Section 2: Detail Aduan & Bidang
  y += 4;
  doc.setFillColor(240, 243, 248);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.text('II. RINCIAN PENGADUAN & KATEGORI BIDANG', 18, y + 5);

  y += 12;
  doc.setFont('Helvetica', 'normal');
  doc.text('Bidang Disdukcapil', 18, y);
  doc.text(':', 85, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(getBidangTitle(complaint.bidang), 89, y, { maxWidth: pageWidth - 100 });
  
  y += 8;
  doc.setFont('Helvetica', 'normal');
  doc.text('Jenis Dokumen Utama', 18, y);
  doc.text(':', 85, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(complaint.dokumenUtamaType || 'Dokumen Kependudukan', 89, y);

  y += 8;
  doc.setFont('Helvetica', 'normal');
  doc.text('Status Aduan Saat Ini', 18, y);
  doc.text(':', 85, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(getStatusLabel(complaint.status).toUpperCase(), 89, y);

  // Permasalahan Box
  y += 10;
  doc.setFont('Helvetica', 'bold');
  doc.text('Deskripsi / Uraian Permasalahan:', 18, y);
  y += 4;

  const splitText = doc.splitTextToSize(complaint.permasalahan, pageWidth - 36);
  const boxHeight = Math.max(18, splitText.length * 5 + 6);
  
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(18, y, pageWidth - 36, boxHeight, 2, 2, 'FD');
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(splitText, 22, y + 6);

  y += boxHeight + 8;

  // Section 3: Dokumen Pendukung & Catatan
  doc.setFillColor(240, 243, 248);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('III. LAMPIRAN DOKUMEN PENDUKUNG & VERIFIKASI', 18, y + 5);

  y += 12;
  doc.setFont('Helvetica', 'normal');
  doc.text('Status Upload Dokumen', 18, y);
  doc.text(':', 85, y);
  doc.text(
    complaint.attachment 
      ? `Tersedia - ${complaint.attachment.name} (${Math.round(complaint.attachment.size / 1024)} KB)` 
      : 'Dokumen Fisik Diserahkan Saat Verifikasi / Tidak Mengunggah File',
    89,
    y
  );

  if (complaint.catatanPetugas) {
    y += 8;
    doc.text('Catatan / Tindak Lanjut Petugas', 18, y);
    doc.text(':', 85, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(complaint.catatanPetugas, 89, y, { maxWidth: pageWidth - 100 });
  }

  // Declaration Notice
  y += 16;
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.text(
    'Pernyataan: Pemohon menyatakan bahwa data dan informasi yang diberikan adalah benar dan sah. Formulir aduan ini secara otomatis terdaftar di database Disdukcapil Kab. Kepulauan Tanimbar dan terusan langsung ke WhatsApp Pejabat Pengaduan.',
    18,
    y,
    { maxWidth: pageWidth - 36 }
  );

  // Signature section
  y += 18;
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  
  doc.text('Pemohon Layanan,', 25, y);
  doc.text(`Saumlaki, ${todayStr}`, pageWidth - 70, y);
  doc.text('Dinas Kependudukan & Pencatatan Sipil', pageWidth - 70, y + 5);
  doc.text('Kabupaten Kepulauan Tanimbar', pageWidth - 70, y + 9);

  y += 24;
  doc.setFont('Helvetica', 'bold');
  doc.text(`( ${complaint.namaLengkap} )`, 20, y);
  doc.text(`( ${officerConfig.namaPejabat} )`, pageWidth - 70, y);

  if (action === 'dataurl') {
    return doc.output('datauristring');
  } else {
    doc.save(`Pengaduan_Disdukcapil_Tanimbar_${complaint.id}.pdf`);
  }
};

/**
 * Generates official summary PDF report for Admin Panel based on filtered period.
 */
export const generateReportPDF = (
  complaints: Complaint[],
  filterInfo: { startDate: string; endDate: string; bidangTitle: string; statusTitle: string },
  officerConfig: OfficerConfig
): void => {
  const doc = new jsPDF({
    orientation: 'l', // Landscape for clean multi-column table
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Kop Surat
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PEMERINTAH KABUPATEN KEPULAUAN TANIMBAR', pageWidth / 2, 14, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL', pageWidth / 2, 20, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(officerConfig.alamatKantor, pageWidth / 2, 25, { align: 'center' });
  doc.text(`Email: ${officerConfig.emailDinas} | Call Center: +${officerConfig.nomorWhatsapp}`, pageWidth / 2, 29, { align: 'center' });

  doc.setLineWidth(0.8);
  doc.line(14, 32, pageWidth - 14, 32);
  doc.setLineWidth(0.2);
  doc.line(14, 33.5, pageWidth - 14, 33.5);

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LAPORAN REKAPITULASI LAYANAN PENGADUAN MASYARAKAT', pageWidth / 2, 41, { align: 'center' });

  // Filter Info Metadata
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  const periodText = `Periode: ${filterInfo.startDate || 'Awal'} s.d. ${filterInfo.endDate || 'Hari Ini'} | Kategori: ${filterInfo.bidangTitle} | Status: ${filterInfo.statusTitle}`;
  doc.text(periodText, pageWidth / 2, 46, { align: 'center' });

  // Prepare table data
  const tableHead = [['No', 'No. Tiket', 'Tgl Aduan', 'Nama Pemohon', 'NIK', 'No. WA', 'Bidang', 'Permasalahan', 'Status']];
  
  const tableData = complaints.map((c, index) => [
    index + 1,
    c.id,
    formatDateShort(c.tanggalPengaduan),
    c.namaLengkap,
    c.nik,
    c.noWhatsapp,
    getBidangTitle(c.bidang),
    c.permasalahan.length > 60 ? c.permasalahan.slice(0, 57) + '...' : c.permasalahan,
    getStatusLabel(c.status)
  ]);

  autoTable(doc, {
    startY: 52,
    head: tableHead,
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    headStyles: {
      fillColor: [15, 42, 86], // Dark navy blue Disdukcapil Tanimbar
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 22 },
      3: { cellWidth: 35 },
      4: { cellWidth: 32 },
      5: { cellWidth: 28 },
      6: { cellWidth: 38 },
      7: { cellWidth: 'auto' },
      8: { halign: 'center', cellWidth: 28, fontStyle: 'bold' }
    }
  });

  // Tanda Tangan Block at bottom
  // @ts-ignore
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  
  if (finalY + 45 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
  }

  const signY = Math.max(finalY + 12, 140);
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Saumlaki, ${todayStr}`, pageWidth - 80, signY);
  doc.text('Kepala / Pejabat Layanan Pengaduan', pageWidth - 80, signY + 5);
  doc.text('Disdukcapil Kabupaten Kepulauan Tanimbar', pageWidth - 80, signY + 9);

  doc.setFont('Helvetica', 'bold');
  doc.text(`( ${officerConfig.namaPejabat} )`, pageWidth - 80, signY + 30);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Jabatan: ${officerConfig.jabatanPejabat}`, pageWidth - 80, signY + 34);

  doc.save(`Laporan_Pengaduan_Disdukcapil_Tanimbar_${filterInfo.startDate}_sd_${filterInfo.endDate}.pdf`);
};
