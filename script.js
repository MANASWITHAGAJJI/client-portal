// =====================================
// CLIENT PORTAL SYSTEM - CRM
// =====================================

// Helper functions
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const clone = value => JSON.parse(JSON.stringify(value));

// =====================================
// INITIAL SAMPLE DATA
// =====================================

const seed = {
    clients: [
        {
            id: 1,
            name: "John Smith",
            email: "john@company.com",
            company: "Tech Solutions Inc.",
            phone: "+1 555-0101",
            status: "Active"
        },
        {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah@design.com",
            company: "Creative Design Agency",
            phone: "+1 555-0102",
            status: "Active"
        },
        {
            id: 3,
            name: "Michael Chen",
            email: "michael@north.io",
            company: "Northstar Labs",
            phone: "+1 555-0103",
            status: "Active"
        }
    ],

    projects: [
        {
            id: 1,
            clientId: 1,
            name: "Website Redesign",
            category: "Web Development",
            status: "In Progress",
            progress: 75,
            start: "2026-10-01",
            due: "2026-12-15"
        },
        {
            id: 2,
            clientId: 1,
            name: "Customer Portal",
            category: "Product Design",
            status: "In Progress",
            progress: 45,
            start: "2026-10-15",
            due: "2027-01-20"
        },
        {
            id: 3,
            clientId: 2,
            name: "Brand Identity",
            category: "Branding",
            status: "Review",
            progress: 90,
            start: "2026-09-01",
            due: "2026-11-30"
        },
        {
            id: 4,
            clientId: 3,
            name: "Analytics Dashboard",
            category: "Development",
            status: "Completed",
            progress: 100,
            start: "2026-07-10",
            due: "2026-10-20"
        }
    ],

    documents: [
        {
            id: 1,
            clientId: 1,
            name: "Website Project Brief.pdf",
            type: "PDF",
            size: "2.4 MB",
            date: "2026-11-12"
        },
        {
            id: 2,
            clientId: 1,
            name: "Design Proposal.pdf",
            type: "PDF",
            size: "1.8 MB",
            date: "2026-11-08"
        },
        {
            id: 3,
            clientId: 1,
            name: "Brand Assets.zip",
            type: "ZIP",
            size: "8.2 MB",
            date: "2026-11-04"
        },
        {
            id: 4,
            clientId: 2,
            name: "Brand Guidelines.pdf",
            type: "PDF",
            size: "3.1 MB",
            date: "2026-10-28"
        }
    ],

    tickets: [
        {
            id: 101,
            clientId: 1,
            subject: "Update billing contact details",
            status: "Open",
            priority: "Normal",
            date: "2026-11-15"
        },
        {
            id: 102,
            clientId: 1,
            subject: "Question about project milestone",
            status: "In Progress",
            priority: "High",
            date: "2026-11-13"
        },
        {
            id: 103,
            clientId: 2,
            subject: "Request source design files",
            status: "Resolved",
            priority: "Normal",
            date: "2026-11-10"
        }
    ],

    invoices: [
        {
            id: "INV-2026-014",
            clientId: 1,
            amount: 1250,
            status: "Pending",
            due: "2026-11-30"
        },
        {
            id: "INV-2026-009",
            clientId: 1,
            amount: 850,
            status: "Paid",
            due: "2026-10-30"
        },
        {
            id: "INV-2026-011",
            clientId: 2,
            amount: 2200,
            status: "Paid",
            due: "2026-11-05"
        }
    ],

    messages: [
        {
            id: 1,
            clientId: 1,
            sender: "manager",
            message: "Hi John! The latest homepage designs are ready for your review.",
            time: "Today, 9:15 AM"
        },
        {
            id: 2,
            clientId: 1,
            sender: "client",
            message: "Thanks! I will review them this afternoon.",
            time: "Today, 9:32 AM"
        },
        {
            id: 3,
            clientId: 1,
            sender: "manager",
            message: "Perfect. Let me know if you would like any changes.",
            time: "Today, 9:40 AM"
        }
    ]
};

// =====================================
// APPLICATION STATE
// =====================================

function loadDB() {
    try {
        return JSON.parse(localStorage.getItem("northstarCRM")) || clone(seed);
    } catch {
        return clone(seed);
    }
}

let db = loadDB();
let currentUser = null;
let role = "client";
let currentPage = "dashboard";

// Save data in local storage
function saveDB() {
    localStorage.setItem("northstarCRM", JSON.stringify(db));
}

// =====================================
// GENERAL FUNCTIONS
// =====================================

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}

function money(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(amount);
}

function dateLabel(date) {
    return new Date(date + "T00:00:00").toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}

