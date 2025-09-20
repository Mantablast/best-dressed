# 👰‍♀️ Best Dressed

A modern full-stack demo for **priority-based filtering** — that just so happens to be about wedding dresses.  
Built for fun. Stayed for the filters.  Fancy dresses are not a topic I know anything about… so why not learn? 💅

---

## ✨ What It Is and Why?

**Best Dressed** is a full-stack lexicographic web filter that lets users browse and prioritize wedding dresses by silhouette, fabric, season, color, and more.  I built the thing that I wanted to see on ecommerce sites and I haven't seen it used yet.  Search filters only go so far.  I find them to be very...boolean. :s So I thought "could I make a filter for shopping that considers what I find most important in a buying choice?"  I have many tweaks to do but this filter adds a new dimension to shopping >>> user priority.

The key magic is its **priority scoring system**:  
Users can drag entire filter sections *and* individual selected values to rank their importance. Results update in real time with a weighted “match score” and sort lexicographically by user-defined priority order. 💖

---

## 🧩 Tech Stack

| Layer                 | Tooling                                                                 |
|------------------------|----------------------------------------------------------------------|
| **Frontend**            | [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [dnd-kit](https://dndkit.com/) |
| **Backend**             | [Flask](https://flask.palletsprojects.com/), [Flask-CORS](https://flask-cors.readthedocs.io/), [gunicorn](https://gunicorn.org/) |
| **Database**             | [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) |
| **Storage (images)**     | [Supabase Storage](https://supabase.com/storage) (public bucket) |
| **Hosting**                | Frontend: [Vercel](https://vercel.com/)<br>Backend: [Render](https://render.com/) |
| **Dev Tools**               | npm, [concurrently](https://www.npmjs.com/package/concurrently), [axios](https://axios-http.com/) |

---

## 🌐 Live Architecture

```plaintext
┌─────────────┐       HTTPS        ┌─────────────┐       SQL         ┌──────────────┐
│  Frontend   │  ───────────────▶  │   Backend   │  ───────────────▶ │  Supabase DB │
│ (Vercel)    │                    │ (Render)    │                   │ (PostgreSQL) │
│             │                    │             │                   └──────────────┘
│  VITE_IMG_  │                    │  Serves     │
│  BASE_URL   │ ───────────────▶   │ /api/dresses│
│ (Supabase)  │                    │             │
└─────────────┘                    └─────────────┘
        ▲
        │ Loads dress images from Supabase public storage
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js + npm
- Python 3.11+
- PostgreSQL

---

### Backend Setup

\`\`\`bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# (Optional) Seed the database
python seed.py

# Start the backend
python app.py
\`\`\`

---

### Frontend Setup

\`\`\`bash
cd frontend
npm install

# create a .env file
echo "VITE_API_BASE=http://127.0.0.1:5050" >> .env
echo "VITE_IMG_BASE_URL=http://127.0.0.1:5050/static/images" >> .env

# run local dev server
npm run dev
\`\`\`

---

## 🌸 Screenshots

| Filter Panel (Drag + Drop) | Live Priority Results |
|------------------------------|-------------------------|
| ![Filter Panel](./screenshots/filter-panel.png) | ![Priority Results](./screenshots/priority-results.png) |

> 📌 *Add screenshots to `/screenshots` folder as `filter-panel.png` and `priority-results.png` to make them appear here.*

---

## 🌍 Live Demo

- **Frontend:** [best-dressed.vercel.app](https://best-dressed.vercel.app)
- **Backend API:** [best-dressed-api.onrender.com](https://best-dressed-api.onrender.com/api/dresses)
- **Image Storage:** [Supabase public bucket](https://supabase.com/)

---

## 💖 Credits

Built with:
- curiosity
- many snacks 🍅
- much perseverance
- and more error messages than anyone should ever see 😅


## One Last Note*!*
While deploying to vercel, many changes had to be made to the repo to get through many typescript errors.
TODO: Make a local run friendly version from previous commits and save it as a local-run branch.
Thanks! -AJ
