/* =========================================
   FINANCE APPLICATION - DEMO ONLY
   Local browser storage
========================================= */

let editingCustomerId = null;

const STORAGE_KEY = "finance_demo_customers";

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getCustomers() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Load error:", error);
        return [];
    }
}

function saveCustomers(customers) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(customers)
        );
        return true;
    } catch (error) {
        console.error("Storage error:", error);
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

function getField(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

/* =========================================
   SAVE / UPDATE DEMO APPLICATION
========================================= */

const customerForm = document.getElementById("customerForm");

if (customerForm) {
    customerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const customer = {
            customer_name: getField("customerName"),
            mobile_number: getField("mobileNumber"),
            loan_type: getField("loanType"),
            loan_amount: getField("loanAmount"),
            return_year: getField("returnYear"),
            percentage: getField("percentage") || "0"
        };

        if (!/^[0-9]{10}$/.test(customer.mobile_number)) {
            showAdminMessage(
                "Please enter a valid 10 digit demo mobile number.",
                "red"
            );
            return;
        }

        const percentage = Number(customer.percentage);
        const amount = Number(customer.loan_amount || 0);

        if (
            !Number.isFinite(percentage) ||
            percentage < 0 ||
            percentage > 100
        ) {
            showAdminMessage(
                "Progress must be between 0 and 100.",
                "red"
            );
            return;
        }

        if (!Number.isFinite(amount) || amount < 0) {
            showAdminMessage(
                "Please enter a valid demo amount.",
                "red"
            );
            return;
        }

        const customers = getCustomers();

        if (editingCustomerId !== null) {
            const index = customers.findIndex(
                item => item.id === editingCustomerId
            );

            if (index === -1) {
                showAdminMessage("Demo record not found.", "red");
                return;
            }

            customers[index] = {
                ...customers[index],
                ...customer
            };

            editingCustomerId = null;
        } else {
            customer.id = Date.now();
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

        showAdminMessage(
            "Demo application saved successfully.",
            "green"
        );

        customerForm.reset();

        const button = customerForm.querySelector(
            'button[type="submit"]'
        );

        if (button) button.textContent = "Submit Customer";

        loadCustomers();
    });
}

/* =========================================
   DISPLAY DEMO RECORDS
========================================= */

function loadCustomers() {
    const list = document.getElementById("customerList");
    if (!list) return;

    const customers = getCustomers();

    if (customers.length === 0) {
        list.textContent = "No demo records available.";
        return;
    }

    list.innerHTML = "";

    customers.forEach(customer => {
        const box = document.createElement("div");
        box.className = "customer-record";

        box.innerHTML = `
            <p><b>Customer:</b>
                ${escapeHtml(customer.customer_name || "-")}
            </p>
            <p><b>Mobile:</b>
                ${escapeHtml(customer.mobile_number || "-")}
            </p>
            <p><b>Loan Type:</b>
                ${escapeHtml(customer.loan_type || "-")}
            </p>
            <p><b>Loan Amount:</b>
                ₹${Number(customer.loan_amount || 0).toLocaleString("en-IN")}
            </p>
            <p><b>Return Period:</b>
                ${escapeHtml(customer.return_year || "-")}
            </p>
            <p><b>Demo Progress:</b>
                ${Number(customer.percentage || 0)}%
            </p>
            <p><b>Submitted:</b>
                ${escapeHtml(customer.submitted_at || "-")}
            </p>
            <button type="button" class="edit-customer-btn">
                Edit Demo Record
            </button>
        `;

        const editButton = box.querySelector("button");

        editButton.addEventListener("click", () => {
            editCustomer(customer.id);
        });

        list.appendChild(box);
    });
}

/* =========================================
   EDIT DEMO RECORD
========================================= */

function editCustomer(id) {
    const customer = getCustomers().find(
        item => item.id === id
    );

    if (!customer) {
        showAdminMessage("Demo record not found.", "red");
        return;
    }

    const fields = {
        customerName: customer.customer_name,
        mobileNumber: customer.mobile_number,
        loanType: customer.loan_type,
        loanAmount: customer.loan_amount,
        returnYear: customer.return_year,
        percentage: customer.percentage
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value ?? "";
    });

    editingCustomerId = id;

    const button = customerForm?.querySelector(
        'button[type="submit"]'
    );

    if (button) button.textContent = "Update Demo Record";

    showAdminMessage(
        "Demo record loaded for editing.",
        "#0757a8"
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================
   CHECK DEMO APPLICATION STATUS
========================================= */

async function checkStatus() {
    const mobileInput = document.getElementById("mobileNumber");
    const result = document.getElementById("statusResult");

    if (!mobileInput || !result) return;

    const mobile = mobileInput.value.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {
        result.textContent =
            "Please enter a valid 10 digit demo mobile number.";
        return;
    }

    const customer = getCustomers().find(
        item => item.mobile_number === mobile
    );

    if (!customer) {
        result.textContent = "No demo application found.";
        return;
    }

    result.innerHTML = `
        <div class="status-card">
            <h3>Demo Application Status</h3>
            <p><b>Customer:</b>
                ${escapeHtml(customer.customer_name || "-")}
            </p>
            <p><b>Loan Type:</b>
                ${escapeHtml(customer.loan_type || "-")}
            </p>
            <p><b>Demo Amount:</b>
                ₹${Number(customer.loan_amount || 0).toLocaleString("en-IN")}
            </p>
            <p><b>Return Period:</b>
                ${escapeHtml(customer.return_year || "-")}
            </p>
            <p><b>Demo Progress:</b>
                ${Number(customer.percentage || 0)}%
            </p>
            <p>This page displays demonstration data only.
            It is not a loan approval or payment request.</p>
        </div>
    `;
}

/* =========================================
   MOBILE NAVIGATION
========================================= */

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

/* =========================================
   INITIAL LOAD
========================================= */

loadCustomers();
