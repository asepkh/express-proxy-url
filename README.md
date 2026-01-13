# Express Proxy URL

Express endpoint proxy yang menforward semua headers dan payload dengan efisiensi dan optimasi.

## Fitur

- ✅ Support semua HTTP methods (GET, POST, PUT, DELETE, PATCH, dll)
- ✅ Forward semua headers (kecuali yang tidak perlu)
- ✅ Forward request body/payload
- ✅ Streaming response untuk efisiensi (untuk large files)
- ✅ Error handling yang baik
- ✅ Timeout protection (30 detik)
- ✅ Support berbagai content types (JSON, form-data, binary, dll)

## Instalasi

### Dengan npm/yarn/pnpm (Node.js)

```bash
npm install
```

### Dengan Bun (Recommended - Lebih Cepat)

```bash
# Install Bun (jika belum)
curl -fsSL https://bun.sh/install | bash

# Install dependencies dengan Bun
bun install
```

**Catatan:** Semua dependencies kompatibel dengan Bun. Bun dapat menjalankan package Node.js dengan sempurna.

## Menjalankan Server

### Dengan Bun (Recommended - Lebih Cepat)

```bash
# Install Bun (jika belum)
curl -fsSL https://bun.sh/install | bash

# Development mode (dengan auto-reload)
npm run dev

# Production mode
npm start
```

### Dengan Node.js (Alternatif)

```bash
# Development mode
npm run dev:node

# Production mode
npm run start:node
```

Server akan berjalan di port 3000 (atau sesuai `PORT` environment variable).

**Catatan:** Vercel akan menggunakan Bun runtime secara otomatis berdasarkan konfigurasi di `vercel.json`.

## Penggunaan

### Format 1: URL di path parameter (encoded)

```
GET /https%3A%2F%2Fapi.example.com%2Fdata
POST /https%3A%2F%2Fapi.example.com%2Fapi%2Fusers
PUT /https%3A%2F%2Fapi.example.com%2Fapi%2Fusers%2F123
```

### Format 2: URL di query parameter

```
GET /?url=https://api.example.com/data
POST /?url=https://api.example.com/api/users
PUT /?url=https://api.example.com/api/users/123
```

### Contoh dengan cURL

```bash
# GET request dengan encoded URL di path
curl http://localhost:3000/https%3A%2F%2Fjsonplaceholder.typicode.com%2Fposts%2F1

# GET request dengan query parameter
curl http://localhost:3000/?url=https://jsonplaceholder.typicode.com/posts/1

# POST request dengan JSON body (query parameter)
curl -X POST "http://localhost:3000/?url=https://api.example.com/data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"name": "John", "age": 30}'

# POST request dengan encoded URL di path
curl -X POST "http://localhost:3000/$(echo -n 'https://api.example.com/data' | jq -sRr @uri)" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### Contoh dengan JavaScript/Node.js

```javascript
const axios = require("axios");

// GET request dengan encoded URL di path
const response1 = await axios.get(
  "http://localhost:3000/" + encodeURIComponent("https://api.example.com/data")
);

// GET request dengan query parameter
const response2 = await axios.get("http://localhost:3000/", {
  params: { url: "https://api.example.com/data" },
});

// POST request dengan headers dan body (query parameter)
const response3 = await axios.post(
  "http://localhost:3000/?url=https://api.example.com/data",
  { name: "John", age: 30 },
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer token123",
    },
  }
);

