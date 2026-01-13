# Fix: Bun Runtime Error di Vercel

## Error yang Terjadi

```
Error: Importing "bun": Cannot find module '/vercel/path0/.vercel/builders/node_modules/bun/index.js'
```

## Solusi

### 1. Format Runtime

Ubah dari:
```json
"runtime": "bun@1.0.0"
```

Menjadi:
```json
"runtime": "bun"
```

Vercel akan otomatis menggunakan versi terbaru Bun yang tersedia.

### 2. Pastikan Konfigurasi Benar

File `vercel.json` sudah diperbaiki dengan format yang benar:

```json
{
  "functions": {
    "api/index.js": {
      "runtime": "bun",
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### 3. Deploy Ulang

Setelah update konfigurasi:

```bash
# Deploy ulang
vercel --prod

# Atau via GitHub
# Push perubahan dan Vercel akan auto-deploy
```

## Alternatif: Jika Masih Error

Jika masih ada error, coba:

### Opsi 1: Hapus Runtime Specification

Hapus `"runtime": "bun"` dan biarkan Vercel auto-detect. Vercel akan menggunakan Node.js default.

```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Opsi 2: Gunakan Node.js (Fallback)

Jika Bun masih bermasalah, gunakan Node.js:

```json
{
  "functions": {
    "api/index.js": {
      "runtime": "nodejs20.x",
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Opsi 3: Check Vercel Support

Pastikan akun Vercel Anda support Bun runtime:
- Bun runtime tersedia untuk semua tier Vercel
- Pastikan menggunakan Vercel CLI terbaru
- Check [Vercel Documentation](https://vercel.com/docs/functions/runtimes/bun)

## Verifikasi

Setelah deploy, cek di Vercel Dashboard:
1. Buka project → Settings → Functions
2. Pastikan runtime menunjukkan "bun"
3. Check logs untuk memastikan tidak ada error

## Catatan

- Bun runtime di Vercel masih relatif baru
- Jika ada masalah, Node.js runtime tetap bekerja dengan baik
- Performa Node.js sudah cukup cepat untuk kebanyakan use case
