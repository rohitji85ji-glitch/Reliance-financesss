"use strict";

const STORAGE_KEY = "finance_demo_customers";
let editingCustomerId = null;

function byId(id) {
    return document.getElementById(id);
}

function field(id) {
    const element = byId(id);
    return element ? element.value.trim() : "";
}

function message(text, color = "#0757a8") {
    const box = byId("adminMessage");
    if (!box) {
        alert(text);
        return;
    }

    box.textContent = text;
    box.style.color = color;
    box.style.fontWeight = "bold";
    box.style.marginTop = "12px";
}

function getCustomers() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Reading records failed:", error);
        message("डेटा पढ़ने में समस्या हुई।", "red");
        return [];
    }
}

function saveCustomers(customers) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));

        const check = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        return Array.isArray(check) &&
            check.length === customers.length;
    } catch (error) {
        console.error("Saving records failed:", error);
        return false;
    }
}

function amount(value) {
    const number = Number(value || 0);
    return Number.isFinite(number)
        ? "₹" + number.toLocaleString("en-IN")
        : "₹0";
}

function addRow(parent, label, value) {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = label + ": ";
    const span = document.createElement("span");
    span.textContent = String(value ?? "-");
    p.append(strong, span);
    parent.appendChild(p);
}

function newId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 9);
}

function loadCustomers() {
    const list = byId("customerList");
    if (!list) return;

    const customers = getCustomers();
    list.replaceChildren();

    if (customers.length === 0) {
        list.textContent = "अभी कोई डेमो रिकॉर्ड सेव नहीं है।";
        return;
    }

    customers.forEach(customer => {
        const card = document.createElement("article");
        card.className = "customer-record";

        const heading = document.createElement("h3");
        heading.textContent = customer.customer_name || "Customer";
        card.appendChild(heading);

        addRow(card, "Mobile", customer.mobile_number);
        addRow(card, "Loan Type", customer.loan_type);
        addRow(card, "Loan Amount", amount(customer.loan_amount));
        addRow(card, "Return Period", customer.return_year || "-");
        addRow(card, "Charge Type", customer.charge || "-");
        addRow(
            card,
            "Charge Amount",
            customer.charge_amount === ""
                ? "-"
                : amount(customer.charge_amount)
        );
        addRow(card, "Progress", ${customer.percentage || 0}%);
        addRow(card, "Bank Name (Demo)", customer.bank_name || "-");
        addRow(
            card,
            "Account Holder (Demo)",
            customer.account_holder_name || "-"
        );
        addRow(
            card,
            "Account Number",
            customer.account_number
                ? "••••" + String(customer.account_number).slice(-4)
                : "-"
        );
        addRow(
            card,
            "IFSC",
            customer.ifsc_code
                ? "••••••" + String(customer.ifsc_code).slice(-2)
                : "-"
        );
        addRow(
            card,
            "UPI",
            customer.upi_number ? "Hidden for privacy" : "-"
        );

        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "Edit Demo Record";
        edit.addEventListener("click", () => editCustomer(customer.id));
        card.appendChild(edit);

        list.appendChild(card);
    });
}

function resetEditState() {
    editingCustomerId = null;

    const form = byId("customerForm");
    const saveButton = byId("saveButton");
    const cancelButton = byId("cancelEditButton");

    if (form) form.reset();
    if (saveButton) saveButton.textContent = "Save Demo Record";
    if (cancelButton) cancelButton.hidden = true;
}

