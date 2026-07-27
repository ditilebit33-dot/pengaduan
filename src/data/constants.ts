import { BidangInfo, OfficerConfig, BidangOfficerConfigs, Complaint } from '../types';

export const BIDANG_LIST: BidangInfo[] = [
  {
    id: 'pendaftaran_penduduk',
    title: 'Bidang Pelayanan Pendaftaran Penduduk',
    shortTitle: 'Pendaftaran Penduduk',
    description: 'Silahkan memberikan aduan terkait dengan pendaftaran penduduk (KK, KTP, KIA, SKPWNI, SKDWNI dll)',
    iconName: 'FileText',
    examples: ['Kartu Keluarga (KK)', 'KTP-el / IKD', 'Kartu Identitas Anak (KIA)', 'Surat Pindah (SKPWNI/SKDWNI)', 'Perubahan Data KK']
  },
  {
    id: 'pencatatan_sipil',
    title: 'Bidang Pelayanan Pencatatan Sipil',
    shortTitle: 'Pencatatan Sipil',
    description: 'Silahkan memberikan aduan terkait dengan pencatatan sipil (Akta Kelahiran, Akta Kematian, Akta Perkawinan, Akta Perceraian dll)',
    iconName: 'Award',
    examples: ['Akta Kelahiran', 'Akta Kematian', 'Akta Perkawinan', 'Akta Perceraian', 'Akta Pengakuan Anak']
  },
  {
    id: 'piak',
    title: 'Bidang Pengelolaan Informasi Administrasi Kependudukan (PIAK)',
    shortTitle: 'PIAK & Data Kependudukan',
    description: 'Silahkan memberikan aduan terkait dengan tidak sinkronnya data kependudukan dan data Lembaga pengguna',
    iconName: 'Database',
    examples: ['Data NIK tidak aktif/sinkron di BPJS', 'Data tidak terdeteksi di Bank / Pajak / SIM', 'Perubahan elemen data Belum Update', 'Konsolidasi Data NIK Nasional']
  }
];

export const DEFAULT_OFFICER_CONFIGS: BidangOfficerConfigs = {
  pendaftaran_penduduk: {
    namaPejabat: 'Drs. Herman Lerebulan, M.Si',
    jabatanPejabat: 'Kabid Pelayanan Pendaftaran Penduduk',
    nomorWhatsapp: '6282198765431',
    emailDinas: 'pendaftaran.disdukcapil@kepulauantanimbar.go.id',
    alamatKantor: 'Jl. Ir. Soekarno, Saumlaki, Kab. Kepulauan Tanimbar'
  },
  pencatatan_sipil: {
    namaPejabat: 'Yosep Ratu, S.SOS',
    jabatanPejabat: 'Kabid Pelayanan Pencatatan Sipil',
    nomorWhatsapp: '6282198765432',
    emailDinas: 'capilsipil.disdukcapil@kepulauantanimbar.go.id',
    alamatKantor: 'Jl. Ir. Soekarno, Saumlaki, Kab. Kepulauan Tanimbar'
  },
  piak: {
    namaPejabat: 'Maria Fatlolon, S.STP',
    jabatanPejabat: 'Kabid PIAK & Pemanfaatan Data Kependudukan',
    nomorWhatsapp: '6282198765433',
    emailDinas: 'piak.disdukcapil@kepulauantanimbar.go.id',
    alamatKantor: 'Jl. Ir. Soekarno, Saumlaki, Kab. Kepulauan Tanimbar'
  }
};

export const DEFAULT_OFFICER_CONFIG: OfficerConfig = DEFAULT_OFFICER_CONFIGS.pendaftaran_penduduk;

export const INITIAL_COMPLAINTS: Complaint[] = [];
