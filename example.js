/**
 * Contoh penggunaan proxy endpoint
 * Jalankan dengan: node example.js
 */

const axios = require("axios");

const PROXY_BASE_URL = "http://localhost:3000";

async function testProxy() {
  try {
    console.log("Testing Express Proxy URL...\n");

    // Test 1: GET request dengan path parameter (encoded URL)
    console.log("1. Testing GET with encoded URL in path...");
    const testUrl1 = "https://jsonplaceholder.typicode.com/posts/1";
    const encodedUrl = encodeURIComponent(testUrl1);
    const response1 = await axios.get(
      `${PROXY_BASE_URL}/proxy-url/${encodedUrl}`
    );
    console.log("✅ Success:", response1.data.title?.substring(0, 50) || "OK");
    console.log("");

    // Test 2: GET request dengan query parameter
    console.log("2. Testing GET with query parameter...");
    const testUrl2 = "https://jsonplaceholder.typicode.com/posts/2";
    const response2 = await axios.get(`${PROXY_BASE_URL}/proxy-url`, {
      params: { url: testUrl2 },
    });
    console.log("✅ Success:", response2.data.title?.substring(0, 50) || "OK");
    console.log("");

    // Test 3: POST request dengan JSON body
    console.log("3. Testing POST with JSON body...");
    const testUrl3 = "https://jsonplaceholder.typicode.com/posts";
    const postData = {
      title: "Test Post",
      body: "This is a test post",
      userId: 1,
    };
    const response3 = await axios.post(
      `${PROXY_BASE_URL}/proxy-url?url=${encodeURIComponent(testUrl3)}`,
      postData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Success:", response3.data.id ? "Post created" : "OK");
    console.log("");

    // Test 4: Health check
    console.log("4. Testing health check...");
    const healthResponse = await axios.get(`${PROXY_BASE_URL}/health`);
    console.log("✅ Health:", healthResponse.data);
    console.log("");

    console.log("All tests completed! ✅");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

// Jalankan test jika file dijalankan langsung
if (require.main === module) {
  testProxy();
}

module.exports = { testProxy };
