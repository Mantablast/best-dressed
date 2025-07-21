import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Create Flask app and config
app = Flask(__name__, instance_relative_config=True)

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "instance", "dresses.db")

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Define model
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

# Route to get all dresses
@app.route("/api/dresses")
def get_dresses():
    dresses = WeddingDress.query.all()
    print(f"🔍 Found {len(dresses)} dresses in DB at: {db_path}")

    return jsonify([
        {
            "id": d.id,
            "name": d.name,
            "image_path": d.image_path,
            "silhouette": d.silhouette,
            "shipin48hrs": d.shipin48hrs,
            "neckline": d.neckline,
            "strapsleevelayout": d.strapsleevelayout,
            "length": d.length,
            "collection": d.collection,
            "fabric": d.fabric,
            "color": d.color,
            "backstyle": d.backstyle,
            "price": d.price,
            "size_range": d.size_range,
            "tags": d.tags,
            "weddingvenue": d.weddingvenue,
            "season": d.season,
            "embellishments": d.embellishments,
            "features": d.features,
            "has_pockets": d.has_pockets,
            "corset_back": d.corset_back
        }
        for d in dresses
    ])

# Run the app
if __name__ == "__main__":
    print(f"🌐 Using database at: {db_path}")
    app.run(debug=True, host="0.0.0.0", port=5050)
