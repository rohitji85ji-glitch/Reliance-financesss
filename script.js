"use strict";

const STORAGE_KEY = "relianceFinanceCustomers";

/* ---------- COMMON HELPERS ---------- */

function getCustomers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Read error:", error);
    return [];
  }
}

function saveCustomers(customers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));

  // Confirm that the saved data can be read back.
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  if (!Array.isArray(saved)) {
    throw new Error("Saved data could not be verified.");
  }
}

function field(id) {
  return document.getElementById(id);
}

function getValue(id) {
  const element = field(id);
  return element ? element.value.trim() : "";
}

function showMessage(message, error = false) {
  const output = field("adminMessage");

  if (output) {
    output.textContent = message;
    output.style.color = error ? "#b91c1c" : "#15803d";
  } else {
    alert(message);
  }
}

function createApplicationId() {
  return "APP-" + Date.now().toString(36).toUpperCase();
}

function formatMoney(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) return "₹0";

  return "₹" + amount.toLocaleString("en-IN");
}

function addRow(container, label, value) {
  const p = document.createElement("p");
  const strong = document.createElement("strong");

  strong.textContent = label + ": ";
  p.appendChild(strong);

  p.appendChild(
    document.createTextNode(
      value === undefined || value === null || value === ""
        ? "—"
        : String(value)
    )
  );

  container.appendChild(p);
}

function makeButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

/* ---------- ADMIN FORM ---------- */

function handleCustomerSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');

  const name = getValue("customerName");
  const mobile = getValue("mobileNumber");
  const loanType = getValue("loanType");
  const loanAmount = getValue("loanAmount");
  const percentageText = getValue("percentage");

  const percentage =
    percentageText === "" ? 0 : Number(percentageText);

  if (!name) {
    showMessage("कृपया ग्राहक का नाम भरें।", true);
    return;
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    showMessage("कृपया सही 10 अंकों का मोबाइल नंबर डालें।", true);
    return;
  }

  if (!loanType) {
    showMessage("कृपया Loan Type चुनें।", true);
    return;
  }

  if (
    loanAmount === "" ||
    !Number.isFinite(Number(loanAmount)) ||
    Number(loanAmount) < 0
  ) {
    showMessage("कृपया सही Loan Amount भरें।", true);
    return;
  }

  if (
    !Number.isFinite(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    showMessage("Progress 0 से 100 के बीच भरें।", true);
    return;
  }

  const editingId = getValue("editingId");

  const customer = {
    applicationId: editingId || createApplicationId(),
    name: name,
    mobile: mobile,
    loanType: loanType,
    loanAmount: Number(loanAmount),
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
    upiNumber: getValue("upiNumber"),
    updatedAt: new Date().toISOString()
  };

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Saving...";
    }

    const customers = getCustomers();

    const existingIndex = customers.findIndex(
      item => item.applicationId === editingId
    );

    if (editingId && existingIndex === -1) {
      showMessage("अपडेट करने वाला रिकॉर्ड नहीं मिला।", true);
      return;
    }

    const duplicate = customers.find(
      item =>
        item.mobile === mobile &&
        item.applicationId !== editingId
    );

    if (duplicate) {
      showMessage(
        "यह मोबाइल नंबर पहले से मौजूद है। पुराने रिकॉर्ड को Edit करें।",
        true
      );
      return;
    }

    if (editingId) {
      customers[existingIndex] = {
        ...customers[existingIndex],
        ...customer
      };
    } else {
      customers.unshift(customer);
    }

    // Save BEFORE clearing the form.
    saveCustomers(customers);

    renderCustomers();
    form.reset();

    const editingField = field("editingId");
    if (editingField) editingField.remove();

    if (submitButton) {
      submitButton.textContent = "Submit Customer";
    }

    showMessage(
      editingId
        ? "रिकॉर्ड सफलतापूर्वक अपडेट हो गया।"
        : "ग्राहक का रिकॉर्ड सफलतापूर्वक सेव हो गया।"
    );
  } catch (error) {
    console.error("Save failed:", error);

    showMessage(
      "रिकॉर्ड सेव नहीं हुआ। आपकी जानकारी फिर से जाँचें और दोबारा प्रयास करें।",
      true
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      if (submitButton.textContent === "Saving...") {
        submitButton.textContent = "Submit Customer";
      }
    }
  }
}

