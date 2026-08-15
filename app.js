/* ═══════════════════════════════════════════════════════════
   Library Management System — Client-side app
   No build step, no framework, works in every modern browser.

   Architecture:
     - Data lives in IndexedDB (persists across refreshes).
     - On first load we seed from the original SQL schema data.
     - Reset button wipes IndexedDB and re-seeds.
     - Every mutation triggers a re-render of whichever view is active.

   Why IndexedDB over localStorage: we have ~200+ rows across 6 tables;
   IndexedDB gives us real object-store queries and larger quota.
   ═══════════════════════════════════════════════════════════ */

// ── Seed data (from the original SQL) ──────────────────────
const SEED = {
  publishers: [
    { name: 'DAW Books', address: '375 Hudson Street, New York, NY 10014', phone: '212-366-2000' },
    { name: 'Viking', address: '375 Hudson Street, New York, NY 10014', phone: '212-366-2000' },
    { name: 'Signet Books', address: '375 Hudson Street, New York, NY 10014', phone: '212-366-2000' },
    { name: 'Chilton Books', address: 'Not Available', phone: 'Not Available' },
    { name: 'George Allen & Unwin', address: '83 Alexander Ln, Crows Nest NSW 2065, Australia', phone: '+61-2-8425-0100' },
    { name: 'Alfred A. Knopf', address: '1745 Broadway, New York, NY 10019', phone: '212-940-7390' },
    { name: 'Bloomsbury', address: '1385 Broadway, 5th Floor, New York, NY 10018', phone: '212-419-5300' },
    { name: 'Shinchosa', address: 'Oga Bldg. 8, 2-5-4 Sarugaku-cho, Chiyoda-ku, Tokyo 101-0064 Japan', phone: '+81-3-5577-6507' },
    { name: 'Harper and Row', address: '195 Broadway, New York, NY 10007', phone: '212-207-7000' },
    { name: 'Pan Books', address: '175 Fifth Avenue, New York, NY 10010', phone: '646-307-5745' },
    { name: 'Chalto & Windus', address: '375 Hudson Street, New York, NY 10014', phone: '212-366-2000' },
    { name: 'Harcourt Brace Jovanovich', address: '3 Park Ave, New York, NY 10016', phone: '212-420-5800' },
    { name: 'W.W. Norton', address: '500 Fifth Avenue, New York, NY 10110', phone: '212-354-5500' },
    { name: 'Scholastic', address: '557 Broadway, New York, NY 10012', phone: '800-724-6527' },
    { name: 'Bantam', address: '375 Hudson Street, New York, NY 10014', phone: '212-366-2000' },
    { name: 'Picador USA', address: '175 Fifth Avenue, New York, NY 10010', phone: '646-307-5745' },
  ],
  books: [
    { id: 1, title: 'The Name of the Wind', publisher: 'DAW Books', authors: ['Patrick Rothfuss'] },
    { id: 2, title: 'It', publisher: 'Viking', authors: ['Stephen King'] },
    { id: 3, title: 'The Green Mile', publisher: 'Signet Books', authors: ['Stephen King'] },
    { id: 4, title: 'Dune', publisher: 'Chilton Books', authors: ['Frank Herbert'] },
    { id: 5, title: 'The Hobbit', publisher: 'George Allen & Unwin', authors: ['J.R.R. Tolkien'] },
    { id: 6, title: 'Eragon', publisher: 'Alfred A. Knopf', authors: ['Christopher Paolini'] },
    { id: 7, title: "A Wise Man's Fear", publisher: 'DAW Books', authors: ['Patrick Rothfuss'] },
    { id: 8, title: "Harry Potter and the Philosopher's Stone", publisher: 'Bloomsbury', authors: ['J.K. Rowling'] },
    { id: 9, title: 'Hard-Boiled Wonderland and the End of the World', publisher: 'Shinchosa', authors: ['Haruki Murakami'] },
    { id: 10, title: 'The Giving Tree', publisher: 'Harper and Row', authors: ['Shel Silverstein'] },
    { id: 11, title: "The Hitchhiker's Guide to the Galaxy", publisher: 'Pan Books', authors: ['Douglas Adams'] },
    { id: 12, title: 'Brave New World', publisher: 'Chalto & Windus', authors: ['Aldous Huxley'] },
    { id: 13, title: 'The Princess Bride', publisher: 'Harcourt Brace Jovanovich', authors: ['William Goldman'] },
    { id: 14, title: 'Fight Club', publisher: 'W.W. Norton', authors: ['Chuck Palahniuk'] },
    { id: 15, title: 'Holes', publisher: 'Scholastic', authors: ['Louis Sachar'] },
    { id: 16, title: 'Harry Potter and the Chamber of Secrets', publisher: 'Bloomsbury', authors: ['J.K. Rowling'] },
    { id: 17, title: 'Harry Potter and the Prisoner of Azkaban', publisher: 'Bloomsbury', authors: ['J.K. Rowling'] },
    { id: 18, title: 'The Fellowship of the Ring', publisher: 'George Allen & Unwin', authors: ['J.R.R. Tolkien'] },
    { id: 19, title: 'A Game of Thrones', publisher: 'Bantam', authors: ['George R.R. Martin'] },
    { id: 20, title: 'The Lost Tribe', publisher: 'Picador USA', authors: ['Mark Lee'] },
  ],
  branches: [
    { id: 1, name: 'Sharpstown', address: '32 Corner Road, New York, NY 10012' },
    { id: 2, name: 'Central', address: '491 3rd Street, New York, NY 10014' },
    { id: 3, name: 'Saline', address: '40 State Street, Saline, MI 48176' },
    { id: 4, name: 'Ann Arbor', address: '101 South University, Ann Arbor, MI 48104' },
  ],
  borrowers: [
    { cardNo: 100, name: 'Joe Smith', address: '1321 4th Street, New York, NY 10014', phone: '212-312-1234' },
    { cardNo: 101, name: 'Jane Smith', address: '1321 4th Street, New York, NY 10014', phone: '212-931-4124' },
    { cardNo: 102, name: 'Tom Li', address: '981 Main Street, Ann Arbor, MI 48104', phone: '734-902-7455' },
    { cardNo: 103, name: 'Angela Thompson', address: '2212 Green Avenue, Ann Arbor, MI 48104', phone: '313-591-2122' },
    { cardNo: 104, name: 'Harry Emnace', address: '121 Park Drive, Ann Arbor, MI 48104', phone: '412-512-5522' },
    { cardNo: 105, name: 'Tom Haverford', address: '23 75th Street, New York, NY 10014', phone: '212-631-3418' },
    { cardNo: 106, name: 'Haley Jackson', address: '231 52nd Avenue, New York, NY 10014', phone: '212-419-9935' },
    { cardNo: 107, name: 'Michael Horford', address: '653 Glen Avenue, Ann Arbor, MI 48104', phone: '734-998-1513' },
  ],
  // Copies: 5 per branch for every book (from the original SQL pattern)
  copies: (() => {
    const out = [];
    for (let branchId = 1; branchId <= 4; branchId++) {
      for (let bookId = 1; bookId <= 20; bookId++) {
        out.push({ bookId, branchId, count: 5 });
      }
    }
    return out;
  })(),
  // Loans: sample from the original data. Dates set relative to today so
  // the demo always has some overdue and some active — otherwise the seed
  // dates from 2018 would ALL show as overdue and the demo feels dead.
  loans: (() => {
    const today = new Date();
    const dayOffset = (d) => {
      const x = new Date(today);
      x.setDate(x.getDate() + d);
      return x.toISOString().split('T')[0];
    };
    // (bookId, branchId, cardNo, dateOutOffset, dueDateOffset)
    const template = [
      [1, 1, 100, -5, 25],
      [2, 1, 100, -5, 25],
      [3, 1, 100, -35, -5], // OVERDUE
      [4, 1, 100, -3, 27],
      [5, 1, 102, -10, 20],
      [6, 1, 102, -10, 20],
      [7, 1, 102, -45, -15], // OVERDUE
      [8, 1, 102, -8, 22],
      [11, 2, 102, -12, 18],
      [12, 2, 105, -20, 10],
      [18, 2, 105, -6, 24],
      [19, 2, 105, -60, -30], // OVERDUE (very)
      [10, 3, 103, -14, 16],
      [17, 3, 102, -2, 28],
      [16, 3, 104, -1, 29],
      [15, 3, 107, -25, 5],
      [14, 4, 104, -4, 26],
      [13, 4, 107, -50, -20], // OVERDUE
      [9, 4, 103, -7, 23],
      [20, 4, 103, -3, 27],
    ];
    return template.map(([bookId, branchId, cardNo, out, due], i) => ({
      loanId: i + 1,
      bookId, branchId, cardNo,
      dateOut: dayOffset(out),
      dueDate: dayOffset(due),
      returned: false,
    }));
  })(),
};

