import { Leaf, GraduationCap, Sprout, Languages, ShieldCheck, HeartHandshake, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProgramUnggulan() {
  const programs = [
    {
      title: 'SASI SASA (Satu Siswa Satu Sapu)',
      description: 'Gerakan pembiasaan tanggung jawab personal terhadap kebersihan, pilah sampah, serta kearifan menjaga lingkungan sekolah setiap hari secara konsisten.',
      details: 'Siswa dibiasakan membawa tumbler, sedekah tanaman setiap hari Jumat, dan merawat tanaman hias di lingkungan kelas. Sesuai visi Sekolah Peduli dan berbudaya Lingkungan Hidup.',
      color: 'from-emerald-400 to-teal-600',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Leaf,
      delay: 0.1,
    },
    {
      title: 'HAJUZA (Hafalan Juz Amma)',
      description: 'Program keagamaan hafalan surat pendek Juz 30 yang dilafalkan bersama sebelum pelajaran dimulai, diintegrasikan dengan kajian ayat tentang melestarikan alam semesta.',
      details: 'Dilaksanakan melalui Sholat Dhuhur berjamaah setiap hari, Sholat Dhuha bersama pada hari Jumat, serta siraman rohani pembentukan karakter berakhlak mulia.',
      color: 'from-teal-400 to-cyan-600',
      tagColor: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: GraduationCap,
      delay: 0.2,
    },
    {
      title: 'Tani Cilik Kronggen',
      description: 'Pembelajaran luar kelas (outdoor learning) bekerja sama dengan petani lokal Kronggen untuk mengenalkan kearifan pertanian organik modern dan ekosistem sawah alami.',
      details: 'Siswa diajak langsung menanam padi, memantau siklus hidup tanaman, mengenal ekologi serangga sawah, serta menghargai perjuangan petani dalam swasembada pangan lokal.',
      color: 'from-amber-400 to-emerald-600',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Sprout,
      delay: 0.3,
    },
    {
      title: 'KAMBOJA (Kamis Boso Jowo)',
      description: 'Upaya pelestarian kebudayaan daerah melalui pembiasaan berbicara menggunakan Bahasa Jawa krama alus yang sopan dan santun setiap hari Kamis.',
      details: 'Menumbuhkan rasa cinta tanah air, tata krama, etika berbicara kepada orang tua, guru, serta sesama teman, dipadukan pakaian adat daerah pada momen-momen tertentu.',
      color: 'from-rose-400 to-amber-600',
      tagColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Languages,
      delay: 0.4,
    },
    {
      title: 'Sekolah Berbasis Digital',
      description: 'SD Negeri 4 Kronggen merupakan sekolah berbasis digital dengan memiliki webs dan absensi digital berbasis QR-Digital Card.',
      details: 'Siswa didaftarkan secara online & divalidasi presensi hariannya secara seketika menggunakan kartu QR code personal yang terekam aman di server sekolah.',
      color: 'from-blue-500 to-indigo-600',
      tagColor: 'bg-blue-105 bg-blue-100 text-blue-800 border-blue-250',
      icon: QrCode,
      delay: 0.5,
    },
  ];

  return (
    <section id="program-unggulan" className="py-16 bg-gradient-to-b from-emerald-50/50 to-white relative overflow-hidden">
      {/* Decorative leaf shapes */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-100/40 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Program Unggulan Sekolah
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3.5xl sm:text-4xl font-bold text-slate-800 tracking-tight"
          >
            Program Unggulan <span className="text-emerald-600 relative inline-block">SD NEGERI 4 KRONGGEN<span className="absolute bottom-1.5 left-0 w-full h-2 bg-emerald-200/50 -z-10 rounded"></span></span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed"
          >
            Sebagai <span className="font-semibold text-emerald-700">"Sekolah Peduli dan berbudaya Lingkungan Hidup"</span>, kami berkomitmen untuk menyeimbangkan kecerdasan akademis dengan kedisiplinan ekologis, moral agama yang kokoh, dan pelestarian budaya lokal.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((prog, index) => {
            const IconComponent = prog.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: prog.delay }}
                whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
                id={`program-card-${index}`}
                className={`bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl shadow-slate-100/80 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 flex flex-col justify-between group ${
                  index === 4 ? 'md:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${prog.color} text-white shadow-lg shadow-emerald-900/10 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${prog.tagColor}`}>
                      ECO-GREEN SCHOOL
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors duration-200">
                    {prog.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4 text-justify">
                    {prog.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Penerapan dalam Pembelajaran
                  </h4>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed italic text-justify">
                    "{prog.details}"
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Highlight Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          {/* Wave decor background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_120%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl shrink-0">
              <HeartHandshake className="w-8 h-8 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Seluruh Proses SPMB 100% GRATIS (Rp 0,-)</h3>
              <p className="text-emerald-100 text-sm mt-1 text-justify">
                SD Negeri 4 Kronggen membebaskan biaya pendaftaran, uang pangkal, maupun tes masuk demi akses keadilan pendidikan bagi warga Grobogan.
              </p>
            </div>
          </div>
          
          <div className="shrink-0">
            <a
              href="#form-pendaftaran"
              className="inline-block px-6 py-3 bg-white text-emerald-700 font-bold rounded-2xl shadow-lg hover:bg-emerald-50 active:bg-white hover:scale-105 active:scale-98 transition-all duration-200 text-center text-sm"
            >
              Daftar Sekarang Juga
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
