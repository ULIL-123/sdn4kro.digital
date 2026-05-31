import { useRef, useState } from 'react';
import { CalonSiswa } from '../types';
import { Printer, ArrowLeft, Check, X, Eye, EyeOff, Info, HelpCircle, FileText, Settings, Sparkles, CheckSquare, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sdn4KronggenLogo from './Sdn4KronggenLogo';
import DinasPendidikanLogo from './DinasPendidikanLogo';

interface RegistrationCardProps {
  student: CalonSiswa;
  onBack: () => void;
}

export default function RegistrationCard({ student, onBack }: RegistrationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // States for Dedicated Interactive Print Preview
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [simulateGrayscale, setSimulateGrayscale] = useState(false);
  const [showStampInteractive, setShowStampInteractive] = useState(true);
  const [showWatermarkInteractive, setShowWatermarkInteractive] = useState(true);
  
  // Interactive checklist states
  const [checklistPaper, setChecklistPaper] = useState(true);
  const [checklistGraphics, setChecklistGraphics] = useState(true);
  const [checklistMargin, setChecklistMargin] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleModalPrint = () => {
    setShowPreviewModal(false);
    // Add small delay to let state render & trigger browser print cleanly
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const getFormatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Generate mock QR Code matrix SVG for visual authenticity
  const renderQRCodeMock = () => {
    return (
      <svg className="w-20 h-20 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" strokeWidth="2" />
        <rect x="3" y="3" width="2" height="2" fill="currentColor" />
        <rect x="17" y="1" width="6" height="6" strokeWidth="2" />
        <rect x="19" y="3" width="2" height="2" fill="currentColor" />
        <rect x="1" y="17" width="6" height="6" strokeWidth="2" />
        <rect x="3" y="19" width="2" height="2" fill="currentColor" />
        
        {/* Random dots to make it look like a real QR code */}
        <rect x="10" y="2" width="2" height="2" fill="currentColor" />
        <rect x="14" y="2" width="2" height="2" fill="currentColor" />
        <rect x="10" y="5" width="2" height="4" fill="currentColor" />
        <rect x="13" y="6" width="3" height="1" fill="currentColor" />
        <rect x="20" y="10" width="2" height="2" fill="currentColor" />
        <rect x="10" y="11" width="4" height="2" fill="currentColor" />
        <rect x="15" y="14" width="2" height="2" fill="currentColor" />
        
        <rect x="10" y="16" width="2" height="5" fill="currentColor" />
        <rect x="14" y="18" width="6" height="2" fill="currentColor" />
        <rect x="18" y="14" width="2" height="3" fill="currentColor" />
        <rect x="21" y="18" width="2" height="4" fill="currentColor" />
        <rect x="1" y="10" width="4" height="2" fill="currentColor" />
        <rect x="6" y="11" width="2" height="3" fill="currentColor" />
      </svg>
    );
  };

  // Shared sheet rendering logic to ensure visual alignment between layout views
  const renderCardContent = (isForOverlay: boolean = false) => {
    const isGrayscale = isForOverlay && simulateGrayscale;
    const isWatermarkVisible = isForOverlay ? showWatermarkInteractive : true;
    const isStampVisible = isForOverlay ? showStampInteractive : true;

    return (
      <div 
        className={`bg-white text-slate-900 border-4 border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden text-left ${
          isGrayscale ? 'filter grayscale contrast-125' : ''
        }`}
      >
        {/* Background emblem placeholder for printing watermark */}
        {isWatermarkVisible && (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
            <Sdn4KronggenLogo size={360} className="text-emerald-800" />
          </div>
        )}

        {/* Header - KOP SURAT */}
        <div className="pb-4 border-b-4 border-double border-slate-950">
          <div className="flex flex-row items-center justify-between gap-4">
            {/* Logo Dinas Pendidikan di sebelah kiri */}
            <div className="shrink-0">
              <DinasPendidikanLogo size={62} className="drop-shadow-sm" />
            </div>

            {/* Kop Surat Text Tengah */}
            <div className="flex-1 text-center">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase leading-tight">
                PEMERINTAH KABUPATEN GROBOGAN
              </h2>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-tight leading-normal text-slate-950 animate-pulse-slow">
                SD NEGERI 4 KRONGGEN
              </h1>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight mt-1">
                Dusun Sembukan RT 02 RW 08 Desa Kronggen, Brati
              </p>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight">
                Grobogan, Jawa Tengah 58153
              </p>
              <p className="text-[9px] sm:text-[10px] italic font-semibold text-slate-500 leading-none mt-1">
                Pos-El: sdn4kronggen@gmail.com, NPSN: 20313593
              </p>
            </div>

            {/* Logo SD di sebelah kanan */}
            <div className="shrink-0">
              <Sdn4KronggenLogo size={62} className="drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Receipt Title */}
        <div className="my-5 text-center">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-wider uppercase leading-none">
            BUKTI PENDAFTARAN PESERTA DIDIK BARU (SPMB)
          </h3>
          <p className={`text-[10px] sm:text-xs font-black tracking-widest mt-1 uppercase ${
            isGrayscale ? 'text-slate-700' : 'text-emerald-700'
          }`}>
            TAHUN AJARAN 2026 / 2027
          </p>
          <div className={`inline-block mt-2 border px-4 py-1.5 rounded-full ${
            isGrayscale ? 'bg-slate-50 border-slate-300' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <span className="text-[11px] font-bold text-slate-400">Nomor Pendaftaran: </span>
            <dfn className={`not-italic text-xs sm:text-sm font-black ${
              isGrayscale ? 'text-slate-800' : 'text-emerald-800'
            }`}>{student.id}</dfn>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-slate-800 text-[11px] sm:text-xs border-t border-b border-dashed border-slate-300 py-4">
          
          {/* Main Info Columns */}
          <div className="md:col-span-8 space-y-3.5">
            <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 border-b pb-0.5 ${
              isGrayscale ? 'text-slate-650 border-slate-200' : 'text-emerald-700 border-emerald-100'
            }`}>
              A. DATA CALON PESERTA DIDIK
            </h4>
            
            <table className="w-full text-left border-collapse table-auto">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400 w-1/3">Nama Lengkap</td>
                  <td className="py-1 text-slate-805 font-bold uppercase">: {student.namaLengkap}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">NIK Calon Siswa</td>
                  <td className="py-1 text-slate-700">: {student.nik}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">Jenis Kelamin</td>
                  <td className="py-1 text-slate-700">
                    : {student.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">Tempat, Tgl Lahir</td>
                  <td className="py-1 text-slate-700">
                    : {student.tempatLahir}, {getFormatDate(student.tanggalLahir)}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">Kriteria Usia (1 Juli 2026)</td>
                  <td className="py-1 text-slate-805 font-bold">
                    : {student.usiaTahun} Tahun {student.usiaBulan} Bulan
                    {student.usiaTahun >= 7 && (
                      <span className={`ml-2 text-[9px] py-0.5 px-2 rounded-full font-bold ${
                        isGrayscale ? 'bg-slate-200 text-slate-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>Prioritas Lulus</span>
                    )}
                    {student.usiaTahun === 6 && (
                      <span className={`ml-2 text-[9px] py-0.5 px-2 rounded-full font-bold ${
                        isGrayscale ? 'bg-slate-200 text-slate-800' : 'bg-sky-100 text-sky-800'
                      }`}>Memenuhi Syarat</span>
                    )}
                    {student.usiaTahun < 6 && (
                      <span className={`ml-2 text-[9px] py-0.5 px-2 rounded-full font-bold ${
                        isGrayscale ? 'bg-slate-200 text-slate-800' : 'bg-amber-100 text-amber-800'
                      }`}>Syarat Khusus</span>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">NISN (jika ada)</td>
                  <td className="py-1 text-slate-705">: {student.nisn || 'Tidak ada/belum punya'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">Alamat Rumah</td>
                  <td className="py-1 text-slate-700">: {student.alamatLengkap}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">E-RT / RW</td>
                  <td className="py-1 text-slate-705">: RT {student.rt} / RW {student.rw}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">Wilayah Zonasi Desa</td>
                  <td className="py-1 text-slate-700">: {student.desa}, Brati, Grobogan</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">Estimasi Jarak Rumah</td>
                  <td className="py-1 text-slate-850 font-extrabold">: {student.jarakKeSekolah} Meter</td>
                </tr>
              </tbody>
            </table>

            <h4 className={`text-[10px] font-bold uppercase tracking-widest pt-2 mb-2 border-b pb-0.5 ${
              isGrayscale ? 'text-slate-600 border-slate-200' : 'text-teal-700 border-teal-100'
            }`}>
              B. DATA ORANG TUA / WALI
            </h4>
            
            <table className="w-full text-left border-collapse table-auto">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400 w-1/3">Nama Ayah Kandung</td>
                  <td className="py-1 text-slate-700">: {student.namaAyah} ({student.pekerjaanAyah})</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">Nama Ibu Kandung</td>
                  <td className="py-1 text-slate-700">: {student.namaIbu} ({student.pekerjaanIbu})</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1 font-semibold text-slate-400">No HP / WhatsApp</td>
                  <td className="py-1 text-slate-700 font-mono">: {student.noHpOrangTua}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sidebar Area - Pathway and Checklist */}
          <div className="md:col-span-4 border-l-0 md:border-l border-slate-200 pl-0 md:pl-4 space-y-4">
            <div className={`p-3 rounded-2xl border ${
              isGrayscale ? 'bg-slate-50 border-slate-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Jalur Masuk Terpilih</span>
              <span className="text-xs font-black text-slate-800 uppercase block mt-0.5">
                {student.jalur === 'domisili' ? '🏠 Zonasi Domisili' : student.jalur === 'afirmasi' ? '🛡️ Afirmasi Sosial' : '🚚 Perpindahan Tugas'}
              </span>
              <div className={`p-1 px-2 rounded text-[8px] font-bold inline-block mt-1.5 text-white ${
                isGrayscale ? 'bg-slate-700' : 'bg-emerald-600'
              }`}>
                TA 2026/2027
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                VERIFIKASI BERKAS FISIK
              </h4>
              
              <ul className="space-y-1 text-[10px] leading-relaxed">
                <li className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                    student.hasAkta 
                      ? isGrayscale ? 'bg-slate-200 border-slate-500 text-slate-800' : 'bg-emerald-100 border-emerald-500 text-emerald-700' 
                      : 'border-slate-300'
                  }`}>
                    {student.hasAkta && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span className={student.hasAkta ? 'text-slate-800 font-medium font-semibold' : 'text-slate-400 line-through'}>
                    Akta Kelahiran / Surat Kenal Lahir
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                    student.hasKK 
                      ? isGrayscale ? 'bg-slate-200 border-slate-500 text-slate-800' : 'bg-emerald-100 border-emerald-500 text-emerald-700' 
                      : 'border-slate-300'
                  }`}>
                    {student.hasKK && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span className={student.hasKK ? 'text-slate-800 font-medium font-semibold' : 'text-slate-400 line-through'}>
                    Kartu Keluarga (KK Kabupaten)
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                    student.hasSPTJM 
                      ? isGrayscale ? 'bg-slate-200 border-slate-500 text-slate-800' : 'bg-emerald-100 border-emerald-500 text-emerald-700' 
                      : 'border-slate-300'
                  }`}>
                    {student.hasSPTJM && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span className={student.hasSPTJM ? 'text-slate-800 font-medium font-semibold' : 'text-slate-400 line-through'}>
                    SPTJM Bermaterai Orang Tua
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                    student.hasSKKB 
                      ? isGrayscale ? 'bg-slate-200 border-slate-500 text-slate-800' : 'bg-emerald-100 border-emerald-500 text-emerald-700'  
                      : 'border-slate-300'
                  }`}>
                    {student.hasSKKB && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span className={student.hasSKKB ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                    Surat Keterangan TK (opsional)
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center p-2.5 border border-dashed border-slate-300 rounded-2xl bg-white select-none">
              {renderQRCodeMock()}
              <span className="text-[8px] text-slate-400 font-mono mt-1 uppercase text-center block">
                ZONATION-VERIFIED CRYPTO
              </span>
            </div>
          </div>

        </div>

        {/* Footer info & Signature Block */}
        <div className="mt-5 flex flex-col sm:flex-row justify-between gap-4 overflow-hidden text-[10px]">
          
          <div className="text-slate-500 py-1 sm:max-w-xs space-y-1.5">
            <h5 className="font-extrabold text-slate-700 flex items-center gap-0.5">📜 Syarat Daftar Tambahan:</h5>
            <ol className="list-decimal pl-3.5 space-y-0.5 leading-normal text-justify">
              <li>Lembar struk ini wajib dicetak utuh dalam 1 muka kertas.</li>
              <li>Serahkan cetakan lembar bukti ini beserta fotokopi KK/Akta ke panitia SPMB.</li>
              <li>No. Whatsapp <strong>{student.noHpOrangTua}</strong> must be active during sorting.</li>
              <li>Penerimaan murni didasarkan atas validitas usia & zonasi wilayah.</li>
            </ol>
          </div>

          <div className="flex justify-between sm:justify-end gap-5">
            {/* TTD Orang tua */}
            <div className="text-center shrink-0 pt-2 select-none">
              <span className="block text-slate-400 mb-10 font-medium">Wali Calon Murid,</span>
              <div className="w-24 border-b border-slate-400 mx-auto" />
              <span className="block text-slate-700 font-bold uppercase mt-1">({student.namaIbu || student.namaAyah})</span>
            </div>

            {/* TTD Panitia */}
            <div className="text-center shrink-0 pt-2 relative select-none">
              <span className="block text-slate-400 mb-0.5 font-medium">Panitia SPMB,</span>
              <span className="block text-[8px] text-slate-400 mb-8">Grobogan, {getFormatDate(new Date().toISOString())}</span>
              <div className="w-32 border-b border-slate-400 mx-auto" />
              <span className="block text-slate-750 font-bold uppercase mt-1">Asep Nurarianto, S.Pd.SD</span>
              <span className="block text-[7px] text-slate-400">NIP. 198305282009031002</span>
              
              {/* Fake round stamp layer with toggle */}
              {isStampVisible && (
                <div className={`absolute top-6 left-1 w-20 h-20 border-2 rounded-full flex items-center justify-center font-bold text-[6px] uppercase tracking-wider rotate-12 pointer-events-none select-none ${
                  isGrayscale ? 'border-slate-400/30 text-slate-500/30' : 'border-emerald-600/15 text-emerald-600/25'
                }`}>
                  <span className="text-center font-black">PANITIA SPMB<br/>SDN 4 KRONGGEN<br/>★ TERAKREDITASI ★</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    );
  };

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      {/* Action Buttons: Hidden during Print */}
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-250 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:scale-102 active:scale-98 transition-all font-medium text-xs sm:text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Utama
        </button>
        
        <div className="flex gap-2.5">
          {/* Action to launch interactive High-Fidelity Print Preview Overlay */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md font-bold text-xs sm:text-sm cursor-pointer transition-all hover:scale-103 hover:shadow-emerald-700/10 active:scale-97"
            title="Buka Lembar Pratinjau Cetak Interaktif"
          >
            <Printer className="w-4 h-4" /> Buka Pratinjau Cetak
          </button>
        </div>
      </div>

      {/* Official Form Area (Static fallback on-page) */}
      <div ref={cardRef} id="bukti-pendaftaran-print">
        {renderCardContent(false)}
      </div>

      {/* Interactive Print Preview Overlay (Modal) */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col no-print select-none outline-none"
          >
            {/* Top Navigation Control Bar */}
            <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-800 px-4 md:px-8 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Printer className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">Lembar Pratinjau Cetak Interaktif</h3>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">Simulasi Cetak A4 SD Negeri 4 Kronggen TA 2026/2027</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
                title="Tutup Pratinjau"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </header>

            {/* Split Screen Workspace / Content Section */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row items-stretch">
              
              {/* LEFT COLUMN: Setup Panel & Help Instructions (30% on Desktop) */}
              <div className="w-full md:w-80 lg:w-[350px] shrink-0 bg-slate-850 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto border-t md:border-t-0 border-slate-700">
                
                {/* Simulated Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-800">
                    <Settings className="w-4 h-4 text-emerald-500 animate-spin-slow" /> Kontrol Simulasi Hasil Cetak
                  </div>

                  <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 space-y-4">
                    {/* Grayscale toggle */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-extrabold text-white block">Mode Hitam Putih</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Bermanfaat jika printer Anda monokrom</span>
                      </div>
                      <button
                        onClick={() => setSimulateGrayscale(!simulateGrayscale)}
                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                          simulateGrayscale ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          simulateGrayscale ? 'translate-x-[20px]' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Stamp toggle */}
                    <div className="flex items-center justify-between gap-4 border-t border-slate-800/60 pt-3">
                      <div>
                        <span className="text-xs font-extrabold text-white block">Tampilkan Cap Stempel</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Stempel basah resmi panitia SPMB</span>
                      </div>
                      <button
                        onClick={() => setShowStampInteractive(!showStampInteractive)}
                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                          showStampInteractive ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          showStampInteractive ? 'translate-x-[20px]' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Watermark toggle */}
                    <div className="flex items-center justify-between gap-4 border-t border-slate-800/60 pt-3">
                      <div>
                        <span className="text-xs font-extrabold text-white block">Stempel Garis Air (Watermark)</span>
                        <span className="text-[10px] text-slate-405 text-slate-400 block mt-0.5">Transparansi lambang di lembar tengah</span>
                      </div>
                      <button
                        onClick={() => setShowWatermarkInteractive(!showWatermarkInteractive)}
                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                          showWatermarkInteractive ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          showWatermarkInteractive ? 'translate-x-[20px]' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Checklist for parents before printing */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-800">
                    <CheckSquare className="w-4 h-4 text-emerald-500" /> Checklist Persiapan Cetak
                  </div>

                  <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 space-y-3.5 text-xs">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklistPaper}
                        onChange={() => setChecklistPaper(!checklistPaper)}
                        className="w-4 h-4 accent-emerald-600 rounded bg-slate-800 border-slate-700 mt-0.5"
                      />
                      <span className="text-slate-300">Masukkan kertas ukuran <strong>A4</strong> ke dalam printer</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklistGraphics}
                        onChange={() => setChecklistGraphics(!checklistGraphics)}
                        className="w-4 h-4 accent-emerald-600 rounded bg-slate-800 border-slate-700 mt-0.5"
                      />
                      <span className="text-slate-300">Aktifkan opsi <strong>"Background Graphics / Gambar Latar"</strong> di dialog browser</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklistMargin}
                        onChange={() => setChecklistMargin(!checklistMargin)}
                        className="w-4 h-4 accent-emerald-600 rounded bg-slate-800 border-slate-700 mt-0.5"
                      />
                      <span className="text-slate-305 text-slate-300">Pastikan margin diatur ke <strong>"Default" / "None"</strong> agar tidak terpotong</span>
                    </label>
                  </div>
                </div>

                {/* Technical Help Box */}
                <div className="bg-emerald-950/40 border border-emerald-900/40 p-4 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>💡 Tips Sukses Mencetak:</span>
                  </div>
                  <p className="text-emerald-200/85 text-justify leading-relaxed text-[11px]">
                    Jika tidak memiliki printer fisik terhubung, Anda dapat klik tombol cetak di bawah lalu ganti tujuan printer menjadi <strong>"Save as PDF / Simpan sebagai PDF"</strong> untuk mengunduh dokumen bukti digital yang sah ke handphone/komputer Anda.
                  </p>
                </div>

                {/* Primary Action Trigger inside preview modal */}
                <div className="mt-auto pt-6 border-t border-slate-800">
                  <button
                    onClick={handleModalPrint}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-101 active:scale-99"
                  >
                    <Printer className="w-4.5 h-4.5" /> Cetak Sekarang (Print / PDF)
                  </button>
                  <span className="block text-center text-[10px] text-slate-500 mt-2 font-medium">Meluncurkan perintah cetak sistem operasi Anda</span>
                </div>

              </div>

              {/* RIGHT COLUMN: Realistic 3D A4 Canvas desk workspace (Scrollable) */}
              <div className="flex-1 bg-slate-900 overflow-y-auto p-4 md:p-10 flex justify-center items-start scrollbar-thin scrollbar-thumb-slate-800 select-text">
                <div className="max-w-2xl w-full translate-z-0">
                  {/* Subtle paper layout indicator */}
                  <div className="flex items-center justify-between text-slate-550 text-[10px] uppercase font-bold tracking-widest mb-3 px-2">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-500" /> Simulasi Lembar A4 Fisik</span>
                    <span>1 Halaman (Potret)</span>
                  </div>

                  {/* High fidelity realistic paper container sheet with shadow */}
                  <motion.div
                    initial={{ scale: 0.96, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
                  >
                    {renderCardContent(true)}
                  </motion.div>

                  <div className="text-center text-[11px] text-slate-500 mt-6 pb-2">
                    <span>Pratinjau di atas merepresentasikan lembar kertas berukuran 210mm x 297mm (Standard A4)</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
