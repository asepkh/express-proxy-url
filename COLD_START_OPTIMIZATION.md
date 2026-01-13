# Cold Start Optimization untuk Vercel

Dokumen ini menjelaskan strategi yang digunakan untuk mengurangi cold start di Vercel.

## Strategi yang Diterapkan

### 1. ✅ Keep-Alive dengan Cron Jobs

**File:** `api/keep-alive.js` + `vercel.json` (crons)

**Cara Kerja:**

- Vercel Cron akan memanggil `/keep-alive` setiap 5 menit
- Ini menjaga function tetap "warm" dan siap digunakan
- Function tidak akan masuk ke cold state jika ada traffic berkala

**Konfigurasi:**

```json
"crons": [
  {
    "path": "/keep-alive",
    "schedule": "*/5 * * * *"  // Setiap 5 menit
  }
]
```

### 2. ✅ Warm-Up Function

**File:** `api/warm.js` + `vercel.json` (crons)

**Cara Kerja:**

- Memanggil `/warm` setiap 10 menit
- Pre-load Express app dan dependencies (axios)
- Memastikan semua module sudah di memory

**Konfigurasi:**

```json
"crons": [
  {
    "path": "/warm",
    "schedule": "*/10 * * * *"  // Setiap 10 menit
  }
]
```

### 3. ✅ Memory Allocation

**File:** `vercel.json` (functions)

**Optimasi:**

- Main function: 1024MB (lebih banyak memory = lebih cepat)
- Keep-alive: 256MB (minimal, hanya untuk ping)
- Warm: 512MB (sedang, untuk pre-load)

**Catatan:** Memory lebih besar = cold start lebih cepat, tapi cost lebih tinggi.

### 4. ✅ Code Optimization

- Dependencies di-load di top level (bukan lazy)
- Minimal middleware untuk mengurangi initialization time
- Efficient error handling

## Cara Menggunakan

### Otomatis (Recommended)

Setelah deploy ke Vercel, cron jobs akan otomatis berjalan. Tidak perlu setup tambahan.

### Manual Warm-Up

Jika perlu warm-up manual, bisa panggil:

```bash
# Keep-alive (simple ping)
curl https://your-project.vercel.app/keep-alive

# Warm-up (pre-load dependencies)
curl https://your-project.vercel.app/warm
```

## Monitoring Cold Start

Untuk monitor cold start performance:

1. **Vercel Dashboard:**

   - Buka project → Functions
   - Lihat "Cold Boot" vs "Execution Time"

2. **Add Logging:**
   ```javascript
   const startTime = Date.now();
   // ... your code ...
   console.log(`Cold start: ${Date.now() - startTime}ms`);
   ```

## Tips Tambahan

### 1. Upgrade ke Vercel Pro

- Pro plan: 60 detik timeout (vs 30 detik)
- Lebih banyak memory options
- Better cold start performance

### 2. Regional Deployment

- Deploy di region terdekat dengan users
- Mengurangi network latency

### 3. Reduce Bundle Size

- Minimize dependencies
- Use tree-shaking
- Remove unused code

### 4. External Keep-Alive Service

Jika cron tidak cukup, bisa gunakan external service:

- UptimeRobot (gratis)
- Cron-job.org (gratis)
- Ping setiap 1-2 menit ke `/keep-alive`

## Expected Results

Dengan optimasi ini:

- **Cold Start:** 1-3 detik (first request setelah idle)
- **Warm Start:** < 100ms (setelah cron ping)
- **Success Rate:** 95%+ requests akan warm (jika cron aktif)

## Troubleshooting

### Cron tidak jalan?

1. Pastikan Vercel Pro (cron hanya untuk Pro)
2. Atau gunakan external cron service

### Masih ada cold start?

1. Pastikan cron schedule tidak terlalu jarang (max 10 menit)
2. Pertimbangkan upgrade memory
3. Gunakan external keep-alive service

### Cost concerns?

- Keep-alive function: minimal cost (hanya ping)
- Warm function: sedikit lebih mahal (pre-load)
- Main function: normal cost per request

## Alternative: External Keep-Alive

Jika Vercel Cron tidak tersedia (Free tier), gunakan external service:

### UptimeRobot (Gratis)

1. Daftar di uptimerobot.com
2. Add monitor → HTTP(s)
3. URL: `https://your-project.vercel.app/keep-alive`
4. Interval: 5 menit

### Cron-job.org (Gratis)

1. Daftar di cron-job.org
2. Create cron job
3. URL: `https://your-project.vercel.app/keep-alive`
4. Schedule: `*/5 * * * *`