function initials(name = "User") {
    return name.split(/\s+/)
        .map(x => x[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function client() {
    return db.clients.find(c => c.id === currentUser?.id) || db.clients[0];
}

function visible(list) {
    return role === "admin"
        ? list
        : list.filter(x => x.clientId === currentUser.id);
}

function statusClass(status) {
    return String(status).toLowerCase().replace(/\s+/g, "-");
}

function badge(status) {
    return `<span class="status ${statusClass(status)}">
        ${escapeHTML(status)}
    </span>`;
}

function toast(message) {
    const element = $("#toast");

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        element.classList.remove("show");
    }, 2600);
}

function refreshIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

// =====================================
// LOGIN AND LOGOUT
// =====================================

function login(user, selectedRole) {
    currentUser = user;
    role = selectedRole;

    $("#authScreen").classList.add("hidden");
    $("#app").classList.remove("hidden");

    $("#topName").textContent = user.name;
    $("#topAvatar").textContent = initials(user.name);

    $("#todayLabel").textContent =
        new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });

    setRole(selectedRole);
}

function logout() {
    $("#app").classList.add("hidden");
    $("#authScreen").classList.remove("hidden");

    currentUser = null;
}

function setRole(nextRole) {
    role = nextRole;

    $("#adminNav").classList.toggle(
        "hidden",
        role !== "admin"
    );

    $("#roleToggle span").textContent =
        role === "admin" ? "Admin View" : "Client View";

    $("#topRole").textContent =
        role === "admin" ? "Administrator" : "Client Account";

    currentPage = "dashboard";

    render();
}

// Login form
$("#loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = $("#loginEmail").value.trim().toLowerCase();
    const password = $("#loginPassword").value;
    const selectedRole = $("#loginRole").value;

    // Admin login
    if (
        selectedRole === "admin" &&
        email === "admin@portal.com" &&
        password === "admin123"
    ) {
        login({
            id: 0,
            name: "Alex Morgan",
            email: email
        }, "admin");

        return;
    }

    // Client login
    const found = db.clients.find(
        c => c.email.toLowerCase() === email
    );

    if (
        selectedRole === "client" &&
        found &&
        password === "demo123"
    ) {
        login(found, "client");
        return;
    }

    toast("Invalid demo credentials. Please check your details.");
});

// Show registration
$("#showRegister").addEventListener("click", () => {
    $("#registerForm").classList.toggle("hidden");
});

// Registration
$("#registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = $("#regName").value.trim();
    const company = $("#regCompany").value.trim();
    const email = $("#regEmail").value.trim().toLowerCase();

    if (db.clients.some(c => c.email.toLowerCase() === email)) {
        toast("An account with this email already exists.");
        return;
    }

    const newClient = {
        id: Math.max(0, ...db.clients.map(c => c.id)) + 1,
        name,
        company,
        email,
        phone: "",
        status: "Active"
    };

    db.clients.push(newClient);
    saveDB();

    toast("Account created successfully!");

    // Demo password for newly registered users
    login(newClient, "client");
});

$("#logoutBtn").addEventListener("click", logout);

// Switch between client and admin demo views
$("#roleToggle").addEventListener("click", () => {
    if (!currentUser) return;

    setRole(role === "client" ? "admin" : "client");

    toast("Switched to " + role + " view");
});

// =====================================
// PAGE HEADING
// =====================================

function pageHeading(title, description, actions = "") {
    return `
        <div class="page-heading">
            <div>
                <h1>${title}</h1>
                <p>${description}</p>
            </div>

            <div class="heading-actions">
                ${actions}
            </div>
        </div>
    `;
}

// =====================================
// DASHBOARD
// =====================================

function stat(label, value, note, icon) {
    return `
        <div class="stat-card">

            <div class="stat-top">
                <span>${label}</span>
                <span class="stat-icon">
                    <i data-lucide="${icon}"></i>
                </span>
            </div>

            <div class="stat-value">${value}</div>

            <div class="stat-note">${note}</div>

        </div>
    `;
}

function projectRow(project) {
    return `
        <div class="project-row">

            <div class="project-title">
                <span>${escapeHTML(project.name)}</span>
                ${badge(project.status)}
            </div>

            <div class="project-sub">
                ${escapeHTML(project.category)}
                · Due ${dateLabel(project.due)}
            </div>

            <div class="progress">
                <span style="width:${project.progress}%"></span>
            </div>

            <div class="project-foot">
                <span>Project progress</span>
                <b>${project.progress}%</b>
            </div>

        </div>
    `;
}

