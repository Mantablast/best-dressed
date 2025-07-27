import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import or_
# App setup
app = Flask(__name__, instance_relative_config=True)
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "instance", "dresses.db")

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
CORS(app)

# Model
class WeddingDress(db.Model):
    __tablename__ = "wedding_dresses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    image_path = db.Column(db.String(200))
    silhouette = db.Column(db.String(50))
    shipin48hrs = db.Column(db.Boolean)
    neckline = db.Column(db.String(50))
    strapsleevelayout = db.Column(db.String(50))
    length = db.Column(db.String(50))
    collection = db.Column(db.String(50))
    fabric = db.Column(db.String(50))
    color = db.Column(db.String(50))
    backstyle = db.Column(db.String(50))
    price = db.Column(db.Float)
    size_range = db.Column(db.String(20))
    tags = db.Column(db.PickleType)
    weddingvenue = db.Column(db.PickleType)
    season = db.Column(db.String(20))
    embellishments = db.Column(db.PickleType)
    features = db.Column(db.PickleType)
    has_pockets = db.Column(db.Boolean)
    corset_back = db.Column(db.Boolean)

    def serialize(self):
        return self.to_dict()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image_path": self.image_path,
            "silhouette": self.silhouette,
            "shipin48hrs": self.shipin48hrs,
            "neckline": self.neckline,
            "strapsleevelayout": self.strapsleevelayout,
            "length": self.length,
            "collection": self.collection,
            "fabric": self.fabric,
            "color": self.color,
            "backstyle": self.backstyle,
            "price": self.price,
            "size_range": self.size_range,
            "tags": self.tags,
            "weddingvenue": self.weddingvenue,
            "season": self.season,
            "embellishments": self.embellishments,
            "features": self.features,
            "has_pockets": self.has_pockets,
            "corset_back": self.corset_back
        }
# Utility
def match_any(field_value, filter_values):
    return any(val.lower() in field_value.lower() for val in filter_values)

# API route with filters
@app.route("/api/dresses")
def get_dresses():
    query = db.session.query(WeddingDress)

    # 👇 Log the raw price filters
    price_ranges = request.args.getlist('price')
    print("Received price ranges:", price_ranges)

    price_conditions = []

    for range_str in price_ranges:
        print("Processing range:", range_str)  # 👈 add this
        if '+' in range_str:
            try:
                min_price = int(range_str.replace('+', ''))
                price_conditions.append(WeddingDress.price >= min_price)
            except ValueError as e:
                print("Error parsing + range:", e)
        else:
            try:
                min_str, max_str = range_str.split('-')
                min_price = int(min_str)
                max_price = int(max_str)
                price_conditions.append(WeddingDress.price.between(min_price, max_price))
            except ValueError as e:
                print("Error parsing range:", range_str, e)

    if price_conditions:
        query = query.filter(or_(*price_conditions))

    results = query.all()
    serialized = [dress.serialize() for dress in results]
    return jsonify(serialized)



if __name__ == "__main__":
    print(f"🌐 Using DB at {db_path}")
    app.run(debug=True, host="0.0.0.0", port=5050)