/* ---------- ADMIN CUSTOMER LIST ---------- */

function renderCustomers() {
  const list = field("customerList");
  if (!list) return;

  list.replaceChildren();

  const customers = getCustomers();

  if (customers.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "अभी कोई रिकॉर्ड उपलब्ध नहीं है।";
    list.appendChild(empty);
    return;
  }

  customers.forEach(customer => {
    const card = document.createElement("div");
    card.className = "customer-card";

    addRow(card, "नाम", customer.name);
    addRow(card, "मोबाइल", customer.mobile);
    addRow(card, "Application ID", customer.applicationId);
    addRow(card, "Loan Type", customer.loanType);
    addRow(card, "Loan Amount", formatMoney(customer.loanAmount));
    addRow(card, "Progress", ${customer.percentage || 0}%);

    card.appendChild(
      makeButton("Edit", () => editCustomer(customer.applicationId))
    );

    card.appendChild(
      makeButton("Delete", () => deleteCustomer(customer.applicationId))
    );

    list.appendChild(card);
  });
}

function editCustomer(applicationId) {
  const customer = getCustomers().find(
    item => item.applicationId === applicationId
  );

  if (!customer) {
    showMessage("रिकॉर्ड नहीं मिला।", true);
    return;
  }

  const fieldMap = {
    customerName: "name",
    mobileNumber: "mobile",
    loanType: "loanType",
    loanAmount: "loanAmount",
    aadhaarLast4: "aadhaarLast4",
    panLast4: "panLast4",
    returnYear: "returnYear",
    charge: "charge",
    chargeAmount: "chargeAmount",
    percentage: "percentage",
    bankName: "bankName",
    accountHolderName: "accountHolderName",
    accountNumber: "accountNumber",
    ifscCode: "ifscCode",
    upiNumber: "upiNumber"
  };

  Object.entries(fieldMap).forEach(([id, key]) => {
    const element = field(id);

    if (element) {
      element.value = customer[key] ?? "";
    }
  });

  let editingField = field("editingId");

  if (!editingField) {
    editingField = document.createElement("input");
    editingField.type = "hidden";
    editingField.id = "editingId";
    editingField.name = "editingId";
    field("customerForm").appendChild(editingField);
  }

  editingField.value = customer.applicationId;

  const form = field("customerForm");
  const submitButton = form.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.textContent = "Update Customer";
  }

  showMessage("जानकारी बदलें और Update Customer दबाएँ।");

  form.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function deleteCustomer(applicationId) {
  if (!confirm("क्या आप यह रिकॉर्ड हटाना चाहते हैं?")) return;

  try {
    const customers = getCustomers().filter(
      item => item.applicationId !== applicationId
    );

    saveCustomers(customers);
    renderCustomers();
    showMessage("रिकॉर्ड हटा दिया गया।");
  } catch (error) {
    console.error(error);
    showMessage("रिकॉर्ड हटाया नहीं जा सका।", true);
  }
}

/* ---------- CUSTOMER STATUS PAGE ---------- */

function checkStatus() {
  const mobile = getValue("mobileNumber");
  const result = field("statusResult");

  if (!result) return;

  result.replaceChildren();

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    result.textContent = "कृपया सही 10 अंकों का मोबाइल नंबर डालें।";
    return;
  }

  const customer = getCustomers().find(
    item => item.mobile === mobile
  );

  if (!customer) {
    result.textContent = "इस मोबाइल नंबर से कोई आवेदन नहीं मिला।";
    return;
  }

  const card = document.createElement("div");
  card.className = "status-card";

  addRow(card, "आवेदक का नाम", customer.name);
  addRow(card, "Application ID", customer.applicationId);
  addRow(card, "Loan Type", customer.loanType);
  addRow(card, "Loan Amount", formatMoney(customer.loanAmount));
  addRow(card, "Application Progress", ${customer.percentage || 0}%);
  addRow(card, "Last Updated", customer.updatedAt
    ? new Date(customer.updatedAt).toLocaleString("en-IN")
    : "—");

  result.appendChild(card);
}

window.checkStatus = checkStatus;

/* ---------- INITIALIZATION ---------- */

function initializeScript() {
  const form = field("customerForm");

  if (form) {
    form.addEventListener("submit", handleCustomerSubmit);
    renderCustomers();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeScript);
} else {
  initializeScript();
}
