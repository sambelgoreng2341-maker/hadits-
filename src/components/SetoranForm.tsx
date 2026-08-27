import React, { useState, useEffect } from 'react';
import { Setoran, Predikat } from '../types';
import { Save, Plus, Trash2 } from 'lucide-react';

interface SetoranFormProps {
  onSubmit: (data: Omit<Setoran, 'id' | 'createdAt'>[]) => void;
  halaqahData: Record<string, string[]>;
  kitabOptions: Array<{nama: string, jumlah: number}>;
  isLoading: boolean;
}

const PREDIKAT_OPTIONS: Predikat[] = ['Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul', 'Dhaif'];

export function SetoranForm({ onSubmit, halaqahData, kitabOptions, isLoading }: SetoranFormProps) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [halaqah, setHalaqah] = useState(Object.keys(halaqahData)[0] || '');
  
  type InputRow = { id: string; kitab: string; noHaditsMulai: string; noHaditsSampai: string; predikat: Predikat; catatan: string };
  const [inputs, setInputs] = useState<Record<string, InputRow[]>>({});

  useEffect(() => {
    if (Object.keys(halaqahData).length > 0 && !halaqahData[halaqah]) {
      setHalaqah(Object.keys(halaqahData)[0]);
    }
  }, [halaqahData]);

  const createEmptyRow = (): InputRow => ({
    id: Math.random().toString(36).substring(7),
    kitab: kitabOptions.length > 0 ? kitabOptions[0].nama : '',
    noHaditsMulai: '',
    noHaditsSampai: '',
    predikat: 'Mumtaz',
    catatan: ''
  });

  useEffect(() => {
    const santriList = halaqahData[halaqah] || [];
    const newInputs: typeof inputs = {};
    santriList.forEach(s => {
      newInputs[s] = [createEmptyRow()];
    });
    setInputs(newInputs);
  }, [halaqah, halaqahData]);

  const handleInputChange = (nama: string, rowId: string, field: keyof InputRow, value: string) => {
    setInputs(prev => ({
      ...prev,
      [nama]: prev[nama].map(row => row.id === rowId ? { ...row, [field]: value } : row)
    }));
  };

  const handleAddRow = (nama: string) => {
    setInputs(prev => ({
      ...prev,
      [nama]: [...prev[nama], createEmptyRow()]
    }));
  };

  const handleRemoveRow = (nama: string, rowId: string) => {
    setInputs(prev => ({
      ...prev,
      [nama]: prev[nama].filter(row => row.id !== rowId)
    }));
  };

  const handleSaveSantri = (namaSantri: string) => {
    const santriRows = inputs[namaSantri].filter(r => r.noHaditsMulai.trim() !== '');
    if (santriRows.length === 0) {
      alert(`Belum ada No. Hadits (Mulai) yang diisi untuk ${namaSantri}.`);
      return;
    }

    const dataToSave = santriRows.map(row => {
      let noHadits = row.noHaditsMulai.trim();
      if (row.noHaditsSampai.trim() !== '') {
        noHadits = `${row.noHaditsMulai.trim()} - ${row.noHaditsSampai.trim()}`;
      }
      return {
        namaSantri,
        halaqah,
        tanggal,
        kitab: row.kitab,
        noHadits,
        predikat: row.predikat,
        catatan: row.catatan
      };
    });

    onSubmit(dataToSave);
    
    // Reset only this santri
    setInputs(prev => ({
      ...prev,
      [namaSantri]: [createEmptyRow()]
    }));
    alert(`${dataToSave.length} setoran untuk ${namaSantri} berhasil disimpan!`);
  };

  const handleSubmitAll = (e: React.FormEvent) => {
    e.preventDefault();
    const bulkData: Omit<Setoran, 'id' | 'createdAt'>[] = [];
    
    Object.entries(inputs).forEach(([namaSantri, rows]) => {
      rows.forEach(row => {
        if (row.noHaditsMulai.trim() !== '') {
          let noHadits = row.noHaditsMulai.trim();
          if (row.noHaditsSampai.trim() !== '') {
            noHadits = `${row.noHaditsMulai.trim()} - ${row.noHaditsSampai.trim()}`;
          }
          bulkData.push({
            namaSantri, halaqah, tanggal, kitab: row.kitab, noHadits, predikat: row.predikat, catatan: row.catatan
          });
        }
      });
    });

    if (bulkData.length === 0) {
      alert('Isi minimal satu No. Hadits (Mulai) untuk menyimpan setoran.');
      return;
    }

    onSubmit(bulkData);
    
    // Reset all
    const newInputs = { ...inputs };
    Object.keys(newInputs).forEach(k => {
      newInputs[k] = [createEmptyRow()];
    });
    setInputs(newInputs);
    alert(`${bulkData.length} data setoran berhasil disimpan!`);
  };

  return (
    <form onSubmit={handleSubmitAll} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8E2D5] flex-col">
      <div className="flex items-center gap-2 mb-6 border-b border-[#F0EBE0] pb-3">
        <div className="w-2 h-6 bg-[#A4907C] rounded-full"></div>
        <h2 className="text-lg font-serif font-bold text-[#5F584F]">Input Setoran Masal</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="tanggal" className="block text-xs font-bold uppercase text-[#A4907C] mb-1">Tanggal</label>
          <input type="date" id="tanggal" required value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7D8F69]" />
        </div>
        <div className="flex-1">
          <label htmlFor="halaqah" className="block text-xs font-bold uppercase text-[#A4907C] mb-1">Kelas / Halaqah</label>
          <select id="halaqah" required value={halaqah} onChange={e => setHalaqah(e.target.value)} className="w-full bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7D8F69]" disabled={isLoading}>
            {isLoading ? <option>Memuat data...</option> : Object.keys(halaqahData).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F5F1E8] text-[#A4907C] text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-3 sm:px-4 py-3 font-bold sticky left-0 z-20 bg-[#F5F1E8] shadow-[inset_-1px_0_0_#D4C7B0] w-[110px] sm:w-auto min-w-[110px] sm:min-w-[200px] sm:whitespace-nowrap">Nama Santri</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap w-40">Kitab</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap min-w-[140px]">No. Hadits (Mulai - Sampai)</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap w-36">Predikat</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap min-w-[150px]">Catatan</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#F0EBE0]">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#A4907C]">Memuat daftar santri...</td>
              </tr>
            )}
            {!isLoading && (halaqahData[halaqah] || []).map(santri => (
              <React.Fragment key={santri}>
                {inputs[santri]?.map((row, index) => (
                  <tr key={row.id} className="hover:bg-[#FAF8F4]">
                    {index === 0 && (
                      <td rowSpan={inputs[santri].length} className="px-3 sm:px-4 py-3 align-top bg-white sticky left-0 z-10 shadow-[inset_-1px_0_0_#F0EBE0] w-[110px] sm:w-auto min-w-[110px] sm:min-w-[200px]">
                        <div className="flex flex-col gap-2">
                          <span className="font-bold text-[#4A443D] block break-words sm:whitespace-nowrap leading-snug">{santri}</span>
                          <div className="flex flex-col sm:flex-row gap-1.5 mt-1">
                            <button type="button" onClick={() => handleSaveSantri(santri)} className="text-[10px] bg-[#7D8F69] text-white px-2 py-1.5 rounded flex items-center gap-1 hover:bg-[#687a55] transition-colors font-bold tracking-wider" title="Simpan data santri ini">
                              <Save size={12} /> Simpan
                            </button>
                            <button type="button" onClick={() => handleAddRow(santri)} className="text-[10px] bg-[#E8E2D5] text-[#5F584F] px-2 py-1.5 rounded flex items-center gap-1 hover:bg-[#D4C7B0] transition-colors font-bold tracking-wider" title="Tambah baris setoran">
                              <Plus size={12} /> Baris
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 min-w-[140px]">
                      <select 
                        value={row.kitab} 
                        onChange={e => handleInputChange(santri, row.id, 'kitab', e.target.value)}
                        className="w-full bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7D8F69]"
                      >
                        {kitabOptions.map(opt => <option key={opt.nama} value={opt.nama}>{opt.nama}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          list="no-hadits-list"
                          placeholder="Mulai"
                          value={row.noHaditsMulai} 
                          onChange={e => handleInputChange(santri, row.id, 'noHaditsMulai', e.target.value)}
                          className="w-full bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7D8F69]" 
                        />
                        <span className="text-xs text-[#A4907C]">-</span>
                        <input
                          type="text"
                          list="no-hadits-list"
                          placeholder="Sampai"
                          value={row.noHaditsSampai} 
                          onChange={e => handleInputChange(santri, row.id, 'noHaditsSampai', e.target.value)}
                          className="w-full bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7D8F69]" 
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <select 
                        value={row.predikat} 
                        onChange={e => handleInputChange(santri, row.id, 'predikat', e.target.value as Predikat)}
                        className="w-full bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7D8F69]"
                      >
                        {PREDIKAT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Opsional..." 
                          value={row.catatan} 
                          onChange={e => handleInputChange(santri, row.id, 'catatan', e.target.value)}
                          className="w-full bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#7D8F69]" 
                        />
                        {inputs[santri].length > 1 && (
                          <button type="button" onClick={() => handleRemoveRow(santri, row.id)} className="text-rose-400 hover:text-rose-600 p-1 flex-shrink-0 transition-colors" title="Hapus baris ini">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-[#A4907C] mt-4 italic">* Kosongkan kolom No. Hadits jika santri tidak menyetorkan hafalan hari ini.</p>
      </div>
      
      <datalist id="no-hadits-list">
        {(() => {
          // Find max limit based on selected book for the first row, or just render general numbers
          const max = kitabOptions.reduce((acc, curr) => Math.max(acc, curr.jumlah), 200);
          return Array.from({ length: max }, (_, i) => <option key={i + 1} value={(i + 1).toString()} />);
        })()}
      </datalist>

      <button type="submit" className="w-full bg-[#7D8F69] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#687a55] transition-colors">
        Simpan Semua Setoran
      </button>
    </form>
  );
}