// ── IndexedDB wrapper ──────────────────────────────────────
const DB_NAME = 'library-mgmt';
const DB_VERSION = 1;
const STORES = ['publishers', 'books', 'branches', 'borrowers', 'copies', 'loans', 'meta'];

let db;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const _db = e.target.result;
      if (!_db.objectStoreNames.contains('publishers'))
        _db.createObjectStore('publishers', { keyPath: 'name' });
      if (!_db.objectStoreNames.contains('books'))
        _db.createObjectStore('books', { keyPath: 'id', autoIncrement: true });
      if (!_db.objectStoreNames.contains('branches'))
        _db.createObjectStore('branches', { keyPath: 'id', autoIncrement: true });
      if (!_db.objectStoreNames.contains('borrowers'))
        _db.createObjectStore('borrowers', { keyPath: 'cardNo', autoIncrement: true });
      if (!_db.objectStoreNames.contains('copies'))
        _db.createObjectStore('copies', { keyPath: ['bookId', 'branchId'] });
      if (!_db.objectStoreNames.contains('loans'))
        _db.createObjectStore('loans', { keyPath: 'loanId', autoIncrement: true });
      if (!_db.objectStoreNames.contains('meta'))
        _db.createObjectStore('meta', { keyPath: 'key' });
    };
  });
}

