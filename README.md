# 👰‍♀️ Best Dressed

A tiny stack filtering demo... that just so happens to be about wedding dresses.  
Built for fun. Stayed for the filters. Not a topic I know anything about so why not learn? 💅
The user may have to seed the database before use!  python seed.py!
---

## ✨ What It Is

Best Dressed is a modern, full-stack web app that lets users filter through wedding dresses by color, silhouette, style, and more. It's a demonstration of:

- 💻 React frontend with Vite + Tailwind CSS
- 🧠 Flask backend serving dress data via a REST API
- 🗃️ PostgreSQL for storing dresses and attributes
- 🔄 Live filter syncing via query params
- 🌸 Styled in soft mauve, because elegance
- 🧪 Built with love, sarcasm, and many error messages

---

## 🧩 Tech Stack

| Layer         | Tooling                         |
|---------------|----------------------------------|
| Frontend      | React, TypeScript, Tailwind CSS |
| Backend       | Flask, Flask-CORS               |
| Database      | PostgreSQL                      |
| Dev Tools     | Vite, npm, concurrently         |

---

## 🚀 Getting Started

### Prerequisites
- Node.js + npm
- Python 3.11+
- PostgreSQL

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# (Optional) Seed the database if needed
python seed.py
# Start the backend server
python app.py
```