function activity(icon, title, description) {
    return `
        <div class="activity-item">

            <div class="activity-icon">
                <i data-lucide="${icon}"></i>
            </div>

            <div>
                <strong>${title}</strong>
                <p>${description}</p>
            </div>

        </div>
    `;
}

function dashboard() {

    const projects = visible(db.projects);
    const tickets = visible(db.tickets);
    const invoices = visible(db.invoices);
    const documents = visible(db.documents);

    const paid = invoices
        .filter(i => i.status === "Paid")
        .reduce((total, item) => total + item.amount, 0);

    return `
        ${pageHeading(
            "Dashboard",
            "Here's an overview of your workspace and recent activity."
        )}

        <div class="welcome-banner">
            <div>
                <h2>
                    ${role === "admin"
                        ? "Welcome to the admin workspace"
                        : "Good morning, " + escapeHTML(currentUser.name.split(" ")[0]) + "!"
                    }
                </h2>

                <p>
                    ${role === "admin"
                        ? "Manage clients, projects and service requests."
                        : "Your projects are moving forward. Here's what's happening today."
                    }
                </p>
            </div>

            <div class="banner-art">✦</div>
        </div>

        <div class="stats-grid">

            ${stat(
                "Active Projects",
                projects.filter(p => p.status !== "Completed").length,
                projects.length + " total projects",
                "briefcase-business"
            )}

            ${stat(
                "Documents",
                documents.length,
                "Files available in your portal",
                "folder"
            )}

            ${stat(
                "Open Support Tickets",
                tickets.filter(t => t.status !== "Resolved").length,
                "We're here if you need us",
                "life-buoy"
            )}

            ${stat(
                "Paid Invoices",
                money(paid),
                "Total payments recorded",
                "wallet"
            )}

        </div>

        <div class="dashboard-grid">

            <section class="panel">

                <div class="panel-head">
                    <div>
                        <h3>Your Projects</h3>
                        <p>Track progress across your active work</p>
                    </div>

                    <button class="link-btn" data-page="projects">
                        View All
                    </button>
                </div>

                ${
                    projects.slice(0, 4).map(projectRow).join("") ||
                    '<div class="empty-state">No projects yet.</div>'
                }

            </section>

            <section class="panel">

                <div class="panel-head">
                    <div>
                        <h3>Recent Activity</h3>
                        <p>Latest workspace updates</p>
                    </div>
                </div>

                ${activity(
                    "file-check",
                    "New project document added",
                    "Project brief · Today"
                )}

                ${activity(
                    "message-circle",
                    "Account manager sent a message",
                    "Today · 9:15 AM"
                )}

                ${activity(
                    "check-circle",
                    "Milestone completed",
                    "Discovery phase · Yesterday"
                )}

                ${activity(
                    "receipt",
                    "Invoice available",
                    "INV-2026-014 · Nov 15"
                )}

            </section>

        </div>
    `;
}

// =====================================
// PROFILE MANAGEMENT
// =====================================

function profile() {

    const c = client();

    return `
        ${pageHeading(
            "My Profile",
            "Manage your contact details and account preferences."
        )}

        <div class="profile-layout">

            <section class="content-card profile-summary">

                <div class="profile-large">
                    ${initials(c.name)}
                </div>

                <h3>${escapeHTML(c.name)}</h3>

                <p>${escapeHTML(c.company)}</p>

                ${badge(c.status)}

                <div style="margin-top:20px;text-align:left">

                    <div class="detail-line">
                        <span>Client ID</span>
                        <b>CL-${String(c.id).padStart(4, "0")}</b>
                    </div>

                    <div class="detail-line">
                        <span>Account Type</span>
                        <b>Standard</b>
                    </div>

                    <div class="detail-line">
                        <span>Member Since</span>
                        <b>Oct 2026</b>
                    </div>

                </div>

            </section>

            <section class="content-card">

                <div class="panel-head">
                    <div>
                        <h3>Personal Information</h3>
                        <p>Keep your account information up to date.</p>
                    </div>
                </div>

                <form id="profileForm">

                    <div class="form-grid">

                        <label class="field">
                            Full Name
                            <input name="name" required
                                value="${escapeHTML(c.name)}">
                        </label>

                        <label class="field">
                            Company Name
                            <input name="company" required
                                value="${escapeHTML(c.company)}">
                        </label>

                        <label class="field">
                            Email Address
                            <input name="email" type="email" required
                                value="${escapeHTML(c.email)}">
                        </label>

                        <label class="field">
                            Phone Number
                            <input name="phone"
                                value="${escapeHTML(c.phone || "")}">
                        </label>

                        <label class="field full-span">
                            Communication Preference
                            <select name="preference">
                                <option>Email Notifications</option>
                                <option>In-app Notifications</option>
                                <option>Both Email and In-app</option>
                            </select>
                        </label>

                    </div>

                    <div class="form-actions">
                        <button class="btn primary">
                            Save Changes
                        </button>
                    </div>

                </form>

            </section>

        </div>
    `;
}

