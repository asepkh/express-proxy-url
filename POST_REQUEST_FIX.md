# Fix: POST Request DEPLOYMENT_NOT_FOUND Error

## Masalah

- ✅ GET request bekerja dengan baik
- ❌ POST request dengan body mendapat error `DEPLOYMENT_NOT_FOUND`

## Penyebab Kemungkinan

### 1. Body Size Limit

Vercel memiliki body size limit:
- **Hobby (Free)**: 4.5MB
- **Pro**: 50MB

Jika body melebihi limit, Vercel mungkin mengembalikan error yang tidak jelas.

### 2. Body Parsing Issue

Di Vercel serverless, body handling bisa berbeda dari traditional Express server.

## Solusi yang Diterapkan

### 1. Improved Body Handling

Menggunakan `express.raw()` untuk handle semua content types:

```javascript
app.use(express.raw({ 
  type: '*/*', 
  limit: '10mb' 
}));
```

### 2. Multiple Body Source Support

Code sekarang support:
- `req.rawBody` (dari middleware)
- `req.body` (dari express.raw)
- String body (fallback)

### 3. Body Size Validation

Added check untuk body size dengan error message yang jelas.

### 4. Better Error Handling

Improved error handling untuk berbagai skenario.

## Testing

Setelah deploy, test dengan:

```bash
# Test POST dengan body kecil
curl -X POST "https://your-domain.vercel.app/?url=https://httpbin.org/post" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "test=data"

# Test POST dengan body besar (seperti request Anda)
curl -X POST "https://your-domain.vercel.app/?url=https://app.orderkuota.com/api/v2/qris/menu/2748859" \
  -H "User-Agent: okhttp/4.12.0" \
  -H "Host: app.orderkuota.com" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "request_time=$(date +%s%3N)&app_reg_id=..."
```

## Check Logs

Setelah deploy, check Vercel logs untuk melihat:
1. Apakah request sampai ke function
2. Body size yang diterima
3. Error yang terjadi

```bash
# Via CLI
vercel logs --prod

# Atau di Dashboard
# Project → Deployments → Latest → Logs
```

## Jika Masih Error

### Check Body Size

Hitung size body Anda:
```bash
echo -n "your-body-data" | wc -c
```

Jika > 4.5MB dan menggunakan Hobby plan, upgrade ke Pro atau kurangi body size.

### Check Vercel Limits

- Request timeout: 30s (Hobby) / 60s (Pro)
- Body size: 4.5MB (Hobby) / 50MB (Pro)
- Memory: Sesuai konfigurasi di vercel.json

### Alternative: Split Request

Jika body terlalu besar, pertimbangkan:
1. Split menjadi multiple requests
2. Use PUT/PATCH dengan chunking
3. Upload ke storage service dulu, lalu forward URL

## Verifikasi

Setelah fix, verifikasi:

1. ✅ GET request masih bekerja
2. ✅ POST dengan body kecil bekerja
3. ✅ POST dengan body besar (jika < limit) bekerja
4. ✅ Error message jelas jika body terlalu besar