function txPut(store, obj) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(obj);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
function txAdd(store, obj) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).add(obj);
    req.onsuccess = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
  });
}
function txDelete(store, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
function txGetAll(store) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function txClear(store) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function seed() {
  // Only seed if not already seeded (or after reset).
  for (const store of STORES) await txClear(store);
  for (const p of SEED.publishers) await txPut('publishers', p);
  for (const b of SEED.books) await txPut('books', b);
  for (const br of SEED.branches) await txPut('branches', br);
  for (const bw of SEED.borrowers) await txPut('borrowers', bw);
  for (const c of SEED.copies) await txPut('copies', c);
  for (const l of SEED.loans) await txPut('loans', l);
  await txPut('meta', { key: 'seeded', value: true, seededAt: new Date().toISOString() });
}

async function isSeeded() {
  return new Promise((resolve) => {
    const tx = db.transaction('meta', 'readonly');
    const req = tx.objectStore('meta').get('seeded');
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => resolve(false);
  });
}

// ── Data helpers ───────────────────────────────────────────
async function loadAll() {
  const [publishers, books, branches, borrowers, copies, loans] = await Promise.all(
    ['publishers', 'books', 'branches', 'borrowers', 'copies', 'loans'].map(txGetAll)
  );
  return { publishers, books, branches, borrowers, copies, loans };
}

function isOverdue(loan) {
  if (loan.returned) return false;
  return new Date(loan.dueDate) < new Date(new Date().toDateString());
}
function activeLoans(loans) { return loans.filter(l => !l.returned); }

function todayISO() { return new Date().toISOString().split('T')[0]; }
function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function relativeDate(iso) {
  const d = new Date(iso);
  const today = new Date(new Date().toDateString());
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  if (diff > 0) return `in ${diff} days`;
  return `${-diff} days ago`;
}

// Cache to avoid re-hitting the DB inside every table row render.
let state = null;
async function refresh() { state = await loadAll(); }

/* ── Sorting infrastructure ─────────────────────────────
   Each table has its own sort state (null | {col, dir}).
   Click cycles: unsorted → asc → desc → unsorted.

   We keep sorting logic here so all three tables share the same pattern.
   Extractors: given a row + the current col name, return the sortable value.
   Numeric columns are compared as numbers; strings case-insensitively;
   dates as ISO strings (already sortable). */
const sortState = { books: null, borrowers: null, loans: null };

function cycleSort(table, col, type) {
  const cur = sortState[table];
  let next;
  if (!cur || cur.col !== col)      next = { col, dir: 'asc', type };
  else if (cur.dir === 'asc')       next = { col, dir: 'desc', type };
  else                              next = null;   // back to original order
  sortState[table] = next;
  // Re-render the table
  if (table === 'books') renderBooks();
  else if (table === 'borrowers') renderBorrowers();
  else if (table === 'loans') renderLoans();
}

/* Apply a sort state to an array of rows, using the given extractor to
   pull the sortable value from each row. Returns a new sorted array
   (or the original if no sort is active). */
function applySort(rows, state, extractor) {
  if (!state) return rows;
  const { col, dir, type } = state;
  const sign = dir === 'asc' ? 1 : -1;
  const items = rows.map((r, i) => ({ r, i, k: extractor(r, col) }));
  items.sort((a, b) => {
    const av = a.k, bv = b.k;
    // Nulls / undefineds always at the bottom, regardless of direction
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (type === 'num') return sign * (Number(av) - Number(bv));
    if (type === 'date') return sign * (String(av).localeCompare(String(bv)));
    return sign * String(av).toLowerCase().localeCompare(String(bv).toLowerCase());
  });
  return items.map(x => x.r);
}

/* Update the visual state of a table's headers to reflect its current sort. */
function updateSortHeaders(tableSelector, state) {
  document.querySelectorAll(`${tableSelector} thead th.sortable`).forEach(th => {
    const col = th.dataset.col;
    th.classList.remove('sort-asc', 'sort-desc');
    const icon = th.querySelector('.sort-icon');
    if (state && state.col === col) {
      th.classList.add(state.dir === 'asc' ? 'sort-asc' : 'sort-desc');
      if (icon) icon.className = state.dir === 'asc'
        ? 'sort-icon fas fa-sort-up'
        : 'sort-icon fas fa-sort-down';
    } else {
      if (icon) icon.className = 'sort-icon fas fa-sort';
    }
  });
}

/* Wire header clicks once at boot. */
function wireSortableHeaders() {
  document.querySelectorAll('#booksTable thead th.sortable').forEach(th => {
    th.addEventListener('click', () => cycleSort('books', th.dataset.col, th.dataset.type));
  });
  document.querySelectorAll('#borrowersTable thead th.sortable').forEach(th => {
    th.addEventListener('click', () => cycleSort('borrowers', th.dataset.col, th.dataset.type));
  });
  document.querySelectorAll('#loansTable thead th.sortable').forEach(th => {
    th.addEventListener('click', () => cycleSort('loans', th.dataset.col, th.dataset.type));
  });
}

// ── UI helpers ─────────────────────────────────────────────
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return [...document.querySelectorAll(sel)]; }
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

