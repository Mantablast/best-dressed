from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, WeddingDress

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# Connect to PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/best_dressed'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route("/")
def home():
    return {"message": "Welcome to Best Dressed!"}

@app.route("/dresses", methods=["GET"])
def get_dresses():
    query = WeddingDress.query

    # Grab filter params from URL
    color = request.args.get("color")
    has_pockets = request.args.get("has_pockets")
    corset_back = request.args.get("corset_back")
    price_min = request.args.get("priceMin", type=int)
    price_max = request.args.get("priceMax", type=int)

    # Apply filters
    if color:
        query = query.filter_by(color=color)

    if has_pockets is not None:
        query = query.filter_by(has_pockets=has_pockets.lower() == "true")

    if corset_back is not None:
        query = query.filter_by(corset_back=corset_back.lower() == "true")

    if price_min is not None:
        query = query.filter(WeddingDress.price >= price_min)

    if price_max is not None:
        query = query.filter(WeddingDress.price <= price_max)

    results = query.all()
    return jsonify([dress.serialize() for dress in results])


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
