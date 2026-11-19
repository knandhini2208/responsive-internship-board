# Responsive Internship Board

A responsive, accessible internship listing application built for the EdVyro Full Stack Development task using vanilla HTML, CSS, JavaScript, Node.js and Express.

## Features
- Search internships by title, domain, location or skill.
- Filter by domain and work mode.
- View internship details in an accessible dialog.
- Submit an application with server-side name, email and URL validation.
- Prevent duplicate applications for the same internship/email combination.
- API responses use a predictable `{ status, data, pagination, message }` envelope.
- Loading, empty, error and retry states.
- Responsive layout designed for 360px mobile screens and larger.
- Keyboard-operable native buttons, selects, forms and dialogs.

## Project structure
```text
responsive-internship-board/
├── data/
│   ├── internships.json
│   └── applications.json
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── package.json
├── server.js
└── README.md
```

## Requirements
- Node.js 18 or later
- npm

## Setup
1. Download or clone this repository.
2. Open the project folder in a terminal.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000`.

For development with automatic server restart, use `npm run dev`.

## API
- `GET /api/internships?search=frontend&domain=Full%20Stack%20Development&mode=Remote&page=1&limit=10`
- `GET /api/internships/INT-101`
- `POST /api/applications`

Example application body:
```json
{
  "internshipId": "INT-101",
  "name": "Sample Student",
  "email": "student@example.com",
  "portfolioUrl": "https://example.com"
}
```

The server validates required names, email format, portfolio URL protocol and duplicate applications. Applications are saved locally in `data/applications.json` for this learning demo. For production, use a database, stronger validation, rate limiting, CSRF protection where applicable, and appropriate privacy controls.

## Data
`data/internships.json` contains the five fictional seed records. Their original IDs and supplied fields are preserved.

## Testing checklist
- [ ] Search by role, skill and location.
- [ ] Filter by each domain.
- [ ] Filter by Remote, Hybrid and On-site.
- [ ] Combine search and filters.
- [ ] Confirm no-results state and clear filters.
- [ ] Stop the server and confirm the error state; restart and use Retry.
- [ ] Open Details and Apply using keyboard navigation.
- [ ] Submit a valid application.
- [ ] Try a missing name, invalid email and unsafe URL.
- [ ] Submit the same email for the same internship twice and confirm duplicate rejection.
- [ ] Test at 360px, 768px and desktop widths.
- [ ] Confirm no horizontal scrolling at 360px.

## Accessibility notes
- Semantic landmarks and heading hierarchy.
- Visible labels for every form control.
- Skip link, visible keyboard focus and native dialog elements.
- Live regions announce result counts, status and form feedback.
- Reduced-motion preference is respected.

## Screenshots and walkthrough
Add screenshots of the desktop and mobile layouts here before submission. Record a short walkthrough (about two minutes) showing search, filters, details, application validation, and responsive layout.

## Deployment
Deploy the Node.js application to a host that supports Node.js services. Set the start command to `npm start`. Do not publish real applicant information or secrets. The demo stores application data in a local JSON file; use persistent storage or a database if the hosting platform has an ephemeral filesystem.