let toastTimer;
function toast(message, kind = 'info') {
  const t = $('#toast');
  t.className = 'toast ' + kind;
  t.textContent = message;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Modal ──────────────────────────────────────────────────
function openModal(html) {
  $('#modalContent').innerHTML = html;
  $('#modal').classList.add('open');
  $('#modal').setAttribute('aria-hidden', 'false');
}
function closeModal() {
  $('#modal').classList.remove('open');
  $('#modal').setAttribute('aria-hidden', 'true');
  $('#modalContent').innerHTML = '';
}
$('#modal').addEventListener('click', (e) => {
  if (e.target.matches('[data-close]')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('#modal').classList.contains('open')) closeModal();
});

// ── Tab routing ────────────────────────────────────────────
$$('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});
function switchTab(name) {
  $$('.tab').forEach(t => {
    const active = t.dataset.tab === name;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active);
  });
  $$('.panel').forEach(p => {
    p.classList.toggle('active', p.dataset.panel === name);
  });
  // Trigger the view's render
  if (name === 'dashboard') renderDashboard();
  if (name === 'books') renderBooks();
  if (name === 'borrowers') renderBorrowers();
  if (name === 'loans') renderLoans();
  if (name === 'checkout') renderCheckoutForm();
  if (name === 'reports') renderReports();
}

// ── Theme ──────────────────────────────────────────────────
$('#btnTheme').addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : (current === 'light' ? '' : 'dark');
  if (next === '') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = next;
  try { localStorage.setItem('lib-theme', next); } catch {}
  const isDark = next === 'dark' || (next === '' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('#btnTheme i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
});
// Restore theme
(function initTheme() {
  try {
    const saved = localStorage.getItem('lib-theme');
    if (saved && saved !== '') document.documentElement.dataset.theme = saved;
  } catch {}
  const isDark = document.documentElement.dataset.theme === 'dark'
    || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  $('#btnTheme i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
})();

// ── Reset ──────────────────────────────────────────────────
$('#btnReset').addEventListener('click', async () => {
  openModal(`
    <h2>Reset the database?</h2>
    <p class="meta">This wipes all your changes and restores the original seed data (20 books, 8 borrowers, 4 branches, 20 loans). Useful for demo resets.</p>
    <div class="form-actions">
      <button class="btn-primary" id="confirmReset"><i class="fas fa-rotate-left"></i> Yes, reset everything</button>
      <button class="btn-ghost" data-close>Cancel</button>
    </div>
  `);
  $('#confirmReset').addEventListener('click', async () => {
    closeModal();
    await seed();
    await refresh();
    switchTab('dashboard');
    toast('Database reset to original seed data', 'success');
  });
});

// ═══════════════════════════════════════════════════════════
//   VIEWS
// ═══════════════════════════════════════════════════════════

// ── Dashboard ──────────────────────────────────────────────
function renderDashboard() {
  const { books, branches, borrowers, copies, loans } = state;

  $('#statTotalBooks').textContent = books.length;
  $('#statTotalCopies').textContent = copies.reduce((s, c) => s + c.count, 0);
  const active = activeLoans(loans);
  $('#statActiveLoans').textContent = active.length;
  $('#statOverdue').textContent = active.filter(isOverdue).length;
  $('#statBorrowers').textContent = borrowers.length;
  $('#statBranches').textContent = branches.length;

  // Loans by branch chart
  const byBranch = branches.map(b => ({
    branch: b,
    count: active.filter(l => l.branchId === b.id).length,
  }));
  const max = Math.max(1, ...byBranch.map(b => b.count));
  $('#chartBranch').innerHTML = byBranch.map(b => `
    <div class="bar-row">
      <div class="bar-label">${escape(b.branch.name)}</div>
      <div class="bar-track"><div class="bar-fill" style="width: ${(b.count / max) * 100}%"></div></div>
      <div class="bar-value">${b.count}</div>
    </div>
  `).join('');

  // Recent activity — latest loans
  const recent = [...loans].sort((a, b) => new Date(b.dateOut) - new Date(a.dateOut)).slice(0, 6);
  if (recent.length === 0) {
    $('#recentActivity').innerHTML = `<div class="empty"><i class="fas fa-inbox"></i>No activity yet</div>`;
  } else {
    $('#recentActivity').innerHTML = recent.map(l => {
      const book = books.find(b => b.id === l.bookId);
      const borrower = borrowers.find(b => b.cardNo === l.cardNo);
      const branch = branches.find(b => b.id === l.branchId);
      const status = l.returned ? 'returned' : (isOverdue(l) ? 'overdue' : 'active');
      const verb = l.returned ? 'returned' : 'borrowed';
      return `
        <div class="activity-item">
          <div class="activity-icon"><i class="fas fa-${l.returned ? 'undo' : 'book'}"></i></div>
          <div class="activity-text">
            <strong>${escape(borrower?.name || 'Unknown')}</strong> ${verb}
            <strong>${escape(book?.title || 'Unknown')}</strong>
            at ${escape(branch?.name || 'Unknown')}
            <div class="activity-time">${relativeDate(l.dateOut)}${status === 'overdue' ? ' · overdue' : ''}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ── Books ──────────────────────────────────────────────────
let bookSearchTerm = '';
function renderBooks() {
  const { books, publishers, copies, loans } = state;
  const term = bookSearchTerm.toLowerCase();

  let filtered = books.filter(b => {
    if (!term) return true;
    return b.title.toLowerCase().includes(term)
      || (b.authors || []).some(a => a.toLowerCase().includes(term))
      || b.publisher.toLowerCase().includes(term);
  });

  // Apply sort. Extractor computes the sortable value per column — for
  // computed columns (Copies, Available) it does the same math the row
  // renderer does, so what you see is what you sort.
  filtered = applySort(filtered, sortState.books, (book, col) => {
    if (col === 'id') return book.id;
    if (col === 'title') return book.title;
    if (col === 'author') return (book.authors || []).join(', ');
    if (col === 'publisher') return book.publisher;
    if (col === 'copies') return copies.filter(c => c.bookId === book.id).reduce((s, c) => s + c.count, 0);
    if (col === 'available') {
      const total = copies.filter(c => c.bookId === book.id).reduce((s, c) => s + c.count, 0);
      const activeLoansForBook = loans.filter(l => l.bookId === book.id && !l.returned).length;
      return total - activeLoansForBook;
    }
    return null;
  });
  updateSortHeaders('#booksTable', sortState.books);

  const tbody = $('#booksTable tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><i class="fas fa-book"></i>No books match your search</div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(book => {
    const totalCopies = copies.filter(c => c.bookId === book.id).reduce((s, c) => s + c.count, 0);
    const activeLoansForBook = loans.filter(l => l.bookId === book.id && !l.returned).length;
    const available = totalCopies - activeLoansForBook;
    const statusClass = available === 0 ? 'status-none' : available < 3 ? 'status-low' : 'status-available';
    return `
      <tr data-book-id="${book.id}">
        <td class="id-cell">#${book.id}</td>
        <td><strong>${escape(book.title)}</strong></td>
        <td>${escape((book.authors || []).join(', '))}</td>
        <td>${escape(book.publisher)}</td>
        <td>${totalCopies}</td>
        <td><span class="status-badge ${statusClass}">${available} available</span></td>
        <td class="row-actions">
          <button class="btn-danger" data-delete-book="${book.id}" title="Delete book"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-delete-book]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDeleteBook(parseInt(btn.dataset.deleteBook));
    });
  });
  tbody.querySelectorAll('tr[data-book-id]').forEach(row => {
    row.addEventListener('click', () => openBookDetail(parseInt(row.dataset.bookId)));
  });
}

