import * as XLSX from 'xlsx';
import { Complaint, OfficerConfig } from '../types';
import { BIDANG_LIST } from '../data/constants';
import { formatDateID, formatDateShort } from './pdfGenerator';

const getBidangName = (bidangKey: string): string => {
  const b = BIDANG_LIST.find(item => item.id === bidangKey);
  return b ? b.title : bidangKey;
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'menunggu': return 'Menunggu Verifikasi';
    case 'proses': return 'Dalam Proses';
    case 'terverifikasi': return 'Disetujui / Terverifikasi';
    case 'selesai': return 'Selesai';
    case 'ditolak': return 'Ditolak';
    default: return status;
  }
};

export const exportComplaintsToExcel = (
  complaints: Complaint[],
  filterInfo: { startDate: string; endDate: string; bidangTitle: string; statusTitle: string },
  officerConfig: OfficerConfig
): void => {
  // Title Rows
  const titleRows = [
    ['PEMERINTAH KABUPATEN KEPULAUAN TANIMBAR'],
    ['DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL'],
    ['LAPORAN REKAPITULASI PENGADUAN LAYANAN KEPENDUDUKAN'],
    [`Periode: ${filterInfo.startDate || 'Semua Tanggal'} s/d ${filterInfo.endDate || 'Hari Ini'} | Kategori: ${filterInfo.bidangTitle} | Status: ${filterInfo.statusTitle}`],
    []
  ];

  // Header row
  const headers = [
    'No',
    'Nomor Tiket',
    'Tanggal Pengaduan',
    'Nama Lengkap Pemohon',
    'NIK Pemohon',
    'Nomor WhatsApp',
    'Email Pemohon',
    'Bidang Pengaduan',
    'Dokumen Utama',
    'Uraian Permasalahan',
    'Status Aduan',
    'Tanggal Verifikasi',
    'Petugas Verifikasi',
    'Catatan Petugas'
  ];

  // Data rows
  const dataRows = complaints.map((c, index) => [
    index + 1,
    c.id,
    formatDateID(c.tanggalPengaduan),
    c.namaLengkap,
    `'${c.nik}`, // Single quote prefix forces string formatting for 16-digit NIK
    `'${c.noWhatsapp}`,
    c.email,
    getBidangName(c.bidang),
    c.dokumenUtamaType,
    c.permasalahan,
    getStatusText(c.status),
    c.tanggalVerifikasi ? formatDateID(c.tanggalVerifikasi) : '-',
    c.petugasVerifikasi || '-',
    c.catatanPetugas || '-'
  ]);

  const worksheetData = [...titleRows, headers, ...dataRows];

  // Create sheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Auto-fit column widths
  const colWidths = [
    { wch: 6 },  // No
    { wch: 22 }, // No Tiket
    { wch: 20 }, // Tanggal
    { wch: 25 }, // Nama
    { wch: 22 }, // NIK
    { wch: 18 }, // No WA
    { wch: 25 }, // Email
    { wch: 35 }, // Bidang
    { wch: 20 }, // Dokumen
    { wch: 45 }, // Permasalahan
    { wch: 20 }, // Status
    { wch: 20 }, // Tgl Verifikasi
    { wch: 22 }, // Petugas
    { wch: 35 }  // Catatan
  ];

  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Pengaduan');

  // Export file
  const fileName = `Laporan_Pengaduan_Disdukcapil_Tanimbar_${filterInfo.startDate}_sd_${filterInfo.endDate}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
