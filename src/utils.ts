import { CalonSiswa, Kegiatan } from './types';
import { saveLogosToFirestore } from './firebaseSync';

// @ts-ignore
import perpusImg from './assets/images/sdn4_perpus_1780119704306.png';
// @ts-ignore
import taniImg from './assets/images/sdn4_tani_1780119732986.png';
// @ts-ignore
import kelasImg from './assets/images/sdn4_kelas_1780119751226.png';
// @ts-ignore
import bersihImg from './assets/images/sdn4_bersih_1780119770388.png';

// Hitung usia per 1 Juli 2026
export function hitungUsia(birthDateStr: string): { tahun: number; bulan: number } {
  if (!birthDateStr) return { tahun: 0, bulan: 0 };
  
  const birthDate = new Date(birthDateStr);
  const targetDate = new Date('2026-07-01'); // Cut-off SPMB TA 2026/2027
  
  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && targetDate.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  
  if (targetDate.getDate() < birthDate.getDate()) {
    months--;
    if (months < 0) {
      months = 11;
      years--;
    }
  }
  
  return {
    tahun: Math.max(0, years),
    bulan: Math.max(0, months)
  };
}

export function generateRegistrationId(): string {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `SPMB-2026-${randNum}`;
}

export function getWAUrl(whatsappNumber: string, message: string): string {
  // bersihkan nomor dari spasi atau strip
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  // format internasional (ubah 08... ke 628...)
  let formattedNumber = cleanNumber;
  if (cleanNumber.startsWith('0')) {
    formattedNumber = '62' + cleanNumber.substring(1);
  }
  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
}

// Mock registrations to prepopulate local storage if empty
export const MOCK_REGISTRATIONS: CalonSiswa[] = [
  {
    id: 'SPMB-2026-4821',
    namaLengkap: 'Budi Santoso',
    nik: '3315012304190001',
    jenisKelamin: 'L',
    tempatLahir: 'Grobogan',
    tanggalLahir: '2019-04-12', // 7 tahun 2 bulan per Juli 2026
    nisn: '19041289',
    alamatLengkap: 'Dusun Tambak RT 03 RW 01, Desa Kronggen',
    rt: '03',
    rw: '01',
    desa: 'Kronggen',
    kecamatan: 'Brati',
    kabupaten: 'Grobogan',
    jarakKeSekolah: 350,
    namaAyah: 'Wahyudi Santoso',
    pekerjaanAyah: 'Buruh Tani',
    namaIbu: 'Siti Rahmawati',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpOrangTua: '081234567890',
    jalur: 'domisili',
    usiaTahun: 7,
    usiaBulan: 2,
    hasAkta: true,
    hasKK: true,
    hasSPTJM: true,
    hasSKKB: true,
    tanggalDaftar: '2026-05-20T08:30:00Z',
    status: 'Diterima'
  },
  {
    id: 'SPMB-2026-8912',
    namaLengkap: 'Ayu Lestari',
    nik: '3315025508190002',
    jenisKelamin: 'P',
    tempatLahir: 'Semarang',
    tanggalLahir: '2019-08-15', // 6 tahun 10 bulan per Juli 2026
    nisn: '19081523',
    alamatLengkap: 'Jl. Raya Kronggen No. 12, RT 01 RW 02, Desa Kronggen',
    rt: '01',
    rw: '02',
    desa: 'Kronggen',
    kecamatan: 'Brati',
    kabupaten: 'Grobogan',
    jarakKeSekolah: 150,
    namaAyah: 'Joko Susilo',
    pekerjaanAyah: 'Pedagang',
    namaIbu: 'Tri Astuti',
    pekerjaanIbu: 'Guru PAUD',
    noHpOrangTua: '085244556677',
    jalur: 'domisili',
    usiaTahun: 6,
    usiaBulan: 10,
    hasAkta: true,
    hasKK: true,
    hasSPTJM: true,
    hasSKKB: true,
    tanggalDaftar: '2026-05-22T09:15:00Z',
    status: 'Diterima'
  },
  {
    id: 'SPMB-2026-1182',
    namaLengkap: 'Dimas Wijaya',
    nik: '3315011112200003',
    jenisKelamin: 'L',
    tempatLahir: 'Grobogan',
    tanggalLahir: '2020-12-10', // 5 tahun 6 bulan lebih sedikit, butuh rekomendasi
    nisn: '',
    alamatLengkap: 'Dusun Gedad RT 04 RW 03, Desa Kronggen',
    rt: '04',
    rw: '03',
    desa: 'Kronggen',
    kecamatan: 'Brati',
    kabupaten: 'Grobogan',
    jarakKeSekolah: 800,
    namaAyah: 'Slamet Wijaya',
    pekerjaanAyah: 'Karyawan Swasta',
    namaIbu: 'Endang Ningsih',
    pekerjaanIbu: 'Penjahit',
    noHpOrangTua: '087788990011',
    jalur: 'domisili',
    usiaTahun: 5,
    usiaBulan: 6,
    hasAkta: true,
    hasKK: true,
    hasSPTJM: true,
    hasSKKB: false,
    tanggalDaftar: '2026-05-24T10:45:00Z',
    status: 'Pending'
  },
  {
    id: 'SPMB-2026-3392',
    namaLengkap: 'Fatimah Az Zahra',
    nik: '3315014402190004',
    jenisKelamin: 'P',
    tempatLahir: 'Grobogan',
    tanggalLahir: '2019-02-04', // 7 tahun 4 bulan
    nisn: '19020477',
    alamatLengkap: 'Kampung Suro RT 02 RW 01, Desa Kronggen',
    rt: '02',
    rw: '01',
    desa: 'Kronggen',
    kecamatan: 'Brati',
    kabupaten: 'Grobogan',
    jarakKeSekolah: 1200,
    namaAyah: 'Rahmat Hidayat',
    pekerjaanAyah: 'Petani',
    namaIbu: 'Sumarni',
    pekerjaanIbu: 'Pedagang Sayur',
    noHpOrangTua: '081223344556',
    jalur: 'afirmasi',
    usiaTahun: 7,
    usiaBulan: 4,
    hasAkta: true,
    hasKK: true,
    hasSPTJM: true,
    hasSKKB: true,
    tanggalDaftar: '2026-05-25T11:20:00Z',
    status: 'Diterima'
  }
];

