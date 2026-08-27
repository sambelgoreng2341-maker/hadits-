/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BookHeart, CalendarDays, Search, Menu, PenLine, Filter, LayoutDashboard, History, CloudOff, Cloud, RefreshCw } from 'lucide-react';
import { SetoranForm } from './components/SetoranForm';
import { RiwayatTable } from './components/RiwayatTable';
import { RekapTable } from './components/RekapTable';
import { Dashboard } from './components/Dashboard';
import { Setoran } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'input' | 'rekap' | 'riwayat'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [setoranList, setSetoranList] = useState<Setoran[]>(() => {
    const saved = localStorage.getItem('iqbs_setoran_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  const [filterMode, setFilterMode] = useState<'harian' | 'mingguan' | 'bulanan' | 'semesteran' | 'tahunan' | 'jangka_waktu'>('harian');
  const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
  const [filterKitab, setFilterKitab] = useState("Semua Kitab");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Data Master State
  const [halaqahData, setHalaqahData] = useState<Record<string, string[]>>({
    'Halaqah Utsman': ['Ahmad Fauzan', 'Budi Santoso', 'Zaidan Ilhami'],
    'Halaqah Ali': ['Farras Haidar', 'Tariq Ramadhan', 'Umar Al-Faruq'],
    'Halaqah Umar': ['Abdullah Malik', 'Hasan Basri', 'Ali Imran'],
    'Halaqah Abu Bakar': ['Khalid Walid', 'Zubair Awwam', 'Saad Waqqas']
  });
  const [kitabOptions, setKitabOptions] = useState<Array<{nama: string, jumlah: number}>>([
    { nama: "Arba'in Nawawi", jumlah: 42 },
    { nama: "Bulughul Maram", jumlah: 1596 },
    { nama: "Riyadhus Shalihin", jumlah: 1896 }
  ]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);

  // Load Master Data
  useEffect(() => {
    const fetchMasterData = async () => {
      const gasUrl = import.meta.env.VITE_GAS_API_URL || "https://script.google.com/macros/s/AKfycbx6xPmke19Jj3B-rPWFuvQlMFnM6WeGz7orEsJyw3W7PbRzJukeoOxi-BOnxdlzeVwx/exec";
      if (!gasUrl) return;
      
      setIsLoadingMaster(true);
      try {
        const response = await fetch(gasUrl);
        const result = await response.json();
        
        if (result.status === 'success') {
          if (Object.keys(result.santri).length > 0) {
            setHalaqahData(result.santri);
          }
          if (result.kitab && result.kitab.length > 0) {
            setKitabOptions(result.kitab);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data master:", error);
      } finally {
        setIsLoadingMaster(false);
      }
    };

    fetchMasterData();
  }, []);

  useEffect(() => {
    localStorage.setItem('iqbs_setoran_data', JSON.stringify(setoranList));
  }, [setoranList]);

  const applyFilterMode = (mode: string) => {
    setFilterMode(mode as any);
    if (mode !== 'jangka_waktu') setIsFilterMenuOpen(false);
    
    if (mode === 'jangka_waktu') return;
    
    const end = new Date();
    const start = new Date(end);
    
    if (mode === 'mingguan') {
      start.setDate(end.getDate() - 7);
    } else if (mode === 'bulanan') {
      start.setMonth(end.getMonth() - 1);
    } else if (mode === 'semesteran') {
      start.setMonth(end.getMonth() - 6);
    } else if (mode === 'tahunan') {
      start.setFullYear(end.getFullYear() - 1);
    }
    
    setDateStart(start.toISOString().split('T')[0]);
    setDateEnd(end.toISOString().split('T')[0]);
  };

  const handleAddSetoran = (dataBulk: Omit<Setoran, 'id' | 'createdAt'>[]) => {
    const newSetorans: Setoran[] = dataBulk.map(data => ({
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      syncStatus: 'pending' as const
    }));
    setSetoranList(prev => [...newSetorans, ...prev]);
    
    if (dataBulk.length > 0) {
      setDateStart(dataBulk[0].tanggal);
      setDateEnd(dataBulk[0].tanggal);
      setFilterMode('harian');
    }
  };

  const handleDeleteSetoran = (id: string) => {
    if (window.confirm('Yakin ingin menghapus data setoran ini?')) {
      setSetoranList(prev => prev.filter(s => s.id !== id));
    }
  };

  const pendingCount = setoranList.filter(s => s.syncStatus === 'pending' || !s.syncStatus).length;

  const handleSyncData = async () => {
    if (pendingCount === 0) return;
    setIsSyncing(true);
    
    const pendingData = setoranList.filter(s => s.syncStatus === 'pending' || !s.syncStatus);
    const gasUrl = import.meta.env.VITE_GAS_API_URL || "https://script.google.com/macros/s/AKfycbx6xPmke19Jj3B-rPWFuvQlMFnM6WeGz7orEsJyw3W7PbRzJukeoOxi-BOnxdlzeVwx/exec";

    if (gasUrl) {
      try {
        // Kirim data ke Google Sheets (Apps Script Web App)
        // Menggunakan text/plain agar tidak memicu preflight request (CORS) yang sering bermasalah di GAS
        await fetch(gasUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(pendingData),
        });
        
        // Setelah berhasil dikirim, ubah status menjadi tersinkronisasi
        setSetoranList(prev => prev.map(s => ({ ...s, syncStatus: 'synced' })));
      } catch (error) {
        console.error("Gagal sinkronisasi ke server:", error);
        alert("Gagal menyinkronkan data ke Google Sheets. Pastikan jaringan internet stabil dan URL API valid.");
      }
    } else {
      // Fallback jika URL API belum dikonfigurasi: simulasi delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSetoranList(prev => prev.map(s => ({ ...s, syncStatus: 'synced' })));
    }
    
    setIsSyncing(false);
  };

  const filteredSetoran = useMemo(() => {
    return setoranList.filter(s => {
      const matchTanggal = s.tanggal >= dateStart && s.tanggal <= dateEnd;
      const matchKitab = filterKitab === "Semua Kitab" || s.kitab === filterKitab;
      const search = searchQuery.toLowerCase();
      const matchSearch = s.namaSantri.toLowerCase().includes(search) || 
                          s.kitab?.toLowerCase().includes(search) ||
                          s.noHadits?.toLowerCase().includes(search) ||
                          (s as any).namaHadits?.toLowerCase().includes(search);
      return matchTanggal && matchKitab && matchSearch;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [setoranList, dateStart, dateEnd, filterKitab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A443D] pb-12 font-sans">
      <header className="bg-[#7D8F69] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-serif text-2xl font-bold">
                IQ
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold leading-tight">Mutabaah Setoran Hadits</h1>
                <p className="text-xs opacity-90 uppercase tracking-widest">Ibnu Qayyim Boarding School</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={handleSyncData}
                disabled={isSyncing || pendingCount === 0}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pendingCount > 0 ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer' : 'bg-white/20 text-white cursor-default'}`}
                title={pendingCount > 0 ? "Simpan ke Database" : "Semua data tersimpan"}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Menyinkronkan...</span>
                  </>
                ) : pendingCount > 0 ? (
                  <>
                    <CloudOff size={16} />
                    <span>{pendingCount} Tertunda</span>
                  </>
                ) : (
                  <>
                    <Cloud size={16} />
                    <span>Tersimpan</span>
                  </>
                )}
              </button>
              
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">Semester Genap</p>
                <p className="text-xs opacity-75 italic">TA 2023/2024</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-white/20 hover:bg-white/30 transition-colors p-2 rounded-lg flex items-center gap-2 backdrop-blur-sm"
                >
                  <Menu size={20} className="text-white" />
                  <span className="text-sm font-medium hidden sm:block">Menu</span>
                </button>
                
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-[#D4C7B0] rounded-xl shadow-lg overflow-hidden z-20 text-[#4A443D]">
                      <button 
                        onClick={() => { setActiveView('dashboard'); setIsMenuOpen(false); }} 
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm hover:bg-[#FAF8F4] transition-colors ${activeView === 'dashboard' ? 'font-bold text-[#7D8F69] bg-[#FAF8F4]' : 'text-[#5F584F]'}`}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </button>
                      <button 
                        onClick={() => { setActiveView('input'); setIsMenuOpen(false); }} 
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm hover:bg-[#FAF8F4] transition-colors border-t border-[#F0EBE0] ${activeView === 'input' ? 'font-bold text-[#7D8F69] bg-[#FAF8F4]' : 'text-[#5F584F]'}`}
                      >
                        <PenLine size={16} />
                        Input Setoran
                      </button>
                      <button 
                        onClick={() => { setActiveView('rekap'); setIsMenuOpen(false); }} 
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm hover:bg-[#FAF8F4] transition-colors border-t border-[#F0EBE0] ${activeView === 'rekap' ? 'font-bold text-[#7D8F69] bg-[#FAF8F4]' : 'text-[#5F584F]'}`}
                      >
                        <CalendarDays size={16} />
                        Rekapitulasi
                      </button>
                      <button 
                        onClick={() => { setActiveView('riwayat'); setIsMenuOpen(false); }} 
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm hover:bg-[#FAF8F4] transition-colors border-t border-[#F0EBE0] ${activeView === 'riwayat' ? 'font-bold text-[#7D8F69] bg-[#FAF8F4]' : 'text-[#5F584F]'}`}
                      >
                        <History size={16} />
                        Riwayat
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <Dashboard data={setoranList} />
        )}
        
        {activeView === 'input' && (
          <div className="w-full">
            <SetoranForm 
              onSubmit={handleAddSetoran}
              halaqahData={halaqahData}
              kitabOptions={kitabOptions}
              isLoading={isLoadingMaster}
            />
          </div>
        )}
        
        {(activeView === 'rekap' || activeView === 'riwayat') && (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-serif font-bold text-[#5F584F] flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#7D8F69]" />
                {activeView === 'rekap' ? 'Rekapitulasi' : 'Riwayat'} {filterMode === 'jangka_waktu' ? 'Jangka Waktu' : filterMode.charAt(0).toUpperCase() + filterMode.slice(1)}
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#A4907C]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari santri/materi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 w-full sm:w-64 bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7D8F69] focus:border-[#7D8F69] text-sm"
                  />
                </div>
                
                <div className="relative">
                  <select
                    value={filterKitab}
                    onChange={(e) => setFilterKitab(e.target.value)}
                    className="px-3 py-2 bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7D8F69] text-sm h-full min-w-[140px]"
                  >
                    <option value="Semua Kitab">Semua Kitab</option>
                    {kitabOptions.map(opt => <option key={opt.nama} value={opt.nama}>{opt.nama}</option>)}
                  </select>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    className="px-3 py-2 bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7D8F69] text-sm flex items-center gap-2 h-full min-w-[140px] justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-[#A4907C]" />
                      <span className="capitalize font-medium">{filterMode.replace('_', ' ')}</span>
                    </div>
                  </button>
                  
                  {isFilterMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsFilterMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D4C7B0] rounded-xl shadow-lg z-20 p-2 text-sm text-[#4A443D]">
                        <div className="flex flex-col gap-1">
                          {['harian', 'mingguan', 'bulanan', 'semesteran', 'tahunan'].map(mode => (
                            <button
                              key={mode}
                              onClick={() => applyFilterMode(mode)}
                              className={`text-left px-3 py-2 rounded-lg capitalize transition-colors ${filterMode === mode ? 'bg-[#7D8F69] text-white font-bold' : 'hover:bg-[#FAF8F4]'}`}
                            >
                              {mode}
                            </button>
                          ))}
                          <button
                            onClick={() => applyFilterMode('jangka_waktu')}
                            className={`text-left px-3 py-2 rounded-lg transition-colors ${filterMode === 'jangka_waktu' ? 'bg-[#7D8F69] text-white font-bold' : 'hover:bg-[#FAF8F4]'}`}
                          >
                            Jangka Waktu
                          </button>
                        </div>
                        
                        {filterMode === 'jangka_waktu' && (
                          <div className="mt-3 pt-3 border-t border-[#F0EBE0] flex flex-col gap-2">
                            <div>
                              <label className="text-[10px] text-[#A4907C] font-bold uppercase mb-1 block">Dari Tanggal</label>
                              <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full px-2 py-1.5 bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7D8F69]" />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#A4907C] font-bold uppercase mb-1 block">Sampai Tanggal</label>
                              <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full px-2 py-1.5 bg-[#FAF8F4] border border-[#D4C7B0] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7D8F69]" />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {activeView === 'rekap' ? (
              <RekapTable 
                data={filteredSetoran} 
                dateStart={dateStart}
                dateEnd={dateEnd}
                filterKitab={filterKitab}
              />
            ) : (
              <RiwayatTable data={filteredSetoran} onDelete={handleDeleteSetoran} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
