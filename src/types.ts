export type BidangType = 
  | 'pendaftaran_penduduk'
  | 'pencatatan_sipil'
  | 'piak';

export type StatusAduan = 
  | 'menunggu'
  | 'proses'
  | 'terverifikasi'
  | 'selesai'
  | 'ditolak';

export interface BidangInfo {
  id: BidangType;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  examples: string[];
}

export interface AttachmentFile {
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // base64 preview
}

export interface Complaint {
  id: string; // Ticket e.g. TK-TNB-20260726-001
  nik: string;
  namaLengkap: string;
  noWhatsapp: string;
  email: string;
  bidang: BidangType;
  permasalahan: string;
  dokumenUtamaType: string; // e.g. 'Kartu Keluarga (KK)', 'KTP-el', 'Akta Kelahiran', dll
  attachment?: AttachmentFile;
  syaratKetentuanAccepted: boolean;
  tanggalPengaduan: string; // ISO String
  status: StatusAduan;
  catatanPetugas?: string;
  tanggalVerifikasi?: string;
  petugasVerifikasi?: string;
  generatedPdfUrl?: string;
  emailSent?: boolean;
  emailSentAt?: string;
  emailMessageId?: string;
}

export interface OfficerConfig {
  namaPejabat: string;
  jabatanPejabat: string;
  nomorWhatsapp: string; // e.g. 6281234567890
  emailDinas: string;
  alamatKantor: string;
}

export type BidangOfficerConfigs = Record<BidangType, OfficerConfig>;

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
  registeredAt?: string;
}

export interface ReportFilter {
  startDate: string;
  endDate: string;
  bidang: string; // 'all' or BidangType
  status: string; // 'all' or StatusAduan
}
