import { Users, Trees, Home, Shield, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { CalonSiswa } from '../types';

interface KuotaStatsProps {
  students: CalonSiswa[];
}

export default function KuotaStats({ students }: KuotaStatsProps) {
  // Hitung jumlah pendaftar per jalur yang disetujui / diterima
  const getCountByJalur = (jalur: 'domisili' | 'afirmasi' | 'mutasi') => {
    return students.filter(s => s.jalur === jalur && (s.status === 'Diterima' || s.status === 'Pending' || s.status === 'Terverifikasi')).length;
  };

  const countZonasi = getCountByJalur('domisili');
  const countAfirmasi = getCountByJalur('afirmasi');
  const countMutasi = getCountByJalur('mutasi');

  const quotaZonasi = 23;
  const quotaAfirmasi = 4;
  const quotaMutasi = 1;
  const totalQuota = 28;

  const totalFilled = countZonasi + countAfirmasi + countMutasi;
  const remainingSeats = Math.max(0, totalQuota - totalFilled);
  const fillPercentage = Math.min(100, Math.round((totalFilled / totalQuota) * 100));

  const paths = [
    {
      name: 'Jalur Domisili (Zonasi)',
      icon: Home,
      quota: quotaZonasi,
      filled: countZonasi,
      pctg: 'Minimal 80%',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      barColor: 'bg-emerald-500',
      borderColor: 'border-emerald-200',
      notes: 'Prioritas utama bagi warga terdekat dengan wilayah sekolah di Desa Kronggen dan sekitarnya (Kec. Brati, Grobogan). Seleksi murni berdasarkan jarak rumah ke sekolah, bukan tes akademik.',
    },
    {
      name: 'Jalur Afirmasi',
      icon: Shield,
      quota: quotaAfirmasi,
      filled: countAfirmasi,
      pctg: 'Minimal 15%',
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-100',
      barColor: 'bg-teal-500',
      borderColor: 'border-teal-200',
      notes: 'Khusus bagi calon peserta didik dari keluarga ekonomi kurang mampu (dibuktikan dengan KIP, PKH/KKS) serta anak berkebutuhan khusus / disabilitas ringan.',
    },
    {
      name: 'Jalur Mutasi Pindahan',
      icon: Trees,
      quota: quotaMutasi,
      filled: countMutasi,
      pctg: 'Maksimal 5%',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-100',
      barColor: 'bg-amber-500',
      borderColor: 'border-amber-200',
      notes: 'Ditujukan bagi calon murid yang mengikuti perpindahan tugas kedinasan orang tua/wali (dibuktikan surat keputusan mutasi) atau kuota anak kandung guru/tendik.',
    },
  ];

  return (
    <section id="kuota-jalur" className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1 bg-amber-100 border border-amber-200 text-amber-850 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-amber-600" />
            Kuota & Informasi Pendaftaran
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight"
          >
            Daya Tampung Kursi SPMB <span className="text-emerald-600">2026/2027</span>
          </motion.h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Sesuai keputusan Dinas Pendidikan Kabupaten Grobogan, SD Negeri 4 Kronggen membuka <strong className="text-emerald-700">1 Rombongan Belajar (Rombel)</strong> dengan daya tampung maksimal 28 siswa.
          </p>
        </div>

        {/* Global Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-3xl p-6 sm:p-8 mb-12 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Pengisian Kuota Saat Ini</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center gap-2 mt-1">
                {totalFilled} / {totalQuota} <span className="text-sm font-semibold text-slate-500">Kursi Terisi ({fillPercentage}%)</span>
              </h3>
            </div>
            
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-emerald-600 text-white rounded-2xl text-center shadow-md shadow-emerald-950/10">
                <span className="block text-xs text-emerald-100">Kursi Tersisa</span>
                <span className="text-lg font-bold">{remainingSeats} Kursi</span>
              </div>
              <div className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-2xl text-center shadow-xs">
                <span className="block text-xs text-slate-400">Total Rombel</span>
                <span className="text-lg font-bold text-emerald-600">1 Kelas</span>
              </div>
            </div>
          </div>

          {/* Bar */}
          <div className="relative w-full h-5 bg-slate-200 rounded-full overflow-hidden p-1 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${fillPercentage}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full relative"
            >
              <span className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
            </motion.div>
          </div>

          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5 italic">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            *Data pendaftar di atas diperbarui secara realtime dari formulir pendaftaran lokal di browser ini.
          </p>
        </motion.div>

        {/* Path Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {paths.map((path, idx) => {
            const Icon = path.icon;
            const isFull = path.filled >= path.quota;
            const pathFillPct = Math.min(100, Math.round((path.filled / path.quota) * 100));

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`bg-white rounded-3xl p-6 border ${path.borderColor} shadow-lg shadow-slate-100 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 relative`}
              >
                {/* Ribbon Tag */}
                <span className="absolute -top-3 right-5 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {path.pctg}
                </span>

                <div>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className={`p-3 rounded-2xl ${path.bgColor} ${path.textColor} shadow-xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight lg:text-base xl:text-lg">
                        {path.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        Kuota Resmi: <span className="text-slate-700 font-bold">{path.quota} Kursi</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                    {path.notes}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                    <span className="font-medium">Status Pendaftar Dolar/Terisi:</span>
                    <span className="font-bold text-slate-800">
                      {path.filled} / {path.quota} Kursi ({pathFillPct}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${path.barColor} rounded-full`}
                      style={{ width: `${pathFillPct}%` }}
                    />
                  </div>

                  {isFull ? (
                    <div className="mt-3.5 px-3 py-1 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-100 text-center uppercase tracking-wide">
                      Kuota Jalur Penuh
                    </div>
                  ) : (
                    <div className={`mt-3.5 px-3 py-1 ${path.bgColor} ${path.textColor} text-[11px] font-bold rounded-lg text-center uppercase tracking-wide`}>
                      Tersedia {path.quota - path.filled} Kursi
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
