"use strict";

const API_BASE = "https://reliance-financesss-service12.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("customerForm");
  const message = document.getElementById("adminMessage");
  const customerList = document.getElementById("customerList");

  function showMessage(text, success = false) {
    if (!message) {
      alert(text);
      return;
    }

    message.textContent = text;
    message.style.color = success ? "green" : "red";
    message.style.display = "block";
  }

  if (!form) {
    console.error("customerForm नहीं मिला।");
    showMessage("Form नहीं मिला। admin.html में customerForm ID जाँचें।");
    return;
  }

  const value = (id) =>
    document.getElementById(id)?.value?.trim() || "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector('[type="submit"]');
    const originalText = button?.textContent || "Submit Customer";

    const name = value("customerName");
    const mobile = value("mobileNumber");
    const loanType = value("loanType");
    const loanAmountText = value("loanAmount");
    const returnYearText = value("returnYear");
    const percentageText = value("percentage");

    const loanAmount = Number(loanAmountText);
    const returnYear = Number(returnYearText);
    const percentage = Number(percentageText || 0);

    if (!name || !mobile || !loanType) {
      showMessage("नाम, मोबाइल और Loan Type भरें।");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      showMessage("डेमो मोबाइल नंबर 10 अंकों का होना चाहिए।");
      return;
    }

    if (!loanAmountText || !Number.isFinite(loanAmount) || loanAmount <= 0) {
      showMessage("Loan Amount सही भरें।");
      return;
    }

    if (!returnYearText || !Number.isFinite(returnYear) || returnYear <= 0) {
      showMessage("Return Year में वर्षों की संख्या भरें, जैसे 2।");
      return;
    }

    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      showMessage("Percentage 0 से 100 के बीच भरें।");
      return;
    }

    const payload = {
      name,
      mobile,
      loanType,
      loanAmount,
      returnYear,
      percentage
    };

    try {
      if (button) {
        button.disabled = true;
        button.textContent = "Saving...";
      }

      showMessage("डेटा सेव किया जा रहा है...", true);

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

      const text = await response.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          Backend ने सही JSON नहीं भेजा (HTTP ${response.status})
        );
      }

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || Request failed (HTTP ${response.status})
        );
      }

      const record = result.application || result.data || {};
      const recordId = record.id ?? record.application_id ?? record.applicationId;

      if (recordId == null) {
        throw new Error(
          "Backend ने सेव होने की पुष्टि या Application ID नहीं दी।"
        );
      }

      showMessage(डेटा सफलतापूर्वक सेव हुआ। Application ID: ${recordId}, true);

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

