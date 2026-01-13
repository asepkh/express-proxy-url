// Lazy load dependencies untuk optimasi cold start
// Express dan axios akan di-load saat pertama kali digunakan
const express = require("express");
const axios = require("axios");

// Initialize Express app
const app = express();

// Middleware untuk capture raw body untuk semua request
// Kita akan forward body as-is ke target server untuk memastikan semua data ter-forward dengan benar
app.use((req, res, next) => {
  // Untuk methods tanpa body, langsung next
  if (
    req.method === "GET" ||
    req.method === "HEAD" ||
    req.method === "DELETE" ||
    req.method === "OPTIONS"
  ) {
    req.rawBody = null;
    return next();
  }

  const chunks = [];

  req.on("data", (chunk) => {
    chunks.push(chunk);
  });

  req.on("end", () => {
    req.rawBody = chunks.length > 0 ? Buffer.concat(chunks) : null;
    next();
  });

  req.on("error", (err) => {
    next(err);
  });
});

/**
 * Helper function untuk membersihkan headers yang tidak perlu diforward
 */
function cleanHeaders(headers) {
  const cleaned = { ...headers };

  // Hapus headers yang tidak perlu diforward atau akan di-set ulang
  delete cleaned.host;
  delete cleaned.connection;
  delete cleaned["content-length"]; // Akan di-set ulang oleh axios berdasarkan body
  delete cleaned["transfer-encoding"];
  delete cleaned["upgrade"];
  delete cleaned["proxy-connection"];
  delete cleaned["proxy-authenticate"];
  delete cleaned["proxy-authorization"];
  delete cleaned["accept-encoding"]; // Biarkan axios handle compression

  return cleaned;
}

/**
 * Proxy endpoint yang menangani semua HTTP methods
 * Format: /:encodedUrl (encoded URL di path)
 * atau: /?url=... (query parameter)
 */
async function proxyHandler(req, res) {
  try {
    // Ambil target URL dari path parameter atau query parameter
    let targetUrl = req.params.encodedUrl || req.query.url;

    if (!targetUrl) {
      return res.status(400).json({
        error: "Target URL is required. Use /:encodedUrl or /?url=...",
      });
    }

    // Decode URL jika dari path parameter
    if (req.params.encodedUrl) {
      try {
        targetUrl = decodeURIComponent(targetUrl);
      } catch (e) {
        return res.status(400).json({ error: "Invalid URL encoding" });
      }
    }

    // Validasi URL
    try {
      new URL(targetUrl);
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Siapkan headers untuk request
    const headers = cleanHeaders(req.headers);

    // Siapkan data untuk request
    // Forward raw body as-is untuk memastikan semua data (termasuk binary) ter-forward dengan benar
    let requestData = undefined;
    if (req.rawBody && req.rawBody.length > 0) {
      requestData = req.rawBody;
      // Set content-length header jika ada body
      headers["content-length"] = requestData.length.toString();
    }

    // Konfigurasi axios request
    const axiosConfig = {
      method: req.method.toLowerCase(),
      url: targetUrl,
      headers: headers,
      data: requestData,
      // Optimasi: set maxRedirects dan timeout
      maxRedirects: 5,
      timeout: 30000, // 30 detik
      // Untuk response streaming yang lebih efisien (menghemat memory untuk large files)
      responseType: "stream",
      // Validasi status code - accept semua status code untuk forward ke client
      validateStatus: (status) => status < 600,
      // Decompress response jika perlu
      decompress: true,
    };

    // Lakukan request ke target URL
    const response = await axios(axiosConfig);

    // Forward status code
    res.status(response.status);

    // Forward headers dari response (kecuali beberapa yang tidak perlu)
    const responseHeaders = { ...response.headers };
    delete responseHeaders["content-encoding"]; // Biarkan Express handle compression
    delete responseHeaders["transfer-encoding"];
    delete responseHeaders["connection"];

    Object.keys(responseHeaders).forEach((key) => {
      res.setHeader(key, responseHeaders[key]);
    });

    // Pipe response stream ke client (efisien untuk large files)
    response.data.pipe(res);
  } catch (error) {
    // Handle errors
    if (error.response) {
      // Server responded dengan error status
      res.status(error.response.status);

      // Forward error headers
      const errorHeaders = { ...error.response.headers };
      delete errorHeaders["content-encoding"];
      delete errorHeaders["transfer-encoding"];
      delete errorHeaders["connection"];

      Object.keys(errorHeaders).forEach((key) => {
        res.setHeader(key, errorHeaders[key]);
      });

      // Forward error body
      if (error.response.data) {
        if (error.response.data.pipe) {
          error.response.data.pipe(res);
        } else {
          res.send(error.response.data);
        }
      } else {
        res.json({
          error: "Proxy request failed",
          status: error.response.status,
        });
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      res.status(502).json({
        error: "No response from target server",
        message: error.message,
      });
    } else {
      // Error saat setup request
      res.status(500).json({
        error: "Proxy error",
        message: error.message,
      });
    }
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Route untuk semua HTTP methods dengan encoded URL di path
app.all("/:encodedUrl(*)", proxyHandler);

// Route alternatif dengan query parameter
app.all("/", proxyHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", message: err.message });
});

// Export app untuk Vercel serverless function
module.exports = app;

// Hanya listen jika dijalankan langsung (bukan di Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
    console.log(`Usage examples:`);
    console.log(`  GET  /https%3A%2F%2Fapi.example.com%2Fdata`);
    console.log(`  GET  /?url=https://api.example.com/data`);
    console.log(`  POST /?url=https://api.example.com/data`);
  });
}
