import React from 'react';
import { Setoran, Predikat } from '../types';
import { Trash2, AlertCircle, Cloud, CloudOff } from 'lucide-react';

interface RecapTableProps {
  data: Setoran[];
  onDelete: (id: string) => void;
}

const getPredikatColor = (predikat: Predikat) => {
  switch (predikat) {
    case 'Mumtaz': return 'bg-[#D5E2CC] text-[#4A5D3B]';
    case 'Jayyid Jiddan': return 'bg-[#E8E2D5] text-[#5F584F]';
    case 'Jayyid': return 'bg-[#F0EBE0] text-[#8E8578]';
    case 'Maqbul': return 'bg-[#FAF8F4] text-[#A4907C] border border-[#D4C7B0]';
    case 'Dhaif': return 'bg-white text-[#4A443D] border border-[#A4907C]';
    default: return 'bg-white text-[#4A443D]';
  }
};

export function RiwayatTable({ data, onDelete }: RecapTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E8E2D5] shadow-sm text-center flex flex-col items-center justify-center text-[#A4907C]">
        <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-base font-medium text-[#5F584F]">Belum ada data setoran</p>
        <p className="text-sm">Silakan input setoran atau pilih tanggal lain.</p>
      </div>
    );
  }

  return (
    <div className="bg-white flex-1 rounded-2xl shadow-sm border border-[#E8E2D5] flex flex-col overflow-hidden">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F5F1E8] text-[#A4907C] text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-bold">No</th>
              <th className="px-6 py-3 font-bold">Nama Santri</th>
              <th className="px-6 py-3 font-bold">Halaqah</th>
              <th className="px-6 py-3 font-bold">Kitab</th>
              <th className="px-6 py-3 font-bold">No. Hadits</th>
              <th className="px-6 py-3 font-bold">Predikat</th>
              <th className="px-6 py-3 font-bold">Catatan</th>
              <th className="px-6 py-3 font-bold text-center">Status</th>
              <th className="px-6 py-3 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#F0EBE0]">
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-[#FAF8F4]">
                <td className="px-6 py-4 text-[#8E8578] font-medium">{index + 1}</td>
                <td className="px-6 py-4 font-bold text-[#4A443D]">{item.namaSantri}</td>
                <td className="px-6 py-4 text-[#5F584F]">{item.halaqah}</td>
                <td className="px-6 py-4 text-[#5F584F] font-medium">{item.kitab || '-'}</td>
                <td className="px-6 py-4 text-[#5F584F]">{item.noHadits || (item as any).namaHadits || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getPredikatColor(item.predikat)}`}>
                    {item.predikat}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#5F584F] max-w-[200px] truncate" title={item.catatan}>
                  {item.catatan || '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  {item.syncStatus === 'pending' || !item.syncStatus ? (
                    <span title="Belum sinkron (Tersimpan di perangkat)" className="inline-flex items-center justify-center p-1.5 rounded-full bg-amber-100 text-amber-600">
                      <CloudOff size={14} />
                    </span>
                  ) : (
                    <span title="Tersinkronisasi (Database)" className="inline-flex items-center justify-center p-1.5 rounded-full bg-emerald-100 text-emerald-600">
                      <Cloud size={14} />
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-[#A4907C] hover:text-[#5F584F] transition-colors inline-flex"
                    title="Hapus Data"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