function editCustomer(id) {
    const customer = getCustomers().find(
        item => String(item.id) === String(id)
    );

    if (!customer) {
        message("रिकॉर्ड नहीं मिला।", "red");
        return;
    }

    const mapping = {
        customerName: "customer_name",
        mobileNumber: "mobile_number",
        loanType: "loan_type",
        loanAmount: "loan_amount",
        aadhaarLast4: "aadhaar_last4",
        panLast4: "pan_last4",
        returnYear: "return_year",
        charge: "charge",
        chargeAmount: "charge_amount",
        percentage: "percentage",
        bankName: "bank_name",
        accountHolderName: "account_holder_name",
        accountNumber: "account_number",
        ifscCode: "ifsc_code",
        upiNumber: "upi_number"
    };

    Object.entries(mapping).forEach(([elementId, property]) => {
        const element = byId(elementId);
        if (element) element.value = customer[property] ?? "";
    });

    editingCustomerId = customer.id;

    const saveButton = byId("saveButton");
    const cancelButton = byId("cancelEditButton");

    if (saveButton) saveButton.textContent = "Update Demo Record";
    if (cancelButton) cancelButton.hidden = false;

    message("रिकॉर्ड एडिट करने के लिए लोड हो गया।");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function initAdmin() {
    const form = byId("customerForm");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const customer = {
            customer_name: field("customerName"),
            mobile_number: field("mobileNumber"),
            loan_type: field("loanType"),
            loan_amount: field("loanAmount"),
            aadhaar_last4: field("aadhaarLast4"),
            pan_last4: field("panLast4"),
            return_year: field("returnYear"),
            charge: field("charge"),
            charge_amount: field("chargeAmount"),
            percentage: field("percentage") || "0",
            bank_name: field("bankName"),
            account_holder_name: field("accountHolderName"),
            account_number: field("accountNumber"),
            ifsc_code: field("ifscCode"),
            upi_number: field("upiNumber")
        };

        if (!customer.customer_name) {
            message("Customer Name भरें।", "red");
            return;
        }

        if (!/^[0-9]{10}$/.test(customer.mobile_number)) {
            message("10 अंकों का मोबाइल नंबर भरें।", "red");
            return;
        }

        if (
            customer.loan_amount === "" ||
            !Number.isFinite(Number(customer.loan_amount)) ||
            Number(customer.loan_amount) < 0
        ) {
            message("सही Loan Amount भरें।", "red");
            return;
        }

        const progress = Number(customer.percentage);
        if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
            message("Progress 0 से 100 के बीच रखें।", "red");
            return;
        }

        if (
            customer.charge_amount !== "" &&
            (
                !Number.isFinite(Number(customer.charge_amount)) ||
                Number(customer.charge_amount) < 0
            )
        ) {
            message("सही Charge Amount भरें।", "red");
            return;
        }

        const customers = getCustomers();

        if (editingCustomerId !== null) {
            const index = customers.findIndex(
                item => String(item.id) === String(editingCustomerId)
            );

            if (index === -1) {
                message("एडिट रिकॉर्ड नहीं मिला।", "red");
                return;
            }

            customer.id = customers[index].id;
            customer.submitted_at = customers[index].submitted_at;
            customers[index] = { ...customers[index], ...customer };
        } else {
            customer.id = newId();
            customer.submitted_at = new Date().toISOString();
            customers.unshift(customer);
        }

        if (!saveCustomers(customers)) {
            message(
                "डेटा सेव नहीं हुआ। ब्राउज़र की Storage या Private mode चेक करें।",
                "red"
            );
            return;
        }

        resetEditState();
        loadCustomers();
        message("डेमो रिकॉर्ड सफलतापूर्वक सेव हो गया।", "green");
    });

    const cancelButton = byId("cancelEditButton");
    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            resetEditState();
            message("एडिट रद्द किया गया।");
        });
    }
}

function checkStatus() {
    const mobileInput = byId("mobileNumber");
    const result = byId("statusResult");

    if (!mobileInput || !result) return;

    const mobile = mobileInput.value.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {
        result.textContent = "10 अंकों का सही मोबाइल नंबर भरें।";
        return;
    }

    const customer = getCustomers().find(
        item => String(item.mobile_number) === mobile
    );

    if (!customer) {
        result.textContent = "कोई डेमो आवेदन नहीं मिला।";
        return;
    }

    const card = document.createElement("div");
    card.className = "status-card";

    const heading = document.createElement("h3");
    heading.textContent = "Demo Application Status";
    card.appendChild(heading);

    addRow(card, "Customer", customer.customer_name);
    addRow(card, "Mobile", customer.mobile_number);
    addRow(card, "Loan Type", customer.loan_type);
    addRow(card, "Loan Amount", amount(customer.loan_amount));
    addRow(card, "Return Period", customer.return_year || "-");
    addRow(card, "Charge Type", customer.charge || "-");
    addRow(
        card,
        "Charge Amount",
        customer.charge_amount === ""
            ? "-"
            : amount(customer.charge_amount)
    );
    addRow(card, "Application Progress", ${customer.percentage || 0}%);

    const progress = document.createElement("progress");
    progress.max = 100;
    progress.value = Math.max(
        0,
        Math.min(100, Number(customer.percentage) || 0)
    );
    progress.style.width = "100%";
    card.appendChild(progress);

    const notice = document.createElement("p");
    notice.textContent =
        "Demo only. This is not a real loan approval or payment request.";
    card.appendChild(notice);

    result.replaceChildren(card);
}

function initApp() {
    initAdmin();
    loadCustomers();

    // Status page button can use onclick="checkStatus()".
    window.checkStatus = checkStatus;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
