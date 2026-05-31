import React, { useMemo } from 'react';
import { CalonSiswa } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  TooltipProps
} from 'recharts';
import { Users, Landmark, TrendingUp, Calendar, Heart, Shield } from 'lucide-react';

interface DashboardChartsProps {
  students: CalonSiswa[];
}

export default function DashboardCharts({ students }: DashboardChartsProps) {
  // 1. Calculate stats dynamically using useMemo
  const chartData = useMemo(() => {
    // Jalur groupings
    const jalurCount = {
      domisili: { L: 0, P: 0, total: 0 },
      afirmasi: { L: 0, P: 0, total: 0 },
      mutasi: { L: 0, P: 0, total: 0 }
    };

    // Gender totals
    let maleCount = 0;
    let femaleCount = 0;

    // Status totals
    const statusCount = {
      Diterima: 0,
      Pending: 0,
      Terverifikasi: 0,
      Cadangan: 0,
      Gugur: 0
    };

    students.forEach(student => {
      // Jalur & Gender
      const j = student.jalur;
      if (jalurCount[j] !== undefined) {
        jalurCount[j].total += 1;
        if (student.jenisKelamin === 'L') {
          jalurCount[j].L += 1;
          maleCount += 1;
        } else {
          jalurCount[j].P += 1;
          femaleCount += 1;
        }
      }

      // Status
      if (statusCount[student.status] !== undefined) {
        statusCount[student.status] += 1;
      }
    });

    // Format Jalur Data for Recharts Bar Chart
    const jalurBarData = [
      {
        name: 'Zonasi Domisili',
        'Laki-Laki (L)': jalurCount.domisili.L,
        'Perempuan (P)': jalurCount.domisili.P,
        'Total Pendaftar': jalurCount.domisili.total,
        pagu: 23
      },
      {
        name: 'Afirmasi Sosial',
        'Laki-Laki (L)': jalurCount.afirmasi.L,
        'Perempuan (P)': jalurCount.afirmasi.P,
        'Total Pendaftar': jalurCount.afirmasi.total,
        pagu: 4
      },
      {
        name: 'Mutasi Tugas',
        'Laki-Laki (L)': jalurCount.mutasi.L,
        'Perempuan (P)': jalurCount.mutasi.P,
        'Total Pendaftar': jalurCount.mutasi.total,
        pagu: 1
      }
    ];

    // Format Gender Data for Recharts Pie Chart
    const genderPieData = [
      { name: 'Laki-Laki (L)', value: maleCount, color: '#0ea5e9' }, // Emerald alternative or Sky Link
      { name: 'Perempuan (P)', value: femaleCount, color: '#ec4899' }  // Pink color-safe theme
    ];

    // Format Status Data for Stats
    const totalStudents = students.length;
    const acceptedCount = statusCount.Diterima;
    const pendingCount = statusCount.Pending + statusCount.Terverifikasi;
    const quotaPercentage = Math.min(Math.round((acceptedCount / 28) * 100), 100);

    return {
      jalurBarData,
      genderPieData,
      maleCount,
      femaleCount,
      totalStudents,
      acceptedCount,
      pendingCount,
      quotaPercentage,
      statusCount
    };
  }, [students]);

  // Handle case of zero students gracefully
  if (chartData.totalStudents === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 mb-8 text-center text-slate-500">
        <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <h4 className="font-bold text-slate-850">Analisis Laporan Grafik Belum Tersedia</h4>
        <p className="text-xs text-slate-500 mt-1">Belum ada data calon siswa terdaftar di dalam database kami untuk dicitrakan grafis.</p>
      </div>
    );
  }

  // Custom high density tooltips to fit our "craftsmanship" standard
  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-800 text-[11px] shadow-xl font-sans">
          <p className="font-extrabold text-white uppercase text-xs mb-1.5 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-extrabold text-white text-right">{entry.value} Anak</span>
            </div>
          ))}
          <div className="border-t border-slate-800/85 mt-1.5 pt-1 flex items-center justify-between font-bold text-slate-400">
            <span>Kuota Tampung (Pagu):</span>
            <span className="font-mono text-white text-right">{payload[0]?.payload?.pagu} Siswa</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const percent = chartData.totalStudents ? Math.round(((entry.value || 0) / chartData.totalStudents) * 100) : 0;
      return (
        <div className="bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-800 text-[11px] shadow-xl font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: entry.color }} />
            <span className="font-extrabold text-white">{entry.name}:</span>
            <span className="font-mono font-black text-amber-300">{entry.value} Anak</span>
          </div>
          <p className="text-[10px] text-slate-405 text-slate-400 mt-1 font-semibold">Persentase pendaftar: <strong>{percent}%</strong> dari total berkas.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-10 space-y-6">
      
      {/* Visual Quick Fact Badges Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none block">Total Berkas</span>
            <span className="text-xl font-extrabold text-slate-850 block mt-0.5 font-sans leading-none">{chartData.totalStudents} Pendaftar</span>
            <span className="text-[9px] text-slate-450 mt-1 block">Aktif dalam database</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none block">Kuota Terisi</span>
            <span className="text-xl font-extrabold text-slate-850 block mt-0.5 font-sans leading-none">{chartData.acceptedCount} / 28</span>
            <span className="text-[9px] text-slate-450 mt-1 block">Rencana rombel: {chartData.quotaPercentage}% penuh</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none block">Dokumen Masuk</span>
            <span className="text-xl font-extrabold text-slate-850 block mt-0.5 font-sans leading-none">{chartData.pendingCount} Berkas</span>
            <span className="text-[9px] text-slate-450 mt-1 block">Menunggu verifikasi</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 border border-pink-100">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Rasio Gender</span>
            <span className="text-sm font-extrabold text-slate-850 block mt-1 leading-none">
              👦 {chartData.maleCount} L &nbsp;|&nbsp; 👧 {chartData.femaleCount} P
            </span>
            <span className="text-[9px] text-slate-455 text-slate-450 mt-1 block">Keseimbangan kelas</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Bar Chart and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stacked Bar Chart for Path & Gender - Takes 8 cols */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider">
                  Distribusi Jalur Pendaftaran & Gender
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Berdasarkan data kuota tampung (Pagu Rombel) real-time</p>
              </div>
              <div className="text-[10px] py-1 px-2.5 rounded bg-slate-100 font-extrabold font-mono text-slate-500">
                BAR CHART SPREAD
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-64 sm:h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.jalurBarData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#64748b', fontWeight: 'bold' }}
                  />
                  <Tooltip content={<CustomTooltipBar />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />
                  <Legend 
                    align="right" 
                    verticalAlign="top" 
                    iconSize={8} 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '15px', fontWeight: 'bold', fontSize: '11px', color: '#475569' }}
                  />
                  <Bar dataKey="Laki-Laki (L)" stackId="a" fill="#38bdf8" radius={[0, 0, 0, 0]} barSize={28} />
                  <Bar dataKey="Perempuan (P)" stackId="a" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-450 leading-relaxed text-slate-400">
            📊 Keterangan: Pagu resmi SDN 4 Kronggen adalah <strong>Zonasi (23)</strong>, <strong>Afirmasi (4)</strong>, dan <strong>Mutasi Orang Tua (1)</strong> dengan total tampung <strong>28 Siswa</strong>.
          </div>
        </div>

        {/* Right Column: Pie Chart representation of Genders - Takes 4 cols */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider">
                  Proporsi Gender Siswa
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Beban sebaran laki-laki & perempuan</p>
              </div>
              <div className="text-[10px] py-1 px-2.5 rounded bg-slate-100 font-extrabold font-mono text-slate-500">
                PIE
              </div>
            </div>

            {/* Recharts Pie Chart Container */}
            <div className="h-44 sm:h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.genderPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.genderPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipPie />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Absolute Center Ratio Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-xl font-black text-slate-800 leading-none">
                  {Math.round((chartData.maleCount / chartData.totalStudents) * 100 || 0)}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Laki-Laki</span>
              </div>
            </div>
          </div>

          {/* Color Indicators Legend Layout */}
          <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-650">
                <div className="w-2.5 h-2.5 rounded bg-[#0ea5e9]" />
                <span>👦 Laki-Laki (L)</span>
              </div>
              <span className="font-mono font-bold text-slate-700">{chartData.maleCount} Anak ({Math.round((chartData.maleCount / chartData.totalStudents) * 100 || 0)}%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-650">
                <div className="w-2.5 h-2.5 rounded bg-[#ec4899]" />
                <span>👧 Perempuan (P)</span>
              </div>
              <span className="font-mono font-bold text-slate-700">{chartData.femaleCount} Anak ({Math.round((chartData.femaleCount / chartData.totalStudents) * 100 || 0)}%)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
