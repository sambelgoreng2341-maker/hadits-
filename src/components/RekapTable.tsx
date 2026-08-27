import React from 'react';
import { Setoran } from '../types';
import { Share2 } from 'lucide-react';

interface RekapTableProps {
  data: Setoran[];
  dateStart?: string;
  dateEnd?: string;
  filterKitab?: string;
}

export function RekapTable({ data, dateStart, dateEnd, filterKitab }: RekapTableProps) {
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
          total += 1; // Fallback jika tidak valid
        }
      } else {
        const num = parseInt(range, 10);
        if (!isNaN(num)) {
          total += 1;
        } else {
          total += 1; // Fallback text biasa (misal "Al-Fatihah")
        }
      }
    }
    return total > 0 ? total : 1;
  };

  const groupedData = data.reduce((acc, curr) => {
    const key = `${curr.namaSantri}-${curr.halaqah}`;
    if (!acc[key]) {
      acc[key] = {
        namaSantri: curr.namaSantri,
        halaqah: curr.halaqah,
        totalHadits: 0
      };
    }
    
    acc[key].totalHadits += hitungJumlahSetoran(curr.noHadits);
    return acc;
  }, {} as Record<string, { namaSantri: string, halaqah: string, totalHadits: number }>);

  const sortedData = Object.values(groupedData).sort((a, b) => b.totalHadits - a.totalHadits);

  const handleShareWA = () => {
    let message = `*REKAPITULASI SETORAN HADITS*\n`;
    if (dateStart && dateEnd) {
      message += `Tanggal: ${dateStart === dateEnd ? dateStart : `${dateStart} s/d ${dateEnd}`}\n`;
    }
    if (filterKitab && filterKitab !== "Semua Kitab") {
      message += `Kitab: ${filterKitab}\n`;
    }
    message += `\n`;

    sortedData.forEach((item, index) => {
      message += `${index + 1}. ${item.namaSantri} (${item.halaqah}) - ${item.totalHadits} Hadits\n`;
    });
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  if (sortedData.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E8E2D5] shadow-sm text-center flex flex-col items-center justify-center text-[#A4907C]">
        <p className="font-medium text-[#5F584F] mb-1">Belum ada data rekapitulasi</p>
        <p className="text-sm">Silakan ubah filter atau input setoran baru.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button 
          onClick={handleShareWA}
          className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#128C7E] transition-colors shadow-sm"
        >
          <Share2 size={16} />
          Bagikan ke WA
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E2D5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F5F1E8] text-[#A4907C] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">No</th>
                <th className="px-6 py-4 font-bold">Nama Santri</th>
                <th className="px-6 py-4 font-bold">Halaqah</th>
                <th className="px-6 py-4 font-bold text-center">Jumlah Hadits Disetor</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#F0EBE0]">
              {sortedData.map((item, index) => (
                <tr key={`${item.namaSantri}-${item.halaqah}`} className="hover:bg-[#FAF8F4] transition-colors">
                  <td className="px-6 py-4 text-[#8E8578] font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-[#4A443D]">{item.namaSantri}</td>
                  <td className="px-6 py-4 text-[#5F584F]">{item.halaqah}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block bg-[#7D8F69] text-white px-3 py-1 rounded-full font-bold">
                      {item.totalHadits}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