// =====================================
// PROJECT TRACKING
// =====================================

function projectTableRows(list) {

    return list.map(p => `
        <tr>

            <td>
                <strong>${escapeHTML(p.name)}</strong><br>
                <span class="muted">${escapeHTML(p.category)}</span>
            </td>

            ${role === "admin"
                ? `<td>${escapeHTML(
                    db.clients.find(c => c.id === p.clientId)?.name || "—"
                )}</td>`
                : ""
            }

            <td>${badge(p.status)}</td>

            <td>
                <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress" style="width:70px">
                        <span style="width:${p.progress}%"></span>
                    </div>
                    ${p.progress}%
                </div>
            </td>

            <td>${dateLabel(p.start)}</td>

            <td>${dateLabel(p.due)}</td>

        </tr>
    `).join("") || `
        <tr>
            <td colspan="6" class="empty-state">
                No matching projects.
            </td>
        </tr>
    `;
}

function projects() {

    const list = visible(db.projects);

    return `
        ${pageHeading(
            "Projects",
            "Follow timelines, milestones and delivery progress.",
            role === "admin"
                ? '<button class="btn primary" data-action="add-project">+ New Project</button>'
                : ""
        )}

        <div class="content-card">

            <div class="toolbar">

                <input
                    class="search-input"
                    id="projectSearch"
                    placeholder="Search projects..."
                >

                <div class="toolbar-right">

                    <select class="filter-select" id="projectFilter">
                        <option value="">All Statuses</option>
                        <option>In Progress</option>
                        <option>Review</option>
                        <option>Completed</option>
                    </select>

                </div>

            </div>

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Project</th>
                            ${role === "admin" ? "<th>Client</th>" : ""}
                            <th>Status</th>
                            <th>Progress</th>
                            <th>Start Date</th>
                            <th>Due Date</th>
                        </tr>
                    </thead>

                    <tbody id="projectRows">
                        ${projectTableRows(list)}
                    </tbody>

                </table>

            </div>

        </div>
    `;
}

// =====================================
// DOCUMENT CENTER
// =====================================

function documentCards(list) {

    return list.map(d => `
        <article class="doc-card">

            <div class="file-icon">
                <i data-lucide="file-text"></i>
            </div>

            <div class="doc-info">

                <strong>${escapeHTML(d.name)}</strong>

                <p>
                    ${escapeHTML(d.type)}
                    · ${escapeHTML(d.size)}
                    · ${dateLabel(d.date)}
                </p>

                <div class="doc-actions">

                    <button class="mini-btn"
                        data-download="${d.id}">
                        Download
                    </button>

                    ${role === "admin"
                        ? `<button class="mini-btn"
                            data-delete-doc="${d.id}">
                            Delete
                           </button>`
                        : ""
                    }

                </div>

            </div>

        </article>
    `).join("") || `
        <div class="empty-state">No documents found.</div>
    `;
}

function documents() {

    const list = visible(db.documents);

    return `
        ${pageHeading(
            "Document Center",
            "Access and manage the files shared with you.",
            '<button class="btn primary" data-action="upload-doc">+ Upload Document</button>'
        )}

        <div class="content-card">

            <div class="toolbar">

                <input
                    class="search-input"
                    id="docSearch"
                    placeholder="Search documents..."
                >

                <span class="muted">
                    ${list.length} files
                </span>

            </div>

            <div class="document-grid" id="documentGrid">
                ${documentCards(list)}
            </div>

        </div>

        <p class="muted" style="font-size:10px;margin-top:12px">
            Demo note: uploaded files are stored as metadata.
            Actual cloud storage requires a backend.
        </p>
    `;
}

// =====================================
// SUPPORT TICKETS
// =====================================

function support() {

    const list = visible(db.tickets);

    return `
        ${pageHeading(
            "Support & Helpdesk",
            "Create a request and follow its resolution.",
            '<button class="btn primary" data-action="new-ticket">+ New Ticket</button>'
        )}

        <div class="content-card">

            <div class="panel-head">
                <div>
                    <h3>Your Support Requests</h3>
                    <p>Our support team typically responds within one business day.</p>
                </div>
            </div>

            <div class="ticket-list">

                ${list.map(t => `
                    <div class="ticket-card">

                        <div>
                            <strong>
                                #${t.id} · ${escapeHTML(t.subject)}
                            </strong>

                            <p>
                                Created ${dateLabel(t.date)}
                                · Priority: ${escapeHTML(t.priority)}
                            </p>
                        </div>

                        <div>
                            ${badge(t.status)}

                            ${role === "admin" && t.status !== "Resolved"
                                ? `<button class="mini-btn"
                                    data-resolve="${t.id}">
                                    Resolve
                                   </button>`
                                : ""
                            }
                        </div>

                    </div>
                `).join("") || `
                    <div class="empty-state">
                        No support requests yet.
                    </div>
                `}

            </div>

        </div>
    `;
}

