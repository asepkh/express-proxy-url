/**
 * Warm-up endpoint yang memanggil main proxy function
 * Ini akan memastikan Express app dan dependencies sudah loaded di memory
 */
module.exports = async (req, res) => {
  try {
    // Pre-load Express app dan dependencies untuk warm-up
    // Ini akan trigger module loading dan initialization
    const app = require("../server");
    
    // Pre-load axios juga untuk memastikan sudah di memory
    require("axios");
    
    res.status(200).json({
      status: "warmed",
      timestamp: new Date().toISOString(),
      message: "Proxy function and dependencies warmed up successfully",
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(200).json({
      status: "warm",
      timestamp: new Date().toISOString(),
      message: "Warm-up initiated",
      error: error.message,
    });
  }
};
