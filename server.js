"use strict";

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = url && key ? createClient(url, key) : null;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Demo API is running."
  });
});

app.get("/health", (req, res) => {
  res.json({ success: true, server: "running" });
});

app.post("/submit-application", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: "Supabase is not configured."
      });
    }

    const { name, mobile, loanType, loanAmount, returnYear, percentage } =
      req.body || {};

    if (
      !String(name || "").trim() ||
      !/^\d{10}$/.test(String(mobile || "")) ||
      !String(loanType || "").trim() ||
      loanAmount === "" ||
      loanAmount == null ||
      !Number.isFinite(Number(loanAmount)) ||
      Number(loanAmount) < 0 ||
      !Number.isFinite(Number(percentage ?? 0)) ||
      Number(percentage ?? 0) < 0 ||
      Number(percentage ?? 0) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid demo application details."
      });
    }

    const { data, error } = await supabase
      .from("applications")
      .insert([{
        name: String(name).trim(),
        mobile: String(mobile),
        loan_type: String(loanType).trim(),
        loan_amount: Number(loanAmount),
        return_year: String(returnYear || ""),
        percentage: Number(percentage ?? 0),
        status: "Pending"
      }])
      .select()
      .single();

    if (error) {
      console.error(error.message);
      return res.status(500).json({
        success: false,
        message: "Could not save application."
      });
    }

    res.status(201).json({ success: true, application: data });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

app.get("/check-application", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: "Supabase is not configured."
      });
    }

    const mobile = String(req.query.mobile || "");

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid demo mobile number."
      });
    }

    const { data, error } = await supabase
      .from("applications")
      .select("id,name,mobile,loan_type,loan_amount,return_year,percentage,status,created_at")
      .eq("mobile", mobile)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error.message);
      return res.status(500).json({
        success: false,
        message: "Could not check application."
      });
    }

    res.json({ success: true, application: data || null });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

app.get("/account-details", (req, res) => {
  res.json({ success: true, accountDetails: {} });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found."
  });
});

app.listen(PORT, () => {
  console.log("Demo API listening on port " + PORT);
});