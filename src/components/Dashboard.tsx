import React, { useState } from 'react';
import { Setoran } from '../types';
import { Users, BookOpen, CalendarDays, Award, Filter, LayoutDashboard } from 'lucide-react';

interface DashboardProps {
  data: Setoran[];
}

export function Dashboard({ data }: DashboardProps) {
  const [selectedHalaqah, setSelectedHalaqah] = useState<string>('Semua Kelas');
  
  // Ambil daftar halaqah unik dari data
  const uniqueHalaqahs = Array.from(new Set(data.map(s => s.halaqah))).filter(Boolean).sort();

  // Filter data berdasarkan halaqah terpilih
  const filteredData = selectedHalaqah === 'Semua Kelas' ? data : data.filter(s => s.halaqah === selectedHalaqah);

  // Fungsi pembantu untuk menghitung jumlah hadits/halaman dari format "1 - 5" atau "1, 2, 3"
  const hitungJumlahSetoran = (noHaditsStr: string): number => {
    if (!noHaditsStr) return 0;
    const parts = noHaditsStr.toString().split(',');
    let total = 0;
    
    for (const part of parts) {
      const range = part.trim();
      if (range.includes('-')) {
        const [start, end] = range.split('-');
        const s = parseInt(start.trim(), 10);
        const e = parseInt(end.trim(), 10);
        if (!isNaN(s) && !isNaN(e) && e >= s) {
          total += (e - s + 1);
        } else {
          total += 1;
        }
      } else {
        const num = parseInt(range, 10);
        if (!isNaN(num)) {
          total += 1;
        } else {
          total += 1;
        }
      }
    }
    return total > 0 ? total : 1;
  };

  const totalSetoran = filteredData.reduce((acc, curr) => acc + hitungJumlahSetoran(curr.noHadits), 0);
  const uniqueSantri = new Set(filteredData.map(s => s.namaSantri)).size;
  
  const santriCounts = filteredData.reduce((acc, curr) => {
    acc[curr.namaSantri] = (acc[curr.namaSantri] || 0) + hitungJumlahSetoran(curr.noHadits);
    return acc;
  }, {} as Record<string, number>);
  
  const topSantri = Object.entries(santriCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const hariIni = new Date().toISOString().split('T')[0];
  const setoranHariIni = filteredData.filter(s => s.tanggal === hariIni).reduce((acc, curr) => acc + hitungJumlahSetoran(curr.noHadits), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#E8E2D5]">
        <h2 className="text-lg font-serif font-bold text-[#5F584F] flex items-center gap-2">
          <LayoutDashboard size={20} className="text-[#7D8F69]" />
          Ringkasan Statistik
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-[#F5F1E8] p-2 rounded-lg text-[#A4907C]">
            <Filter size={16} />
          </div>
          <select 
            value={selectedHalaqah} 
            onChange={(e) => setSelectedHalaqah(e.target.value)}
            className="w-full sm:w-auto bg-[#FAF8F4] border border-[#D4C7B0] text-[#4A443D] text-sm rounded-lg focus:ring-[#7D8F69] focus:border-[#7D8F69] block p-2"
          >
            <option value="Semua Kelas">Semua Kelas / Halaqah</option>
            {uniqueHalaqahs.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E8E2D5] flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F5F1E8] rounded-xl flex items-center justify-center text-[#7D8F69]">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A4907C] uppercase tracking-wider">Total Hafalan</p>
            <p className="text-2xl font-serif font-bold text-[#4A443D]">{totalSetoran}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E8E2D5] flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F5F1E8] rounded-xl flex items-center justify-center text-[#7D8F69]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A4907C] uppercase tracking-wider">Santri Aktif</p>
            <p className="text-2xl font-serif font-bold text-[#4A443D]">{uniqueSantri}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E8E2D5] flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F5F1E8] rounded-xl flex items-center justify-center text-[#7D8F69]">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A4907C] uppercase tracking-wider">Rata-rata/Santri</p>
            <p className="text-2xl font-serif font-bold text-[#4A443D]">
              {uniqueSantri ? Math.round(totalSetoran / uniqueSantri) : 0}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E8E2D5] flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F5F1E8] rounded-xl flex items-center justify-center text-[#7D8F69]">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A4907C] uppercase tracking-wider">Hafalan Hari Ini</p>
            <p className="text-2xl font-serif font-bold text-[#4A443D]">
              {setoranHariIni}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E2D5]">
          <h3 className="text-lg font-serif font-bold text-[#5F584F] mb-4">Top 5 Santri (Terbanyak)</h3>
          <div className="flex flex-col gap-3">
            {topSantri.length > 0 ? topSantri.map(([nama, count], index) => (
              <div key={nama} className="flex items-center justify-between p-3 bg-[#FAF8F4] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E8E2D5] text-[#7D8F69] font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <span className="font-bold text-[#4A443D]">{nama}</span>
                </div>
                <span className="text-sm font-bold bg-[#7D8F69] text-white px-2 py-1 rounded-lg">{count} Hadits/Hal</span>
              </div>
            )) : (
              <p className="text-sm text-[#A4907C] italic">Belum ada data setoran</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