$('#bookSearch').addEventListener('input', (e) => {
  bookSearchTerm = e.target.value;
  renderBooks();
});

$('#btnAddBook').addEventListener('click', () => {
  const { publishers } = state;
  openModal(`
    <h2>Add a New Book</h2>
    <p class="meta">All fields required.</p>
    <div class="form-row">
      <label for="newBookTitle">Title</label>
      <input id="newBookTitle" type="text" placeholder="e.g., Sapiens" required>
    </div>
    <div class="form-row">
      <label for="newBookAuthor">Author</label>
      <input id="newBookAuthor" type="text" placeholder="e.g., Yuval Noah Harari" required>
    </div>
    <div class="form-row">
      <label for="newBookPublisher">Publisher</label>
      <select id="newBookPublisher" required>
        <option value="">Select a publisher...</option>
        ${publishers.map(p => `<option value="${escape(p.name)}">${escape(p.name)}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <label for="newBookCopies">Copies at each branch</label>
      <input id="newBookCopies" type="number" min="0" max="20" value="3">
    </div>
    <div class="form-actions">
      <button class="btn-primary" id="confirmAddBook"><i class="fas fa-check"></i> Add Book</button>
      <button class="btn-ghost" data-close>Cancel</button>
    </div>
  `);
  $('#confirmAddBook').addEventListener('click', async () => {
    const title = $('#newBookTitle').value.trim();
    const author = $('#newBookAuthor').value.trim();
    const publisher = $('#newBookPublisher').value;
    const copiesEach = Math.max(0, parseInt($('#newBookCopies').value) || 0);
    if (!title || !author || !publisher) { toast('Please fill in all fields', 'error'); return; }

    const bookId = await txAdd('books', { title, publisher, authors: [author] });
    for (const branch of state.branches) {
      await txPut('copies', { bookId, branchId: branch.id, count: copiesEach });
    }
    await refresh();
    closeModal();
    renderBooks();
    toast(`Added "${title}"`, 'success');
  });
});

function confirmDeleteBook(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return;
  const activeCount = state.loans.filter(l => l.bookId === bookId && !l.returned).length;
  if (activeCount > 0) {
    toast(`Can't delete — ${activeCount} active loan(s) for this book. Return them first.`, 'error');
    return;
  }
  openModal(`
    <h2>Delete "${escape(book.title)}"?</h2>
    <p class="meta">This removes the book, all its copies at every branch, and any historical loans.</p>
    <div class="form-actions">
      <button class="btn-danger" id="confirmDeleteBookBtn"><i class="fas fa-trash"></i> Delete permanently</button>
      <button class="btn-ghost" data-close>Cancel</button>
    </div>
  `);
  $('#confirmDeleteBookBtn').addEventListener('click', async () => {
    for (const copy of state.copies.filter(c => c.bookId === bookId)) {
      await txDelete('copies', [copy.bookId, copy.branchId]);
    }
    for (const loan of state.loans.filter(l => l.bookId === bookId)) {
      await txDelete('loans', loan.loanId);
    }
    await txDelete('books', bookId);
    await refresh();
    closeModal();
    renderBooks();
    toast(`Deleted "${book.title}"`, 'success');
  });
}

function openBookDetail(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return;
  const copies = state.copies.filter(c => c.bookId === bookId);
  const bookLoans = state.loans.filter(l => l.bookId === bookId);
  const activeBookLoans = bookLoans.filter(l => !l.returned);

  const copyRows = state.branches.map(branch => {
    const c = copies.find(x => x.branchId === branch.id);
    const total = c ? c.count : 0;
    const loanedHere = activeBookLoans.filter(l => l.branchId === branch.id).length;
    const available = total - loanedHere;
    return `
      <tr>
        <td>${escape(branch.name)}</td>
        <td>${total}</td>
        <td>${loanedHere}</td>
        <td><span class="status-badge ${available === 0 ? 'status-none' : available < 2 ? 'status-low' : 'status-available'}">${available}</span></td>
      </tr>
    `;
  }).join('');

  const activeLoansSection = activeBookLoans.length === 0
    ? `<div class="empty"><i class="fas fa-book-open"></i>No active loans</div>`
    : `<table class="data-table"><thead><tr><th>Borrower</th><th>Branch</th><th>Due</th></tr></thead>
       <tbody>${activeBookLoans.map(l => {
         const bw = state.borrowers.find(b => b.cardNo === l.cardNo);
         const br = state.branches.find(b => b.id === l.branchId);
         return `<tr><td>${escape(bw?.name)}</td><td>${escape(br?.name)}</td><td>${fmtDate(l.dueDate)}${isOverdue(l) ? ' <span class="status-badge status-overdue">overdue</span>' : ''}</td></tr>`;
       }).join('')}</tbody></table>`;

  openModal(`
    <h2>${escape(book.title)}</h2>
    <p class="meta">Book #${book.id}</p>
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Author(s)</div><div class="detail-value">${escape((book.authors || []).join(', '))}</div></div>
      <div class="detail-item"><div class="detail-label">Publisher</div><div class="detail-value">${escape(book.publisher)}</div></div>
    </div>
    <div class="subheading">Copies by Branch</div>
    <table class="data-table">
      <thead><tr><th>Branch</th><th>Total</th><th>Loaned</th><th>Available</th></tr></thead>
      <tbody>${copyRows}</tbody>
    </table>
    <div class="subheading">Active Loans</div>
    ${activeLoansSection}
  `);
}

// ── Borrowers ──────────────────────────────────────────────
let borrowerSearchTerm = '';
function renderBorrowers() {
  const { borrowers, loans } = state;
  const term = borrowerSearchTerm.toLowerCase();
  let filtered = borrowers.filter(b => {
    if (!term) return true;
    return b.name.toLowerCase().includes(term)
      || b.phone.toLowerCase().includes(term)
      || b.address.toLowerCase().includes(term);
  });

  filtered = applySort(filtered, sortState.borrowers, (bw, col) => {
    if (col === 'cardNo') return bw.cardNo;
    if (col === 'name') return bw.name;
    if (col === 'phone') return bw.phone;
    if (col === 'address') return bw.address;
    if (col === 'active') return loans.filter(l => l.cardNo === bw.cardNo && !l.returned).length;
    return null;
  });
  updateSortHeaders('#borrowersTable', sortState.borrowers);

  const tbody = $('#borrowersTable tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><i class="fas fa-users"></i>No borrowers match your search</div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(bw => {
    const active = loans.filter(l => l.cardNo === bw.cardNo && !l.returned).length;
    return `
      <tr data-card-no="${bw.cardNo}">
        <td class="id-cell">#${bw.cardNo}</td>
        <td><strong>${escape(bw.name)}</strong></td>
        <td>${escape(bw.phone)}</td>
        <td>${escape(bw.address)}</td>
        <td>${active > 0 ? `<span class="status-badge status-active">${active}</span>` : '<span class="status-badge status-none">0</span>'}</td>
        <td class="row-actions">
          <button class="btn-danger" data-delete-borrower="${bw.cardNo}" title="Delete borrower"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');
  tbody.querySelectorAll('[data-delete-borrower]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDeleteBorrower(parseInt(btn.dataset.deleteBorrower));
    });
  });
  tbody.querySelectorAll('tr[data-card-no]').forEach(row => {
    row.addEventListener('click', () => openBorrowerDetail(parseInt(row.dataset.cardNo)));
  });
}

$('#borrowerSearch').addEventListener('input', (e) => {
  borrowerSearchTerm = e.target.value;
  renderBorrowers();
});

$('#btnAddBorrower').addEventListener('click', () => {
  openModal(`
    <h2>Add a New Borrower</h2>
    <p class="meta">A card number is assigned automatically.</p>
    <div class="form-row">
      <label for="newBorrowerName">Full Name</label>
      <input id="newBorrowerName" type="text" placeholder="e.g., Alex Johnson" required>
    </div>
    <div class="form-row">
      <label for="newBorrowerPhone">Phone</label>
      <input id="newBorrowerPhone" type="text" placeholder="e.g., 555-123-4567" required>
    </div>
    <div class="form-row">
      <label for="newBorrowerAddress">Address</label>
      <input id="newBorrowerAddress" type="text" placeholder="Street, city, state, zip" required>
    </div>
    <div class="form-actions">
      <button class="btn-primary" id="confirmAddBorrower"><i class="fas fa-check"></i> Add Borrower</button>
      <button class="btn-ghost" data-close>Cancel</button>
    </div>
  `);
  $('#confirmAddBorrower').addEventListener('click', async () => {
    const name = $('#newBorrowerName').value.trim();
    const phone = $('#newBorrowerPhone').value.trim();
    const address = $('#newBorrowerAddress').value.trim();
    if (!name || !phone || !address) { toast('Please fill in all fields', 'error'); return; }
    const cardNo = await txAdd('borrowers', { name, phone, address });
    await refresh();
    closeModal();
    renderBorrowers();
    toast(`Added ${name} (card #${cardNo})`, 'success');
  });
});

