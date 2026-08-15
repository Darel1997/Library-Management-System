# Library Management System

A complete library management application with a clean, professional UI — book catalog, member management, checkout / return workflows, and analytics dashboards. Built to demonstrate practical full-stack thinking: real relational schema, real business logic, real UX considerations.

**[▶ Try it live](https://darelrodriguez.com/library/)**

![Dashboard screenshot](docs/dashboard.png)

---

## What it does

Six connected views, all working with live data:

- **Dashboard** — total titles, copies, active loans, overdue count, members, branches; loans-by-branch chart; recent activity feed
- **Books** — full catalog with search across title, author, and publisher; click any row for copies-per-branch breakdown and current loan status
- **Borrowers** — member directory with search; click for active loans, full history, and inline Return actions
- **Loans** — every active loan with search + filters (All / Active / Overdue), inline Return button on each row
- **Checkout** — pick a borrower, book, and branch; live availability check; configurable loan period
- **Reports** — most-loaned books, most active borrowers, borrowers with no loans, overdue-loan tracking (mirrors the original stored procedures)

Every table is sortable — click any column header to cycle ascending → descending → original order. Dark mode included. Fully responsive.

## Why this project

Originally built as a college database project focused on schema design and T-SQL stored procedures ([schema included in the repo](./LibraryManagementSystemAndStoredProceduresFINAL.sql)). I rebuilt it as a full application to showcase:

- **Data modeling** — six related tables with proper referential integrity (books, publishers, branches, borrowers, copies, loans)
- **Business logic** — availability calculations, overdue detection, referential guards on deletes, loan period math
- **UI/UX** — searchable/sortable tables, modal detail views, live form validation, toast notifications, dark mode with OS-preference detection, accessible keyboard nav
- **Zero-friction deployment** — no backend to babysit, no dependencies to install, works offline after first load

## Tech stack

- **Vanilla JavaScript** — no framework, no build step. ~1,000 lines of readable, dependency-free code.
- **IndexedDB** — client-side database that persists data across sessions and page refreshes.
- **CSS custom properties** — theme tokens for light/dark mode and consistent design.
- **Original schema** — Microsoft SQL Server T-SQL with tables, foreign keys, and 7 stored procedures ([view the SQL](./LibraryManagementSystemAndStoredProceduresFINAL.sql)).

The app runs entirely in the browser. No server, no API keys, no database credentials. Every visitor gets their own private copy of the seed data and can experiment freely — a Reset button restores the original state instantly.

## Run it locally

Three options, all take under a minute:

**Option 1 — just open the file.**
```bash
git clone https://github.com/Darel1997/Library-Management-System.git
cd Library-Management-System
# Open index.html in any modern browser
```

**Option 2 — with a local server (recommended for dev).**
```bash
git clone https://github.com/Darel1997/Library-Management-System.git
cd Library-Management-System
python3 -m http.server 8000
# Visit http://localhost:8000
```

**Option 3 — try it hosted.**
No clone needed → [darelrodriguez.com/library/](https://darelrodriguez.com/library/)

That's it. No `npm install`, no `.env` file, no database setup.

## Project structure

```
Library-Management-System/
├── index.html                                          # App shell + markup
├── app.js                                              # All logic (~1,000 lines)
├── style.css                                           # Design system + components
├── LibraryManagementSystemAndStoredProceduresFINAL.sql # Original T-SQL schema
└── README.md
```

## Sample data

Seeded with 20 classic novels, 4 branches, 8 borrowers, and 20 sample loans — some active, some overdue — so you can explore every feature without setup. Add your own books and borrowers, check out and return items; refresh the page and everything you did is still there. Click **Reset** to restore the original seed.

## Browser support

Any browser with IndexedDB support — that's essentially every browser released since 2015. Tested on Chrome, Firefox, Safari, and Edge.

## About the author

Built by **[Darel Rodriguez](https://darelrodriguez.com)** — Software Engineer, Computer Science M.S. candidate.

- Portfolio: [darelrodriguez.com](https://darelrodriguez.com)
- Other projects: [github.com/Darel1997](https://github.com/Darel1997)