export function loadRegistrations(): CalonSiswa[] {
  // Try fallback to check both keys for backwards-compatibility or ease of access
  const saved = localStorage.getItem('spmb_registrations') || localStorage.getItem('ppdb_registrations');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  // If empty, save the mock ones
  localStorage.setItem('spmb_registrations', JSON.stringify(MOCK_REGISTRATIONS));
  return MOCK_REGISTRATIONS;
}

export function saveRegistrations(regs: CalonSiswa[]): void {
  try {
    localStorage.setItem('spmb_registrations', JSON.stringify(regs));
  } catch (e) {
    console.error('Gagal menyimpan data pendaftaran ke LocalStorage:', e);
  }
}

// ==========================================
// KONSISTENSI DATA PRAKTIK BAIK (KEGIATAN)
// ==========================================

export const DEFAULT_KEGIATAN: Kegiatan[] = [
  {
    id: 'K-001',
    judul: 'Eksplorasi Literasi & Perpustakaan Ramah Anak',
    deskripsi: 'Siswa-siswi secara aktif memanfaatkan fasilitas Perpustakaan SD Negeri 4 Kronggen yang nyaman. Dengan slogan "Membaca Adalah Jendela Dunia" dan Pojok Baca yang tertata rapi, program ini sukses menanamkan minat baca tinggi dan kecerdasan intelektual sejak usia dini.',
    tanggalKegiatan: 'Setiap Hari Efektif',
    kategori: 'Akademik & Literasi',
    imageUrl: perpusImg
  },
  {
    id: 'K-002',
    judul: 'Lahan Tani Cilik: Budidaya Tanaman Jagung',
    deskripsi: 'Siswa terjun langsung menanam dan merawat bibit jagung di area kebun praktek sekolah "Lahan Tani Cilik". Melalui program terpadu ini, siswa belajar sistem pengairan, pemupukan organik mandiri, dan menumbuhkan karakter cinta lingkungan serta kewirausahaan.',
    tanggalKegiatan: 'Setiap Bulan',
    kategori: 'Sains & Praktik Alam',
    imageUrl: taniImg
  },
  {
    id: 'K-003',
    judul: 'Pembiasaan Karakter & Doa Bersama di Kelas',
    deskripsi: 'Menanamkan nilai-nilai keagamaan dan budi pekerti luhur di lingkungan kelas. Sebelum proses belajar mengajar dimulai, siswa duduk bersama dengan tertib untuk melantunkan doa harian serta membiasakan akhlak mulia dalam bimbingan bapak/ibu guru.',
    tanggalKegiatan: 'Setiap Pagi Hari',
    kategori: 'Keagamaan & Karakter',
    imageUrl: kelasImg
  },
  {
    id: 'K-004',
    judul: 'AKSI SASI SASA (Satu Siswa Satu Sapu) & Kerja Bakti',
    deskripsi: 'Aksi nyata bergotong royong menjaga keasrian lingkungan hidup di Sekolah Adiwiyata. Siswa secara terjadwal merawat halaman, menyapu selasar kelas, dan memilah sampah plastik guna diolah kembali demi iklim belajar yang sehat dan bersih.',
    tanggalKegiatan: 'Setiap Hari Jumat',
    kategori: 'Lingkungan & Sosial',
    imageUrl: bersihImg
  }
];