function confirmDeleteBorrower(cardNo) {
  const bw = state.borrowers.find(b => b.cardNo === cardNo);
  if (!bw) return;
  const activeCount = state.loans.filter(l => l.cardNo === cardNo && !l.returned).length;
  if (activeCount > 0) {
    toast(`Can't delete — ${bw.name} has ${activeCount} active loan(s)`, 'error');
    return;
  }
  openModal(`
    <h2>Delete ${escape(bw.name)}?</h2>
    <p class="meta">This removes the borrower and their loan history.</p>
    <div class="form-actions">
      <button class="btn-danger" id="confirmDelBorrower"><i class="fas fa-trash"></i> Delete permanently</button>
      <button class="btn-ghost" data-close>Cancel</button>
    </div>
  `);
  $('#confirmDelBorrower').addEventListener('click', async () => {
    for (const loan of state.loans.filter(l => l.cardNo === cardNo)) {
      await txDelete('loans', loan.loanId);
    }
    await txDelete('borrowers', cardNo);
    await refresh();
    closeModal();
    renderBorrowers();
    toast(`Deleted ${bw.name}`, 'success');
  });
}

function openBorrowerDetail(cardNo) {
  const bw = state.borrowers.find(b => b.cardNo === cardNo);
  if (!bw) return;
  const bwLoans = state.loans.filter(l => l.cardNo === cardNo);
  const active = bwLoans.filter(l => !l.returned);
  const returned = bwLoans.filter(l => l.returned);

  const rows = (items, showReturn) => items.length === 0
    ? `<div class="empty"><i class="fas fa-inbox"></i>None</div>`
    : `<table class="data-table"><thead><tr><th>Book</th><th>Branch</th><th>Due</th>${showReturn ? '<th></th>' : ''}</tr></thead><tbody>
        ${items.map(l => {
          const bk = state.books.find(b => b.id === l.bookId);
          const br = state.branches.find(b => b.id === l.branchId);
          return `<tr>
            <td>${escape(bk?.title)}</td>
            <td>${escape(br?.name)}</td>
            <td>${fmtDate(l.dueDate)}${isOverdue(l) ? ' <span class="status-badge status-overdue">overdue</span>' : ''}</td>
            ${showReturn ? `<td><button class="btn-primary" style="padding:6px 12px; font-size:12px;" data-return-loan="${l.loanId}"><i class="fas fa-check"></i> Return</button></td>` : ''}
          </tr>`;
        }).join('')}
      </tbody></table>`;

  openModal(`
    <h2>${escape(bw.name)}</h2>
    <p class="meta">Card #${bw.cardNo}</p>
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Phone</div><div class="detail-value">${escape(bw.phone)}</div></div>
      <div class="detail-item"><div class="detail-label">Address</div><div class="detail-value">${escape(bw.address)}</div></div>
    </div>
    <div class="subheading">Active Loans (${active.length})</div>
    ${rows(active, true)}
    <div class="subheading">Loan History (${returned.length})</div>
    ${rows(returned, false)}
  `);

  document.querySelectorAll('[data-return-loan]').forEach(btn => {
    btn.addEventListener('click', () => returnLoan(parseInt(btn.dataset.returnLoan), () => openBorrowerDetail(cardNo)));
  });
}

