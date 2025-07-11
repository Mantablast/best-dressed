from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ARRAY

db = SQLAlchemy()

class WeddingDress(db.Model):
    __tablename__ = 'wedding_dresses'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    silhouette = db.Column(db.String)
    shipin48hrs = db.Column(db.Boolean)
    neckline = db.Column(db.String)
    strapsleevelayout = db.Column(db.String)
    length = db.Column(db.String)
    collection = db.Column(db.String)
    fabric = db.Column(db.String)
    color = db.Column(db.String)
    backstyle = db.Column(db.String)
    price = db.Column(db.Integer)
    size_range = db.Column(db.String)
    tags = db.Column(ARRAY(db.String))
    weddingvenue = db.Column(ARRAY(db.String))
    season = db.Column(db.String)
    embellishments = db.Column(ARRAY(db.String))
    features = db.Column(ARRAY(db.String))
    has_pockets = db.Column(db.Boolean)
    corset_back = db.Column(db.Boolean)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
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
            "corset_back": self.corset_back,
        }
