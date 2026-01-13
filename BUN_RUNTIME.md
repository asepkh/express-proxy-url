# Bun Runtime di Vercel

Proyek ini dikonfigurasi untuk menggunakan **Bun runtime** di Vercel untuk performa yang lebih baik.

## Keuntungan Bun Runtime

### 1. ⚡ Performa Lebih Cepat
- **Cold start lebih cepat** - Bun memulai lebih cepat dari Node.js
- **Execution lebih cepat** - Bun menggunakan JavaScriptCore engine yang dioptimasi
- **Bundle size lebih kecil** - Dependencies lebih ringan

### 2. 🔄 Kompatibilitas
- **100% kompatibel dengan Node.js** - Semua package Node.js berjalan dengan sempurna
- **Native TypeScript support** - Tidak perlu compile
- **Built-in bundler** - Tidak perlu webpack/rollup

### 3. 💰 Cost Efficiency
- **Lebih cepat = lebih murah** - Function execution time lebih pendek
- **Memory efficient** - Menggunakan memory lebih efisien

## Konfigurasi

### Vercel Configuration

File `vercel.json` sudah dikonfigurasi dengan:

```json
{
  "functions": {
    "api/index.js": {
      "runtime": "bun@1.0.0",
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Local Development

Untuk development lokal dengan Bun:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run dengan Bun
bun server.js

# Atau dengan watch mode
bun --watch server.js
```

## Perbandingan: Bun vs Node.js

| Metrik | Bun | Node.js |
|--------|-----|---------|
| **Cold Start** | ~100-300ms | ~500-1000ms |
| **Execution Speed** | 2-3x lebih cepat | Baseline |
| **Memory Usage** | Lebih efisien | Baseline |
| **Bundle Size** | Lebih kecil | Baseline |
| **Compatibility** | 100% Node.js | Native |

## Expected Performance

Dengan Bun runtime + optimasi cold start:

- **Cold Start:** 100-300ms (vs 500-1000ms dengan Node.js)
- **Warm Start:** < 50ms (vs < 100ms dengan Node.js)
- **Function Execution:** 2-3x lebih cepat

## Troubleshooting

### Bun tidak terdeteksi di Vercel?

1. Pastikan `vercel.json` sudah memiliki `"runtime": "bun@1.0.0"`
2. Pastikan menggunakan Vercel yang support Bun (Vercel sudah support Bun)
3. Deploy ulang setelah update konfigurasi

### Dependencies tidak kompatibel?

Bun 100% kompatibel dengan Node.js packages. Jika ada masalah:

1. Pastikan menggunakan versi terbaru dari dependencies
2. Check Bun compatibility: https://bun.sh/docs/runtime/nodejs
3. Fallback ke Node.js jika perlu (ubah runtime di vercel.json)

### Local development dengan Node.js?

Tidak masalah! Code tetap bisa dijalankan dengan Node.js:

```bash
npm run start:node  # Menggunakan Node.js
npm start          # Menggunakan Bun (default)
```

## Migration dari Node.js

Jika sudah deploy dengan Node.js dan ingin migrasi ke Bun:

1. Update `vercel.json` dengan `"runtime": "bun@1.0.0"`
2. Deploy ulang
3. Vercel akan otomatis menggunakan Bun runtime

**Tidak perlu perubahan code!** Bun kompatibel 100% dengan Node.js.

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Vercel Bun Runtime](https://vercel.com/docs/functions/runtimes/bun)
- [Bun vs Node.js Performance](https://bun.sh/blog/bun-v1.0)
