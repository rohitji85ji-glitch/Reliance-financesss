"use strict";

const STORAGE_KEY = "relianceFinanceCustomers";

// HTML से सुरक्षित तरीके से वैल्यू पढ़ें
function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

// सेव किया गया डेटा पढ़ें
function getCustomers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const customers = data ? JSON.parse(data) : [];
    return Array.isArray(customers) ? customers : [];
  } catch (error) {
    console.error("Data read error:", error);
    return [];
  }
}

// डेटा सेव करें
function saveCustomers(customers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

// संदेश दिखाएँ
function setMessage(message, type = "success") {
  const element = document.getElementById("adminMessage");

  if (element) {
    element.textContent = message;
    element.style.color =
      type === "error" ? "#dc2626" : "#15803d";
  } else {
    const result = document.getElementById("statusResult");
    if (result) result.textContent = message;
  }
}

// नया Application ID बनाएँ
function makeId() {
  return "APP-" + Date.now().toString(36).toUpperCase();
}

// रुपये का फॉर्मेट
function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return "₹" + amount.toLocaleString("en-IN");
}

// सुरक्षित टेक्स्ट रो बनाएँ
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

// फॉर्म रीसेट करें
function resetForm() {
  const form = document.getElementById("customerForm");
  if (form) form.reset();

  const editingId = document.getElementById("editingId");
  if (editingId) editingId.value = "";

  const button = document.querySelector(
    '#customerForm button[type="submit"]'
  );

  if (button) button.textContent = "Submit Customer";

  const cancelButton =
    document.getElementById("cancelEditButton");

  if (cancelButton) cancelButton.style.display = "none";
}

// फॉर्म सबमिट
function handleCustomerSubmit(event) {
  event.preventDefault();

  const name = getValue("customerName");
  const mobile = getValue("mobileNumber");
  const loanType = getValue("loanType");
  const loanAmount = getValue("loanAmount");
  const percentageText = getValue("percentage");
  const percentage =
    percentageText === "" ? 0 : Number(percentageText);

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
    setMessage("Progress 0 से 100 के बीच भरें।", "error");
    return;
  }

  const editingField = document.getElementById("editingId");
  const editingId = editingField ? editingField.value : "";

  const customer = {
    name: name,
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
    upiNumber: getValue("upiNumber"),
    status: "Pending",
    updatedAt: new Date().toISOString()
  };

  try {
    const customers = getCustomers();

    if (editingId) {
      const index = customers.findIndex(
        item => item.applicationId === editingId
      );

      if (index === -1) {
        setMessage("अपडेट करने वाला रिकॉर्ड नहीं मिला।", "error");
        return;
      }

      customer.applicationId = editingId;
      customers[index] = {
        ...customers[index],
        ...customer
      };
    } else {
      const duplicate = customers.find(
        item => item.mobile === mobile
      );

      if (duplicate) {
        setMessage(
          "यह मोबाइल नंबर पहले से सेव है। पुराने रिकॉर्ड को Edit करें।",
          "error"
        );
        return;
      }

      customer.applicationId = makeId();
      customers.unshift(customer);
    }

    // सेव करने के बाद डेटा दोबारा पढ़कर पुष्टि करें
    saveCustomers(customers);

    const savedCustomers = getCustomers();
    const savedRecord = savedCustomers.find(
      item => item.applicationId === customer.applicationId
    );

    if (!savedRecord) {
      throw new Error("Record verification failed");
    }

    loadCustomers();
    resetForm();

    setMessage(
      "रिकॉर्ड सफलतापूर्वक सेव हो गया। Application ID: " +
      customer.applicationId
    );
  } catch (error) {
    console.error("Save error:", error);
    setMessage(
      "रिकॉर्ड सेव नहीं हुआ। कृपया दोबारा कोशिश करें।",
      "error"
    );
  }
}

// Admin में सभी रिकॉर्ड दिखाएँ
function loadCustomers() {
  const list = document.getElementById("customerList");
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
    addRow(card, "लोन राशि", formatMoney(customer.loanAmount));
    addRow(card, "स्टेटस", customer.status);
    addRow(card, "Application Progress", ${customer.percentage || 0}%);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      editCustomer(customer.applicationId);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      deleteCustomer(customer.applicationId);
    });

    card.appendChild(editButton);
    card.appendChild(deleteButton);
    list.appendChild(card);
  });
}

// रिकॉर्ड एडिट करें
function editCustomer(applicationId) {
  const customer = getCustomers().find(
    item => item.applicationId === applicationId
  );

  if (!customer) {
    setMessage("रिकॉर्ड नहीं मिला।", "error");
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
    const field = document.getElementById(id);
    if (field) field.value = customer[key] ?? "";
  });

  let editingField = document.getElementById("editingId");

  if (!editingField) {
    editingField = document.createElement("input");
    editingField.type = "hidden";
    editingField.id = "editingId";
    document.getElementById("customerForm").appendChild(editingField);
  }

  editingField.value = customer.applicationId;

  const button = document.querySelector(
    '#customerForm button[type="submit"]'
  );

  if (button) button.textContent = "Update Customer";

  setMessage("जानकारी बदलकर Update Customer दबाएँ।");

  document.getElementById("customerForm").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// रिकॉर्ड हटाएँ
function deleteCustomer(applicationId) {
  if (!confirm("क्या आप यह रिकॉर्ड हटाना चाहते हैं?")) return;

  try {
    const customers = getCustomers().filter(
      item => item.applicationId !== applicationId
    );

    saveCustomers(customers);
    loadCustomers();
    setMessage("रिकॉर्ड हटा दिया गया।");
  } catch (error) {
    console.error("Delete error:", error);
    setMessage("रिकॉर्ड हटाया नहीं जा सका।", "error");
  }
}

// मोबाइल नंबर से स्टेटस देखें
function checkStatus() {
  const mobileInput = document.getElementById("mobileNumber");
  const result = document.getElementById("statusResult");

  if (!mobileInput || !result) return;

  const mobile = mobileInput.value.trim();
  result.replaceChildren();

  if (!/^\d{10}$/.test(mobile)) {
    result.textContent = "कृपया सही 10 अंकों का मोबाइल नंबर डालें।";
    return;
  }

  const customer = getCustomers().find(
    item => item.mobile === mobile
  );

  if (!customer) {
    result.textContent =
      "इस मोबाइल नंबर से कोई आवेदन नहीं मिला।";
    return;
  }

  const card = document.createElement("div");
  card.className = "status-card";

  addRow(card, "आवेदक का नाम", customer.name);
  addRow(card, "Application ID", customer.applicationId);
  addRow(card, "Loan Type", customer.loanType);
  addRow(card, "आवेदन का स्टेटस", customer.status);
  addRow(
    card,
    "Application Progress",
    ${customer.percentage || 0}%
  );
  addRow(card, "लोन राशि", formatMoney(customer.loanAmount));

  result.appendChild(card);
}

window.checkStatus = checkStatus;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;

// स्क्रिप्ट शुरू करें
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