// =====================================
// INVOICES AND BILLING
// =====================================

function invoices() {

    const list = visible(db.invoices);

    const due = list
        .filter(i => i.status !== "Paid")
        .reduce((total, item) => total + item.amount, 0);

    return `
        ${pageHeading(
            "Invoices & Billing",
            "Review your invoices and payment history.",
            role === "admin"
                ? '<button class="btn primary" data-action="new-invoice">+ Create Invoice</button>'
                : ""
        )}

        <div class="stats-grid" style="grid-template-columns:repeat(2,1fr)">

            ${stat(
                "Outstanding Balance",
                money(due),
                "Invoices awaiting payment",
                "wallet"
            )}

            ${stat(
                "Total Invoices",
                list.length,
                "Across your account",
                "receipt"
            )}

        </div>

        <div class="content-card">

            <div class="panel-head">
                <div>
                    <h3>Invoice History</h3>
                    <p>Download a copy for your records.</p>
                </div>
            </div>

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Invoice</th>
                            ${role === "admin" ? "<th>Client</th>" : ""}
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${list.map(i => `
                            <tr>

                                <td><strong>${i.id}</strong></td>

                                ${role === "admin"
                                    ? `<td>${escapeHTML(
                                        db.clients.find(c => c.id === i.clientId)?.name || "—"
                                    )}</td>`
                                    : ""
                                }

                                <td><strong>${money(i.amount)}</strong></td>

                                <td>${dateLabel(i.due)}</td>

                                <td>${badge(i.status)}</td>

                                <td>
                                    <button class="mini-btn"
                                        data-invoice="${i.id}">
                                        Download
                                    </button>

                                    ${role === "admin" && i.status !== "Paid"
                                        ? `<button class="mini-btn"
                                            data-paid="${i.id}">
                                            Mark Paid
                                           </button>`
                                        : ""
                                    }
                                </td>

                            </tr>
                        `).join("") || `
                            <tr>
                                <td colspan="6" class="empty-state">
                                    No invoices available.
                                </td>
                            </tr>
                        `}

                    </tbody>

                </table>

            </div>

        </div>
    `;
}

// =====================================
// MESSAGES
// =====================================

function messages() {

    const list = visible(db.messages);

    return `
        ${pageHeading(
            "Messages",
            "Stay connected with your account manager."
        )}

        <div class="content-card message-layout">

            <div class="conversation-list">

                <div class="conversation active">
                    <strong>Account Manager</strong>
                    <p>Project updates and support</p>
                </div>

            </div>

            <div class="chat-area">

                <div class="panel-head">
                    <div>
                        <h3>Account Manager</h3>
                        <p>Typically replies within one business day</p>
                    </div>
                    ${badge("Online")}
                </div>

                <div class="chat-messages" id="chatMessages">

                    ${list.map(m => `
                        <div class="bubble ${m.sender === "client" ? "mine" : ""}">
                            ${escapeHTML(m.message)}
                            <small>${escapeHTML(m.time)}</small>
                        </div>
                    `).join("")}

                </div>

                <form class="chat-compose" id="messageForm">

                    <input
                        name="message"
                        placeholder="Write a message..."
                        required
                        autocomplete="off"
                    >

                    <button class="btn primary">
                        Send
                    </button>

                </form>

            </div>

        </div>
    `;
}

// =====================================
// ADMIN PANEL
// =====================================

function clientRows(list) {

    return list.map(c => `
        <tr>

            <td><strong>${escapeHTML(c.name)}</strong></td>

            <td>${escapeHTML(c.company)}</td>

            <td>${escapeHTML(c.email)}</td>

            <td>${escapeHTML(c.phone || "—")}</td>

            <td>${badge(c.status)}</td>

            <td>
                <button class="mini-btn"
                    data-edit-client="${c.id}">
                    Edit
                </button>
            </td>

        </tr>
    `).join("");
}

