
const API_BASE =
  "https://reliance-financesss-service12.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("customerForm");
  const message = document.getElementById("adminMessage");
  const customerList = document.getElementById("customerList");

  function showMessage(text, success = false) {
    if (!message) return;

    message.textContent = text;
    message.style.color = success ? "green" : "red";
    message.style.display = "block";
  }

  async function readApiResponse(response) {
    const text = await response.text();

    if (!text.trim()) {
      throw new Error(
        API से खाली response मिला (HTTP ${response.status})
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        API ने JSON response नहीं दिया (HTTP ${response.status})
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        Server error: ${response.status}
      );
    }

    if (data.success === false || data.error) {
      throw new Error(
        data.message || data.error || "डेटा सेव नहीं हुआ।"
      );
    }

    return data;
  }

  if (!form) {
    console.error("customerForm नहीं मिला।");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector(
      'button[type="submit"]'
    );

    const originalButtonText =
      button?.textContent || "Submit Customer";

    const getValue = (id) =>
      document.getElementById(id)?.value?.trim() || "";

    const name = getValue("customerName");
    const mobile = getValue("mobileNumber");
    const loanType = getValue("loanType");
    const loanAmount = Number(getValue("loanAmount"));
    const returnYear = Number(getValue("returnYear"));
    const percentage = Number(getValue("percentage"));

    if (!name || !mobile || !loanType) {
      showMessage("कृपया नाम, मोबाइल और Loan Type भरें।");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      showMessage("मोबाइल नंबर 10 अंकों का होना चाहिए।");
      return;
    }

    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      showMessage("Loan Amount सही भरें।");
      return;
    }

    if (!Number.isFinite(returnYear) || returnYear <= 0) {
      showMessage("Return Year सही भरें।");
      return;
    }

    if (!Number.isFinite(percentage) || percentage < 0) {
      showMessage("Percentage सही भरें।");
      return;
    }

    const payload = {
      name,
      mobile,
      loan_type: loanType,
      loan_amount: loanAmount,
      return_year: returnYear,
      percentage
    };

    try {
      if (button) {
        button.disabled = true;
        button.textContent = "Saving...";
      }

      showMessage("डेटा सेव किया जा रहा है...", true);

      const response = await fetch(
        ${API_BASE}/submit-application,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await readApiResponse(response);

      // Backend से रिकॉर्ड की पुष्टि आवश्यक है।
      const application = result.application;

      if (
        !application ||
        application.id === undefined ||
        application.id === null
      ) {
        throw new Error(
          "API ने सेव किए गए रिकॉर्ड की ID नहीं भेजी। " +
          "फॉर्म सुरक्षित रखा गया है। Backend response जाँचें।"
        );
      }

      showMessage(
        डेटा सेव हो गया। Application ID: ${application.id},
        true
      );

      form.reset();

      if (customerList) {
        const item = document.createElement("div");
        item.textContent =
          ${name} — ${mobile} — ID: ${application.id};
        customerList.prepend(item);
      }
    } catch (error) {
      console.error("Application submit error:", error);

      showMessage(
        डेटा सेव नहीं हुआ: ${error.message}
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalButtonText;
      }
    }
  });

  console.log("Admin script loaded successfully.");
});
