"use strict";

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  url && key ? createClient(url, key) : null;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    supabaseConfigured: Boolean(supabase)
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    server: "running",
    supabaseConfigured: Boolean(supabase)
  });
});

app.post("/submit-application", async (req, res) => {
  console.log("POST /submit-application received");

  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: "Supabase configuration missing."
      });
    }

    const {
      name,
      mobile,
      loanType,
      loanAmount,
      returnYear,
      percentage
    } = req.body || {};

    const cleanName = String(name || "").trim();
    const cleanMobile = String(mobile || "").trim();
    const cleanLoanType = String(loanType || "").trim();

    const amount = Number(loanAmount);
    const rate = percentage === "" || percentage == null
      ? 0
      : Number(percentage);

    // Accept both "2" and "2 Years"
    const yearMatch = String(returnYear ?? "").match(
      /^\s*(\d+(?:\.\d+)?)/
    );
    const year = yearMatch ? Number(yearMatch[1]) : NaN;

    if (
      !cleanName ||
      !/^\d{10}$/.test(cleanMobile) ||
      !cleanLoanType ||
      loanAmount == null ||
      loanAmount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isFinite(year) ||
      year <= 0 ||
      !Number.isFinite(rate) ||
      rate < 0 ||
      rate > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid form details. Check all fields."
      });
    }

    const row = {
      name: cleanName,
      mobile: cleanMobile,
      loan_type: cleanLoanType,
      loan_amount: amount,
      return_year: String(year),
      percentage: rate,
      status: "Pending"
    };

    const { data, error } = await supabase
      .from("applications")
      .insert([row])
      .select("*")
      .single();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Database save failed. Check Render Logs.",
        code: error.code || null
      });
    }

    console.log("APPLICATION SAVED:", data.id);

    return res.status(201).json({
      success: true,
      message: "Application saved successfully.",
      application: data
    });

  } catch (error) {
    console.error("SUBMIT ROUTE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while saving application."
    });
  }
});

app.get("/check-application", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: "Supabase configuration missing."
      });
    }

    const mobile = String(req.query.mobile || "").trim();

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number."
      });
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("mobile", mobile)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("CHECK APPLICATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Could not check application."
      });
    }

    return res.json({
      success: true,
      application: data || null
    });

  } catch (error) {
    console.error("CHECK ROUTE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

app.get("/account-details", (req, res) => {
  res.json({
    success: true,
    accountDetails: {}
  });
});

app.use((req, res) => {
  console.warn("API ROUTE NOT FOUND:", req.method, req.path);

  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request."
    });
  }

  console.error("UNEXPECTED SERVER ERROR:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

app.listen(PORT, () => {
  console.log("API listening on port", PORT);
  console.log("Supabase configured:", Boolean(supabase));
});
