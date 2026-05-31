export type JalurPendaftaran = 'domisili' | 'afirmasi' | 'mutasi';

export interface CalonSiswa {
  id: string;
  namaLengkap: string;
  nik: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  nisn?: string;
  
  // Alamat & Kontak
  alamatLengkap: string;
  rt: string;
  rw: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  jarakKeSekolah: number; // dalam meter
  
  // Data Orang Tua / Wali
  namaAyah: string;
  pekerjaanAyah: string;
  namaIbu: string;
  pekerjaanIbu: string;
  noHpOrangTua: string;
  
  // Administratif
  jalur: JalurPendaftaran;
  usiaTahun: number;
  usiaBulan: number;
  
  // Kelengkapan Berkas (Checkbox)
  hasAkta: boolean;
  hasKK: boolean;
  hasSPTJM: boolean;
  hasSKKB: boolean;
  
  tanggalDaftar: string;
  status: 'Pending' | 'Terverifikasi' | 'Diterima' | 'Cadangan' | 'Gugur';
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface Kegiatan {
  id: string;
  judul: string;
  deskripsi: string;
  tanggalKegiatan: string;
  kategori: string;
  imageUrl: string;
}
