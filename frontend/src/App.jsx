import { useState, useEffect, useCallback } from "react";

// ─── Update this to your deployed backend URL in production ───────────────────
const API_BASE = "https://datavault-vdx6.onrender.com/api";

// Nigerian States list
const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara"
];

// ─── API Helpers ───────────────────────────────────────────────────────────────
const api = {
  async post(path, data, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: JSON.stringify(data) });
    return { ok: res.ok, status: res.status, data: await res.json() };
  },
  async get(path, token) {
    const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    return { ok: res.ok, data: await res.json() };
  },
  async patch(path, data, token) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return { ok: res.ok, data: await res.json() };
  },
  async delete(path, token) {
    const res = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    return { ok: res.ok, data: await res.json() };
  },
};

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,700;1,300&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f4f1eb;
    --surface: #ffffff;
    --ink: #1a1a2e;
    --ink-mid: #4a4a6a;
    --ink-soft: #8888aa;
    --green: #1a6b45;
    --green-light: #e6f4ed;
    --gold: #b8962e;
    --gold-light: #fdf6e3;
    --red: #b52b27;
    --red-light: #fde8e7;
    --blue: #1a4b8c;
    --blue-light: #e8eef8;
    --border: #e0ddd6;
    --shadow-sm: 0 2px 8px rgba(26,26,46,0.08);
    --shadow-md: 0 8px 32px rgba(26,26,46,0.12);
    --shadow-lg: 0 20px 60px rgba(26,26,46,0.16);
    --radius: 16px;
    --radius-sm: 8px;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--ink);
    min-height: 100vh;
    line-height: 1.5;
  }

  /* ── NAV ── */
  nav {
    background: var(--ink);
    padding: 0 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 2px 16px rgba(0,0,0,0.2);
  }
  .nav-brand {
    font-family: 'Fraunces', serif;
    color: #fff;
    font-size: 1.3rem;
    letter-spacing: -0.01em;
  }
  .nav-brand span { color: #7eb8a4; }
  .nav-links { display: flex; gap: 0.4rem; align-items: center; }
  .nav-btn {
    padding: 0.4rem 1rem;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.12);
    background: transparent;
    color: rgba(255,255,255,0.7);
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    letter-spacing: 0.01em;
  }
  .nav-btn:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.25); }
  .nav-btn.active { background: #7eb8a4; border-color: #7eb8a4; color: var(--ink); font-weight: 600; }
  .nav-btn.danger { color: #f08080; border-color: rgba(240,128,128,0.3); }
  .nav-btn.danger:hover { background: var(--red); border-color: var(--red); color: #fff; }

  /* ── PAGE WRAPPER ── */
  .page { flex: 1; padding: 3rem 1.5rem; display: flex; justify-content: center; }

  /* ── FORM CARD ── */
  .form-wrap { width: 100%; max-width: 720px; }
  .form-hero {
    background: linear-gradient(135deg, var(--green) 0%, #0f4a2f 100%);
    border-radius: var(--radius) var(--radius) 0 0;
    padding: 2.5rem 2.5rem 2rem;
    position: relative;
    overflow: hidden;
  }
  .form-hero::before {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    background: rgba(255,255,255,0.04);
    border-radius: 50%;
    top: -80px; right: -80px;
  }
  .form-hero::after {
    content: '';
    position: absolute;
    width: 180px; height: 180px;
    background: rgba(255,255,255,0.03);
    border-radius: 50%;
    bottom: -60px; left: 40px;
  }
  .form-hero h1 { font-family: 'Fraunces', serif; color: #fff; font-size: 2rem; font-weight: 600; margin-bottom: 0.4rem; line-height: 1.2; }
  .form-hero p { color: rgba(255,255,255,0.65); font-size: 0.9rem; }
  .form-hero .required-note { margin-top: 0.75rem; font-size: 0.78rem; color: rgba(255,255,255,0.4); }

  .form-body {
    background: var(--surface);
    border-radius: 0 0 var(--radius) var(--radius);
    padding: 2.5rem;
    box-shadow: var(--shadow-lg);
  }

  /* ── SECTION DIVIDER ── */
  .section-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 2rem 0 1.25rem;
  }
  .section-divider span {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--green);
    white-space: nowrap;
  }
  .section-divider::before, .section-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .section-divider::before { display: none; }

  /* ── GRID ── */
  .grid { display: grid; gap: 1rem; }
  .grid-2 { grid-template-columns: 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  .span-2 { grid-column: span 2; }
  .span-3 { grid-column: span 3; }

  /* ── FIELD ── */
  .field { display: flex; flex-direction: column; gap: 0.35rem; }
  .field label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--ink-mid);
    letter-spacing: 0.01em;
  }
  .field label .req { color: var(--red); margin-left: 2px; }
  .field input, .field select, .field textarea {
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.65rem 0.9rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: var(--ink);
    background: #fafaf8;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    outline: none;
    width: 100%;
  }
  .field input:focus, .field select:focus, .field textarea:focus {
    border-color: var(--green);
    box-shadow: 0 0 0 3px rgba(26,107,69,0.1);
    background: #fff;
  }
  .field input.err, .field select.err, .field textarea.err { border-color: var(--red); box-shadow: 0 0 0 3px rgba(181,43,39,0.08); }
  .field input::placeholder, .field textarea::placeholder { color: var(--ink-soft); }
  .field textarea { resize: vertical; min-height: 90px; }
  .field select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238888aa' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.9rem center; padding-right: 2.2rem; }
  .field-err { font-size: 0.76rem; color: var(--red); display: flex; align-items: center; gap: 0.3rem; }

  /* ── SUBMIT BTN ── */
  .submit-btn {
    margin-top: 1.75rem;
    width: 100%;
    padding: 0.9rem;
    background: var(--green);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.01em;
  }
  .submit-btn:hover:not(:disabled) { background: #145536; transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── TOAST ── */
  .toast {
    margin-top: 1.25rem;
    padding: 0.9rem 1.1rem;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    font-weight: 500;
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
  }
  .toast.success { background: var(--green-light); color: var(--green); border: 1px solid #b3d9c8; }
  .toast.error { background: var(--red-light); color: var(--red); border: 1px solid #f5c1bf; }

  /* ── LOGIN ── */
  .login-page { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; min-height: calc(100vh - 60px); }
  .login-card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow-lg); width: 100%; max-width: 400px; overflow: hidden; }
  .login-hero { background: linear-gradient(135deg, #1a1a2e 0%, #2d2d5a 100%); padding: 2.5rem; text-align: center; }
  .login-icon { font-size: 2.8rem; display: block; margin-bottom: 0.75rem; }
  .login-hero h2 { font-family: 'Fraunces', serif; color: #fff; font-size: 1.7rem; }
  .login-hero p { color: rgba(255,255,255,0.45); font-size: 0.82rem; margin-top: 0.3rem; }
  .login-body { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }

  /* ── ADMIN DASHBOARD ── */
  .admin-wrap { width: 100%; max-width: 1300px; padding: 2rem 0; }
  .admin-wrap h2 { font-family: 'Fraunces', serif; font-size: 1.8rem; color: var(--ink); margin-bottom: 1.5rem; font-weight: 600; }

  /* Stats */
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: var(--surface); border-radius: var(--radius); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
  .stat-val { font-family: 'Fraunces', serif; font-size: 2.2rem; font-weight: 600; line-height: 1; }
  .stat-lbl { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft); margin-top: 0.4rem; }
  .stat-card.g .stat-val { color: var(--green); }
  .stat-card.b .stat-val { color: var(--blue); }
  .stat-card.gold .stat-val { color: var(--gold); }

  /* Top States */
  .states-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
  .states-card { background: var(--surface); border-radius: var(--radius); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
  .states-card h4 { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); margin-bottom: 0.75rem; }
  .state-bar { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; font-size: 0.84rem; }
  .state-bar-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .state-bar-fill { height: 100%; background: var(--green); border-radius: 3px; transition: width 0.4s ease; }
  .state-bar-name { min-width: 100px; color: var(--ink); font-weight: 500; }
  .state-bar-count { color: var(--ink-soft); min-width: 24px; text-align: right; font-size: 0.8rem; }

  /* Toolbar */
  .toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
  .search-box { flex: 1; min-width: 200px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 0.6rem 1rem; font-family: 'Inter', sans-serif; font-size: 0.88rem; background: var(--surface); outline: none; transition: border-color 0.18s; color: var(--ink); }
  .search-box:focus { border-color: var(--green); }
  .filter-sel { border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 0.6rem 0.9rem; font-family: 'Inter', sans-serif; font-size: 0.85rem; background: var(--surface); outline: none; cursor: pointer; color: var(--ink); }

  /* Table */
  .tbl-wrap { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow-sm); border: 1px solid var(--border); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #f0ede6; }
  th { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--ink-mid); padding: 0.85rem 1.1rem; text-align: left; border-bottom: 1px solid var(--border); }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.12s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #faf9f6; }
  td { padding: 0.85rem 1.1rem; font-size: 0.875rem; vertical-align: middle; }
  .td-name { font-weight: 600; color: var(--ink); }
  .td-sub { font-size: 0.78rem; color: var(--ink-soft); margin-top: 1px; }

  /* Badges */
  .badge { display: inline-flex; align-items: center; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge.new_member { background: var(--blue-light); color: var(--blue); }
  .badge.old_member { background: var(--gold-light); color: var(--gold); }
  .badge.admin { background: #f3e8ff; color: #7c3aed; }

  /* Action buttons */
  .act-btn { border: 1px solid var(--border); border-radius: 5px; padding: 0.28rem 0.65rem; background: none; cursor: pointer; font-size: 0.78rem; font-family: 'Inter', sans-serif; font-weight: 500; color: var(--ink-mid); transition: all 0.15s; margin-right: 0.3rem; }
  .act-btn:hover { border-color: var(--green); color: var(--green); background: var(--green-light); }
  .act-btn.del:hover { border-color: var(--red); color: var(--red); background: var(--red-light); }

  /* Pagination */
  .pagination { display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 1.25rem; border-top: 1px solid var(--border); }
  .pg-btn { border: 1.5px solid var(--border); border-radius: 6px; padding: 0.35rem 0.75rem; background: var(--surface); cursor: pointer; font-size: 0.82rem; font-family: 'Inter', sans-serif; color: var(--ink-mid); transition: all 0.15s; }
  .pg-btn:hover:not(:disabled) { border-color: var(--green); color: var(--green); }
  .pg-btn.active { background: var(--green); border-color: var(--green); color: #fff; font-weight: 600; }
  .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Empty / Loading */
  .empty, .loading { text-align: center; padding: 4rem 2rem; color: var(--ink-soft); }
  .empty-icon { font-size: 3rem; margin-bottom: 0.75rem; }

  /* MODAL */
  .overlay { position: fixed; inset: 0; background: rgba(26,26,46,0.55); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; backdrop-filter: blur(3px); }
  .modal { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow-lg); width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
  .modal-head { background: linear-gradient(135deg, var(--green) 0%, #0f4a2f 100%); padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; border-radius: var(--radius) var(--radius) 0 0; }
  .modal-head h3 { font-family: 'Fraunces', serif; color: #fff; font-size: 1.3rem; }
  .modal-close { background: rgba(255,255,255,0.15); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .modal-close:hover { background: rgba(255,255,255,0.25); }
  .modal-body { padding: 1.75rem 2rem; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .detail-item { }
  .detail-item.full { grid-column: span 2; }
  .detail-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--ink-soft); margin-bottom: 0.2rem; }
  .detail-value { font-size: 0.9rem; color: var(--ink); font-weight: 500; word-break: break-word; }
  .detail-section { margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
  .detail-section h4 { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--green); margin-bottom: 0.85rem; }
  .status-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .status-sel { border: 1.5px solid var(--border); border-radius: 6px; padding: 0.45rem 0.85rem; font-family: 'Inter', sans-serif; font-size: 0.85rem; background: var(--bg); cursor: pointer; outline: none; color: var(--ink); }
  .status-sel:focus { border-color: var(--green); }
  .save-btn { padding: 0.45rem 1.1rem; background: var(--green); color: #fff; border: none; border-radius: 6px; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.18s; }
  .save-btn:hover:not(:disabled) { background: #145536; }
  .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── TABLET (max 1024px) ── */
  @media (max-width: 1024px) {
    .admin-wrap { padding: 1.5rem 1rem; }
    .stats-row { grid-template-columns: repeat(3, 1fr); }
    .states-row { grid-template-columns: 1fr 1fr; }
    table { font-size: 0.83rem; }
  }

  /* ── MOBILE (max 768px) ── */
  @media (max-width: 768px) {

    /* Nav */
    nav { padding: 0.75rem 1rem; height: auto; flex-direction: column; align-items: flex-start; gap: 0.6rem; }
    .nav-brand { font-size: 1.1rem; }
    .nav-links { width: 100%; flex-wrap: wrap; gap: 0.4rem; }
    .nav-btn { font-size: 0.78rem; padding: 0.35rem 0.75rem; flex: 1; text-align: center; }

    /* Form Page */
    .page { padding: 1rem 0.75rem; }
    .form-wrap { max-width: 100%; }
    .form-hero { padding: 1.5rem 1.25rem 1.25rem; border-radius: 12px 12px 0 0; }
    .form-hero h1 { font-size: 1.5rem; }
    .form-hero p { font-size: 0.85rem; }
    .form-body { padding: 1.25rem; border-radius: 0 0 12px 12px; }

    /* Grids */
    .grid-2, .grid-3 { grid-template-columns: 1fr; gap: 0.85rem; }
    .span-2, .span-3 { grid-column: span 1; }

    /* Fields — font-size 16px prevents iOS auto-zoom */
    .field input, .field select, .field textarea { font-size: 16px; padding: 0.75rem 0.9rem; }
    .field label { font-size: 0.8rem; }
    .section-divider { margin: 1.5rem 0 1rem; }

    /* Submit button */
    .submit-btn { padding: 1rem; font-size: 0.95rem; margin-top: 1.25rem; }

    /* Login */
    .login-page { padding: 1rem; align-items: flex-start; padding-top: 2rem; }
    .login-hero { padding: 1.75rem 1.5rem; }
    .login-hero h2 { font-size: 1.4rem; }
    .login-body { padding: 1.5rem; }

    /* Admin Dashboard */
    .admin-wrap { padding: 1rem 0.75rem; }
    .admin-wrap h2 { font-size: 1.4rem; margin-bottom: 1rem; }

    /* Stats */
    .stats-row { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
    .stat-card { padding: 1rem 1.1rem; }
    .stat-val { font-size: 1.8rem; }
    .stat-lbl { font-size: 0.7rem; }

    /* State bars */
    .states-row { grid-template-columns: 1fr; gap: 0.75rem; margin-bottom: 1.25rem; }
    .states-card { padding: 1rem 1.1rem; }
    .state-bar-name { min-width: 80px; font-size: 0.8rem; }

    /* Toolbar */
    .toolbar { flex-direction: column; gap: 0.6rem; }
    .search-box, .filter-sel { width: 100%; font-size: 16px; }

    /* Table — horizontal scroll */
    .tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    table { min-width: 600px; }
    th { font-size: 0.68rem; padding: 0.75rem 0.8rem; }
    td { padding: 0.75rem 0.8rem; font-size: 0.82rem; }
    .td-sub { font-size: 0.72rem; }

    /* Action buttons */
    .act-btn { padding: 0.25rem 0.5rem; font-size: 0.74rem; }

    /* Pagination */
    .pagination { padding: 1rem; gap: 0.3rem; flex-wrap: wrap; }
    .pg-btn { padding: 0.3rem 0.6rem; font-size: 0.78rem; }

    /* Modal — slides up from bottom */
    .overlay { padding: 0; align-items: flex-end; }
    .modal { max-height: 92vh; border-radius: 16px 16px 0 0; }
    .modal-head { padding: 1.25rem 1.5rem; border-radius: 16px 16px 0 0; }
    .modal-head h3 { font-size: 1.1rem; }
    .modal-body { padding: 1.25rem 1.5rem; }
    .detail-grid { grid-template-columns: 1fr; gap: 0.75rem; }
    .detail-item.full { grid-column: span 1; }
    .status-row { flex-direction: column; align-items: flex-start; gap: 0.6rem; }
    .status-sel, .save-btn { width: 100%; }
    .save-btn { padding: 0.65rem; text-align: center; }
  }

  /* ── SMALL MOBILE (max 400px) ── */
  @media (max-width: 400px) {
    .form-hero h1 { font-size: 1.3rem; }
    .stats-row { grid-template-columns: 1fr 1fr; }
    .stat-val { font-size: 1.5rem; }
    .nav-btn { font-size: 0.72rem; padding: 0.3rem 0.6rem; }
    table { min-width: 500px; }
  }

  /* ── MOBILE USER CARDS (shows instead of table on small screens) ── */
  .user-cards { display: none; flex-direction: column; gap: 0.85rem; }
  .user-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.1rem 1.25rem; box-shadow: var(--shadow-sm); }
  .user-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem; gap: 0.5rem; }
  .user-card-name { font-weight: 700; font-size: 0.95rem; color: var(--ink); }
  .user-card-occ { font-size: 0.78rem; color: var(--ink-soft); margin-top: 2px; }
  .user-card-body { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1rem; margin-bottom: 0.85rem; }
  .user-card-lbl { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft); }
  .user-card-val { font-size: 0.83rem; color: var(--ink); font-weight: 500; margin-top: 1px; word-break: break-word; }
  .user-card-actions { display: flex; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--border); }
  .user-card-actions .act-btn { flex: 1; text-align: center; padding: 0.5rem; font-size: 0.82rem; border-radius: 8px; }

  /* Delete button used in modal */
  .del-btn { padding: 0.45rem 1.1rem; background: var(--red); color: #fff; border: none; border-radius: 6px; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.18s; }
  .del-btn:hover:not(:disabled) { background: #922b21; }
  .del-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  @media (max-width: 640px) {
    .tbl-wrap table, .tbl-wrap thead, .tbl-wrap tbody { display: none; }
    .user-cards { display: flex; }
  }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v) => v || "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtDob = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—";

// ─── FIELD WRAPPER — must be OUTSIDE UserForm to prevent input focus loss ────────
function F({ id, label, req, children, className, errors }) {
  return (
    <div className={`field${className ? " " + className : ""}`}>
      <label>{label}{req && <span className="req">*</span>}</label>
      {children}
      {errors && errors[id] && <span className="field-err">⚠ {errors[id]}</span>}
    </div>
  );
}

// ─── PUBLIC FORM ───────────────────────────────────────────────────────────────
function UserForm() {
  const init = { firstName:"", lastName:"", email:"", phone:"", dateOfBirth:"", gender:"",
    stateOfOrigin:"", lgaOfOrigin:"", stateOfResidence:"", lgaOfResidence:"",
    street:"", city:"", zip:"", occupation:"", message:"" };
  const [form, setForm] = useState(init);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim() || form.firstName.length < 2) e.firstName = "At least 2 characters";
    if (!form.lastName.trim() || form.lastName.length < 2) e.lastName = "At least 2 characters";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || !/^[+]?[\d\s\-().]{7,20}$/.test(form.phone)) e.phone = "Valid phone number required";
    if (!form.stateOfOrigin) e.stateOfOrigin = "State of origin is required";
    if (!form.stateOfResidence) e.stateOfResidence = "State of residence is required";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    setToast(null);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const { ok, data } = await api.post("/users", {
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, phone: form.phone,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
      stateOfOrigin: form.stateOfOrigin, lgaOfOrigin: form.lgaOfOrigin,
      stateOfResidence: form.stateOfResidence, lgaOfResidence: form.lgaOfResidence,
      address: { street: form.street, city: form.city, zip: form.zip },
      occupation: form.occupation, message: form.message,
    });
    setLoading(false);
    if (ok) { setToast({ type: "success", msg: "✅ " + data.message }); setForm(init); }
    else setToast({ type: "error", msg: "❌ " + (data.error || "Submission failed. Please try again.") });
  };

  return (
    <div className="page" style={{ alignItems: "flex-start" }}>
      <div className="form-wrap">
        <div className="form-hero">
          <h1>Registration Form</h1>
          <p>Complete all required fields to submit your information securely.</p>
          <p className="required-note">Fields marked <span style={{color:"#f08080"}}>*</span> are required</p>
        </div>
        <div className="form-body">
          <form onSubmit={submit} noValidate>

            {/* Personal Info */}
            <div className="section-divider"><span>Personal Information</span></div>
            <div className="grid grid-2">
              <F id="firstName" label="First Name" req errors={errors}>
                <input value={form.firstName} onChange={set("firstName")} placeholder="e.g. Chukwuemeka" className={errors.firstName ? "err" : ""} />
              </F>
              <F id="lastName" label="Last Name" req errors={errors}>
                <input value={form.lastName} onChange={set("lastName")} placeholder="e.g. Okonkwo" className={errors.lastName ? "err" : ""} />
              </F>
              <F id="email" label="Email Address" req errors={errors}>
                <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={errors.email ? "err" : ""} />
              </F>
              <F id="phone" label="Phone Number" req errors={errors}>
                <input value={form.phone} onChange={set("phone")} placeholder="+234 800 000 0000" className={errors.phone ? "err" : ""} />
              </F>
              <F id="dateOfBirth" label="Date of Birth" errors={errors}>
                <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} max={new Date().toISOString().split("T")[0]} />
              </F>
              <F id="gender" label="Gender" errors={errors}>
                <select value={form.gender} onChange={set("gender")}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </F>
              <F id="occupation" label="Occupation" className="span-2" errors={errors}>
                <input value={form.occupation} onChange={set("occupation")} placeholder="e.g. Civil Servant, Trader, Student…" />
              </F>
            </div>

            {/* Origin */}
            <div className="section-divider"><span>State of Origin</span></div>
            <div className="grid grid-2">
              <F id="stateOfOrigin" label="State of Origin" req errors={errors}>
                <select value={form.stateOfOrigin} onChange={set("stateOfOrigin")} className={errors.stateOfOrigin ? "err" : ""}>
                  <option value="">— Select state —</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </F>
              <F id="lgaOfOrigin" label="LGA of Origin" errors={errors}>
                <input value={form.lgaOfOrigin} onChange={set("lgaOfOrigin")} placeholder="Local Government Area" />
              </F>
            </div>

            {/* Residence */}
            <div className="section-divider"><span>State of Residence</span></div>
            <div className="grid grid-2">
              <F id="stateOfResidence" label="State of Residence" req errors={errors}>
                <select value={form.stateOfResidence} onChange={set("stateOfResidence")} className={errors.stateOfResidence ? "err" : ""}>
                  <option value="">— Select state —</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </F>
              <F id="lgaOfResidence" label="LGA of Residence" errors={errors}>
                <input value={form.lgaOfResidence} onChange={set("lgaOfResidence")} placeholder="Local Government Area" />
              </F>
            </div>

            {/* Address */}
            <div className="section-divider"><span>Residential Address (Optional)</span></div>
            <div className="grid grid-2">
              <F id="street" label="Street Address" className="span-2" errors={errors}>
                <input value={form.street} onChange={set("street")} placeholder="House no., street name" />
              </F>
              <F id="city" label="City / Town" errors={errors}>
                <input value={form.city} onChange={set("city")} placeholder="e.g. Enugu" />
              </F>
              <F id="zip" label="Postal Code" errors={errors}>
                <input value={form.zip} onChange={set("zip")} placeholder="e.g. 400001" />
              </F>
            </div>

            {/* Message */}
            <div className="section-divider"><span>Additional Information</span></div>
            <div className="field">
              <label>Message / Notes</label>
              <textarea value={form.message} onChange={set("message")} placeholder="Any additional information you'd like to share…" />
            </div>

            {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting…" : "Submit Registration →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN LOGIN ───────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { ok, data } = await api.post("/admin/login", form);
    setLoading(false);
    if (ok) { localStorage.setItem("admin_token", data.token); onLogin(data.token); }
    else setError(data.error || "Login failed. Check your credentials.");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-hero">
          <span className="login-icon">🔐</span>
          <h2>Admin Portal</h2>
          <p>Authorised access only</p>
        </div>
        <div className="login-body">
          <div className="field">
            <label>Username</label>
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="admin" autoComplete="username" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <div className="toast error">{error}</div>}
          <button className="submit-btn" onClick={submit} disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── USER DETAIL MODAL ─────────────────────────────────────────────────────────
function UserModal({ user, token, onClose, onRefresh, onDelete }) {
  const [status, setStatus] = useState(user.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete record for "${user.firstName} ${user.lastName}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(user._id);
    setDeleting(false);
    onClose();
  };

  const saveStatus = async () => {
    setSaving(true);
    const { ok } = await api.patch(`/admin/users/${user._id}/status`, { status }, token);
    setSaving(false);
    if (ok) {
      setSaved(true);
      onRefresh(); // refresh table in background — does NOT close modal
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert("Failed to update status. Please try again.");
    }
  };

  const genderLabel = { male:"Male", female:"Female", other:"Other", prefer_not_to_say:"Prefer not to say" };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3>{user.firstName} {user.lastName}</h3>
            <span className={`badge ${status}`} style={{ marginTop: "0.4rem", display: "inline-flex" }}>
              {status === "new_member" ? "New Member" : status === "old_member" ? "Old Member" : status === "admin" ? "Admin" : status}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Personal */}
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Email</div>
              <div className="detail-value">{fmt(user.email)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Phone</div>
              <div className="detail-value">{fmt(user.phone)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Date of Birth</div>
              <div className="detail-value">{fmtDob(user.dateOfBirth)}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Gender</div>
              <div className="detail-value">{user.gender ? genderLabel[user.gender] || user.gender : "—"}</div>
            </div>
            <div className="detail-item full">
              <div className="detail-label">Occupation</div>
              <div className="detail-value">{fmt(user.occupation)}</div>
            </div>
          </div>

          {/* Origin & Residence */}
          <div className="detail-section">
            <h4>Origin & Residence</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">State of Origin</div>
                <div className="detail-value">{fmt(user.stateOfOrigin)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">LGA of Origin</div>
                <div className="detail-value">{fmt(user.lgaOfOrigin)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">State of Residence</div>
                <div className="detail-value">{fmt(user.stateOfResidence)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">LGA of Residence</div>
                <div className="detail-value">{fmt(user.lgaOfResidence)}</div>
              </div>
            </div>
          </div>

          {/* Address */}
          {(user.address?.street || user.address?.city) && (
            <div className="detail-section">
              <h4>Residential Address</h4>
              <div className="detail-grid">
                <div className="detail-item full">
                  <div className="detail-label">Street</div>
                  <div className="detail-value">{fmt(user.address?.street)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">City</div>
                  <div className="detail-value">{fmt(user.address?.city)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Postal Code</div>
                  <div className="detail-value">{fmt(user.address?.zip)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {user.message && (
            <div className="detail-section">
              <h4>Message / Notes</h4>
              <div style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "var(--ink)" }}>{user.message}</div>
            </div>
          )}

          {/* Status + Meta */}
          <div className="detail-section">
            <h4>Record Status</h4>
            <div className="status-row">
              <select className="status-sel" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="new_member">New Member</option>
                <option value="old_member">Old Member</option>
                <option value="admin">Admin</option>
              </select>
              <button className="save-btn" onClick={saveStatus} disabled={saving}>
                {saved ? "✓ Saved" : saving ? "Saving…" : "Update Status"}
              </button>
            </div>
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
              <button className="del-btn" onClick={handleDelete} disabled={deleting} style={{ width: "100%" }}>
                {deleting ? "Deleting…" : "🗑 Delete This Record"}
              </button>
            </div>
            <div style={{ marginTop: "0.85rem", fontSize: "0.78rem", color: "var(--ink-soft)" }}>
              Submitted: {fmtDate(user.submittedAt)} &nbsp;·&nbsp; ID: {user._id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function AdminDashboard({ token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [residenceFilter, setResidenceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15, search, status: statusFilter, stateOfOrigin: originFilter, stateOfResidence: residenceFilter });
    const [ur, sr] = await Promise.all([
      api.get(`/admin/users?${params}`, token),
      api.get("/admin/stats", token),
    ]);
    if (!ur.ok) { onLogout(); return; }
    setUsers(ur.data.users || []);
    setPagination(ur.data.pagination || {});
    if (sr.ok) setStats(sr.data);
    setLoading(false);
  }, [token, page, search, statusFilter, originFilter, residenceFilter, onLogout]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const del = async (id, name) => {
    if (!window.confirm(`Delete record for "${name}"? This cannot be undone.`)) return;
    await api.delete(`/admin/users/${id}`, token);
    fetchAll();
  };

  const maxOrigin = stats?.topOriginStates?.[0]?.count || 1;
  const maxResidence = stats?.topResidenceStates?.[0]?.count || 1;

  return (
    <div className="page" style={{ alignItems: "flex-start" }}>
      <div className="admin-wrap">
        <h2>Submissions Dashboard</h2>

        {/* Stats */}
        {stats && (
          <div className="stats-row">
            <div className="stat-card"><div className="stat-val">{stats.total}</div><div className="stat-lbl">Total</div></div>
            <div className="stat-card gold"><div className="stat-val">{stats.today}</div><div className="stat-lbl">Today</div></div>
            <div className="stat-card b"><div className="stat-val">{stats.byStatus?.new_member || 0}</div><div className="stat-lbl">New Members</div></div>
            <div className="stat-card gold"><div className="stat-val">{stats.byStatus?.old_member || 0}</div><div className="stat-lbl">Old Members</div></div>
            <div className="stat-card" style={{borderTop:"3px solid #7c3aed"}}><div className="stat-val" style={{color:"#7c3aed"}}>{stats.byStatus?.admin || 0}</div><div className="stat-lbl">Admins</div></div>
          </div>
        )}

        {/* State charts */}
        {stats && (stats.topOriginStates?.length > 0 || stats.topResidenceStates?.length > 0) && (
          <div className="states-row">
            <div className="states-card">
              <h4>Top States of Origin</h4>
              {stats.topOriginStates?.map(s => (
                <div className="state-bar" key={s._id}>
                  <span className="state-bar-name">{s._id}</span>
                  <div className="state-bar-track"><div className="state-bar-fill" style={{ width: `${(s.count / maxOrigin) * 100}%` }} /></div>
                  <span className="state-bar-count">{s.count}</span>
                </div>
              ))}
            </div>
            <div className="states-card">
              <h4>Top States of Residence</h4>
              {stats.topResidenceStates?.map(s => (
                <div className="state-bar" key={s._id}>
                  <span className="state-bar-name">{s._id}</span>
                  <div className="state-bar-track"><div className="state-bar-fill" style={{ width: `${(s.count / maxResidence) * 100}%`, background: "var(--blue)" }} /></div>
                  <span className="state-bar-count">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="toolbar">
          <input className="search-box" placeholder="🔍  Search name, email, phone, occupation…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-sel" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="new_member">New Member</option>
            <option value="old_member">Old Member</option>
            <option value="admin">Admin</option>
          </select>
          <select className="filter-sel" value={originFilter} onChange={e => { setOriginFilter(e.target.value); setPage(1); }}>
            <option value="">Origin: All States</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="filter-sel" value={residenceFilter} onChange={e => { setResidenceFilter(e.target.value); setPage(1); }}>
            <option value="">Residence: All States</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="tbl-wrap">
          {loading ? (
            <div className="loading">⏳ Loading submissions…</div>
          ) : users.length === 0 ? (
            <div className="empty"><div className="empty-icon">📭</div><p>No submissions found matching your filters.</p></div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>State of Origin</th>
                    <th>State of Residence</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="td-name">{u.firstName} {u.lastName}</div>
                        {u.occupation && <div className="td-sub">{u.occupation}</div>}
                      </td>
                      <td>
                        <div>{u.email}</div>
                        <div className="td-sub">{u.phone}</div>
                      </td>
                      <td>{fmt(u.stateOfOrigin)}{u.lgaOfOrigin && <div className="td-sub">{u.lgaOfOrigin}</div>}</td>
                      <td>{fmt(u.stateOfResidence)}{u.lgaOfResidence && <div className="td-sub">{u.lgaOfResidence}</div>}</td>
                      <td><span className={`badge ${u.status}`}>{u.status}</span></td>
                      <td style={{ whiteSpace: "nowrap" }}>{fmtDate(u.submittedAt)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="act-btn" onClick={() => setSelected(u)}>View</button>
                        <button className="act-btn del" onClick={() => del(u._id, `${u.firstName} ${u.lastName}`)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards — shown instead of table on small screens */}
              <div className="user-cards">
                {users.map(u => (
                  <div className="user-card" key={u._id}>
                    <div className="user-card-top">
                      <div>
                        <div className="user-card-name">{u.firstName} {u.lastName}</div>
                        {u.occupation && <div className="user-card-occ">{u.occupation}</div>}
                      </div>
                      <span className={`badge ${u.status}`}>{u.status}</span>
                    </div>
                    <div className="user-card-body">
                      <div className="user-card-field">
                        <div className="user-card-lbl">Email</div>
                        <div className="user-card-val">{u.email}</div>
                      </div>
                      <div className="user-card-field">
                        <div className="user-card-lbl">Phone</div>
                        <div className="user-card-val">{u.phone}</div>
                      </div>
                      <div className="user-card-field">
                        <div className="user-card-lbl">State of Origin</div>
                        <div className="user-card-val">{fmt(u.stateOfOrigin)}</div>
                      </div>
                      <div className="user-card-field">
                        <div className="user-card-lbl">State of Residence</div>
                        <div className="user-card-val">{fmt(u.stateOfResidence)}</div>
                      </div>
                      <div className="user-card-field">
                        <div className="user-card-lbl">Date</div>
                        <div className="user-card-val">{fmtDate(u.submittedAt)}</div>
                      </div>
                      {u.lgaOfOrigin && (
                        <div className="user-card-field">
                          <div className="user-card-lbl">LGA of Origin</div>
                          <div className="user-card-val">{u.lgaOfOrigin}</div>
                        </div>
                      )}
                    </div>
                    <div className="user-card-actions">
                      <button className="act-btn" onClick={() => setSelected(u)}>👁 View All</button>
                      <button className="act-btn del" onClick={() => del(u._id, `${u.firstName} ${u.lastName}`)}>🗑 Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button className="pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                    const p = pagination.pages <= 7 ? i + 1 : Math.max(1, page - 3) + i;
                    if (p > pagination.pages) return null;
                    return <button key={p} className={`pg-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>;
                  })}
                  <button className="pg-btn" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selected && (
        <UserModal
          user={selected}
          token={token}
          onClose={() => setSelected(null)}
          onRefresh={() => { fetchAll(); }}
          onDelete={async (id) => { await api.delete(`/admin/users/${id}`, token); fetchAll(); }}
        />
      )}
    </div>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("form");
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));

  const login = (t) => { setToken(t); setView("admin"); };
  const logout = () => { localStorage.removeItem("admin_token"); setToken(null); setView("form"); };

  return (
    <>
      <style>{CSS}</style>
      <nav>
        <span className="nav-brand">Data<span>Vault</span></span>
        <div className="nav-links">
          <button className={`nav-btn ${view === "form" ? "active" : ""}`} onClick={() => setView("form")}>📝 Register</button>
          {token ? (
            <>
              <button className={`nav-btn ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>📊 Dashboard</button>
              <button className="nav-btn danger" onClick={logout}>Sign Out</button>
            </>
          ) : (
            <button className={`nav-btn ${view === "login" ? "active" : ""}`} onClick={() => setView("login")}>🔐 Admin</button>
          )}
        </div>
      </nav>
      {view === "form"  && <UserForm />}
      {view === "login" && <AdminLogin onLogin={login} />}
      {view === "admin" && token && <AdminDashboard token={token} onLogout={logout} />}
    </>
  );
}