function admin() {

    return `
        ${pageHeading(
            "Admin Panel",
            "Manage client accounts and monitor portal activity.",
            '<button class="btn primary" data-action="add-client">+ Add Client</button>'
        )}

        <div class="admin-cards">

            <div class="admin-metric">
                <span>Total Clients</span>
                <strong>${db.clients.length}</strong>
            </div>

            <div class="admin-metric">
                <span>Active Projects</span>
                <strong>
                    ${db.projects.filter(p => p.status !== "Completed").length}
                </strong>
            </div>

            <div class="admin-metric">
                <span>Open Tickets</span>
                <strong>
                    ${db.tickets.filter(t => t.status !== "Resolved").length}
                </strong>
            </div>

        </div>

        <div class="content-card">

            <div class="panel-head">
                <div>
                    <h3>Client Directory</h3>
                    <p>Manage registered client accounts.</p>
                </div>

                <input
                    class="search-input"
                    id="clientSearch"
                    placeholder="Search clients..."
                >
            </div>

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Company</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody id="clientRows">
                        ${clientRows(db.clients)}
                    </tbody>

                </table>

            </div>

        </div>

        <div class="content-card" style="margin-top:18px">

            <div class="panel-head">
                <div>
                    <h3>Recent Support Tickets</h3>
                    <p>Review and resolve client requests.</p>
                </div>

                <button class="link-btn" data-page="support">
                    View Support
                </button>
            </div>

            ${db.tickets.slice(0, 4).map(t => `
                <div class="ticket-card">

                    <div>
                        <strong>${escapeHTML(t.subject)}</strong>
                        <p>
                            ${escapeHTML(
                                db.clients.find(c => c.id === t.clientId)?.name || "Client"
                            )}
                            · ${dateLabel(t.date)}
                        </p>
                    </div>

                    ${badge(t.status)}

                </div>
            `).join("")}

        </div>
    `;
}

// =====================================
// PAGE RENDERING
// =====================================

function render() {

    const titles = {
        dashboard: "Dashboard",
        profile: "My Profile",
        projects: "Projects",
        documents: "Documents",
        support: "Support",
        invoices: "Invoices",
        messages: "Messages",
        admin: "Admin Panel"
    };

    if (role === "client" && currentPage === "admin") {
        currentPage = "dashboard";
    }

    $("#crumb").textContent = titles[currentPage] || "Dashboard";

    $$(".nav-link[data-page]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === currentPage
        );
    });

    const views = {
        dashboard,
        profile,
        projects,
        documents,
        support,
        invoices,
        messages,
        admin
    };

    $("#pageContent").innerHTML =
        (views[currentPage] || dashboard)();

    refreshIcons();
}

// =====================================
// MODAL SYSTEM
// =====================================

