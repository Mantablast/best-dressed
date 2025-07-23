===============================
🧵 best-dressed-dev-commands.txt
===============================

🐍 PYTHON / BACKEND
-------------------------------

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install flask flask-cors flask-sqlalchemy

# Run Flask server
FLASK_APP=app.py flask run --port=5050

# Alternate way (if using .flaskenv)
flask run

# Seed the database
python seed.py

# Delete and reset the DB (if needed)
rm instance/dresses.db
python seed.py

# View DB contents (optional)
sqlite3 instance/dresses.db


💻 REACT FRONTEND
-------------------------------

# Install frontend dependencies
npm install

# Run frontend dev server
npm run dev

# Where image files go
backend/static/images/

# Example image access in browser
http://localhost:5050/static/images/1.png


🧠 PRO TIPS
-------------------------------

# Kill a port (like if 5000 or 5050 is stuck)
lsof -i :5000
kill -9 <PID>

# List defined npm scripts
npm run

# Check Flask logs
# (Watch terminal output while server is running)


✨ FINAL NOTES
-------------------------------
- Make sure Flask and frontend are running on separate ports.
- Default Flask port is 5000 or 5050. React frontend usually runs on 5173.
- Frontend gets dress data from: http://localhost:5050/dresses
- Dress images are served from: http://localhost:5050/static/images/<filename>