export function loadKegiatan(): Kegiatan[] {
  const saved = localStorage.getItem('spmb_kegiatan_praktik_baik');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Auto-migrate to our 4 beautiful custom photographic kegiatan if older entries exist (like length !== 4 or containing unsplash placeholders)
      const hasOldPlaceholder = Array.isArray(parsed) && (
        parsed.length !== 4 || 
        parsed.some(k => k.imageUrl && k.imageUrl.includes('images.unsplash.com'))
      );
      if (hasOldPlaceholder) {
        localStorage.setItem('spmb_kegiatan_praktik_baik', JSON.stringify(DEFAULT_KEGIATAN));
        return DEFAULT_KEGIATAN;
      }
      return parsed;
    } catch (e) {
      console.error('Gagal memuat data Kegiatan dari LocalStorage:', e);
    }
  }
  // Set default templates if absent
  localStorage.setItem('spmb_kegiatan_praktik_baik', JSON.stringify(DEFAULT_KEGIATAN));
  return DEFAULT_KEGIATAN;
}

export function saveKegiatan(activities: Kegiatan[]): boolean {
  try {
    localStorage.setItem('spmb_kegiatan_praktik_baik', JSON.stringify(activities));
    return true;
  } catch (e) {
    console.error('Gagal menyimpan data Kegiatan ke LocalStorage:', e);
    return false;
  }
}

// ==========================================
// CENTRALIZED SERVER-SIDE SYNC HELPERS
// ==========================================

export async function syncRegistrationsToServer(students: CalonSiswa[]): Promise<boolean> {
  // Directly returns true, as registrations are synced in real-time on mutation
  return true;
}

export async function syncKegiatanToServer(kegiatan: Kegiatan[]): Promise<boolean> {
  // Directly returns true, as kegiatan are synced in real-time on mutation
  return true;
}

export async function syncLogosToServer(sdnLogo: string | null, dinasLogo: string | null): Promise<boolean> {
  try {
    // Write directly to Firestore
    await saveLogosToFirestore(sdnLogo, dinasLogo);

    // Fallback optional API ping for development
    try {
      await fetch('/api/sync/logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdnLogo, dinasLogo })
      });
    } catch (e) {
      // Ignored gracefully on serverless deployments like Vercel
    }
    return true;
  } catch (e) {
    console.error('Gagal menyinkronkan logo ke Firestore:', e);
    return false;
  }
}

