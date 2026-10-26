const API_BASE =
  "https://reliance-financesss-service12.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("customerForm");
  const message = document.getElementById("adminMessage");

  if (!form || !message) {
    console.error("Form or message element not found.");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector(
      'button[type="submit"]'
    );

    const originalText = button?.textContent;

    const showMessage = (text, success = false) => {
      message.textContent = text;
      message.style.color = success ? "green" : "red";
    };

    const data = {
      name: document.getElementById("customerName").value.trim(),
      mobile: document.getElementById("mobileNumber").value.trim(),
      loan_type: document.getElementById("loanType").value,
      loan_amount: Number(
        document.getElementById("loanAmount").value
      ),
      return_year: Number(
        document.getElementById("returnYear").value
      ),
      percentage: Number(
        document.getElementById("percentage").value
      )
    };

    if (
      !data.name ||
      !data.mobile ||
      !data.loan_type ||
      !Number.isFinite(data.loan_amount) ||
      data.loan_amount <= 0
    ) {
      showMessage("कृपया सभी जरूरी जानकारी सही भरें।");
      return;
    }

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
          body: JSON.stringify(data)
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
          result?.message ||
          Server error: ${response.status}
        );
      }

      if (!result || result.error || !result.application?.id) {
        throw new Error(
          result?.error ||
          "सेव होने की पुष्टि नहीं मिली। फॉर्म खाली नहीं किया गया।"
        );
      }

      form.reset();
      showMessage("डेटा सफलतापूर्वक सेव हो गया।", true);
    } catch (error) {
      console.error("Submit error:", error);
      showMessage(
        डेटा सेव नहीं हुआ: ${error.message}
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalText || "Submit Customer";
      }
    }
  });
});
