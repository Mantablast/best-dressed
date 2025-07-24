import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

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
    query = WeddingDress.query

    # Handle multi-select filters
    multi_filters = {
        "color": request.args.get("color", "").split(",") if request.args.get("color") else [],
        "silhouette": request.args.get("silhouette", "").split(",") if request.args.get("silhouette") else [],
        "neckline": request.args.get("neckline", "").split(",") if request.args.get("neckline") else [],
        "length": request.args.get("length", "").split(",") if request.args.get("length") else [],
        "fabric": request.args.get("fabric", "").split(",") if request.args.get("fabric") else [],
        "backstyle": request.args.get("backstyle", "").split(",") if request.args.get("backstyle") else [],
        "collection": request.args.get("collection", "").split(",") if request.args.get("collection") else [],
        "season": request.args.get("season", "").split(",") if request.args.get("season") else [],
        "strapsleevelayout": request.args.get("strapsleevelayout", "").split(",") if request.args.get(
            "strapsleevelayout") else [],
    }

    for field, values in multi_filters.items():
        if values:
            query = query.filter(getattr(WeddingDress, field).in_(values))

    # Handle boolean filters
    bool_fields = ["has_pockets", "corset_back", "shipin48hrs"]
    for field in bool_fields:
        val = request.args.get(field)
        if val == "true":
            query = query.filter(getattr(WeddingDress, field).is_(True))
        elif val == "false":
            query = query.filter(getattr(WeddingDress, field).is_(False))

    # Handle price range
    price_min = request.args.get("priceMin")
    price_max = request.args.get("priceMax")
    if price_min:
        query = query.filter(WeddingDress.price >= float(price_min))
    if price_max:
        query = query.filter(WeddingDress.price <= float(price_max))

    dresses = query.all()

    return jsonify([dress.to_dict() for dress in dresses])

if __name__ == "__main__":
    print(f"🌐 Using DB at {db_path}")
    app.run(debug=True, host="0.0.0.0", port=5050)
