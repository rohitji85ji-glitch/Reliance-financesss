"use strict";

const API_BASE =
  "https://reliance-financesss-service12.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("customerForm");
  const message = document.getElementById("adminMessage");
  const customerList = document.getElementById("customerList");

  if (!form) {
    console.error("customerForm नहीं मिला।");
    return;
  }

  function showMessage(text, success = false) {
    if (!message) {
      alert(text);
      return;
    }

    message.textContent = text;
    message.style.color = success ? "green" : "red";
    message.style.display = "block";
  }

  async function readApiResponse(response) {
    const text = await response.text();

    if (!text.trim()) {
      throw new Error(खाली API response (HTTP ${response.status}));
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(API ने JSON नहीं भेजा (HTTP ${response.status}));
    }

    if (!response.ok || data.success === false || data.error) {
      throw new Error(
        data.message || data.error || Server error ${response.status}
      );
    }

    return data;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const originalText = button?.textContent || "Submit Customer";

    const value = (id) =>
      document.getElementById(id)?.value?.trim() || "";

    const name = value("customerName");
    const mobile = value("mobileNumber");
    const loanType = value("loanType");
    const loanAmount = Number(value("loanAmount"));
    const returnYear = Number(value("returnYear"));
    const percentage = Number(value("percentage"));

    if (!name || !mobile || !loanType) {
      showMessage("नाम, मोबाइल और Loan Type भरें।");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      showMessage("डेमो मोबाइल नंबर 10 अंकों का होना चाहिए।");
      return;
    }

    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      showMessage("Loan Amount सही भरें।");
      return;
    }

    if (!Number.isFinite(returnYear) || returnYear <= 0) {
      showMessage("Return Year सही भरें।");
      return;
    }

    if (!Number.isFinite(percentage) || percentage < 0) {
      showMessage("Percentage सही भरें।");
      return;
    }

    // Backend के अपेक्षित field names
    const payload = {
      name: name,
      mobile: mobile,
      loanType: loanType,
      loanAmount: loanAmount,
      returnYear: returnYear,
      percentage: percentage
    };

    try {
      if (button) {
        button.disabled = true;
        button.textContent = "Saving...";
      }

      showMessage("डेटा भेजा जा रहा है...", true);

      const response = await fetch(
        ${API_BASE}/submit-application,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await readApiResponse(response);

      // केवल सफल HTTP/API जवाब के बाद फॉर्म खाली करें।
      // Backend response में ID का नाम अलग हो सकता है।
      const record =
        result.application || result.data || result;

      const recordId =
        record.id ?? record.application_id ?? record.applicationId;

      if (record.success === false) {
        throw new Error(result.message || "डेटा सेव नहीं हुआ।");
      }

      if (recordId == null) {
        console.warn("API response में रिकॉर्ड ID नहीं मिली:", result);
        showMessage(
          "API ने जवाब दिया, लेकिन सेव होने की पुष्टि नहीं मिली। " +
          "फॉर्म खाली नहीं किया गया। Render Logs जाँचें।"
        );
        return;
      }

      showMessage(
        डेटा सेव हो गया। Application ID: ${recordId},
        true
      );

      form.reset();

      if (customerList) {
        const item = document.createElement("div");
        item.textContent = ${name} — ${mobile} — ID: ${recordId};
        customerList.prepend(item);
      }
    } catch (error) {
      console.error("Submit error:", error);
      showMessage(डेटा सेव नहीं हुआ: ${error.message});
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  });

  console.log("Admin script loaded.");
});
