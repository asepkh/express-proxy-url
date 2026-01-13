# Custom Headers Forwarding

Proxy ini mendukung forwarding semua custom headers dari client ke target server, termasuk `host` header.

## Headers yang Di-Forward

### ✅ Semua Custom Headers

Semua headers dari client akan di-forward ke target server, **kecuali `Host`**:

- ✅ `User-Agent` - User agent dari client
- ✅ `Authorization` - Authentication headers
- ✅ `X-*` - Semua custom headers dengan prefix X-
- ✅ `Custom-Header` - Semua custom headers lainnya
- ✅ `Content-Type` - Content type dari client
- ✅ `Accept` - Accept headers
- ✅ Dan semua headers lainnya dari client

### ⚠️ Host Header (Khusus)

**Host header TIDAK di-forward dari HTTP header** karena Vercel serverless tidak bisa menerima host header berbeda.

Sebagai gantinya, host bisa di-set melalui:
1. **Query parameter**: `?host=api.example.com`
2. **Body payload (JSON)**: `{"host": "api.example.com", ...}`
3. **Body payload (form-urlencoded)**: `host=api.example.com&...`
4. **Auto dari target URL**: Jika tidak di-set, akan diambil dari target URL

### ❌ Headers yang Dihapus

Headers berikut akan dihapus karena tidak relevan atau akan di-set ulang:

- ❌ `host` - Akan di-handle dari body payload atau query parameter
- ❌ `connection` - HTTP connection header
- ❌ `content-length` - Akan di-set ulang oleh axios berdasarkan body
- ❌ `transfer-encoding` - Transfer encoding
- ❌ `upgrade` - Upgrade header
- ❌ `proxy-connection` - Proxy connection
- ❌ `proxy-authenticate` - Proxy authentication
- ❌ `proxy-authorization` - Proxy authorization

## Contoh Penggunaan

### Set Host dari Query Parameter

```bash
curl -X POST "https://your-domain.vercel.app/?url=https://api.example.com/data&host=api.example.com" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

Host `api.example.com` akan di-set dari query parameter.

### Set Host dari Body Payload (JSON)

```bash
curl -X POST "https://your-domain.vercel.app/?url=https://api.example.com/data" \
  -H "Content-Type: application/json" \
  -d '{"host": "api.example.com", "key": "value"}'
```

Host `api.example.com` akan di-extract dari JSON body.

### Set Host dari Body Payload (Form-URLEncoded)

```bash
curl -X POST "https://your-domain.vercel.app/?url=https://api.example.com/data" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "host=api.example.com&key=value"
```

Host `api.example.com` akan di-extract dari form-urlencoded body.

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

Karena Vercel serverless tidak bisa menerima host header berbeda, host di-handle dengan urutan prioritas:

1. **Query parameter `?host=...`** (prioritas tertinggi)
2. **Body payload JSON `{"host": "..."}`**
3. **Body payload form-urlencoded `host=...`**
4. **Auto dari target URL** (fallback)
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
// Host header akan otomatis di-handle dari body payload atau query parameter
const headers = cleanHeaders(req.headers);

// Host akan di-extract dari:
// 1. Query parameter: ?host=api.example.com
// 2. Body JSON: {"host": "api.example.com"}
// 3. Body form-urlencoded: host=api.example.com
// 4. Auto dari target URL (fallback)
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