// ── Loans ──────────────────────────────────────────────────
let loanSearchTerm = '';
let loanFilter = 'all';
function renderLoans() {
  const { books, borrowers, branches, loans } = state;
  const term = loanSearchTerm.toLowerCase();
  let filtered = loans.filter(l => !l.returned);
  if (loanFilter === 'active') filtered = filtered.filter(l => !isOverdue(l));
  else if (loanFilter === 'overdue') filtered = filtered.filter(l => isOverdue(l));

  if (term) {
    filtered = filtered.filter(l => {
      const book = books.find(b => b.id === l.bookId);
      const borrower = borrowers.find(b => b.cardNo === l.cardNo);
      const branch = branches.find(b => b.id === l.branchId);
      return (book?.title || '').toLowerCase().includes(term)
        || (borrower?.name || '').toLowerCase().includes(term)
        || (branch?.name || '').toLowerCase().includes(term);
    });
  }

  const tbody = $('#loansTable tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><i class="fas fa-clipboard-check"></i>No loans match</div></td></tr>`;
    return;
  }

  // Apply user sort. When no user sort, default to soonest-due-first
  // (matches original behavior).
  if (sortState.loans) {
    filtered = applySort(filtered, sortState.loans, (l, col) => {
      if (col === 'book') return (books.find(b => b.id === l.bookId) || {}).title;
      if (col === 'borrower') return (borrowers.find(b => b.cardNo === l.cardNo) || {}).name;
      if (col === 'branch') return (branches.find(b => b.id === l.branchId) || {}).name;
      if (col === 'dateOut') return l.dateOut;
      if (col === 'dueDate') return l.dueDate;
      if (col === 'status') return isOverdue(l) ? 'overdue' : 'active';
      return null;
    });
  } else {
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
  updateSortHeaders('#loansTable', sortState.loans);

  tbody.innerHTML = filtered
    .map(l => {
      const book = books.find(b => b.id === l.bookId);
      const borrower = borrowers.find(b => b.cardNo === l.cardNo);
      const branch = branches.find(b => b.id === l.branchId);
      const overdue = isOverdue(l);
      return `
        <tr>
          <td><strong>${escape(book?.title || 'Unknown')}</strong></td>
          <td>${escape(borrower?.name || 'Unknown')}</td>
          <td>${escape(branch?.name || 'Unknown')}</td>
          <td>${fmtDate(l.dateOut)}</td>
          <td>${fmtDate(l.dueDate)}</td>
          <td>${overdue ? '<span class="status-badge status-overdue">Overdue</span>' : '<span class="status-badge status-active">Active</span>'}</td>
          <td><button class="btn-primary" style="padding:6px 12px; font-size:12px;" data-return="${l.loanId}"><i class="fas fa-check"></i> Return</button></td>
        </tr>
      `;
    }).join('');

  tbody.querySelectorAll('[data-return]').forEach(btn => {
    btn.addEventListener('click', () => returnLoan(parseInt(btn.dataset.return)));
  });
}
$('#loanSearch').addEventListener('input', (e) => {
  loanSearchTerm = e.target.value;
  renderLoans();
});
$$('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    $$('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    loanFilter = chip.dataset.filter;
    renderLoans();
  });
});

async function returnLoan(loanId, afterCallback) {
  const loan = state.loans.find(l => l.loanId === loanId);
  if (!loan) return;
  const book = state.books.find(b => b.id === loan.bookId);
  loan.returned = true;
  loan.dateReturned = todayISO();
  await txPut('loans', loan);
  await refresh();
  toast(`Returned "${book?.title}"`, 'success');
  if (afterCallback) afterCallback();
  else renderLoans();
}

// ── Checkout ───────────────────────────────────────────────
function renderCheckoutForm() {
  const { books, borrowers, branches } = state;
  const coBorrower = $('#coBorrower');
  const coBook = $('#coBook');
  const coBranch = $('#coBranch');

  coBorrower.innerHTML = '<option value="">Select a borrower...</option>'
    + borrowers.map(b => `<option value="${b.cardNo}">${escape(b.name)} (card #${b.cardNo})</option>`).join('');
  coBook.innerHTML = '<option value="">Select a book...</option>'
    + books.map(b => `<option value="${b.id}">${escape(b.title)} — ${escape((b.authors || []).join(', '))}</option>`).join('');
  coBranch.innerHTML = '<option value="">Select a branch...</option>'
    + branches.map(b => `<option value="${b.id}">${escape(b.name)}</option>`).join('');

  // Show live availability hint when book + branch are picked
  const updateHint = () => {
    const bookId = parseInt(coBook.value);
    const branchId = parseInt(coBranch.value);
    if (!bookId || !branchId) { $('#coBranchHint').textContent = ''; return; }
    const copy = state.copies.find(c => c.bookId === bookId && c.branchId === branchId);
    const total = copy ? copy.count : 0;
    const loaned = state.loans.filter(l => l.bookId === bookId && l.branchId === branchId && !l.returned).length;
    const available = total - loaned;
    if (available <= 0) $('#coBranchHint').textContent = `⚠ No copies available at this branch`;
    else $('#coBranchHint').textContent = `${available} of ${total} copies available at this branch`;
  };
  coBook.onchange = updateHint;
  coBranch.onchange = updateHint;
}

