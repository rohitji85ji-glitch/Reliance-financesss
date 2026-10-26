"use strict";

const API_BASE = "https://reliance-financesss-12.onrender.com";

// वैल्यू पढ़ें
function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

// मैसेज दिखाएँ
function setMessage(message, type = "success") {
  const element =
    document.getElementById("adminMessage") ||
    document.getElementById("statusResult");

  if (element) {
    element.textContent = message;
    element.style.color =
      type === "error" ? "#dc2626" : "#15803d";
  }
}

// रुपये का फॉर्मेट
function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return "₹" + amount.toLocaleString("en-IN");
}

// फॉर्म रीसेट
function resetForm() {
  const form = document.getElementById("customerForm");
  if (form) form.reset();
}

// डेमो आवेदन सबमिट
async function handleCustomerSubmit(event) {
  event.preventDefault();

  const name =
    getValue("customerName") ||
    getValue("name") ||
    getValue("fullName");

  const mobile =
    getValue("mobileNumber") || getValue("mobile");

  const loanType = getValue("loanType");
  const loanAmount = getValue("loanAmount");
  const percentageText = getValue("percentage");
  const percentage =
    percentageText === "" ? 0 : Number(percentageText);

  if (!name) {
    setMessage("कृपया नाम भरें।", "error");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    setMessage("10 अंकों का डेमो मोबाइल नंबर भरें।", "error");
    return;
  }

  if (!loanType) {
    setMessage("कृपया Loan Type चुनें।", "error");
    return;
  }

  if (
    loanAmount === "" ||
    !Number.isFinite(Number(loanAmount)) ||
    Number(loanAmount) < 0
  ) {
    setMessage("कृपया सही Loan Amount भरें।", "error");
    return;
  }

  if (
    !Number.isFinite(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    setMessage("Progress 0 से 100 के बीच रखें।", "error");
    return;
  }

  const customerData = {
    name,
    mobile,
    loanType,
    loanAmount: Number(loanAmount),
    returnYear: getValue("returnYear"),
    percentage
  };

  try {
    setMessage("डेमो आवेदन सेव हो रहा है...");

    const response = await fetch(
      API_BASE + "/submit-application",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customerData)
      }
    );

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message || "आवेदन सेव नहीं हो सका।"
      );
    }

    resetForm();
    setMessage("डेमो आवेदन सफलतापूर्वक सेव हुआ!");
  } catch (error) {
    console.error("Submit error:", error);
    setMessage(
      error.message || "API कनेक्शन चेक करें।",
      "error"
    );
  }
}

// मोबाइल से डेमो स्टेटस चेक
async function checkStatus() {
  const mobileInput = document.getElementById("mobileNumber");
  const result = document.getElementById("statusResult");

  if (!mobileInput || !result) return;

  const mobile = mobileInput.value.trim();
  result.replaceChildren();

  if (!/^\d{10}$/.test(mobile)) {
    result.textContent =
      "कृपया 10 अंकों का डेमो मोबाइल नंबर डालें।";
    return;
  }

  result.textContent = "डेमो स्टेटस लोड हो रहा है...";

  try {
    const response = await fetch(
      API_BASE +
      "/check-application?mobile=" +
      encodeURIComponent(mobile)
    );

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || "स्टेटस लोड नहीं हुआ।"
      );
    }

    if (!data.application) {
      result.textContent =
        "इस डेमो नंबर से कोई आवेदन नहीं मिला।";
      return;
    }

    const application = data.application;

    const card = document.createElement("div");
    card.className = "status-card";
    card.style.cssText =
      "border:1px solid #ddd;padding:20px;" +
      "border-radius:10px;margin-top:15px;background:#fff;";

    function addRow(label, value) {
      const row = document.createElement("p");
      const strong = document.createElement("strong");

      strong.textContent = label + ": ";
      row.appendChild(strong);

      row.appendChild(
        document.createTextNode(
          value === undefined || value === null || value === ""
            ? "—"
            : String(value)
        )
      );

      card.appendChild(row);
    }

    addRow("आवेदक का नाम", application.name);
    addRow("Application ID", application.id);
    addRow("Loan Type", application.loan_type);
    addRow("आवेदन का स्टेटस", application.status);
    addRow(
      "Application Progress",
      (application.percentage ?? 0) + "%"
    );
    addRow("लोन राशि", formatMoney(application.loan_amount));
    addRow("वापसी अवधि", application.return_year);

    result.replaceChildren(card);
  } catch (error) {
    console.error("Status error:", error);
    result.textContent =
      "API से संपर्क नहीं हो सका। बाद में कोशिश करें।";
  }
}

window.checkStatus = checkStatus;

// स्क्रिप्ट शुरू करें
function initializeScript() {
  const form = document.getElementById("customerForm");

  if (form) {
    form.addEventListener("submit", handleCustomerSubmit);
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeScript
  );
} else {
  initializeScript();
}