function openModal(title, body, onSubmit) {

    $("#modalRoot").innerHTML = `
        <div class="modal-backdrop">

            <div class="modal">

                <div class="modal-head">
                    <h3>${title}</h3>

                    <button class="modal-close"
                        type="button"
                        data-close-modal>
                        ×
                    </button>
                </div>

                <form class="modal-form" id="modalForm">

                    ${body}

                    <div class="form-actions">

                        <button type="button"
                            class="btn outline"
                            data-close-modal>
                            Cancel
                        </button>

                        <button class="btn primary">
                            Save
                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;

    $("#modalForm").addEventListener("submit", function(e) {
        e.preventDefault();

        onSubmit(new FormData(e.currentTarget));

        $("#modalRoot").innerHTML = "";

        render();
        refreshIcons();
    });
}

// =====================================
// ADMIN AND CLIENT ACTIONS
// =====================================

function action(name) {

    // Create support ticket
    if (name === "new-ticket") {

        openModal(
            "Create Support Ticket",

            `
                <label class="field">
                    Subject
                    <input name="subject" required>
                </label>

                <label class="field">
                    Priority
                    <select name="priority">
                        <option>Normal</option>
                        <option>High</option>
                        <option>Low</option>
                    </select>
                </label>

                <label class="field">
                    Description
                    <textarea name="description"></textarea>
                </label>
            `,

            f => {

                db.tickets.unshift({
                    id: Math.max(100, ...db.tickets.map(t => t.id)) + 1,
                    clientId: currentUser.id,
                    subject: f.get("subject"),
                    status: "Open",
                    priority: f.get("priority"),
                    date: new Date().toISOString().slice(0, 10)
                });

                saveDB();
                toast("Support ticket created!");
            }
        );
    }

    // Upload document
    if (name === "upload-doc") {

        openModal(
            "Upload Document",

            `
                <label class="field">
                    Choose a File
                    <input name="file" type="file" required>
                </label>

                <p class="muted" style="font-size:10px">
                    This demo stores file details only.
                    Actual cloud storage requires a backend.
                </p>
            `,

            f => {

                const file = f.get("file");

                if (!file || !file.name) {
                    toast("Please select a file.");
                    return;
                }

                db.documents.unshift({
                    id: Date.now(),
                    clientId: currentUser.id,
                    name: file.name,
                    type: file.name.split(".").pop().toUpperCase(),
                    size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                    date: new Date().toISOString().slice(0, 10)
                });

                saveDB();
                toast("Document added to portal!");
            }
        );
    }

    // Add project
    if (name === "add-project") {

        openModal(
            "Create Project",

            `
                <label class="field">
                    Project Name
                    <input name="name" required>
                </label>

                <label class="field">
                    Client
                    <select name="clientId">
                        ${db.clients.map(c => `
                            <option value="${c.id}">
                                ${escapeHTML(c.name)}
                            </option>
                        `).join("")}
                    </select>
                </label>

                <label class="field">
                    Category
                    <input name="category" required>
                </label>

                <label class="field">
                    Due Date
                    <input name="due" type="date" required>
                </label>
            `,

            f => {

                db.projects.unshift({
                    id: Date.now(),
                    clientId: Number(f.get("clientId")),
                    name: f.get("name"),
                    category: f.get("category"),
                    status: "In Progress",
                    progress: 0,
                    start: new Date().toISOString().slice(0, 10),
                    due: f.get("due")
                });

                saveDB();
                toast("Project created!");
            }
        );
    }

    // Add client
    if (name === "add-client") {

        openModal(
            "Add Client",

            `
                <label class="field">
                    Full Name
                    <input name="name" required>
                </label>

                <label class="field">
                    Company
                    <input name="company" required>
                </label>

                <label class="field">
                    Email
                    <input name="email" type="email" required>
                </label>

                <label class="field">
                    Phone
                    <input name="phone">
                </label>
            `,

            f => {

                db.clients.push({
                    id: Math.max(0, ...db.clients.map(c => c.id)) + 1,
                    name: f.get("name"),
                    company: f.get("company"),
                    email: f.get("email"),
                    phone: f.get("phone"),
                    status: "Active"
                });

                saveDB();
                toast("Client added successfully!");
            }
        );
    }

    // Create invoice
    if (name === "new-invoice") {

        openModal(
            "Create Invoice",

            `
                <label class="field">
                    Client
                    <select name="clientId">
                        ${db.clients.map(c => `
                            <option value="${c.id}">
                                ${escapeHTML(c.name)}
                            </option>
                        `).join("")}
                    </select>
                </label>

                <label class="field">
                    Amount (USD)
                    <input name="amount" type="number" min="1" required>
                </label>

                <label class="field">
                    Due Date
                    <input name="due" type="date" required>
                </label>
            `,

            f => {

                db.invoices.unshift({
                    id: "INV-" + new Date().getFullYear() +
                        "-" + String(Date.now()).slice(-4),
                    clientId: Number(f.get("clientId")),
                    amount: Number(f.get("amount")),
                    status: "Pending",
                    due: f.get("due")
                });

                saveDB();
                toast("Invoice generated!");
            }
        );
    }
}

// =====================================
// DOWNLOAD FUNCTION
// =====================================

function downloadText(filename, content) {

    const blob = new Blob([content], {
        type: "text/plain"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);
}

// =====================================
// CLICK EVENTS
// =====================================

document.addEventListener("click", function(e) {

    // Navigation
    const page = e.target.closest("[data-page]");

    if (page) {

        currentPage = page.dataset.page;

        $("#sidebar").classList.remove("open");

        render();

        return;
    }

    // Action buttons
    const act = e.target.closest("[data-action]");

    if (act) {
        action(act.dataset.action);
        return;
    }

    // Close modal
    if (e.target.closest("[data-close-modal]")) {
        $("#modalRoot").innerHTML = "";
        return;
    }

    // Download document
    const dl = e.target.closest("[data-download]");

    if (dl) {

        const doc = db.documents.find(
            x => x.id == dl.dataset.download
        );

        downloadText(
            doc.name + ".txt",
            `Demo Document Record

Name: ${doc.name}
Uploaded: ${doc.date}

This is a frontend-only demo download.`
        );

        return;
    }

    // Download invoice
    const invoice = e.target.closest("[data-invoice]");

    if (invoice) {

        const item = db.invoices.find(
            x => x.id === invoice.dataset.invoice
        );

        downloadText(
            item.id + ".txt",
            `${item.id}

Amount: ${money(item.amount)}
Status: ${item.status}
Due Date: ${item.due}`
        );

        return;
    }

    // Mark invoice paid
    const paid = e.target.closest("[data-paid]");

    if (paid) {

        const item = db.invoices.find(
            x => x.id === paid.dataset.paid
        );

        item.status = "Paid";

        saveDB();
        render();

        toast("Invoice marked as paid!");

        return;
    }

    // Resolve ticket
    const resolve = e.target.closest("[data-resolve]");

    if (resolve) {

        const ticket = db.tickets.find(
            x => x.id == resolve.dataset.resolve
        );

        ticket.status = "Resolved";

        saveDB();
        render();

        toast("Ticket resolved!");

        return;
    }

    // Delete document
    const del = e.target.closest("[data-delete-doc]");

    if (del) {

        db.documents = db.documents.filter(
            x => x.id != del.dataset.deleteDoc
        );

        saveDB();
        render();

        toast("Document deleted!");

        return;
    }

    // Edit client
    const edit = e.target.closest("[data-edit-client]");

    if (edit) {

        const c = db.clients.find(
            x => x.id == edit.dataset.editClient
        );

        openModal(
            "Edit Client",

            `
                <label class="field">
                    Full Name
                    <input name="name" required value="${escapeHTML(c.name)}">
                </label>

                <label class="field">
                    Company
                    <input name="company" required value="${escapeHTML(c.company)}">
                </label>

                <label class="field">
                    Email
                    <input name="email" type="email" required value="${escapeHTML(c.email)}">
                </label>

                <label class="field">
                    Phone
                    <input name="phone" value="${escapeHTML(c.phone || "")}">
                </label>

                <label class="field">
                    Status
                    <select name="status">
                        <option ${c.status === "Active" ? "selected" : ""}>
                            Active
                        </option>
                        <option ${c.status === "Inactive" ? "selected" : ""}>
                            Inactive
                        </option>
                    </select>
                </label>
            `,

            f => {

                Object.assign(c, {
                    name: f.get("name"),
                    company: f.get("company"),
                    email: f.get("email"),
                    phone: f.get("phone"),
                    status: f.get("status")
                });

                saveDB();
                toast("Client updated!");
            }
        );
    }
});

// =====================================
// FORM SUBMISSIONS
// =====================================

// Profile update
document.addEventListener("submit", function(e) {

    if (e.target.id === "profileForm") {

        e.preventDefault();

        const f = new FormData(e.target);
        const c = client();

        Object.assign(c, {
            name: f.get("name"),
            company: f.get("company"),
            email: f.get("email"),
            phone: f.get("phone")
        });

        saveDB();

        $("#topName").textContent = c.name;
        $("#topAvatar").textContent = initials(c.name);

        toast("Profile updated successfully!");

        render();
    }

    // Send message
    if (e.target.id === "messageForm") {

        e.preventDefault();

        const f = new FormData(e.target);
        const message = f.get("message").trim();

        if (!message) return;

        db.messages.push({
            id: Date.now(),
            clientId: currentUser.id,
            sender: "client",
            message,
            time: "Just now"
        });

        saveDB();

        render();

        toast("Message sent!");
    }
});

// =====================================
// SEARCH AND FILTER
// =====================================

document.addEventListener("input", function(e) {

    // Project search
    if (
        e.target.id === "projectSearch" ||
        e.target.id === "projectFilter"
    ) {

        const query = $("#projectSearch")?.value.toLowerCase() || "";
        const status = $("#projectFilter")?.value || "";

        const list = visible(db.projects).filter(p =>
            p.name.toLowerCase().includes(query) &&
            (!status || p.status === status)
        );

        $("#projectRows").innerHTML = projectTableRows(list);
    }

    // Document search
    if (e.target.id === "docSearch") {

        const query = e.target.value.toLowerCase();

        const list = visible(db.documents).filter(d =>
            d.name.toLowerCase().includes(query)
        );

        $("#documentGrid").innerHTML = documentCards(list);

        refreshIcons();
    }

    // Client search
    if (e.target.id === "clientSearch") {

        const query = e.target.value.toLowerCase();

        const list = db.clients.filter(c =>
            (c.name + c.company + c.email)
                .toLowerCase()
                .includes(query)
        );

        $("#clientRows").innerHTML = clientRows(list);
    }

});

// =====================================
// DARK MODE
// =====================================

$("#themeToggle").addEventListener("click", () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "northstarDark",
        document.body.classList.contains("dark")
    );

    $("#themeToggle").textContent =
        document.body.classList.contains("dark") ? "☀" : "☾";
});

// Restore dark mode
if (localStorage.getItem("northstarDark") === "true") {
    document.body.classList.add("dark");
    $("#themeToggle").textContent = "☀";
}

// =====================================
// MOBILE SIDEBAR
// =====================================

$("#menuToggle").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
});

// =====================================
// INITIALIZE APPLICATION
// =====================================

refreshIcons();