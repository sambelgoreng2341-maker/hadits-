# Panduan Integrasi Google Sheets API (Google Apps Script)

Untuk menjadikan Google Sheets sebagai database (backend) dari aplikasi ini, ikuti langkah-langkah berikut:

## Langkah 1: Buat Spreadsheet & Script Baru
1. Buka [Google Sheets](https://sheets.google.com) dan buat Spreadsheet baru (misal: "Database Setoran IQBS").
2. Klik menu **Ekstensi** > **Apps Script**.
3. Hapus kode bawaan yang ada di editor, lalu *copy* dan *paste* kode di bawah ini:

```javascript
const SHEET_NAME = "Setoran";

// 1. Fungsi untuk setup/inisialisasi header tabel
// Jalankan fungsi ini SATU KALI dari dalam editor Apps Script
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  const headers = [
    "ID", 
    "Tanggal", 
    "Halaqah", 
    "Nama Santri", 
    "Kitab", 
    "No. Hadits", 
    "Predikat", 
    "Catatan", 
    "Waktu Dibuat (Timestamp)"
  ];
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#F5F1E8");
  
  // Mengunci baris pertama (header)
  sheet.setFrozenRows(1);
  
  // Menyesuaikan lebar kolom
  sheet.autoResizeColumns(1, headers.length);
}

// 2. Fungsi untuk menerima data (HTTP POST) dari aplikasi web
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Parse data JSON yang dikirim dari React App
    const data = JSON.parse(e.postData.contents);
    
    // Pastikan bentuknya array (karena kita sinkronisasi massal / bulk)
    const setoranList = Array.isArray(data) ? data : [data];
    const rowsToAppend = [];
    
    setoranList.forEach(item => {
      rowsToAppend.push([
        item.id,
        item.tanggal,
        item.halaqah,
        item.namaSantri,
        item.kitab,
        item.noHadits,
        item.predikat,
        item.catatan,
        new Date(item.createdAt).toLocaleString('id-ID')
      ]);
    });
    
    // Masukkan semua data ke baris terbawah
    if (rowsToAppend.length > 0) {
      const lastRow = Math.max(sheet.getLastRow(), 1);
      sheet.getRange(lastRow + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
    }
    
    // Berikan respons sukses ke aplikasi web
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: `${rowsToAppend.length} data berhasil disimpan`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Langkah 2: Jalankan `setupSheet`
1. Di bagian atas editor Apps Script, pilih fungsi `setupSheet` pada dropdown menu (di sebelah tombol "Jalankan" / "Run").
2. Klik tombol **Jalankan** (Run).
3. Google akan meminta izin akses, klik **Tinjau Izin** > Pilih akun Anda > **Lanjutan** > Buka projek (tidak aman) > **Izinkan**.
4. Cek kembali Spreadsheet Anda, sekarang sudah memiliki tab "Setoran" dengan header tabel yang rapi!

## Langkah 3: Deploy sebagai Web App (API)
1. Di pojok kanan atas Apps Script, klik tombol biru **Terapkan** (Deploy) > **Deployment baru** (New deployment).
2. Klik ikon gir (⚙️) di sebelah "Pilih jenis", pilih **Aplikasi Web** (Web app).
3. Isi kolom deskripsi (misal: "API V1").
4. **PENTING**: Pada bagian **Yang memiliki akses** (Who has access), pilih **Semua orang** (Anyone).
5. Klik **Terapkan** (Deploy).
6. Salin **URL Aplikasi Web** yang muncul (berakhiran `.../exec`).

## Langkah 4: Hubungkan ke Aplikasi React Anda
1. Buat file `.env` di folder utama (sejajar dengan `package.json` dan `.env.example`).
2. Masukkan URL tadi ke dalam variabel, seperti ini:
   `VITE_GAS_API_URL=https://script.google.com/macros/s/.../exec`
3. Restart development server jika berjalan di lokal. Sekarang saat Anda menekan ikon Sinkronisasi ☁️, data akan benar-benar dikirim ke Google Sheets Anda!
