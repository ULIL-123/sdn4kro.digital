import { useState, useEffect } from 'react';
import { Camera, Calendar, Sparkles, X, Heart, Award, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Kegiatan } from '../types';

interface KegiatanPraktikBaikProps {
  kegiatanList: Kegiatan[];
}

export default function KegiatanPraktikBaik({ kegiatanList }: KegiatanPraktikBaikProps) {
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);

  // Keyboard navigation listener (ArrowRight/ArrowLeft/Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedKegiatan || kegiatanList.length <= 1) return;
      
      const idx = kegiatanList.findIndex(k => k.id === selectedKegiatan.id);
      if (idx === -1) return;

      if (e.key === 'ArrowRight') {
        const nextIdx = (idx + 1) % kegiatanList.length;
        setSelectedKegiatan(kegiatanList[nextIdx]);
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (idx - 1 + kegiatanList.length) % kegiatanList.length;
        setSelectedKegiatan(kegiatanList[prevIdx]);
      } else if (e.key === 'Escape') {
        setSelectedKegiatan(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKegiatan, kegiatanList]);

  // Helper to determine badge color depending on category
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'lingkungan':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'keagamaan':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'sains & alam':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pelestarian budaya':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <section id="kegiatan-praktik-baik" className="py-20 bg-slate-50 relative overflow-hidden border-b border-slate-100 no-print">
      {/* Decorative dynamic elements */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-100/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-805 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            Galeri Praktik Baik Sekolah
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4.5xl font-extrabold text-slate-800 tracking-tight leading-tight"
          >
            Kegiatan Praktik Baik <br />
            <span className="text-emerald-600 relative inline-block mt-1">
              SD Negeri 4 Kronggen
              <span className="absolute bottom-1.5 left-0 w-full h-2.5 bg-emerald-200/50 -z-10 rounded-full"></span>
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed text-balance"
          >
            Dokumentasi pembiasaan unggul dan aksi luhur siswa-siswi kami dalam membentuk watak peduli lingkungan, berbudaya luhur, cerdas spiritual, serta tanggap ilmu pengetahuan.
          </motion.p>
        </div>

        {/* Kegiatan Grid */}
        {kegiatanList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto">
            <Camera className="w-12 h-12 text-slate-350 mx-auto mb-3 stroke-1" />
            <p className="text-slate-500 text-sm font-semibold">Belum ada dokumentasi Kegiatan Praktik Baik.</p>
            <p className="text-slate-400 text-xs mt-1">Silakan tambahkan data baru melalui Panel Panitia (Admin Guru).</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kegiatanList.map((k, index) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                id={`kegiatan-card-${k.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
              >
                {/* Image Container */}
                <div className="h-48 sm:h-52 overflow-hidden relative cursor-pointer" onClick={() => setSelectedKegiatan(k)}>
                  <img 
                    src={k.imageUrl} 
                    alt={k.judul}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-501 duration-500"
                    onError={(e) => {
                      // Fallback image in case of broken link
                      e.currentTarget.src = "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  
                  {/* Category Overlay */}
                  <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${getCategoryColor(k.kategori)}`}>
                    {k.kategori}
                  </span>

                  {/* Gradient view helper overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-1">
                      Lihat Foto Detail <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-emerald-550" />
                      <span>{k.tanggalKegiatan}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-800 hover:text-emerald-700 cursor-pointer transition-colors" onClick={() => setSelectedKegiatan(k)}>
                      {k.judul}
                    </h3>

                    <p className="text-slate-500 text-xs sm:text-sm line-clamp-3 leading-relaxed text-justify">
                      {k.deskripsi}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                    <button 
                      onClick={() => setSelectedKegiatan(k)}
                      className="text-emerald-600 hover:text-emerald-700 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      Selengkapnya ➔
                    </button>
                    <div className="flex gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-100" />
                      <Award className="w-3.5 h-3.5 text-amber-400 fill-amber-50" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Big Interactive Highlight Promo Card */}
        <div className="mt-16 bg-white border border-emerald-100 p-6 sm:p-8 rounded-3xl shadow-lg shadow-emerald-50 max-w-4xl mx-auto text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100/40 rounded-full" />
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-100/80 px-3 py-1 rounded-full inline-block">
              Keunggulan Akreditasi & Kultur
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">
              Sekolah Peduli Lingkungan & Berakhlak Islami
            </h3>
            <p className="text-slate-550 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Di SD Negeri 4 Kronggen, anak Anda dibimbing secara hangat dan berkala untuk merawat tanaman, menabung sampah, membiasakan ibadah harian, serta melestarikan tradisi lokal luhur. Kami memastikan tidak sekedar mengajar teori, melainkan membiasakan <strong>Aksi Nyata (Praktik Baik)</strong> setiap hari.
            </p>
          </div>
        </div>

      </div>

      {/* Lightbox / Modal View Details */}
      <AnimatePresence>
        {selectedKegiatan && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative border border-slate-150 max-h-[92vh] overflow-y-auto scrollbar-thin flex flex-col"
              id="kegiatan-modal"
            >
              {/* Top High-Contrast Floating Close Button */}
              <button 
                onClick={() => setSelectedKegiatan(null)}
                className="absolute top-4 right-4 bg-white/95 text-slate-800 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-full shadow-xl hover:shadow-rose-100 transition-all z-40 cursor-pointer border border-slate-200 hover:scale-110 active:scale-90 flex items-center justify-center"
                aria-label="Tutup Detail"
                title="Tutup Detail"
              >
                <X className="w-5 h-5 font-black" />
              </button>

              {/* Modal Image Header with Integrated Carousel Slider Controls */}
              <div className="h-64 sm:h-85 w-full relative shrink-0 group select-none overflow-hidden bg-slate-900">
                <img 
                  key={selectedKegiatan.id} // Re-evaluate img element on active photo shift to allow animation entry
                  src={selectedKegiatan.imageUrl} 
                  alt={selectedKegiatan.judul}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80";
                  }}
                />

                {/* Left and Right Chevron Navigation Handles */}
                {kegiatanList.length > 1 && (
                  <>
                    {/* Previous Slide Button */}
                    <button
                      onClick={() => {
                        const idx = kegiatanList.findIndex(k => k.id === selectedKegiatan.id);
                        const prevIdx = (idx - 1 + kegiatanList.length) % kegiatanList.length;
                        setSelectedKegiatan(kegiatanList[prevIdx]);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-emerald-600 hover:text-white text-slate-800 p-2.5 rounded-full shadow-xl transition-all z-30 cursor-pointer border border-slate-200 hover:scale-115 active:scale-95 flex items-center justify-center"
                      title="Foto Sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Next Slide Button */}
                    <button
                      onClick={() => {
                        const idx = kegiatanList.findIndex(k => k.id === selectedKegiatan.id);
                        const nextIdx = (idx + 1) % kegiatanList.length;
                        setSelectedKegiatan(kegiatanList[nextIdx]);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-emerald-600 hover:text-white text-slate-800 p-2.5 rounded-full shadow-xl transition-all z-30 cursor-pointer border border-slate-200 hover:scale-115 active:scale-95 flex items-center justify-center"
                      title="Foto Selanjutnya"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Navigation dot markers embedded in image */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-30 bg-slate-950/60 px-4 py-1.5 rounded-full backdrop-blur-md">
                      {kegiatanList.map((k, index) => {
                        const idx = kegiatantil => kegiatantil.id === selectedKegiatan.id;
                        const isCurrent = k.id === selectedKegiatan.id;
                        return (
                          <button
                            key={k.id}
                            onClick={() => setSelectedKegiatan(k)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCurrent ? 'bg-emerald-400 w-5' : 'bg-white/50 hover:bg-white w-2'
                            }`}
                            aria-label={`Lihat Slide Ke-${index + 1}`}
                            title={`Lihat Slide Ke-${index + 1}`}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
                
                {/* Category Badge overlay inside modal */}
                <span className={`absolute bottom-4 left-4 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border shadow-md backdrop-blur-md z-20 ${getCategoryColor(selectedKegiatan.kategori)}`}>
                  {selectedKegiatan.kategori}
                </span>

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none z-10" />
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-5 flex-1 overflow-y-auto">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>JADWAL: <strong className="text-slate-700 font-extrabold">{selectedKegiatan.tanggalKegiatan}</strong></span>
                  </div>

                  <span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-md text-slate-500 tracking-wider">
                    Foto {kegiatanList.findIndex(k => k.id === selectedKegiatan.id) + 1} Dari {kegiatanList.length}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {selectedKegiatan.judul}
                </h3>

                <div className="pt-2">
                  <h4 className="text-[10px] font-black uppercase text-emerald-700 tracking-widest mb-2 bg-emerald-50 py-1.5 px-3 rounded-lg inline-block">
                    PROFIL AKTIVITAS & NILAI KARAKTER KOGNITIF
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed text-justify mt-1">
                    {selectedKegiatan.deskripsi}
                  </p>
                </div>

                {/* Keyboard tip instruction block */}
                <p className="text-[10px] text-slate-400 font-medium italic select-none">
                  💡 Tips: Anda juga bisa menggunakan tombol anak panah <strong>← Kiri</strong> / <strong>Kanan →</strong> pada keyboard untuk mengganti foto dengan cepat.
                </p>

                {/* Additional badge / footer inside modal */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                      <Sparkles className="w-5 h-5 animate-spin" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-450 leading-none">Status Budaya Sekolah</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-1">Aktif & Berkelanjutan 100%</p>
                    </div>
                  </div>
                  
                  {/* Highly Visible, balanced, unmistakable Close Button */}
                  <button 
                    onClick={() => setSelectedKegiatan(null)}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <X className="w-4 h-4 text-white font-extrabold" />
                    Tutup Dokumentasi
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
