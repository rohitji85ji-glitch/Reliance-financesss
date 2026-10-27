"use strict";

const API_BASE = "https://reliance-financesss-service12.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("customerForm");
  const message = document.getElementById("adminMessage");
  const customerList = document.getElementById("customerList");

  function showMessage(text, success = false) {
    if (message) {
      message.textContent = text;
      message.style.color = success ? "green" : "red";
      message.style.display = "block";
    } else {
      alert(text);
    }
  }

  if (!form) {
    console.error("customerForm नहीं मिला। HTML में ID चेक करें।");
    return;
  }

  function value(id) {
    return document.getElementById(id)?.value?.trim() || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector('[type="submit"]');
    const originalText = button?.textContent || "Submit Customer";

    const name = value("customerName");
    const mobile = value("mobileNumber");
    const loanType = value("loanType");
    const amountText = value("loanAmount");
    const periodText = value("returnYear");
    const rateText = value("percentage");

    const loanAmount = Number(amountText);
    const percentage = rateText === "" ? 0 : Number(rateText);

    const match = periodText.match(/^\s*(\d+(?:\.\d+)?)/);
    const returnYear = match ? Number(match[1]) : NaN;

    if (!name || !mobile || !loanType) {
      showMessage("नाम, मोबाइल और Loan Type भरें।");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      showMessage("मोबाइल नंबर 10 अंकों का होना चाहिए।");
      return;
    }

    if (!amountText || !Number.isFinite(loanAmount) || loanAmount <= 0) {
      showMessage("Loan Amount सही भरें।");
      return;
    }

    if (!periodText || !Number.isFinite(returnYear) || returnYear <= 0) {
      showMessage("Return Period में 2 Years जैसा मान भरें।");
      return;
    }

    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      showMessage("Percentage 0 से 100 के बीच भरें।");
      return;
    }

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
          body: JSON.stringify({
            name,
            mobile,
            loanType,
            loanAmount,
            returnYear,
            percentage
          })
        }
      );

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          सर्वर का जवाब पढ़ा नहीं जा सका (HTTP ${response.status})
        );
      }

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || HTTP ${response.status}
        );
      }

      const record = result.application || {};

      if (record.id == null) {
        throw new Error(
          "सर्वर ने Application ID नहीं भेजी। सर्वर कोड चेक करें।"
        );
      }

      showMessage(
        डेटा सफलतापूर्वक सेव हो गया। Application ID: ${record.id},
        true
      );

      form.reset();

      if (customerList) {
        const item = document.createElement("div");
        item.textContent = ${name} — ${mobile} — ID: ${record.id};
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

  console.log("Admin script loaded successfully.");
});
