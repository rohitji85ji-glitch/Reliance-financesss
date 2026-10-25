"use strict";

/*
  FINANCE DEMO APPLICATION
  Admin + Status
  Storage: localStorage
*/

const STORAGE_KEY = "finance_demo_customers";
let editingCustomerId = null;

/* ---------- HELPERS ---------- */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getField(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function getCustomers() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Load error:", error);
        return [];
    }
}

function saveCustomers(customers) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
        return true;
    } catch (error) {
        console.error("Save error:", error);
        return false;
    }
}

function showAdminMessage(message, color = "#0757a8") {
    const box = document.getElementById("adminMessage");
    if (!box) return;

    box.textContent = message;
    box.style.color = color;
    box.style.marginTop = "15px";
    box.style.fontWeight = "bold";
}

function formatAmount(value) {
    const amount = Number(value || 0);
    return Number.isFinite(amount)
        ? "₹" + amount.toLocaleString("en-IN")
        : "₹0";
}

function addStatusRow(container, label, value) {
    const row = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = label + ": ";

    const span = document.createElement("span");
    span.textContent = String(value ?? "-");

    row.append(strong, span);
    container.appendChild(row);
}

/* ---------- ADMIN: SAVE CUSTOMER ---------- */

const customerForm = document.getElementById("customerForm");

if (customerForm) {
    customerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const customer = {
            customer_name: getField("customerName"),
            mobile_number: getField("mobileNumber"),
            loan_type: getField("loanType"),
            loan_amount: getField("loanAmount"),
            aadhaar_last4: getField("aadhaarLast4"),
            pan_last4: getField("panLast4"),
            return_year: getField("returnYear"),
            charge: getField("charge"),
            charge_amount: getField("chargeAmount"),
            percentage: getField("percentage") || "0",

            // Demo-only bank fields; never shown on public status
            bank_name: getField("bankName"),
            account_holder_name: getField("accountHolderName"),
            account_number: getField("accountNumber"),
            ifsc_code: getField("ifscCode"),
            upi_number: getField("upiNumber")
        };

        if (!customer.customer_name) {
            showAdminMessage("Customer name is required.", "red");
            return;
        }

        if (!/^[0-9]{10}$/.test(customer.mobile_number)) {
            showAdminMessage(
                "Please enter a valid 10 digit mobile number.",
                "red"
            );
            return;
        }

        const amount = Number(customer.loan_amount);
        const progress = Number(customer.percentage);

        if (!Number.isFinite(amount) || amount < 0) {
            showAdminMessage("Enter a valid loan amount.", "red");
            return;
        }

        if (
            !Number.isFinite(progress) ||
            progress < 0 ||
            progress > 100
        ) {
            showAdminMessage(
                "Progress must be between 0 and 100.",
                "red"
            );
            return;
        }

        if (
            customer.charge_amount !== "" &&
            (!Number.isFinite(Number(customer.charge_amount)) ||
                Number(customer.charge_amount) < 0)
        ) {
            showAdminMessage("Enter a valid charge amount.", "red");
            return;
        }

        const customers = getCustomers();

        if (editingCustomerId !== null) {
            const index = customers.findIndex(
                item => String(item.id) === String(editingCustomerId)
            );

            if (index === -1) {
                showAdminMessage("Customer record not found.", "red");
                return;
            }

            customers[index] = {
                ...customers[index],
                ...customer
            };
        } else {
            customer.id =
                Date.now().toString() +
                Math.random().toString(36).slice(2, 7);

            customer.submitted_at = new Date().toISOString();
            customers.unshift(customer);
        }

        if (!saveCustomers(customers)) {
            showAdminMessage(
                "Could not save data in this browser.",
                "red"
            );
            return;
        }

        editingCustomerId = null;
        customerForm.reset();

        const submitButton = customerForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.textContent = "Submit Customer";
        }

        showAdminMessage(
            "Demo customer saved successfully.",
            "green"
        );

        loadCustomers();
    });
}

/* ---------- ADMIN: SHOW CUSTOMERS ---------- */

