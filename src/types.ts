export type Predikat = 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | 'Dhaif';

export interface Setoran {
  id: string;
  namaSantri: string;
  halaqah: string;
  tanggal: string;
  kitab: string;
  noHadits: string;
  predikat: Predikat;
  catatan: string;
  createdAt: number;
  syncStatus?: 'pending' | 'synced';
}
