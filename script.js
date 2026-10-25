"use strict";

const STORAGE_KEY = "relianceFinanceCustomers";

function getCustomers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const customers = data ? JSON.parse(data) : [];
    return Array.isArray(customers) ? customers : [];
  } catch (error) {
    console.error("Customer data could not be read:", error);
    return [];
  }
}

function saveCustomers(customers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

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
    alert(message);
  }
}

function makeId() {
  return "APP-" + Date.now().toString(36).toUpperCase();
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
  row.appendChild(document.createTextNode(
    value === undefined || value === null || value === ""
      ? "—"
      : String(value)
  ));

  container.appendChild(row);
}

function getForm() {
  return document.getElementById("customerForm");
}

function resetForm() {
  const form = getForm();
  if (form) form.reset();

  const idField = document.getElementById("editingId");
  if (idField) idField.value = "";

  const button = document.getElementById("saveButton") ||
    (form && form.querySelector('button[type="submit"]'));

  if (button) button.textContent = "Submit Customer";

  const cancelButton = document.getElementById("cancelEditButton");
  if (cancelButton) cancelButton.style.display = "none";
}

function handleCustomerSubmit(event) {
  event.preventDefault();

  const form = getForm();
  if (!form) return;

  const name = getValue("name");
  const mobile = getValue("mobile");
  const email = getValue("email");
  const address = getValue("address");
  const loanAmount = getValue("loanAmount");
  const status = getValue("status") || "Pending";
  const percentageText = getValue("percentage");
  const percentage = percentageText === ""
    ? 0
    : Number(percentageText);

  if (!name) {
    setMessage("कृपया ग्राहक का नाम भरें।", "error");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    setMessage("मोबाइल नंबर 10 अंकों का होना चाहिए।", "error");
    return;
  }

  if (
    loanAmount !== "" &&
    (!Number.isFinite(Number(loanAmount)) || Number(loanAmount) < 0)
  ) {
    setMessage("लोन राशि सही भरें।", "error");
    return;
  }

  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    setMessage("Progress 0 से 100 के बीच भरें।", "error");
    return;
  }

  const customer = {
    name,
    mobile,
    email,
    address,
    loanAmount: loanAmount === "" ? "0" : loanAmount,
    status,
    percentage,
    applicationId: getValue("applicationId") || makeId(),
    accountHolderName: getValue("accountHolderName"),
    bankName: getValue("bankName"),
    accountNumber: getValue("accountNumber"),
    ifsc: getValue("ifsc"),
    upiId: getValue("upiId"),
    tds: getValue("tds"),
    rbiCharge: getValue("rbiCharge"),
    updatedAt: new Date().toISOString()
  };

  try {
    const customers = getCustomers();
    const editingId = getValue("editingId");

    if (editingId) {
      const index = customers.findIndex(
        item => item.applicationId === editingId
      );

      if (index === -1) {
        setMessage("एडिट वाला रिकॉर्ड नहीं मिला।", "error");
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
          "इस मोबाइल नंबर का रिकॉर्ड पहले से है। एडिट करके अपडेट करें।",
          "error"
        );
        return;
      }

      customers.unshift(customer);
    }

    saveCustomers(customers);
    resetForm();
    loadCustomers();

    setMessage("रिकॉर्ड सफलतापूर्वक सेव हो गया।");
  } catch (error) {
    console.error(error);
    setMessage(
      "रिकॉर्ड सेव नहीं हुआ। ब्राउज़र की स्टोरेज सेटिंग जाँचें।",
      "error"
    );
  }
}

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
    addRow(card, "लोन राशि", formatMoney(customer.loanAmount));
    addRow(card, "स्टेटस", customer.status);
    addRow(card, "Progress", ${customer.percentage || 0}%);

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

function editCustomer(applicationId) {
  const customer = getCustomers().find(
    item => item.applicationId === applicationId
  );

  if (!customer) {
    setMessage("रिकॉर्ड नहीं मिला।", "error");
    return;
  }

  const fieldMap = {
    name: "name",
    mobile: "mobile",
    email: "email",
    address: "address",
    loanAmount: "loanAmount",
    status: "status",
    percentage: "percentage",
    applicationId: "applicationId",
    accountHolderName: "accountHolderName",
    bankName: "bankName",
    accountNumber: "accountNumber",
    ifsc: "ifsc",
    upiId: "upiId",
    tds: "tds",
    rbiCharge: "rbiCharge"
  };

  Object.entries(fieldMap).forEach(([key, id]) => {
    const field = document.getElementById(id);
    if (field) field.value = customer[key] ?? "";
  });

  let idField = document.getElementById("editingId");

  if (!idField) {
    idField = document.createElement("input");
    idField.type = "hidden";
    idField.id = "editingId";
    idField.name = "editingId";
    getForm().appendChild(idField);
  }

  idField.value = customer.applicationId;

  const button = document.getElementById("saveButton") ||
    getForm().querySelector('button[type="submit"]');

  if (button) button.textContent = "Update Customer";

  const cancelButton = document.getElementById("cancelEditButton");
  if (cancelButton) cancelButton.style.display = "inline-block";

  setMessage("अब जानकारी बदलकर Update Customer दबाएँ।");

  getForm().scrollIntoView({
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
    loadCustomers();
    setMessage("रिकॉर्ड हटा दिया गया।");
  } catch (error) {
    console.error(error);
    setMessage("रिकॉर्ड हटाया नहीं जा सका।", "error");
  }
}

function checkStatus() {
  const mobileInput = document.getElementById("mobileNumber");
  const result = document.getElementById("statusResult");

  if (!mobileInput || !result) {
    console.error("Status page fields are missing.");
    return;
  }

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
    result.textContent = "इस मोबाइल नंबर से कोई आवेदन नहीं मिला।";
    return;
  }

  const card = document.createElement("div");
  card.className = "status-card";

  addRow(card, "आवेदक का नाम", customer.name);
  addRow(card, "Application ID", customer.applicationId);
  addRow(card, "आवेदन का स्टेटस", customer.status);
  addRow(card, "Application Progress", ${customer.percentage || 0}%);
  addRow(card, "लोन राशि", formatMoney(customer.loanAmount));

  result.appendChild(card);
}

window.checkStatus = checkStatus;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;

function initializeScript() {
  const form = getForm();

  if (form) {
    form.addEventListener("submit", handleCustomerSubmit);
  }

  const cancelButton = document.getElementById("cancelEditButton");

  if (cancelButton) {
    cancelButton.addEventListener("click", resetForm);
    cancelButton.style.display = "none";
  }

  loadCustomers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeScript);
} else {
  initializeScript();
}
