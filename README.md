# VESUM — Smart Parking Access Management

Project prototype for managing parking access in housing societies and for public users.

## Project Overview

VESUM is a lightweight, front-end prototype that demonstrates a society-controlled parking access system. Societies can register and list parking slots, public users can find and book slots on a map, and security personnel can verify entry with OTPs.

## Purpose

Reduce manual parking management work for housing societies and provide a simple, verifiable way for public users to find and book parking.

## Features

- Find nearby parking on an interactive map (Leaflet)
- Book parking slots and generate OTPs for gate verification
- Society admin dashboard to add societies and view basic stats
- Security dashboard to verify entry and mark exit
- Admin panel to view societies and bookings
- Booking history for users
- Simple local persistence using browser LocalStorage (prototype)

## Technologies

- HTML (static UI)
- CSS (styles in `css/vesumstyle.css`)
- JavaScript (app logic in `js/vesum.js`)
- Leaflet.js for map integration
- LocalStorage for client-side data persistence

## Requirements

- Modern browser (Chrome/Firefox/Edge)
- Internet connection to load Leaflet tiles

## Project Structure

```
vesum-parking/
├── vesum.html            # Main static page (entry)
├── css/
│   └── vesumstyle.css    # Extracted styles
├── js/
│   └── vesum.js          # Extracted app logic
└── README.md
```

Note: This repository is a prototype; most logic and demo data currently run in the browser.

## How to run

1. Clone or download the repository.
2. Open `vesum.html` in a browser (double-click or `File → Open`).
3. The app should work immediately — it uses LocalStorage for data and Leaflet for maps.

Optional: serve the folder with a static server for nicer development (recommended):

```bash
# using Python 3
python3 -m http.server 8000
# then open http://localhost:8000/vesum.html
```

## How the system works (high level)

1. User opens the site and views societies on the map.
2. User registers (optional) and logs in using demo OTP flow.
3. User selects a society, picks a slot and duration, and confirms booking.
4. An OTP is generated and shown on the booking confirmation; security verifies the OTP at entry.
5. Society admins can add new societies and update availability (in-browser prototype).

## Data storage

All data for this prototype is stored in the browser's LocalStorage:

- `vesumSocieties` — list of societies (default demo data added on first run)
- `vesumUsers` — registered users
- `userBookings` — bookings made by users

No server or external database is used in this prototype.

## Deployment

You can deploy this static prototype on any static hosting provider, e.g., GitHub Pages, Netlify, or Firebase Hosting. For production-grade usage, add a backend API and a persistent database.

## Next steps (recommended)

- Move app logic to an API-backed backend (Node/Express + SQLite or Firebase).
- Replace LocalStorage with server-side persistence and authentication.
- Add input validation and rate-limited OTP delivery (SMS provider) for production.

## Author

Vedang Ramnarayan Tiwari — Founder & Developer

---
This is a learning/demo prototype. Use responsibly and do not store sensitive data in LocalStorage for production.
