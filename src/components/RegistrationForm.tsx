import React, { useState, useEffect } from 'react';
import { CalonSiswa, JalurPendaftaran } from '../types';
import { hitungUsia, generateRegistrationId } from '../utils';
import { 
  User, MapPin, Users, FileText, ShieldAlert, CheckCircle, 
  ChevronRight, ChevronLeft, Sparkles, AlertCircle, FileSpreadsheet, Eye, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegistrationFormProps {
  onRegisterComplete: (student: CalonSiswa) => void;
  currentStudents: CalonSiswa[];
}

export default function RegistrationForm({ onRegisterComplete, currentStudents }: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [showSPTJMModal, setShowSPTJMModal] = useState(false);

  // Form State
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nik, setNik] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [nisn, setNisn] = useState('');
  
  const [alamatLengkap, setAlamatLengkap] = useState('');
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('');
  const [desa, setDesa] = useState('Kronggen');
  const [kecamatan, setKecamatan] = useState('Brati');
  const [kabupaten, setKabupaten] = useState('Grobogan');
  const [jarakKeSekolah, setJarakKeSekolah] = useState(200); // 200m default
  
  const [namaAyah, setNamaAyah] = useState('');
  const [pekerjaanAyah, setPekerjaanAyah] = useState('');
  const [namaIbu, setNamaIbu] = useState('');
  const [pekerjaanIbu, setPekerjaanIbu] = useState('');
  const [noHpOrangTua, setNoHpOrangTua] = useState('');
  
  const [jalur, setJalur] = useState<JalurPendaftaran>('domisili');
  
  const [hasAkta, setHasAkta] = useState(true);
  const [hasKK, setHasKK] = useState(true);
  const [hasSPTJM, setHasSPTJM] = useState(true);
  const [hasSKKB, setHasSKKB] = useState(false);

  // Age calculation details
  const [usiaDetails, setUsiaDetails] = useState({ tahun: 0, bulan: 0 });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (tanggalLahir) {
      const { tahun, bulan } = hitungUsia(tanggalLahir);
      setUsiaDetails({ tahun, bulan });
    } else {
      setUsiaDetails({ tahun: 0, bulan: 0 });
    }
  }, [tanggalLahir]);

  const validateStep = () => {
    const errs: string[] = [];
    if (step === 1) {
      if (!namaLengkap.trim()) errs.push('Nama lengkap calon murid wajib diisi.');
      if (nik.trim().length !== 16) errs.push('NIK wajib diisi tepat 16 digit.');
      if (!tempatLahir.trim()) errs.push('Tempat lahir wajib diisi.');
      if (!tanggalLahir) errs.push('Tanggal lahir wajib diisi.');
      
      const { tahun, bulan } = hitungUsia(tanggalLahir);
      if (tahun < 5 || (tahun === 5 && bulan < 6)) {
        errs.push('Usia minimal adalah 5 tahun 6 bulan per 1 Juli 2026.');
      }
    } else if (step === 2) {
      if (!alamatLengkap.trim()) errs.push('Alamat lengkap rumah wajib diisi.');
      if (!rt.trim() || !rw.trim()) errs.push('RT & RW wajib diisi.');
      if (!desa.trim()) errs.push('Nama Desa / Kelurahan wajib diisi.');
    } else if (step === 3) {
      if (!namaIbu.trim() && !namaAyah.trim()) errs.push('Minimal salah satu nama orang tua kandung wajib diisi.');
      if (!noHpOrangTua.trim()) errs.push('Nomor HP/WA orang tua wajib diisi untuk koordinasi.');
      if (noHpOrangTua.trim().length < 9) errs.push('Format Nomor HP tidak valid.');
    }
    
    setErrors(errs);
    return errs.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      setTimeout(() => {
        const element = document.getElementById('form-pendaftaran');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
    setErrors([]);
    setTimeout(() => {
      const element = document.getElementById('form-pendaftaran');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (!hasAkta || !hasKK || !hasSPTJM) {
      setErrors(['Orang tua wajib menjamin dan membawa dokumen Akta, KK, serta SPTJM saat verifikasi offline.']);
      return;
    }

    const { tahun, bulan } = hitungUsia(tanggalLahir);

    const newStudent: CalonSiswa = {
      id: generateRegistrationId(),
      namaLengkap,
      nik,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      nisn: nisn || undefined,
      alamatLengkap: `${alamatLengkap}, RT ${rt} RW ${rw}, Desa ${desa}, Kec. ${kecamatan}`,
      rt,
      rw,
      desa,
      kecamatan,
      kabupaten,
      jarakKeSekolah: Number(jarakKeSekolah),
      namaAyah,
      pekerjaanAyah: pekerjaanAyah || 'Tidak Bekerja',
      namaIbu,
      pekerjaanIbu: pekerjaanIbu || 'Ibu Rumah Tangga',
      noHpOrangTua,
      jalur,
      usiaTahun: tahun,
      usiaBulan: bulan,
      hasAkta,
      hasKK,
      hasSPTJM,
      hasSKKB,
      tanggalDaftar: new Date().toISOString(),
      status: 'Pending'
    };

    onRegisterComplete(newStudent);
  };

  // Status visual usia
  const getAgeBadge = () => {
    const { tahun, bulan } = usiaDetails;
    if (tahun === 0) return null;
    
    if (tahun >= 7) {
      return (
        <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>Usia <strong>{tahun} Tahun {bulan} Bulan</strong>. Memenuhi syarat prioritas utama pendaftaran (Usia ≥ 7 tahun).</span>
        </div>
      );
    } else if (tahun === 6) {
      return (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-2 text-sky-800 text-xs">
          <CheckCircle className="w-4.5 h-4.5 text-sky-600 shrink-0" />
          <span>Usia <strong>{tahun} Tahun {bulan} Bulan</strong>. Memenuhi syarat standar kelulusan minimal SPMB.</span>
        </div>
      );
    } else if (tahun === 5 && bulan >= 6) {
      return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-1 text-amber-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span className="font-bold">Usia Khusus (5 Tahun {bulan} Bulan)</span>
          </div>
          <p className="pl-6 text-slate-600">
            *Dapat didaftarkan tetapi memerlukan Surat Rekomendasi Tertulis dari Psikolog Profesional atau Dewan Guru Sekolah asal (TK/PAUD).
          </p>
        </div>
      );
    } else {
      return (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs">
          <ShieldAlert className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>Usia Belum Mencukupi. Maaf, anak belum dapat didaftarkan (minimal usia 5 tahun 6 bulan per 1 Juli 2026).</span>
        </div>
      );
    }
  };

  const stepsHeader = [
    { number: 1, label: 'Data Diri', icon: User },
    { number: 2, label: 'Zonasi Jarak', icon: MapPin },
    { number: 3, label: 'Orang Tua', icon: Users },
    { number: 4, label: 'Pemberkasan', icon: FileText },
    { number: 5, label: 'Review', icon: CheckCircle },
  ];

  return (
    <section id="form-pendaftaran" className="py-16 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            SPMB Online 2026/2027
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Formulir Pendaftaran Murid Baru
          </h2>
          <p className="mt-2 text-slate-600 text-sm max-w-xl mx-auto">
            Silakan isi seluruh tahapan dengan data yang valid sesuai Kartu Keluarga (KK) dan Akta Kelahiran yang asli untuk verifikasi berkas pendukung.
          </p>
        </div>

        {/* Dynamic Promotional Privilege Callout inside Registration page */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-2 border-amber-400 bg-white shadow-md flex items-center gap-4 text-slate-800 relative overflow-hidden group select-none"
        >
          {/* Light sweep animation */}
          <div className="absolute inset-y-0 -left-16 w-12 bg-white/30 transform skew-x-12 group-hover:translate-x-[600px] transition-transform duration-1000 ease-out" />
          
          <div className="p-3 bg-gradient-to-br from-amber-400 to-rose-500 text-white rounded-2xl shadow-md shrink-0 relative animate-pulse">
            <Gift className="w-6 h-6 shrink-0" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
          </div>

          <div className="text-left space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black tracking-widest text-amber-700 uppercase bg-amber-200/60 px-2 py-0.5 rounded-full inline-block">Keuntungan Eksklusif Wali Murid 🎁</span>
              <span className="animate-ping inline-block w-1.5 h-1.5 rounded-full bg-rose-600" />
            </div>
            <p className="text-slate-800 text-xs sm:text-sm font-black tracking-wide leading-relaxed">
              🎉 <span className="text-rose-600 uppercase font-black tracking-wider">Dapatkan Free-Gift Menarik</span> Bagi Siswa yang Diterima dan <span className="bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded-md text-xs font-black shadow-xs inline-block animate-pulse">PASTIKAN</span> Ananda Ibu/Bapak Semua <span className="text-emerald-700 font-extrabold underline decoration-amber-500 decoration-2">DITERIMA 100%</span> di Sekolah Kami!
            </p>
          </div>
        </motion.div>
        
        {/* Multi-step Header */}
        <div className="mb-10 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center relative gap-1">
            {stepsHeader.map((hdr, idx) => {
              const Icon = hdr.icon;
              const isActive = step === hdr.number;
              const isPast = step > hdr.number;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center relative z-10">
                  <div 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold ring-4 ring-emerald-100' 
                        : isPast 
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold mt-1.5 hidden sm:block ${isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>
                    {hdr.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global errors display */}
        {errors.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-1"
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>Ada kesalahan pengisian:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </motion.div>
        )}

        {/* Main Form Fields wrapper */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-250 p-6 sm:p-10 shadow-lg relative">
          
          <AnimatePresence mode="wait">
            
            {/* Step 1: Data Diri */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <User className="text-emerald-600 w-5 h-5" /> Identitas Calon Murid Baru
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">*Wajib melampirkan berkas resmi saat verifikasi lapangan.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap Murid (sesuai Akta) <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-medium transition-all"
                      placeholder="Contoh: Muhammad Rafandra"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor Induk Kependudukan / NIK <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      maxLength={16}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-semibold transition-all tracking-wider"
                      placeholder="16 Digit NIK tertera di KK"
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Kelamin <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setJenisKelamin('L')}
                        className={`py-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                          jenisKelamin === 'L' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        🚹 Laki-Laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setJenisKelamin('P')}
                        className={`py-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                          jenisKelamin === 'P' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        🚺 Perempuan
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">NISN (jika dari TK/PAUD)</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-semibold transition-all tracking-wide"
                      placeholder="Masukkan 10 digit NISN jika ada"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tempat Lahir <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-medium transition-all"
                      placeholder="Kota/Kab Tempat Lahir"
                      value={tempatLahir}
                      onChange={(e) => setTempatLahir(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Lahir <span className="text-rose-500">*</span></label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-semibold transition-all"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Jalur Pendaftaran <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setJalur('domisili')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          jalur === 'domisili' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-2 ring-emerald-100' 
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-650'
                        }`}
                      >
                        <span className="block font-bold text-sm">🏠 Zonasi Domisili (Min. 80%)</span>
                        <span className="block text-[11px] text-slate-500 mt-1">Sesuai jarak rumah terdekat ke SD.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setJalur('afirmasi')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          jalur === 'afirmasi' 
                            ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm ring-2 ring-teal-100' 
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-650'
                        }`}
                      >
                        <span className="block font-bold text-sm">🛡️ Afirmasi Sosial (Min. 15%)</span>
                        <span className="block text-[11px] text-slate-500 mt-1">Ekonomi kurang mampu / disabilitas.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setJalur('mutasi')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          jalur === 'mutasi' 
                            ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm ring-2 ring-amber-100' 
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-650'
                        }`}
                      >
                        <span className="block font-bold text-sm">🚚 Mutasi Pindahan (Maks. 5%)</span>
                        <span className="block text-[11px] text-slate-500 mt-1">Perpindahan tugas kedinasan ortu.</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Age Badge Result */}
                <div className="mt-4">
                  {getAgeBadge()}
                </div>
              </motion.div>
            )}

            {/* Step 2: Alamat & Zonasi */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <MapPin className="text-emerald-600 w-5 h-5" /> Zonasi, Jarak & Alamat Rumah
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">*Pendaftaran jalur Zonasi memprioritaskan radius domisili terdekat dengan sekolah.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Jalan / Nama Dusun / Dukuh <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-medium transition-all"
                      placeholder="Contoh: Dusun Gedad No. 24"
                      value={alamatLengkap}
                      onChange={(e) => setAlamatLengkap(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">RT <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="Contoh: 03"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-bold transition-all text-center"
                      value={rt}
                      onChange={(e) => setRt(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">RW <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="Contoh: 01"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-bold transition-all text-center"
                      value={rw}
                      onChange={(e) => setRw(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Desa <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-250 bg-slate-100 text-slate-700 text-sm font-extrabold text-center cursor-default outline-none"
                      value={desa}
                      readOnly
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Kecamatan <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-250 bg-slate-100 text-slate-700 text-sm font-extrabold text-center cursor-default outline-none"
                      value={kecamatan}
                      readOnly
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Kabupaten <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-250 bg-slate-100 text-slate-700 text-sm font-extrabold text-center cursor-default outline-none"
                      value={kabupaten}
                      readOnly
                    />
                  </div>

                  <div className="md:col-span-3 p-5 rounded-3xl bg-emerald-50/55 border border-emerald-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-black text-emerald-805 uppercase tracking-wider">
                        Atur Estimasi Jarak Rumah Ke Sekolah (SDN 4 Kronggen)
                      </label>
                      <span className="text-sm font-black text-emerald-700 bg-emerald-100 py-1 px-4 rounded-full">
                        {jarakKeSekolah} Meter
                      </span>
                    </div>

                    <input 
                      type="range"
                      min={50}
                      max={4000}
                      step={50}
                      className="w-full accent-emerald-600 cursor-ew-resize py-1"
                      value={jarakKeSekolah}
                      onChange={(e) => setJarakKeSekolah(Number(e.target.value))}
                    />

                    <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                      <span>Sangat Dekat (50m)</span>
                      <span>Dekat (1km)</span>
                      <span>Sedang (2km)</span>
                      <span>Jauh (4km)</span>
                    </div>

                    {jarakKeSekolah <= 1000 ? (
                      <p className="text-xs text-emerald-800 italic leading-relaxed">
                        ★ Luar biasa! Jarak rumah Anda berjarak <strong>{jarakKeSekolah} meter</strong>. Jalur Zonasi memprioritaskan anak Anda agar lolos seleksi dengan jaminan peluang lulus sangat tinggi!
                      </p>
                    ) : (
                      <p className="text-xs text-amber-800 italic leading-relaxed">
                        ⚠ Jarak domisili berada di luar radius prima (&gt; 1 KM). Peluang kelulusan jalur Zonasi bergantung pada rekapitulasi pelamar terdekat lainnya.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Identitas Orang Tua */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <Users className="text-emerald-600 w-5 h-5" /> Data Identitas Orang Tua / Wali Kandung
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">*Data ini diperlukan resmi oleh Dapodik sebagai nama ibu kandung serta nomor koordinasi darurat.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Ibu Kandung <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-medium transition-all"
                      placeholder="Nama Lengkap Ibu"
                      value={namaIbu}
                      onChange={(e) => setNamaIbu(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pekerjaan Ibu</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-medium transition-all"
                      placeholder="Contoh: Ibu Rumah Tangga, Guru, Wiraswasta"
                      value={pekerjaanIbu}
                      onChange={(e) => setPekerjaanIbu(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Ayah Kandung</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-medium transition-all"
                      placeholder="Nama Lengkap Ayah"
                      value={namaAyah}
                      onChange={(e) => setNamaAyah(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pekerjaan Ayah</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-medium transition-all"
                      placeholder="Contoh: Petani, Buruh, Karyawan, PNS"
                      value={pekerjaanAyah}
                      onChange={(e) => setPekerjaanAyah(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">No. HP / WhatsAppAktif <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      maxLength={14}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-sm font-semibold transition-all tracking-wider"
                      placeholder="Contoh: 081234567890 (langsung terhubung untuk verifikasi lanjutan)"
                      value={noHpOrangTua}
                      onChange={(e) => setNoHpOrangTua(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Dokumen Pemberkasan */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <FileText className="text-emerald-600 w-5 h-5" /> Kelengkapan Berkas & Surat Pertanggungjawaban
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Orang tua wajib menjamin keaslian data. Berkas fisik asli wajib diserahkan kepada panitia sekolah setelah melakukan pengisian formulir ini.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-xs text-slate-700 leading-normal text-justify">
                      <strong className="block text-amber-800 mb-1">Mengenai Surat Pertanggungjawaban Mutlak (SPTJM)</strong>
                      SPTJM bermaterai Rp10.000 wajib dibuat atas nama orang tua calon peserta didik, menyertakan keabsahan data kependudukan.
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowSPTJMModal(true)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Lihat / Print Draft SPTJM
                    </button>
                  </div>

                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-widest pt-3">
                    Beri ceklis jika bersedia membawakan berkas asli saat verifikasi offline:
                  </label>

                  <div className="space-y-3.5">
                    <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={hasAkta}
                        onChange={(e) => setHasAkta(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-extrabold text-slate-800 block">Akta Kelahiran / Surat Keterangan Lahir (Asli & Fotokopi)</span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">Wajib dimiliki sebagai bukti otentik tanggal kelahiran anak.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={hasKK}
                        onChange={(e) => setHasKK(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-extrabold text-slate-800 block">Kartu Keluarga / KK (Diterbitkan minimal 1 tahun sebelum pendaftaran)</span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">Wajib terdaftar dalam wilayah zonasi desa guna pendaftaran SPMB.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={hasSPTJM}
                        onChange={(e) => setHasSPTJM(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-extrabold text-slate-800 block">Surat Pertanggungjawaban Mutlak (SPTJM) Orang Tua bermaterai Rp10.000</span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">Surat resmi penjaminan keabsahan berkas (Draft disediakan di atas).</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={hasSKKB}
                        onChange={(e) => setHasSKKB(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-extrabold text-slate-800 block">Surat Keterangan TK / PAUD asal (Ijazah / SK Kelakuan Baik - Opsional)</span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">Dapat dibawa jika memiliki riwayat sekolah asal yang memadai.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Review & Send */}
            {step === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-emerald-600 w-5 h-5" /> Tinjauan Ulang & Konfirmasi Akhir
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Pastikan seluruh data yang Anda masukkan sudah benar sebelum menekan tombol Kirim.</p>
                </div>

                <div className="bg-slate-55 border border-slate-200 p-5 rounded-3xl space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3.5 gap-x-2 border-b border-dashed border-slate-200 pb-4">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">Nama Lengkap Calon Siswa</span>
                      <span className="block text-slate-800 font-extrabold uppercase mt-0.5">{namaLengkap}</span>
                    </div>

                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">NIK Calon Siswa</span>
                      <span className="block text-slate-800 font-bold tracking-wider mt-0.5">{nik}</span>
                    </div>

                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">Jenis Kelamin</span>
                      <span className="block text-slate-800 font-semibold mt-0.5">{jenisKelamin === 'L' ? '🚹 Laki-Laki' : '🚺 Perempuan'}</span>
                    </div>

                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">Tempat, Tgl Lahir</span>
                      <span className="block text-slate-800 font-semibold mt-0.5">{tempatLahir}, {tanggalLahir}</span>
                    </div>

                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">Usia Saat Masuk</span>
                      <span className="block text-emerald-700 font-extrabold mt-0.5">{usiaDetails.tahun} Tahun {usiaDetails.bulan} Bulan</span>
                    </div>

                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">Jalur Pendaftaran</span>
                      <span className="block text-emerald-700 font-extrabold uppercase mt-0.5">
                        {jalur === 'domisili' ? '🏠 Zonasi' : jalur === 'afirmasi' ? '🛡️ Afirmasi' : '🚚 Mutasi'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 pb-4 border-b border-dashed border-slate-200">
                    <div className="col-span-2">
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">Alamat Lengkap</span>
                      <span className="block text-slate-800 font-medium mt-0.5">{alamatLengkap}, RT {rt} RW {rw}, {desa}, {kecamatan}, {kabupaten}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">Estimasi Jarak Rumah</span>
                      <span className="block text-slate-800 font-extrabold mt-0.5">{jarakKeSekolah} Meter</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 pb-2">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">Ibu Kandung</span>
                      <span className="block text-slate-800 font-semibold mt-0.5">{namaIbu || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">Ayah Kandung</span>
                      <span className="block text-slate-800 font-semibold mt-0.5">{namaAyah || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-[10px]">No HP / WA Ortu</span>
                      <span className="block text-emerald-800 font-extrabold mt-0.5">{noHpOrangTua}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 leading-relaxed flex items-start gap-2.5">
                  <input 
                    type="checkbox"
                    id="checkbox-setuju"
                    required
                    defaultChecked={true}
                    className="w-4.5 h-4.5 mt-0.5 accent-emerald-600 rounded"
                  />
                  <label htmlFor="checkbox-setuju" className="cursor-pointer select-none text-justify">
                    Saya dengan kesadaran penuh menyatakan bahwa seluruh data yang diisikan adalah asli dan sesuai dengan dokumen yang sah. Apabila terdapat pemalsuan data di kemudian hari, saya bersedia menerima sanksi pembatalan kelulusan penerimaan siswa baru SD Negeri 4 Kronggen.
                  </label>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Form Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 rounded-2xl border border-slate-250 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-905 font-bold text-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 font-black text-sm text-slate-950 transition-all shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-103 hover:shadow-amber-500/15 active:scale-98 tracking-wider uppercase border border-amber-400 group"
              >
                Selanjutnya <ChevronRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform font-black" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-sm text-white transition-all shadow-lg flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
              >
                Kirim & Cetak Formulir <CheckCircle className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

        </form>

      </div>

      {/* Draft SPTJM Modal */}
      {showSPTJMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-2 border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative"
          >
            <button
              onClick={() => setShowSPTJMModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-550 border border-slate-200 flex items-center justify-center font-bold hover:bg-rose-100 hover:text-rose-700 transition-colors shrink-0 cursor-pointer"
            >
              ✕
            </button>
            
            <div className="text-center font-serif text-slate-900 leading-normal border-b pb-4 mb-6">
              <h4 className="font-extrabold text-sm sm:text-base uppercase tracking-wide">
                SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM)
              </h4>
              <h3 className="font-bold text-xs uppercase text-slate-500 mt-1">
                Kebenaran Dokumen Persyaratan SPMB SD Negeri 4 Kronggen
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 space-y-4 font-serif leading-relaxed">
              <p>Saya yang bertandatangan di bawah ini:</p>
              
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="font-bold w-1/3 py-1 text-slate-400">Nama Orang Tua/Wali</td>
                    <td className="py-1">: {namaIbu || namaAyah || '................................................'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1 text-slate-400">Pekerjaan</td>
                    <td className="py-1">: {pekerjaanIbu || pekerjaanAyah || '................................................'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1 text-slate-400">No. HP / WA Terdaftar</td>
                    <td className="py-1">: {noHpOrangTua || '................................................'}</td>
                  </tr>
                </tbody>
              </table>

              <p>Selaku Orang Tua / Wali Kandung dari Calon Peserta Didik Baru:</p>

              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="font-bold w-1/3 py-1 text-slate-400">Nama Lengkap Murid</td>
                    <td className="py-1 uppercase font-bold">: {namaLengkap || '................................................'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1 text-slate-400">NIK Calon Murid</td>
                    <td className="py-1">: {nik || '................................................'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1 text-slate-400">Tempat, Tanggal Lahir</td>
                    <td className="py-1">: {tempatLahir || '..............'}, {tanggalLahir ? hitungUsia(tanggalLahir).tahun + ' th ' + hitungUsia(tanggalLahir).bulan + ' bln' : '...................'}</td>
                  </tr>
                </tbody>
              </table>

              <p className="font-semibold block pt-2">MENYATAKAN DENGAN SEBENAR-BENARNYA BAHWA:</p>

              <ol className="list-decimal pl-5 space-y-2 text-xs text-justify">
                <li>Seluruh dokumen persyaratan fisik pendaftaran SPMB SD Negeri 4 Kronggen Tahun Ajaran 2026/2027 yang saya unggah / serahkan adalah Sah, Asli, dan Sesuai dengan berkas kependudukan di Dinas Dukcapil Kabupaten Grobogan.</li>
                <li>Jika di kemudian hari ditemukan bahwa dokumen kependudukan (KK, Akta Lahir) atau keterangan jarak domisili tidak benar, saya bersedia menerima sanksi pembatalan hak masuk anak saya di sekolah ini.</li>
              </ol>

              <div className="pt-8 flex justify-end">
                <div className="text-center text-xs shrink-0 relative">
                  <span className="block text-slate-400">Grobogan, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="block text-slate-400 font-medium mt-1 mb-14">Yang membuat pernyataan,</span>
                  
                  {/* Fake stamp area */}
                  <div className="absolute top-10 right-10 w-16 h-8 border border-dashed border-slate-400/40 text-slate-450 text-[8px] flex items-center justify-center font-bold uppercase select-none rotate-2">
                    Materai 10.000
                  </div>

                  <div className="w-36 border-b border-slate-500 mx-auto" />
                  <span className="block text-slate-800 font-extrabold uppercase mt-1">({namaIbu || namaAyah || 'NAMA ORANG TUA'})</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1 shrink-0 cursor-pointer"
              >
                Cetak Lembar SPTJM Ini
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </section>
  );
}
