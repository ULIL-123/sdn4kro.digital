/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CalonSiswa, Kegiatan } from './types';
import { loadRegistrations, saveRegistrations, MOCK_REGISTRATIONS, getWAUrl, loadKegiatan, saveKegiatan, DEFAULT_KEGIATAN } from './utils';
import {
  subscribeStudentsRealtime,
  subscribeKegiatanRealtime,
  subscribeLogosRealtime,
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  saveKegiatanToFirestore,
  deleteKegiatanFromFirestore,
  saveLogosToFirestore
} from './firebaseSync';
import ProgramUnggulan from './components/ProgramUnggulan';
import KegiatanPraktikBaik from './components/KegiatanPraktikBaik';
import KuotaStats from './components/KuotaStats';
import RegistrationForm from './components/RegistrationForm';
import RegistrationCard from './components/RegistrationCard';
import Dashboard from './components/Dashboard';
import Sdn4KronggenLogo from './components/Sdn4KronggenLogo';

import { 
  School, Calendar, MapPin, CheckCircle2, Trees, MessageSquare, 
  Clock, ArrowRight, Printer, Search, Menu, X, Phone, Award, 
  BookOpen, HelpCircle, Heart, ChevronRight, UserCheck, FlameKindling, ShieldAlert, Sparkles, Gift 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function TypewriterText({ text, speed = 100 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleType = () => {
      if (!isDeleting) {
        setDisplayedText(text.substring(0, displayedText.length + 1));
        if (displayedText.length + 1 >= text.length) {
          timer = setTimeout(() => setIsDeleting(true), 3000);
        } else {
          timer = setTimeout(handleType, speed);
        }
      } else {
        setDisplayedText(text.substring(0, displayedText.length - 1));
        if (displayedText.length - 1 <= 0) {
          setIsDeleting(false);
          timer = setTimeout(handleType, 500);
        } else {
          timer = setTimeout(handleType, speed / 2);
        }
      }
    };

    timer = setTimeout(handleType, speed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, text, speed]);

  return (
    <span className="inline-flex items-center font-mono">
      <span>{displayedText}</span>
      <span className="w-1.5 h-3.5 bg-current ml-0.5 animate-pulse shrink-0" />
    </span>
  );
}

export default function App() {
  // Database State
  const [students, setStudents] = useState<CalonSiswa[]>(() => loadRegistrations());
  const [selectedStudentToPrint, setSelectedStudentToPrint] = useState<CalonSiswa | null>(null);
  
  // Kegiatan Praktik Baik State
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>(() => loadKegiatan());
  
  const handleUpdateKegiatan = async (newList: Kegiatan[]) => {
    // 1. Identify deleted kegiatan ids by comparing previous and new list
    const oldIds = kegiatanList.map(k => k.id);
    const newIds = newList.map(k => k.id);
    const deletedIds = oldIds.filter(id => !newIds.includes(id));

    // 2. Perform deletions in Firestore
    for (const id of deletedIds) {
      await deleteKegiatanFromFirestore(id);
    }

    // 3. Save/Update all current items in Firestore
    for (const keg of newList) {
      await saveKegiatanToFirestore(keg);
    }

    setKegiatanList(newList);
    const success = saveKegiatan(newList);
    if (!success) {
      alert('Penyimpanan lokal penuh karena ukuran gambar terlalu besar! Perubahan telah diterapkan di memori layar, namun gagal disimpan di browser ini. Mohon gunakan gambar yang berukuran lebih kecil.');
    }
  };
  
  // Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('beranda');

  // FAQ Expanded State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Enable Real-time synchronization across devices!
  useEffect(() => {
    // 1. Subscribe to all student registrations in real-time
    const unsubStudents = subscribeStudentsRealtime((list) => {
      setStudents(list);
      saveRegistrations(list);
    });

    // 2. Subscribe to activities / kegiatan in real-time
    const unsubKegiatan = subscribeKegiatanRealtime((list) => {
      setKegiatanList(list);
      saveKegiatan(list);
    });

    // 3. Subscribe to custom logos in real-time
    const unsubLogos = subscribeLogosRealtime((sdnLogo, dinasLogo) => {
      const localSdn = localStorage.getItem('sdn4_custom_logo');
      const localDinas = localStorage.getItem('sdn4_custom_dinas_logo');
      const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('spmb_admin_auth') === 'true';

      if (sdnLogo) {
        localStorage.setItem('sdn4_custom_logo', sdnLogo);
      } else if (sdnLogo === null) {
        if (localSdn) {
          if (isAdmin) {
            // Sync local up so server and all devices receive it safely
            saveLogosToFirestore(localSdn, dinasLogo || localDinas || null);
          }
        } else {
          localStorage.removeItem('sdn4_custom_logo');
        }
      }

      if (dinasLogo) {
        localStorage.setItem('sdn4_custom_dinas_logo', dinasLogo);
      } else if (dinasLogo === null) {
        if (localDinas) {
          if (isAdmin) {
            saveLogosToFirestore(sdnLogo || localSdn || null, localDinas);
          }
        } else {
          localStorage.removeItem('sdn4_custom_dinas_logo');
        }
      }

      window.dispatchEvent(new Event('sdn4_custom_logo_changed'));
      window.dispatchEvent(new Event('sdn4_custom_dinas_logo_changed'));
    });

    return () => {
      unsubStudents();
      unsubKegiatan();
      unsubLogos();
    };
  }, []);

  // Handle new student registration completion
  const handleRegisterComplete = async (newStudent: CalonSiswa) => {
    await saveStudentToFirestore(newStudent);
    setSelectedStudentToPrint(newStudent);
    // Smooth scroll to card
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Handle manual status update from admin panel
  const handleStatusChange = async (id: string, newStatus: CalonSiswa['status']) => {
    const student = students.find(s => s.id === id);
    if (student) {
      await saveStudentToFirestore({ ...student, status: newStatus });
    }
  };

  // Handle bulk status updates (e.g. from automatic selection)
  const handleBulkStatusChange = async (updates: { [id: string]: CalonSiswa['status'] }) => {
    for (const id of Object.keys(updates)) {
      const student = students.find(s => s.id === id);
      if (student) {
        await saveStudentToFirestore({ ...student, status: updates[id] });
      }
    }
  };

  // Add dummy student to test selection simulator
  const handleAddSampleStudent = async () => {
    const listNames = [
      'Guntur Wibowo', 'Rina Lestari', 'Andika Pratama', 'Siti Maesaroh', 'Eko Saputra', 
      'Rizky Fauzi', 'Novi Safitri', 'Bambang Pamungkas', 'Cahya Ningrum', 'Hendy Setiawan'
    ];
    const listDesa = ['Kronggen', 'Karangrejo', 'Temon', 'Menduran', 'Tawangharjo'];
    
    const randomName = listNames[Math.floor(Math.random() * listNames.length)] + ' ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + '.';
    const randomNik = '331501' + Math.floor(1000000000 + Math.random() * 9000000000);
    const randomJK = Math.random() > 0.5 ? 'L' : 'P';
    
    // Antara tahun 2018 s/d 2021 (usia 5 th 6 bln s/d 8 tahun)
    const birthYear = 2018 + Math.floor(Math.random() * 3);
    const birthMonth = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const birthDay = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
    const randomBirthdate = `${birthYear}-${birthMonth}-${birthDay}`;
    
    const birthDate = new Date(randomBirthdate);
    const targetDate = new Date('2026-07-01');
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && targetDate.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    const randomJalur = Math.random() > 0.35 ? 'domisili' : (Math.random() > 0.5 ? 'afirmasi' : 'mutasi');
    const randomJarak = Math.floor(80 + Math.random() * 2200);

    const dummy: CalonSiswa = {
      id: `SPMB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      namaLengkap: randomName,
      nik: randomNik,
      jenisKelamin: randomJK,
      tempatLahir: 'Grobogan',
      tanggalLahir: randomBirthdate,
      nisn: String(Math.floor(10000000 + Math.random() * 90000000)),
      alamatLengkap: `Dusun Krajan RT ${String(Math.floor(1+Math.random()*5)).padStart(2,'0')} RW 01, Desa ${listDesa[Math.floor(Math.random()*listDesa.length)]}`,
      rt: String(Math.floor(1+Math.random()*5)),
      rw: '01',
      desa: listDesa[Math.floor(Math.random()*listDesa.length)],
      kecamatan: 'Brati',
      kabupaten: 'Grobogan',
      jarakKeSekolah: randomJarak,
      namaAyah: 'Wali ' + randomName.split(' ')[0],
      pekerjaanAyah: 'Swasta',
      namaIbu: 'Ibu ' + randomName.split(' ')[0],
      pekerjaanIbu: 'Ibu Rumah Tangga',
      noHpOrangTua: '08' + Math.floor(100000000 + Math.random() * 900000000),
      jalur: randomJalur,
      usiaTahun: years,
      usiaBulan: months,
      hasAkta: true,
      hasKK: true,
      hasSPTJM: true,
      hasSKKB: Math.random() > 0.4,
      tanggalDaftar: new Date().toISOString(),
      status: 'Pending'
    };

    await saveStudentToFirestore(dummy);
  };

  const handleResetDatabase = async () => {
    // Delete all current students on Firestore
    for (const s of students) {
      await deleteStudentFromFirestore(s.id);
    }
    // Set Firestore with standard mock registrations
    for (const sample of MOCK_REGISTRATIONS) {
      await saveStudentToFirestore(sample);
    }

    // Delete all current activities on Firestore
    for (const keg_item of kegiatanList) {
      await deleteKegiatanFromFirestore(keg_item.id);
    }
    // Set Firestore with new beautiful default kegiatan representing the uploaded images
    for (const d_keg of DEFAULT_KEGIATAN) {
      await saveKegiatanToFirestore(d_keg);
    }

    setSelectedStudentToPrint(null);
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    // 1. Immediately update local state & LocalStorage (Optimistic UI update)
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveRegistrations(updated);

    if (selectedStudentToPrint && selectedStudentToPrint.id === id) {
      setSelectedStudentToPrint(null);
    }

    // 2. Perform background delete from Firestore
    try {
      await deleteStudentFromFirestore(id);
    } catch (e) {
      console.error("Gagal menghapus siswa dari Firestore:", e);
    }
  };

  // Contacts WhatsApp Generator
  const waOfficerAsep = getWAUrl('082227162176', 'Halo Bapak Asep Nurarianto, S.Pd.SD. Saya ingin menanyakan terkait berkas fisik pendaftaran SPMB SD Negeri 4 Kronggen TA 2026/2027 atas nama anak saya...');
  const waPrincipalUlil = getWAUrl('081225991009', 'Halo Bapak Kepala Sekolah Ulil Abshor, S.Pd.I. Saya orang tua calon peserta didik, ingin menanyakan perihal kebijakan pendaftaran SPMB SDN 4 Kronggen...');

  const faqs = [
    {
      q: 'Apakah ada pungutan biaya pendaftaran di SDN 4 Kronggen?',
      a: 'Sama sekali TIDAK ADA. Seluruh proses pendaftaran, seleksi, hingga keterpilihan dalam SPMB SD Negeri 4 Kronggen TA 2026/2027 adalah 100% GRATIS (Rp 0,-). Sekolah melarang keras adanya pungutan uang pangkal maupun uang bangku.',
      cat: 'Biaya'
    },
    {
      q: 'Bagaimana jalur seleksi Zonasi ditentukan jika anak kami berusia kurang dari 7 tahun?',
      a: 'Seleksi Zonasi memprioritaskan anak usia 7 tahun ke atas terlebih dahulu. Apabila masih terdapat kuota tersisa dari 23 pagu utama, maka penentuan kelulusan berikutnya dilakukan secara bertahap menyaring anak usia 6 tahun ke atas berdasarkan estimasi JARAK rumah terdekat (Meter) ke lokasi sekolah secara obyektif.',
      cat: 'Seleksi'
    },
    {
      q: 'Anak saya baru berusia 5 tahun 6 bulan per 1 Juli 2026, apakah diperbolehkan mendaftar?',
      a: 'Secara hukum diperbolehkan mendaftar bersyarat. Persyaratannya wajib menyertakan rekomendasi tertulis yang menyatakan kematangan psikis/bakat istimewa anak dari Psikolog Profesional. Jika psikolog tidak tersedia, rekomendasi dapat dikeluarkan oleh Dewan Guru sekolah asal (TK/PAUD).',
      cat: 'Syarat Usia'
    },
    {
      q: 'Apakah pendaftaran mewajibkan adannya TES CALISTUNG (Membaca, Menulis & Berhitung)?',
      a: 'TIDAK ADA TES CALISTUNG. Sesuai kebijakan Merdeka Belajar Kemendikbudristek dan petunjuk teknis Kabupaten Grobogan, transisi PAUD ke SD dilarang keras membebankan tes calistung kepada murid baru. Seleksi murni menggunakan variabel usia teoretis dan zonasi kependudukan.',
      cat: 'Pengetesan'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* WhatsApp Floating Sticky Widget: Hidden when printing */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 no-print">
        <a 
          href={waOfficerAsep}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white p-3.5 px-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all text-xs font-bold duration-200"
          title="Tanya Pak Asep (Panitia)"
        >
          <Phone className="w-4 h-4" /> Hubungi Pak Asep (Panitia)
        </a>
        <a 
          href={waPrincipalUlil}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-805 active:bg-black text-white p-3.5 px-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all text-xs font-bold duration-200"
          title="Tanya Pak Ulil (Kepala Sekolah)"
        >
          <Phone className="w-4 h-4 text-emerald-400" /> WhatsApp Kepala Sekolah
        </a>
      </div>

      {/* 1. Header Toolbar (Navigasi) */}
      <header className="sticky top-0 z-35 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Group */}
            <div className="flex items-center gap-2.5">
              <Sdn4KronggenLogo size={46} className="shrink-0 drop-shadow-sm hover:scale-105 transition-transform duration-200" />
              <div>
                <a href="#beranda" className="block text-base sm:text-lg font-black tracking-tight text-slate-900 hover:text-emerald-700 transition-colors uppercase leading-none">
                  SDN 4 Kronggen
                </a>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mt-1 leading-none animate-pulse">
                  🌳 Sekolah Peduli dan Berbudaya Lingkungan Hidup
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-x-6">
              {[
                { label: 'Beranda', href: '#beranda' },
                { label: 'Profil & Visi', href: '#profil-sekolah' },
                { label: 'Program Unggulan', href: '#program-unggulan' },
                { label: 'Kuota', href: '#kuota-jalur' },
                { label: 'Persyaratan', href: '#persyaratan' },
                { label: 'Cek Kelulusan', href: '#cek-pendaftaran' }
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setCurrentSection(link.href.replace('#', ''))}
                  className="text-xs font-extrabold text-slate-500 hover:text-emerald-750 transition-colors duration-200 uppercase tracking-wider relative py-2"
                >
                  {link.label}
                  {currentSection === link.href.replace('#', '') && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded" />
                  )}
                </a>
              ))}
              
              <a
                href="#form-pendaftaran"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:scale-103 active:scale-97 transition-all flex items-center gap-1"
              >
                Form SPMB <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </nav>

            {/* Mobile menu trigger */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu tray */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-slate-100 bg-white shadow-xl overflow-hidden"
            >
              <div className="px-5 py-6 space-y-4 flex flex-col">
                {[
                  { label: 'Beranda', href: '#beranda' },
                  { label: 'Profil & Visi', href: '#profil-sekolah' },
                  { label: 'Program Unggulan', href: '#program-unggulan' },
                  { label: 'Kuota', href: '#kuota-jalur' },
                  { label: 'Persyaratan', href: '#persyaratan' },
                  { label: 'Cek Kelulusan', href: '#cek-pendaftaran' }
                ].map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentSection(link.href.replace('#', ''));
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-emerald-700 uppercase tracking-widest"
                  >
                    {link.label}
                  </a>
                ))}
                
                <a
                  href="#form-pendaftaran"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                  Daftar SPMB Online Sekarang
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Banner (WordPress Ceria Style) */}
      <section id="beranda" className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white min-h-[80vh] flex items-center py-20 overflow-hidden no-print">
        {/* Curved visual patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_120%_120%,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 left-0 h-16 bg-slate-50" style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex flex-wrap gap-2 items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-xs font-bold uppercase tracking-wider"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  <span>Penerimaan Peserta Didik Baru TA 2026/2027</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-200 text-xs font-semibold tracking-wider"
                >
                  🚀 <span className="italic">SD Negeri 4 Kronggen: Towards Literate School</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold tracking-wider"
                >
                  ✨ <TypewriterText text="CREDIBLE - CREATIVE . DISCIPLINE . NOBLE CHARACTRE" />
                </motion.div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase font-display"
              >
                Sekolah Peduli dan berbudaya Lingkungan Hidup
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-emerald-100 text-base sm:text-lg leading-relaxed max-w-2xl font-light text-justify"
              >
                Membentuk karakter berakhlak mulia, religius, mandiri, dan berwawasan ekologi peduli lingkungan berbasis kearifan lokal di <strong className="text-white font-extrabold">SD Negeri 4 Kronggen</strong>, Brati, Grobogan.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <a
                  href="#form-pendaftaran"
                  className="px-8 py-4 bg-white text-emerald-800 hover:bg-emerald-50 active:bg-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4.5 h-4.5 text-emerald-600" /> Daftar online di sini
                </a>
                <a
                  href="#cek-pendaftaran"
                  className="px-7 py-4 bg-slate-900 border border-white/10 hover:bg-slate-805 text-white text-sm font-bold uppercase tracking-wider rounded-2xl shadow-lg hover:scale-102 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-emerald-400" /> Cek Status Daftar
                </a>
              </motion.div>
            </div>

            {/* Hero Right Decorative Vector Widgets (WordPress-like Blocks layout) */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative space-y-6"
              >
                {/* Visual Widgets details */}
                <h3 className="font-extrabold text-sm uppercase text-emerald-250 tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-3">
                  <Calendar className="w-4.5 h-4.5" /> Agenda SPMB SD Negeri 4 Kronggen 2026
                </h3>
                
                <div className="space-y-4 text-xs sm:text-sm text-emerald-50">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-bold text-white shrink-0">1</div>
                    <div>
                      <p className="font-extrabold uppercase">Pengumuman Pendaftaran</p>
                      <p className="text-emerald-200 mt-0.5">Mulai 05 Mei 2025</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center font-bold text-white shrink-0">2</div>
                    <div>
                      <p className="font-extrabold uppercase text-emerald-250">Waktu Pendaftaran (Online & Offline)</p>
                      <p className="text-emerald-100 mt-0.5 font-bold">23 - 25 Juni 2025 (08.00 - 14.00 WIB)</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-bold text-white shrink-0">3</div>
                    <div>
                      <p className="font-extrabold uppercase">Pengumuman Hasil Akhir</p>
                      <p className="text-emerald-200 mt-0.5">26 Juni 2325 (pukul 10.00 WIB)</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/25 border border-emerald-500/20 rounded-2xl">
                  <p className="text-xs text-center font-medium text-emerald-200">
                     Ingin datang langsung? Panitia siap membantu registrasi Anda di loket sekolah SDN 4 Kronggen.
                  </p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Dynamic Promotion Banner: Free Gift & 100% Acceptance Guarantee */}
      <section className="py-10 bg-slate-100/60 relative overflow-hidden border-y border-amber-200 no-print">
        {/* Decorative dynamic backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-yellow-500/10 pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-rose-400/15 rounded-full blur-3xl animate-pulse" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 shadow-xl border-4 border-amber-300 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300"
          >
            {/* Shimmer element */}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" style={{ backgroundSize: '50% 100%' }} />

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                {/* Gift animation box */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.12, 1],
                    rotate: [0, -8, 8, -8, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-amber-300 relative"
                >
                  <Gift className="w-9 h-9 sm:w-11 sm:h-11 text-rose-500" />
                  <span className="absolute -top-2.5 -right-2 px-2.5 py-0.5 bg-yellow-400 border border-white text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider animate-bounce shadow-sm">
                    BONUS
                  </span>
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-amber-400/20 blur-md rounded-2xl -z-10 animate-ping" />
                </motion.div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px] uppercase tracking-wider">
                      <Sparkles className="w-3 text-yellow-300 animate-spin" /> PROMO SPESIAL SPMB
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
                      🔥 TERBATAS
                    </span>
                  </div>
                  
                  <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-sm">
                    Dapatkan <span className="text-yellow-300 underline decoration-yellow-400 decoration-2 underline-offset-4">Free-Gift Menarik</span> Bagi Siswa yang Diterima!
                  </h3>
                  
                  <p className="text-amber-50 text-xs sm:text-base leading-relaxed font-bold tracking-wide">
                    Dan <strong className="text-white font-extrabold">PASTIKAN</strong> Ananda Ibu/Bapak Semua <span className="bg-yellow-300 text-slate-950 px-3 py-1 ml-1 rounded-xl inline-block font-black shadow-lg animate-pulse scale-102 hover:scale-105 transition-transform">DITERIMA 100%</span> di Sekolah Peduli dan Berbudaya Lingkungan Hidup SDN 4 Kronggen!
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 w-full lg:w-auto">
                <a 
                  href="#form-pendaftaran"
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-250 hover:scale-103 active:scale-97 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-[4px] cursor-pointer group"
                >
                  <Sparkles className="w-4.5 h-4.5 text-slate-950 animate-bounce" />
                  Daftarkan Ananda Sekarang
                  <ChevronRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1.5 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Profil & Visi Misi Section */}
      <section id="profil-sekolah" className="py-16 bg-white no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Visi Misi Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-16">
            
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full uppercase tracking-wider">VISI SEKOLAH</span>
                <blockquote className="text-xl sm:text-2xl font-serif text-slate-800 leading-relaxed italic border-l-4 border-emerald-600 pl-4 mt-4 text-justify">
                  "Mewujudkan Murid Yang Beriman dan Bertaqwa Kepada Tuhan YME, Berakhlak Mulia, Mandiri, Bernalar Kritis, Bergotong Royong, Peduli dan Berbudaya Lingkungan Hidup, Melalui Program KRONGGEN Berbasis Karakter dan Kearifan Lokal."
                </blockquote>
              </div>

              <div className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-xs font-extrabold text-emerald-800 uppercase block mb-1">PROGRAM UNGGULAN SD NEGERI 4 KRONGGEN</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                  Sekolah kami secara progresif mengintegrasikan nilai-nilai iman melalui pembiasaan ibadah harian, program sedekah lingkungan, dan pertanian sawah organik cilik demi menumbuhkan rasa syukur mendalam terhadap alam semesta.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest pl-1 block">MISI UTAMA KAMI</span>
                <h3 className="text-2xl font-extrabold text-white mt-1.5 mb-5 uppercase tracking-tight">Kompilasi Misi Unggulan</h3>
                
                <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-emerald-400">✓</span>
                    <p><strong className="text-white">Menanamkan Keimanan:</strong> Melalui pembiasaan rutin ibadah harian sholat berjamaah & siraman rohani.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400">✓</span>
                    <p><strong className="text-white">Akhlak Mulia:</strong> Membentuk kearifan moral lewat program pelestarian SASI SASA (Satu Siswa Satu Sapu).</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400">✓</span>
                    <p><strong className="text-white">Kemandirian & Nalar Kritis:</strong> Mengasah daya kritis murid terhadap pelestarian isu ekologi & lingkungan hidup.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400">✓</span>
                    <p><strong className="text-white">Melestarikan Kearifan Lokal:</strong> Pembelajaran praktik bertani organik bersama masyarakat dan Kamis Jowo.</p>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Sekolah Adiwiyata Kab. Grobogan</span>
                <span>TA 2026/2027</span>
              </div>
            </div>

          </div>

          {/* Visi Misi Badges Detail Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                <span className="p-1 rounded bg-teal-100 text-teal-700 text-xs">🕌</span> Karakter & Religius
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                Sholat Dhuhur berjamaah harian, Sholat Dhuha bersama tiap Jumat, dan program <strong>HAJUZA</strong> (Hafalan Juz Amma terintegrasi kajian kelestarian lingkungan).
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                <span className="p-1 rounded bg-emerald-100 text-emerald-700 text-xs">🌳</span> Aksi Lingkungan Hijau
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                Gerakan pembiasaan <strong>SASI SASA</strong> (Satu Siswa Satu Sapu), gerakan bawa botol minum tumbler sendiri (bebas sampah plastik), dan sedekah tanaman hias berkala.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                <span className="p-1 rounded bg-amber-100 text-amber-700 text-xs">🌾</span> Budaya & Kearifan Lokal
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                Pembelajaran luar ruang <strong>Tani Cilik Kronggen</strong> (praktik lapangan ekosistem sawah & pertanian organik) serta hari bahasa krama <strong>KAMBOJA</strong> (Kamis Boso Jowo).
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Flagship Programs Component Render */}
      <ProgramUnggulan />

      {/* 4.1 Activities with Good Practices (Kegiatan Praktik Baik) Render */}
      <KegiatanPraktikBaik kegiatanList={kegiatanList} />

      {/* 5. Statistics of Seats Quota Render */}
      <KuotaStats students={students} />

      {/* 6. Requirements and Calistung policy Information */}
      <section id="persyaratan" className="py-16 bg-slate-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column Information */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] uppercase tracking-wide">
                📢 Informasi Pendaftaran
              </div>
              
              <h2 className="text-3xl font-extrabold text-slate-804 tracking-tight leading-tight">
                Persyaratan Calon Peserta Didik Baru
              </h2>
              
              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-xs mb-1">1. Aturan Kualifikasi Umur (Cut-off 1 Juli 2026):</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Prioritas utama mutlak disetujui pada anak yang telah genap berusia <strong className="text-emerald-700">7 tahun</strong>.</li>
                    <li>Siswa paling rendah berusia <strong className="text-emerald-700">6 tahun</strong> memenuhi syarat dasar penentuan zonasi.</li>
                    <li>Siswa berusia <strong className="text-slate-800">5 tahun 6 bulan</strong> sampai kelipatan di bawah 6 tahun diperbolehkan mendaftar khusus dengan syarat melampirkan rekomendasi psikolog/dewan guru sekolah asalnya.</li>
                  </ul>
                </div>

                <div className="p-4 bg-emerald-100/50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <div className="text-2xl">🌱</div>
                  <div>
                    <h5 className="font-bold text-emerald-850 text-xs">KEBIJAKAN TANPA SELEKSI TES (BEBAS CALISTUNG)</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-normal text-justify">
                      Penerimaan siswa baru SDN 4 Kronggen didasarkan murni pada kriteria umur sah dan jarak kependudukan rumah ke sekolah, TANPA MEMPERSYARATKAN kelulusan tes membaca, menulis, dan berhitung.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Checklist Dokumen */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-1.5">
                📁 Berkas Dokumen yang Diperlukan:
              </h3>
              <p className="text-xs text-slate-550 mb-6 leading-relaxed">
                Demi kelancaran pendaftaran SPMB offline maupun online, orang tua harap menyiapkan berkas di map tersusun rapi:
              </p>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex gap-3">
                  <span className="p-1 h-6 w-6 rounded bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="font-bold text-slate-800">Akta Kelahiran Calon Siswa</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Asli beserta fotokopi untuk pencatatan NIK NISN.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="p-1 h-6 w-6 rounded bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="font-bold text-slate-800">Kartu Keluarga (KK)</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Diterbitkan minimal 1 tahun berjalan sebelum pendaftaran.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="p-1 h-6 w-6 rounded bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <p className="font-bold text-slate-800">Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Bermaterai Rp10.000 (Draf pengisian disediakan gratis di loket sekolah atau form pendaftaran dibawah).</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="p-1 h-6 w-6 rounded bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <p className="font-bold text-slate-800 text-slate-600">Surat Keterangan TK / PAUD (Opsional)</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Membantu memberikan informasi riwayat karakter anak.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Timeline Alur Pendaftaran (Jadwal Penting & Mekanisme) */}
      <section className="py-16 bg-white no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-wider">TIMELINE ADMISI</span>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">Mekanisme & Cara Mendaftar</h2>
            <p className="text-xs sm:text-sm text-slate-550 mt-1 max-w-sm mx-auto">Tersedia dua metode pendaftaran agar memudahkan orang tua dalam registrasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            {/* Online Methods */}
            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-150 relative">
              <span className="absolute -top-3.5 left-6 bg-emerald-600 text-white font-extrabold text-[10px] px-3.5 py-1 rounded-full uppercase">CARA 1: Daring (Online)</span>
              <h3 className="font-extrabold text-lg text-slate-850 mt-2 mb-3">Pendaftaran Melalui Internet</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 text-justify">
                Pendaftaran mandiri dapat dilakukan 100% online kapan saja oleh orang tua murid melalui form pengisian pendaftaran SPMB di website sekolah ini. Silakan tuntaskan 5 tahapan kemudian langsung cetak/unduh kartu tanda bukti registrasinya.
              </p>
              <a 
                href="#form-pendaftaran"
                className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 uppercase tracking-wider"
              >
                Isi form pendaftaran gratis <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Offline Methods */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 relative">
              <span className="absolute -top-3.5 left-6 bg-slate-900 text-white font-extrabold text-[10px] px-3.5 py-1 rounded-full uppercase">CARA 2: Luring (Offline)</span>
              <h3 className="font-extrabold text-lg text-slate-850 mt-2 mb-3">Datang Langsung Ke Sekolah</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 text-justify">
                Ada kendala sinyal atau kesulitan mengisi handphone? Datang langsung ke posko SPMB di gedung SD Negeri 4 Kronggen. Panitia sekolah dengan senang hati akan mendampingi dan menginputkan berkas Anda secara gratis hingga tuntas.
              </p>
              <a 
                href="#cek-pendaftaran"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 uppercase tracking-wider"
              >
                Cek informasi panitia <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Slogan Banner */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white text-center text-xs font-bold tracking-wide">
            🌳 SELURUH PROSES PENDAFTARAN SPMB TIDAK DIPUNGUT BIAYA APAPUN (GRATIS RP 0,-) 🌳
          </div>

        </div>
      </section>

      {/* 8. Registration Master Section (Card Print vs Form Wizard) */}
      <div className="relative">
        {selectedStudentToPrint ? (
          <RegistrationCard 
            student={selectedStudentToPrint} 
            onBack={() => {
              setSelectedStudentToPrint(null);
              // scroll to results
              setTimeout(() => {
                const element = document.getElementById('cek-pendaftaran');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
          />
        ) : (
          <RegistrationForm 
            onRegisterComplete={handleRegisterComplete} 
            currentStudents={students} 
          />
        )}
      </div>

      {/* 9. Search Portal and Admin Dashboard Panel Selection */}
      <Dashboard 
        students={students}
        onChangeStatus={handleStatusChange}
        onBulkStatusChange={handleBulkStatusChange}
        onSelectStudentToPrint={(student) => setSelectedStudentToPrint(student)}
        onAddSampleStudent={handleAddSampleStudent}
        onResetDatabase={handleResetDatabase}
        onDeleteStudent={handleDeleteStudent}
        kegiatanList={kegiatanList}
        onUpdateKegiatan={handleUpdateKegiatan}
      />

      {/* 10. Nara Hubung & Contact Info Section */}
      <section className="py-16 bg-slate-50 text-slate-800- border-t border-b border-slate-200/60 no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nara Hubung Resmi</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">📞 Butuh Bantuan? Hubungi Saja Kami</h2>
            <p className="text-xs text-slate-500 mt-1">Kami menyediakan jalur konsultasi cepat langsung terhubung ke WhatsApp Panitia & Kepala Sekolah.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Contact Asep */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2 mb-4">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">Ketua Panitia SPMB</span>
                <span className="block text-lg font-black text-slate-850">ASEP NURARIANTO, S.Pd.SD</span>
                <p className="text-xs text-slate-500 leading-normal text-justify">
                  Bertugas mengurus pendaftaran fisik, verifikasi zonasi alamat, kesesuaian berkas, dan pendampingan input pendaftaran wali murid.
                </p>
              </div>
              <a 
                href={waOfficerAsep}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold uppercase rounded-2xl flex items-center justify-center gap-1.5 transition-transform hover:scale-101 active:scale-99"
              >
                <Phone className="w-4 h-4" /> Hubungi Ketua Panitia (WA)
              </a>
            </div>

            {/* Contact Ulil Abshor */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2 mb-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Kepala Sekolah SDN 4 Kronggen</span>
                <span className="block text-lg font-black text-slate-850">ULIL ABSHOR, S.Pd.I.</span>
                <p className="text-xs text-slate-500 leading-normal text-justify">
                  Membantu mengurus kebijakan penting sekolah, transisi Merdeka Belajar seputar PAUD ke SD, dan pendampingan rekomendasi psikolog.
                </p>
              </div>
              <a 
                href={waPrincipalUlil}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3 bg-slate-900 hover:bg-slate-805 active:bg-black text-white text-xs font-bold uppercase rounded-2xl flex items-center justify-center gap-1.5 transition-transform hover:scale-101 active:scale-99"
              >
                <Phone className="w-4 h-4 text-emerald-400" /> WhatsApp Kepala Sekolah
              </a>
            </div>

          </div>

          <p className="text-center text-[11px] text-slate-400 italic mt-8 font-medium">
             Nomor Whatsapp panitia di atas siap dihubungi secara proaktif sepanjang jam kerja pelayanan SPMB pukul 08.00 s/d 14.00 WIB.
          </p>

        </div>
      </section>

      {/* 11. Accordion-based FAQs Section */}
      <section className="py-16 bg-white no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-wider">PERTANYAAN UMUM</span>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">Kanal Informasi & Tanya-Jawab</h2>
            <p className="text-xs sm:text-sm text-slate-550 mt-1">Kami merangkum semua pertanyaan penting dari para orang tua murid.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = expandedFaq === i;
              return (
                <div 
                  key={i} 
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button 
                    onClick={() => setExpandedFaq(isOpen ? null : i)}
                    type="button"
                    className="w-full text-left p-5 bg-slate-50 hover:bg-slate-100/60 transition-colors font-extrabold text-xs sm:text-sm text-slate-800 flex justify-between items-center cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-emerald-600 font-normal shrink-0 ml-4">{isOpen ? '➖' : '➕'}</span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="p-5 border-t border-slate-200 bg-white text-xs sm:text-sm leading-relaxed text-slate-600 text-justify">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 12. Elegant interactive map/address directory layout */}
      <section id="lokasi" className="py-16 bg-slate-50 text-slate-700/80 border-t border-slate-200/50 text-xs sm:text-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200/30">
              Lokasi & Alamat Resmi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Google Maps SD Negeri 4 Kronggen
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Temukan lokasi administratif SD Negeri 4 Kronggen langsung dari citra satelit dan peta digital Google Maps terverifikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Detail Sidebar Card - 5 cols */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div className="space-y-6">
                <div className="flex items-start gap-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Alamat Lengkap Berkas</h4>
                    <p className="text-xs text-slate-650 text-slate-600 mt-1 leading-relaxed">
                      Dusun Kronggen, Desa Kronggen, Kecamatan Brati, Kabupaten Grobogan, Provinsi Jawa Tengah, Indonesia.
                    </p>
                    <span className="inline-block mt-2 font-mono font-bold text-[11px] text-slate-450 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      KODEPOS: 58153
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest">Informasi Tambahan Akses:</h5>
                  <ul className="space-y-2 text-xs text-slate-500 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-555 text-emerald-600 font-bold">✓</span>
                      <span>Terletak di sebelah utara jalan raya utama desa Kronggen, akses parkir sangat luas untuk kendaraan roda dua maupun roda empat.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-555 text-emerald-600 font-bold">✓</span>
                      <span>Berada di wilayah zonasi prioritas SDN 4 Kronggen pengisian jalur domisili pendaftaran.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 md:mt-0">
                <a 
                  href="https://maps.google.com/?q=SD+Negeri+4+Kronggen+Brati+Grobogan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-md hover:scale-101 active:scale-99 transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" /> Cari & Buka di Google Maps
                </a>
                <span className="text-[10px] text-slate-400 text-center block mt-2 font-medium">Buka rute mengemudi di ponsel Anda / navigasi rute</span>
              </div>
            </div>

            {/* Right Map Canvas Embed - 7 cols */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-3 shadow-xs h-[320px] sm:h-[400px] relative overflow-hidden flex flex-col">
              <iframe
                id="interactive-google-map"
                title="Peta Lokasi Resmi SD Negeri 4 Kronggen"
                src="https://maps.google.com/maps?q=SD%20Negeri%204%20Kronggen,%20Brati,%20Grobogan&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full rounded-2xl border border-slate-200 grow shadow-inner"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer"
              />
            </div>

          </div>

        </div>
      </section>

      {/* 13. Footer */}
      <footer className="bg-slate-900 text-slate-450 border-t border-slate-800 py-12 text-xs no-print text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Sdn4KronggenLogo size={36} className="shrink-0 drop-shadow-sm hover:scale-105 transition-transform duration-200" />
              <span className="font-extrabold text-sm text-white uppercase tracking-tight">SD Negeri 4 Kronggen</span>
            </div>
            
            <div className="text-slate-400 font-medium text-center sm:text-right text-xs space-y-1">
              <p><span className="italic">SD Negeri 4 Kronggen: Towards Literate School</span></p>
              <p className="text-[10px] text-slate-400 flex items-center justify-center sm:justify-end gap-1 font-semibold">
                <span>✨</span>
                <TypewriterText text="CREDIBLE - CREATIVE . DISCIPLINE . NOBLE CHARACTRE" speed={100} />
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 my-6 pt-4 text-slate-500 flex flex-col sm:flex-row justify-between gap-4 text-[11px] font-medium">
            <p>© 2026 SDN 4 Kronggen SPMB Office. Hak Cipta Dilindungi Undang-Undang.</p>
            <div className="flex gap-4 justify-center">
              <span>Dinas Pendidikan Kab. Grobogan</span>
              <span>•</span>
              <span>SD Negeri 4 Kronggen-Keren</span>
              <span>•</span>
              <span>Merdeka Belajar</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
