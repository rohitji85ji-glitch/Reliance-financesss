"use strict";

const API_BASE = "https://reliance-financesss-service12.onrender.com";

function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function setMessage(message, type = "success") {
  const element =
    document.getElementById("adminMessage") ||
    document.getElementById("statusResult");

  if (!element) {
    console.log(message);
    return;
  }

  element.textContent = message;
  element.style.color =
    type === "error" ? "#dc2626" : "#15803d";
}

function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return "₹" + amount.toLocaleString("en-IN");
}

function resetForm() {
  const form = document.getElementById("customerForm");
  if (form) form.reset();
}

// खाली response और invalid JSON को सुरक्षित तरीके से पढ़ें
async function readApiResponse(response) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      API से खाली response मिला (HTTP ${response.status})।
    );
  }

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      API ने JSON के बजाय दूसरा response दिया (HTTP ${response.status})।
    );
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || API error (HTTP ${response.status})।
    );
  }

  return data;
}

// API request
async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(API_BASE + path, options);
  } catch (error) {
    throw new Error(
      "API से कनेक्शन नहीं हुआ। इंटरनेट और API URL चेक करें।"
    );
  }

  return readApiResponse(response);
}

// डेमो आवेदन सबमिट करें
async function handleCustomerSubmit(event) {
  event.preventDefault();

  const name =
    getValue("customerName") ||
    getValue("name") ||
    getValue("fullName");

  const mobile =
    getValue("mobileNumber") ||
    getValue("mobile");

  const loanType = getValue("loanType");
  const loanAmount = getValue("loanAmount");
  const percentageText = getValue("percentage");
  const percentage =
    percentageText === "" ? 0 : Number(percentageText);

  const returnYear = getValue("returnYear");

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
    setMessage("सही Loan Amount भरें।", "error");
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

  const submitButton = document.querySelector(
    '#customerForm button[type="submit"], #customerForm input[type="submit"]'
  );

  try {
    if (submitButton) submitButton.disabled = true;

    setMessage("डेमो आवेदन सेव हो रहा है...");

    const result = await apiRequest("/submit-application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        mobile,
        loanType,
        loanAmount: Number(loanAmount),
        returnYear,
        percentage
      })
    });

    if (!result.application) {
      throw new Error(
        "सर्वर से आवेदन की पुष्टि नहीं मिली।"
      );
    }

    resetForm();
    setMessage(
      "डेमो आवेदन सफलतापूर्वक सेव हुआ। Application ID: " +
      result.application.id
    );
  } catch (error) {
    console.error("Submit error:", error);
    setMessage(
      error.message || "आवेदन सेव नहीं हो सका।",
      "error"
    );
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

// मोबाइल नंबर से डेमो स्टेटस चेक करें
async function checkStatus() {
  const mobileInput = document.getElementById("mobileNumber");
  const result = document.getElementById("statusResult");

  if (!mobileInput || !result) {
    console.error(
      "Status form में mobileNumber या statusResult ID नहीं मिली।"
    );
    return;
  }

  const mobile = mobileInput.value.trim();
  result.replaceChildren();

  if (!/^\d{10}$/.test(mobile)) {
    result.textContent =
      "कृपया 10 अंकों का डेमो मोबाइल नंबर डालें।";
    return;
  }

  result.textContent = "डेमो स्टेटस लोड हो रहा है...";

  try {
    const data = await apiRequest(
      "/check-application?mobile=" +
      encodeURIComponent(mobile)
    );

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
      error.message || "स्टेटस लोड नहीं हुआ।";
  }
}

window.checkStatus = checkStatus;

// फॉर्म को केवल एक बार जोड़ें
function initializeScript() {
  const form = document.getElementById("customerForm");

  if (form && !form.dataset.submitHandlerAttached) {
    form.addEventListener("submit", handleCustomerSubmit);
    form.dataset.submitHandlerAttached = "true";
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