// POST request dengan encoded URL di path
const response4 = await axios.post(
  "http://localhost:3000/" + encodeURIComponent("https://api.example.com/data"),
  { name: "John", age: 30 },
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer token123",
    },
  }
);
```

## Health Check

```
GET /health
```

## Optimasi yang Diterapkan

1. **Streaming Response**: Menggunakan response streaming untuk efisiensi memory pada large files
2. **Header Cleaning**: Menghapus headers yang tidak perlu (host, connection, dll)
3. **Timeout Protection**: Request timeout 30 detik untuk mencegah hanging requests
4. **Max Redirects**: Limit redirects ke 5 untuk mencegah redirect loops
5. **Body Size Limit**: Limit 50MB untuk request body (dapat disesuaikan)

## Catatan Keamanan

⚠️ **PENTING**: Proxy ini meneruskan semua request tanpa validasi. Untuk production:

- Tambahkan authentication/authorization
- Implementasi rate limiting
- Validasi/whitelist target URLs yang diizinkan
- Tambahkan logging dan monitoring
- Pertimbangkan CORS policy

## Environment Variables

- `PORT`: Port untuk server (default: 3000)

## Deployment

Aplikasi ini bisa di-deploy ke berbagai platform. Pilih sesuai kebutuhan:

### 🚀 Vercel (Serverless)

**Vercel menggunakan serverless functions** - tidak ada opsi traditional server. Express app akan berjalan sebagai serverless function.

**Runtime:** Bun 1.0.0 (lebih cepat dari Node.js, cold start lebih cepat)

**Keuntungan:**

- ✅ Auto-scaling
- ✅ Gratis untuk tier tertentu
- ✅ CDN global
- ✅ Zero configuration
- ✅ **Bun runtime** - lebih cepat, cold start lebih cepat, kompatibel dengan Node.js

**Keterbatasan:**

- ⚠️ Function timeout maksimal 30 detik (Pro: 60 detik)
- ⚠️ Cold start pada request pertama (sudah dioptimasi dengan keep-alive + Bun)
- ⚠️ Serverless-only (tidak bisa traditional server)

**Optimasi Cold Start:**

- ✅ **Bun runtime** - cold start lebih cepat dari Node.js
- ✅ Keep-alive cron job setiap 5 menit
- ✅ Warm-up function setiap 10 menit
- ✅ Memory allocation 1024MB untuk main function
- 📖 Lihat `COLD_START_OPTIMIZATION.md` untuk detail lengkap

**Cara Deploy:**

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

Atau deploy via GitHub dengan menghubungkan repository ke Vercel dashboard.

**Setelah Deploy:**

```
# Format 1: Encoded URL di path
https://your-project.vercel.app/{encodedUrl}

# Format 2: Query parameter
https://your-project.vercel.app/?url={url}
```

**Optimasi Cold Start:**
Setelah deploy, Vercel Cron akan otomatis:

- Memanggil `/keep-alive` setiap 5 menit (jaga function warm)
- Memanggil `/warm` setiap 10 menit (pre-load dependencies)

**Catatan:** Vercel Cron memerlukan **Vercel Pro plan**. Jika menggunakan Free tier, gunakan external keep-alive service (lihat `COLD_START_OPTIMIZATION.md`).

---

### 🖥️ Railway (Traditional Server)

**Railway menjalankan traditional server** - server berjalan terus tanpa timeout limit.

**Keuntungan:**

- ✅ No timeout limit
- ✅ Traditional server (selalu running)
- ✅ Gratis $5 credit/bulan
- ✅ Auto-deploy dari GitHub

**Cara Deploy:**

1. Push code ke GitHub
2. Buka [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Pilih repository
5. Railway akan auto-detect dan deploy

File `railway.json` sudah tersedia untuk konfigurasi.

---

### 🐳 Render (Traditional Server)

**Render juga menjalankan traditional server** dengan auto-scaling.

**Keuntungan:**

- ✅ No timeout limit
- ✅ Traditional server
- ✅ Gratis tier tersedia (dengan sleep setelah idle)
- ✅ Auto-deploy dari GitHub

**Cara Deploy:**

1. Push code ke GitHub
2. Buka [render.com](https://render.com)
3. New → Web Service
4. Connect GitHub repository
5. Render akan auto-detect dari `render.yaml`

File `render.yaml` sudah tersedia untuk konfigurasi.

---

### 🐋 Docker (Traditional Server)

**Deploy dengan Docker** ke platform apapun (AWS, DigitalOcean, dll).

**Cara Deploy:**

1. Build image:

```bash
docker build -t express-proxy-url .
```

2. Run container:

```bash
docker run -p 3000:3000 express-proxy-url
```

File `Dockerfile` sudah tersedia.

---

## Perbandingan: Serverless vs Traditional Server

| Fitur              | Vercel (Serverless) | Railway/Render (Traditional) |
| ------------------ | ------------------- | ---------------------------- |
| **Timeout**        | 30-60 detik         | Tidak ada limit              |
| **Cold Start**     | Ada (pertama kali)  | Tidak ada                    |
| **Scaling**        | Auto (instant)      | Auto (beberapa detik)        |
| **Cost**           | Gratis tier         | Gratis tier tersedia         |
| **Always Running** | Tidak (on-demand)   | Ya (selalu running)          |
| **Best For**       | High traffic, burst | Long-running, no timeout     |

**Rekomendasi:**

- **Gunakan Vercel** jika: traffic tidak konstan, butuh global CDN, budget terbatas
- **Gunakan Railway/Render** jika: butuh no timeout, long-running requests, traditional server behavior
