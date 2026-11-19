const list = document.querySelector("#internship-list");
const searchInput = document.querySelector("#search");
const domainSelect = document.querySelector("#domain");
const modeSelect = document.querySelector("#mode");
const count = document.querySelector("#result-count");
const statusMessage = document.querySelector("#status-message");
const emptyPanel = document.querySelector("#empty-panel");
const errorPanel = document.querySelector("#error-panel");
const detailsDialog = document.querySelector("#details-dialog");
const applyDialog = document.querySelector("#apply-dialog");

let allInternships = [];
let searchTimer;

function setLoading(isLoading) {
  list.setAttribute("aria-busy", String(isLoading));
  statusMessage.textContent = isLoading ? "Loading internships…" : "";
}
function showError() {
  list.innerHTML = "";
  list.hidden = true;
  emptyPanel.hidden = true;
  errorPanel.hidden = false;
  count.textContent = "Unable to load";
  statusMessage.textContent = "An error occurred while loading the internship list.";
}
function showEmpty() {
  list.hidden = true;
  emptyPanel.hidden = false;
  errorPanel.hidden = true;
  statusMessage.textContent = "No matching internships.";
}
function renderCards(records) {
  list.hidden = false;
  emptyPanel.hidden = true;
  errorPanel.hidden = true;
  list.innerHTML = records.map(item => `
    <article class="internship-card">
      <div class="card-top"><div class="company-mark" aria-hidden="true">${escapeHtml(item.title.charAt(0))}</div><span class="mode-tag">${escapeHtml(item.mode)}</span></div>
      <p class="domain-tag">${escapeHtml(item.domain)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="location">⌖ ${escapeHtml(item.location)}</p>
      <div class="skill-list" aria-label="Required skills">${item.skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("")}</div>
      <div class="card-bottom"><span class="openings">${item.openings} opening${item.openings === 1 ? "" : "s"}</span>
        <div class="card-actions"><button class="text-button" type="button" data-details="${escapeHtml(item.id)}">Details</button><button class="apply-button" type="button" data-apply="${escapeHtml(item.id)}">Apply</button></div>
      </div>
    </article>`).join("");
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
async function loadDomains() {
  const response = await fetch("/api/internships?limit=20");
  if (!response.ok) throw new Error("Could not load domains");
  const result = await response.json();
  allInternships = result.data;
  const domains = [...new Set(allInternships.map(item => item.domain))].sort();
  domainSelect.innerHTML = '<option value="">All domains</option>' + domains.map(domain => `<option value="${escapeHtml(domain)}">${escapeHtml(domain)}</option>`).join("");
}
async function loadInternships() {
  setLoading(true);
  list.hidden = false;
  emptyPanel.hidden = true;
  errorPanel.hidden = true;
  try {
    const params = new URLSearchParams({search:searchInput.value.trim(),domain:domainSelect.value,mode:modeSelect.value});
    const response = await fetch(`/api/internships?${params}`);
    if (!response.ok) throw new Error("Request failed");
    const result = await response.json();
    const records = result.data;
    count.textContent = `${result.pagination.total} opportunit${result.pagination.total === 1 ? "y" : "ies"} found`;
    if (!records.length) showEmpty();
    else renderCards(records);
  } catch (error) {
    showError();
  } finally {
    setLoading(false);
  }
}
function debounceSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadInternships, 250);
}
async function openDetails(id) {
  try {
    const response = await fetch(`/api/internships/${encodeURIComponent(id)}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not load details");
    const item = result.data;
    document.querySelector("#details-content").innerHTML = `
      <p class="detail-domain">${escapeHtml(item.domain)}</p><h2 id="details-title">${escapeHtml(item.title)}</h2>
      <div class="detail-meta"><span>⌖ ${escapeHtml(item.location)}</span><span>${escapeHtml(item.mode)}</span><span>${item.openings} opening(s)</span></div>
      <h3>Skills you'll work with</h3><div class="detail-skills">${item.skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("")}</div>
      <button class="primary-button" type="button" id="details-apply">Apply for this role →</button>`;
    detailsDialog.showModal();
    document.querySelector("#details-apply").addEventListener("click", () => {
      detailsDialog.close();
      openApplication(item);
    });
  } catch (error) {
    statusMessage.textContent = error.message;
  }
}
function openApplication(item) {
  document.querySelector("#application-internship-id").value = item.id;
  document.querySelector("#apply-role").textContent = `${item.title} · ${item.location}`;
  document.querySelector("#application-feedback").textContent = "";
  document.querySelector("#application-feedback").className = "form-feedback";
  applyDialog.showModal();
}
list.addEventListener("click", event => {
  const detailsButton = event.target.closest("[data-details]");
  const applyButton = event.target.closest("[data-apply]");
  if (detailsButton) openDetails(detailsButton.dataset.details);
  if (applyButton) {
    const item = allInternships.find(x => x.id === applyButton.dataset.apply);
    if (item) openApplication(item);
  }
});
document.querySelector("#filter-form").addEventListener("submit", event => event.preventDefault());
searchInput.addEventListener("input", debounceSearch);
domainSelect.addEventListener("change", loadInternships);
modeSelect.addEventListener("change", loadInternships);
function clearFilters() {
  searchInput.value = "";
  domainSelect.value = "";
  modeSelect.value = "";
  loadInternships();
}
document.querySelector("#clear-filters").addEventListener("click", clearFilters);
document.querySelector("#empty-clear").addEventListener("click", clearFilters);
document.querySelector("#retry-button").addEventListener("click", loadInternships);
document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => document.getElementById(button.dataset.close).close());
});
[detailsDialog, applyDialog].forEach(dialog => {
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
});
document.querySelector("#application-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.querySelector("#application-feedback");
  const submit = form.querySelector("button[type=submit]");
  const payload = Object.fromEntries(new FormData(form).entries());
  submit.disabled = true;
  submit.textContent = "Submitting…";
  feedback.textContent = "";
  try {
    const response = await fetch("/api/applications", {
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Application could not be submitted.");
    feedback.textContent = result.message;
    feedback.className = "form-feedback success";
    form.reset();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = "form-feedback error";
  } finally {
    submit.disabled = false;
    submit.innerHTML = 'Submit application <span aria-hidden="true">→</span>';
  }
});

(async function init() {
  try {
    await loadDomains();
    await loadInternships();
  } catch (error) {
    showError();
  }
})();
