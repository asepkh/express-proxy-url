# Custom Headers Forwarding

Proxy ini mendukung forwarding semua custom headers dari client ke target server, termasuk `host` header.

## Headers yang Di-Forward

### ✅ Semua Custom Headers

Semua headers dari client akan di-forward ke target server, termasuk:

- ✅ `Host` - Header host dari client akan di-forward
- ✅ `User-Agent` - User agent dari client
- ✅ `Authorization` - Authentication headers
- ✅ `X-*` - Semua custom headers dengan prefix X-
- ✅ `Custom-Header` - Semua custom headers lainnya
- ✅ `Content-Type` - Content type dari client
- ✅ `Accept` - Accept headers
- ✅ Dan semua headers lainnya dari client

### ❌ Headers yang Dihapus

Headers berikut akan dihapus karena tidak relevan atau akan di-set ulang:

- ❌ `connection` - HTTP connection header
- ❌ `content-length` - Akan di-set ulang oleh axios berdasarkan body
- ❌ `transfer-encoding` - Transfer encoding
- ❌ `upgrade` - Upgrade header
- ❌ `proxy-connection` - Proxy connection
- ❌ `proxy-authenticate` - Proxy authentication
- ❌ `proxy-authorization` - Proxy authorization

## Contoh Penggunaan

### Forward Host Header

```bash
curl -X POST "https://your-domain.vercel.app/?url=https://api.example.com/data" \
  -H "Host: api.example.com" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

Host header `api.example.com` akan di-forward ke target server.

### Forward Custom Headers

```bash
curl -X GET "https://your-domain.vercel.app/?url=https://api.example.com/data" \
  -H "X-API-Key: your-api-key" \
  -H "X-Custom-Header: custom-value" \
  -H "Authorization: Bearer token123"
```

Semua custom headers akan di-forward ke target server.

### Forward User-Agent

```bash
curl -X GET "https://your-domain.vercel.app/?url=https://api.example.com/data" \
  -H "User-Agent: MyCustomApp/1.0"
```

User-Agent dari client akan di-forward ke target server.

## Behavior

### Host Header

1. **Jika client mengirim `Host` header:**

   - Header akan di-forward ke target server
   - Target server akan menerima host header dari client

2. **Jika client tidak mengirim `Host` header:**
   - Host akan di-set otomatis dari target URL
   - Contoh: Jika target URL adalah `https://api.example.com/data`, host akan di-set menjadi `api.example.com`

### Custom Headers

Semua custom headers dari client akan di-forward **as-is** ke target server tanpa modifikasi.

## Security Considerations

⚠️ **PENTING**: Karena semua headers di-forward, pastikan:

1. **Jangan forward sensitive headers** jika tidak perlu
2. **Validasi target URLs** untuk mencegah SSRF attacks
3. **Implement rate limiting** untuk mencegah abuse
4. **Monitor headers** yang di-forward untuk security issues

## Configuration

Untuk mengubah behavior, edit fungsi `cleanHeaders()` di `server.js`:

```javascript
const headers = cleanHeaders(req.headers, {
  allowHost: true, // Allow forward host header
  allowCustomHeaders: true, // Allow semua custom headers
});
```

## Testing

Test dengan berbagai headers:

```bash
# Test dengan host header
curl -X GET "https://your-domain.vercel.app/?url=https://httpbin.org/headers" \
  -H "Host: custom-host.com"

# Test dengan custom headers
curl -X GET "https://your-domain.vercel.app/?url=https://httpbin.org/headers" \
  -H "X-Custom-Header: test-value" \
  -H "Authorization: Bearer test-token"

# Test dengan user-agent
curl -X GET "https://your-domain.vercel.app/?url=https://httpbin.org/headers" \
  -H "User-Agent: MyApp/1.0"
```

Check response untuk memastikan headers di-forward dengan benar.