function loadCustomers() {
    const list = document.getElementById("customerList");
    if (!list) return;

    const customers = getCustomers();
    list.replaceChildren();

    if (customers.length === 0) {
        list.textContent = "No customer data available.";
        return;
    }

    customers.forEach(customer => {
        const box = document.createElement("div");
        box.className = "customer-record";

        const title = document.createElement("h3");
        title.textContent = customer.customer_name || "Customer";
        box.appendChild(title);

        addStatusRow(box, "Mobile", customer.mobile_number || "-");
        addStatusRow(box, "Loan Type", customer.loan_type || "-");
        addStatusRow(box, "Loan Amount", formatAmount(customer.loan_amount));
        addStatusRow(box, "Return Period", customer.return_year || "-");
        addStatusRow(box, "Charge", customer.charge || "-");
        addStatusRow(
            box,
            "Charge Amount",
            customer.charge_amount
                ? formatAmount(customer.charge_amount)
                : "-"
        );
        addStatusRow(box, "Progress", ${customer.percentage || 0}%);
        addStatusRow(box, "Bank Name (demo)", customer.bank_name || "-");
        addStatusRow(
            box,
            "Account Holder (demo)",
            customer.account_holder_name || "-"
        );

        // Mask sensitive demo values in the admin list
        addStatusRow(
            box,
            "Account Number (masked)",
            customer.account_number
                ? "••••" + customer.account_number.slice(-4)
                : "-"
        );

        addStatusRow(
            box,
            "IFSC (masked)",
            customer.ifsc_code
                ? "••••••" + customer.ifsc_code.slice(-2)
                : "-"
        );

        addStatusRow(
            box,
            "UPI ID (masked)",
            customer.upi_number ? "Hidden for privacy" : "-"
        );

        addStatusRow(
            box,
            "Submitted",
            customer.submitted_at
                ? new Date(customer.submitted_at).toLocaleString("en-IN")
                : "-"
        );

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit Demo Record";
        editButton.addEventListener("click", () => {
            editCustomer(customer.id);
        });

        box.appendChild(editButton);
        list.appendChild(box);
    });
}

/* ---------- ADMIN: EDIT CUSTOMER ---------- */

function editCustomer(id) {
    const customer = getCustomers().find(
        item => String(item.id) === String(id)
    );

    if (!customer) {
        showAdminMessage("Customer record not found.", "red");
        return;
    }

    const fields = {
        customerName: customer.customer_name,
        mobileNumber: customer.mobile_number,
        loanType: customer.loan_type,
        loanAmount: customer.loan_amount,
        aadhaarLast4: customer.aadhaar_last4,
        panLast4: customer.pan_last4,
        returnYear: customer.return_year,
        charge: customer.charge,
        chargeAmount: customer.charge_amount,
        percentage: customer.percentage,
        bankName: customer.bank_name,
        accountHolderName: customer.account_holder_name,
        accountNumber: customer.account_number,
        ifscCode: customer.ifsc_code,
        upiNumber: customer.upi_number
    };

    Object.entries(fields).forEach(([fieldId, value]) => {
        const element = document.getElementById(fieldId);
        if (element) element.value = value ?? "";
    });

    editingCustomerId = customer.id;

    const submitButton = customerForm?.querySelector(
        'button[type="submit"]'
    );

    if (submitButton) {
        submitButton.textContent = "Update Demo Record";
    }

    showAdminMessage("Demo record loaded for editing.");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- STATUS: CHECK CUSTOMER ---------- */

function checkStatus() {
    const mobileInput = document.getElementById("mobileNumber");
    const result = document.getElementById("statusResult");

    if (!mobileInput || !result) return;

    const mobile = mobileInput.value.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {
        result.textContent =
            "Please enter a valid 10 digit mobile number.";
        return;
    }

    // Read the matching demo application from localStorage
    const customers = getCustomers();

    const customer = customers.find(
        item => String(item.mobile_number) === mobile
    );

    if (!customer) {
        result.textContent = "No demo application found.";
        return;
    }

    const card = document.createElement("div");
    card.className = "status-card";

    const heading = document.createElement("h3");
    heading.textContent = "Demo Application Status";
    card.appendChild(heading);

    addStatusRow(card, "Customer", customer.customer_name || "-");
    addStatusRow(card, "Mobile", customer.mobile_number || "-");
    addStatusRow(card, "Loan Type", customer.loan_type || "-");
    addStatusRow(card, "Loan Amount", formatAmount(customer.loan_amount));
    addStatusRow(card, "Return Period", customer.return_year || "-");
    addStatusRow(card, "Charge", customer.charge || "-");
    addStatusRow(
        card,
        "Charge Amount",
        customer.charge_amount
            ? formatAmount(customer.charge_amount)
            : "-"
    );
    addStatusRow(card, "Application Progress", ${customer.percentage || 0}%);

    const progress = document.createElement("progress");
    progress.max = 100;
    progress.value = Math.min(
        100,
        Math.max(0, Number(customer.percentage) || 0)
    );
    progress.style.width = "100%";
    card.appendChild(progress);

    const notice = document.createElement("p");
    notice.textContent =
        "Demonstration only. This is not a loan approval or a request for payment.";
    card.appendChild(notice);

    // Bank account, IFSC, UPI, Aadhaar and PAN details are not
    // displayed on a public status page.
    result.replaceChildren(card);
}

window.checkStatus = checkStatus;

/* ---------- MOBILE NAVIGATION ---------- */

const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");

if (menuBtn && mainNav) {
    menuBtn.addEventListener("click", () => {
        mainNav.classList.toggle("menu-open");
    });

    mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("menu-open");
        });
    });
}

/* ---------- INITIAL LOAD ---------- */

document.addEventListener("DOMContentLoaded", () => {
    loadCustomers();
});