$('#btnDoCheckout').addEventListener('click', async () => {
  const cardNo = parseInt($('#coBorrower').value);
  const bookId = parseInt($('#coBook').value);
  const branchId = parseInt($('#coBranch').value);
  const days = Math.max(1, parseInt($('#coDays').value) || 30);
  if (!cardNo || !bookId || !branchId) { toast('Please fill in all fields', 'error'); return; }

  // Validate availability
  const copy = state.copies.find(c => c.bookId === bookId && c.branchId === branchId);
  const total = copy ? copy.count : 0;
  const loaned = state.loans.filter(l => l.bookId === bookId && l.branchId === branchId && !l.returned).length;
  if (total - loaned <= 0) { toast('No copies available at this branch', 'error'); return; }

  await txAdd('loans', {
    bookId, branchId, cardNo,
    dateOut: todayISO(),
    dueDate: addDaysISO(days),
    returned: false,
  });
  await refresh();
  const book = state.books.find(b => b.id === bookId);
  const bw = state.borrowers.find(b => b.cardNo === cardNo);
  toast(`Checked out "${book?.title}" to ${bw?.name}`, 'success');
  $('#coBorrower').value = '';
  $('#coBook').value = '';
  $('#coBranch').value = '';
  $('#coDays').value = '30';
  $('#coBranchHint').textContent = '';
});

// ── Reports ────────────────────────────────────────────────
function renderReports() {
  const { books, borrowers, loans, branches } = state;

  // Most-loaned books (of all time — returned + active)
  const byBookCount = {};
  loans.forEach(l => { byBookCount[l.bookId] = (byBookCount[l.bookId] || 0) + 1; });
  const topBooks = Object.entries(byBookCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([bookId, count]) => ({ book: books.find(b => b.id === parseInt(bookId)), count }));

  $('#reportMostLoaned').innerHTML = topBooks.length === 0
    ? `<div class="empty"><i class="fas fa-book"></i>No loan history yet</div>`
    : topBooks.map(({ book, count }) => `
      <div class="bar-row">
        <div class="bar-label">${escape(book?.title || 'Unknown')}</div>
        <div class="bar-track"><div class="bar-fill" style="width: ${(count / topBooks[0].count) * 100}%"></div></div>
        <div class="bar-value">${count}</div>
      </div>
    `).join('');

  // Most active borrowers
  const byBorrower = {};
  loans.forEach(l => { byBorrower[l.cardNo] = (byBorrower[l.cardNo] || 0) + 1; });
  const topBorrowers = Object.entries(byBorrower)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cardNo, count]) => ({ borrower: borrowers.find(b => b.cardNo === parseInt(cardNo)), count }));

  $('#reportActiveBorrowers').innerHTML = topBorrowers.length === 0
    ? `<div class="empty"><i class="fas fa-user"></i>No loan history yet</div>`
    : topBorrowers.map(({ borrower, count }) => `
      <div class="bar-row">
        <div class="bar-label">${escape(borrower?.name || 'Unknown')}</div>
        <div class="bar-track"><div class="bar-fill" style="width: ${(count / topBorrowers[0].count) * 100}%"></div></div>
        <div class="bar-value">${count}</div>
      </div>
    `).join('');

  // Borrowers with no loans (mirrors stored procedure #3)
  const cardNosWithLoans = new Set(loans.map(l => l.cardNo));
  const noLoans = borrowers.filter(b => !cardNosWithLoans.has(b.cardNo));
  $('#reportNoLoans').innerHTML = noLoans.length === 0
    ? `<div class="empty"><i class="fas fa-check-circle"></i>Every borrower has borrowed at least once</div>`
    : `<ul style="list-style:none; padding:0; margin:0;">
        ${noLoans.map(b => `<li style="padding:8px 0; border-bottom:1px solid var(--border);">
          <strong>${escape(b.name)}</strong> <span style="color:var(--text-muted);">· card #${b.cardNo}</span>
        </li>`).join('')}
      </ul>`;

  // Overdue loans
  const overdue = loans.filter(l => !l.returned && isOverdue(l))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  $('#reportOverdue').innerHTML = overdue.length === 0
    ? `<div class="empty"><i class="fas fa-check-circle"></i>No overdue loans</div>`
    : `<table class="data-table" style="border-radius:0; border:none;">
        <thead><tr><th>Book</th><th>Borrower</th><th>Days Late</th></tr></thead>
        <tbody>${overdue.slice(0, 10).map(l => {
          const bk = books.find(b => b.id === l.bookId);
          const bw = borrowers.find(b => b.cardNo === l.cardNo);
          const daysLate = Math.floor((new Date() - new Date(l.dueDate)) / (1000 * 60 * 60 * 24));
          return `<tr>
            <td>${escape(bk?.title)}</td>
            <td>${escape(bw?.name)}</td>
            <td><span class="status-badge status-overdue">${daysLate} days</span></td>
          </tr>`;
        }).join('')}</tbody></table>`;
}

// ── Boot ───────────────────────────────────────────────────
(async function init() {
  try {
    db = await openDb();
    if (!(await isSeeded())) {
      await seed();
    }
    await refresh();
    wireSortableHeaders();
    renderDashboard();
  } catch (err) {
    console.error(err);
    toast('Could not load the library database. Try clearing site data.', 'error');
  }
})();
