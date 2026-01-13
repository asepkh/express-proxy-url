/**
 * Keep-alive endpoint untuk mencegah cold start
 * Endpoint ini akan dipanggil secara berkala oleh Vercel Cron
 */
module.exports = async (req, res) => {
  // Simple response untuk keep function warm
  res.status(200).json({
    status: "warm",
    timestamp: new Date().toISOString(),
    message: "Function is warm and ready",
  });
};
