const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "internships.json");
const APPLICATIONS_FILE = path.join(__dirname, "data", "applications.json");

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}
function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}
function response(res, status, data, pagination = null, message = null) {
  return res.status(status).json({ status: status < 400 ? "success" : "error", data, pagination, message });
}
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function safePortfolioUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}

// List internships: supports search, domain, mode, page and limit.
app.get("/api/internships", (req, res) => {
  const seed = readJson(DATA_FILE, { internships: [] });
  const search = String(req.query.search || "").trim().toLowerCase();
  const domain = String(req.query.domain || "");
  const mode = String(req.query.mode || "");
  const page = Math.max(1, parseInt(req.query.page || "1", 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "10", 10) || 10));

  let records = seed.internships.filter(item => {
    const haystack = [item.title, item.domain, item.location, ...item.skills].join(" ").toLowerCase();
    return (!search || haystack.includes(search)) &&
      (!domain || item.domain === domain) &&
      (!mode || item.mode === mode);
  });
  const total = records.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  records = records.slice((page - 1) * limit, page * limit);
  return response(res, 200, records, { page, limit, total, pages });
});

app.get("/api/internships/:id", (req, res) => {
  const seed = readJson(DATA_FILE, { internships: [] });
  const item = seed.internships.find(x => x.id === req.params.id);
  if (!item) return response(res, 404, null, null, "Internship not found.");
  return response(res, 200, item);
});

app.post("/api/applications", (req, res) => {
  const { internshipId, name, email, portfolioUrl = "" } = req.body || {};
  if (typeof name !== "string" || !name.trim()) {
    return response(res, 400, null, null, "Please enter your name.");
  }
  if (typeof email !== "string" || !validEmail(email.trim())) {
    return response(res, 400, null, null, "Please enter a valid email address.");
  }
  if (!safePortfolioUrl(portfolioUrl)) {
    return response(res, 400, null, null, "Portfolio URL must use http or https.");
  }

  const seed = readJson(DATA_FILE, { internships: [] });
  if (!seed.internships.some(x => x.id === internshipId)) {
    return response(res, 404, null, null, "The selected internship does not exist.");
  }

  const applications = readJson(APPLICATIONS_FILE, []);
  const duplicate = applications.some(x =>
    x.internshipId === internshipId && x.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (duplicate) return response(res, 409, null, null, "You have already applied for this internship.");

  const application = {
    id: `APP-${Date.now()}`,
    internshipId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    portfolioUrl: portfolioUrl.trim(),
    submittedAt: new Date().toISOString()
  };
  applications.push(application);
  writeJson(APPLICATIONS_FILE, applications);

  // Never log passwords, tokens, or applicant records.
  console.info("Application received for internship:", internshipId);
  return response(res, 201, { id: application.id, internshipId, submittedAt: application.submittedAt }, null,
    "Application submitted successfully.");
});

app.use("/api", (req, res) => response(res, 404, null, null, "API endpoint not found."));
app.listen(PORT, () => console.log(`Internship Board running at http://localhost:${PORT}`));
