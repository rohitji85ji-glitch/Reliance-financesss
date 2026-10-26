"use strict";

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// हर आने वाली request को Render Logs में दिखाएँ
app.use((req, res, next) => {
  console.log(
    new Date().toISOString(),
    req.method,
    req.path
  );
  next();
});

// Supabase configuration
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  url && key ? createClient(url, key) : null;

// API home
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Demo API is running.",
    supabaseConfigured: Boolean(supabase)
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    server: "running",
    supabaseConfigured: Boolean(supabase)
  });
});

// Submit application using dummy/demo information
app.post("/submit-application", async (req, res) => {
  console.log("Submit application request received");

  try {
    if (!supabase) {
      console.error("Supabase environment variables are missing");

      return res.status(503).json({
        success: false,
        message: "Supabase is not configured."
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
    const year = Number(returnYear);
    const rate = Number(percentage ?? 0);

    if (
      !cleanName ||
      !/^\d{10}$/.test(cleanMobile) ||
      !cleanLoanType ||
      loanAmount === "" ||
      loanAmount == null ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      returnYear === "" ||
      returnYear == null ||
      !Number.isFinite(year) ||
      year <= 0 ||
      !Number.isFinite(rate) ||
      rate < 0 ||
      rate > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid demo application details."
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
      .select("id,name,mobile,loan_type,loan_amount,return_year,percentage,status,created_at")
      .single();

    if (error) {
      // वास्तविक database error केवल server logs में
      console.error("Supabase insert failed:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      return res.status(500).json({
        success: false,
        message: "Could not save application. Check backend logs."
      });
    }

    console.log("Application saved successfully. ID:", data.id);

    return res.status(201).json({
      success: true,
      message: "Application saved successfully.",
      application: data
    });
  } catch (error) {
    console.error("Submit route error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

// Check application using demo mobile number
app.get("/check-application", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: "Supabase is not configured."
      });
    }

    const mobile = String(req.query.mobile || "").trim();

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid demo mobile number."
      });
    }

    const { data, error } = await supabase
      .from("applications")
      .select(
        "id,name,mobile,loan_type,loan_amount,return_year,percentage,status,created_at"
      )
      .eq("mobile", mobile)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase check failed:", error.message);

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
    console.error("Check route error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

// Demo account details
app.get("/account-details", (req, res) => {
  res.json({
    success: true,
    accountDetails: {}
  });
});

// Unknown route
app.use((req, res) => {
  console.warn("API route not found:", req.method, req.path);

  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

// Invalid JSON handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    console.error("Invalid JSON request body");

    return res.status(400).json({
      success: false,
      message: "Invalid JSON request."
    });
  }

  console.error("Unexpected server error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

app.listen(PORT, () => {
  console.log("Demo API listening on port " + PORT);
  console.log("Supabase configured:", Boolean(supabase));
});
