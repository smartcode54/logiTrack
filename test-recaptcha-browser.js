/**
 * reCAPTCHA Enterprise Test Script
 *
 * วิธีใช้:
 * 1. เปิด Browser Console (F12)
 * 2. Copy และ paste script นี้ทั้งหมด
 * 3. กด Enter
 *
 * Script นี้จะ:
 * - ตรวจสอบว่า reCAPTCHA Enterprise script ถูก load แล้ว
 * - รอให้ script พร้อมใช้งาน
 * - ดึง token อัตโนมัติ
 * - แสดงผลลัพธ์ใน console
 */

(function () {
  console.log("========================================");
  console.log("reCAPTCHA Enterprise Test Script");
  console.log("========================================");
  console.log("");

  // Configuration
  const siteKey = "6LfMKzYsAAAAAOkt_oOVzmUDKhc0Iol63lSr1uEW"; // แทนที่ด้วย site key ของคุณ
  const action = "verify";
  const maxWaitTime = 10000; // 10 seconds

  // Function to check if reCAPTCHA is loaded (supports both v3 and Enterprise)
  function checkRecaptchaLoaded() {
    if (typeof grecaptcha !== "undefined") {
      // Check for Enterprise first
      if (grecaptcha.enterprise) {
        return { loaded: true, type: "enterprise" };
      }
      // Check for v3
      if (grecaptcha.execute) {
        return { loaded: true, type: "v3" };
      }
    }
    return { loaded: false, type: null };
  }

  // Function to wait for reCAPTCHA to load
  function waitForRecaptcha() {
    return new Promise((resolve, reject) => {
      const checkResult = checkRecaptchaLoaded();
      if (checkResult.loaded) {
        console.log(
          `✓ reCAPTCHA ${
            checkResult.type === "enterprise" ? "Enterprise" : "v3"
          } is already loaded`
        );
        resolve(checkResult.type);
        return;
      }

      console.log("⏳ Waiting for reCAPTCHA to load...");

      const checkInterval = setInterval(() => {
        const result = checkRecaptchaLoaded();
        if (result.loaded) {
          clearInterval(checkInterval);
          console.log(
            `✓ reCAPTCHA ${
              result.type === "enterprise" ? "Enterprise" : "v3"
            } loaded successfully`
          );
          resolve(result.type);
        }
      }, 100);

      // Timeout after maxWaitTime
      setTimeout(() => {
        clearInterval(checkInterval);
        const result = checkRecaptchaLoaded();
        if (!result.loaded) {
          reject(
            new Error("reCAPTCHA failed to load within " + maxWaitTime + "ms")
          );
        }
      }, maxWaitTime);
    });
  }

  // Function to get token
  function getToken(recaptchaType) {
    return new Promise((resolve, reject) => {
      const checkResult = checkRecaptchaLoaded();
      if (!checkResult.loaded) {
        reject(new Error("reCAPTCHA is not loaded"));
        return;
      }

      console.log("");
      console.log("🔄 Getting reCAPTCHA token...");
      console.log(
        "   Type: " + (recaptchaType === "enterprise" ? "Enterprise" : "v3")
      );
      console.log("   Site Key: " + siteKey);
      console.log("   Action: " + action);
      console.log("");

      // Use appropriate API based on type
      const executeFn =
        recaptchaType === "enterprise"
          ? grecaptcha.enterprise.execute
          : grecaptcha.execute;

      executeFn(siteKey, { action: action })
        .then((token) => {
          console.log("✓ Token received successfully!");
          console.log("   Token length: " + token.length + " characters");
          console.log("   Token preview: " + token.substring(0, 50) + "...");
          console.log("");

          // Copy to clipboard if possible
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(token)
              .then(() => {
                console.log("✓ Token copied to clipboard!");
              })
              .catch(() => {
                console.log("⚠ Could not copy to clipboard");
              });
          }

          resolve(token);
        })
        .catch((error) => {
          console.error("✗ Error getting token:", error);
          reject(error);
        });
    });
  }

  // Main execution
  waitForRecaptcha()
    .then((recaptchaType) => {
      return getToken(recaptchaType);
    })
    .then((token) => {
      console.log("========================================");
      console.log("✅ Test completed successfully!");
      console.log("========================================");
      console.log("");
      console.log("Next steps:");
      console.log("1. Copy the token above");
      console.log("2. Use it in your API test script");
      console.log("3. Or use it directly in the browser console:");
      console.log("");
      console.log('   fetch("http://localhost:3000/api/recaptcha/verify", {');
      console.log('     method: "POST",');
      console.log('     headers: { "Content-Type": "application/json" },');
      console.log("     body: JSON.stringify({");
      console.log('       token: "' + token.substring(0, 30) + '...",');
      console.log('       expectedAction: "' + action + '",');
      console.log('       siteKey: "' + siteKey + '"');
      console.log("     })");
      console.log("   }).then(r => r.json()).then(console.log);");
      console.log("");

      // Store token in global variable for easy access
      window.recaptchaToken = token;
      console.log("💡 Token is also stored in window.recaptchaToken");
    })
    .catch((error) => {
      console.error("");
      console.error("========================================");
      console.error("✗ Test failed!");
      console.error("========================================");
      console.error("Error: " + error.message);
      console.error("");
      console.error("Troubleshooting:");
      console.error("1. Check if reCAPTCHA script is loaded in the page");
      console.error("2. Check if site key is correct");
      console.error("3. Check if domain is registered in reCAPTCHA admin");
      console.error("4. Check browser console for CSP violations");
    });
})();
