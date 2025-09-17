import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import or_
from sqlalchemy import create_engine

DATABASE_URL = os.environ.get("DATABASE_URL")
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGIN}})
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

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

    # Collect all OR conditions for all filters
    or_conditions = []

    # Standard string filters
    multi_filters = {
        "color": WeddingDress.color,
        "silhouette": WeddingDress.silhouette,
        "neckline": WeddingDress.neckline,
        "length": WeddingDress.length,
        "fabric": WeddingDress.fabric,
        "backstyle": WeddingDress.backstyle,
        "collection": WeddingDress.collection,
        "season": WeddingDress.season,
    }
    for key, column in multi_filters.items():
        values = request.args.getlist(key)
        if values:
            or_conditions.extend([column.in_([val]) for val in values])

    # Boolean filters (as strings like "true")
    if request.args.get("shipin48hrs") == "true":
        or_conditions.append(WeddingDress.shipin48hrs.is_(True))
    if request.args.get("has_pockets") == "true":
        or_conditions.append(WeddingDress.has_pockets.is_(True))
    if request.args.get("corset_back") == "true":
        or_conditions.append(WeddingDress.corset_back.is_(True))

    # Tags, Embellishments, Features (stored as PickleType → list)
    list_fields = {
        "tags": WeddingDress.tags,
        "embellishments": WeddingDress.embellishments,
        "features": WeddingDress.features,
    }
    for key, column in list_fields.items():
        values = request.args.getlist(key)
        if values:
            or_conditions.extend([column.contains([val]) for val in values])

    # Price ranges
    price_ranges = request.args.getlist("price")
    for range_str in price_ranges:
        if "+" in range_str:
            try:
                min_price = int(range_str.replace("+", ""))
                or_conditions.append(WeddingDress.price >= min_price)
            except ValueError:
                pass
        else:
            try:
                min_str, max_str = range_str.split("-")
                min_price = int(min_str)
                max_price = int(max_str)
                or_conditions.append(WeddingDress.price.between(min_price, max_price))
            except ValueError:
                pass

    # If no filters, return all dresses
    if not or_conditions:
        results = db.session.query(WeddingDress).all()
    else:
        results = db.session.query(WeddingDress).filter(or_(*or_conditions)).all()

    serialized = [dress.serialize() for dress in results]
    print("Received color filters:", request.args.getlist("color"))
    return jsonify(serialized)




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5050)))
