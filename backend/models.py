from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class WeddingDress(db.Model):
    __tablename__ = 'wedding_dresses'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    silhouette = db.Column(db.String(50))
    neckline = db.Column(db.String(50))
    fabric = db.Column(db.String(50))
    color = db.Column(db.String(50))
    has_pockets = db.Column(db.Boolean, default=False)
    corset_back = db.Column(db.Boolean, default=False)
    price = db.Column(db.Integer)
    size_range = db.Column(db.String(20))

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "silhouette": self.silhouette,
            "neckline": self.neckline,
            "fabric": self.fabric,
            "color": self.color,
            "has_pockets": self.has_pockets,
            "corset_back": self.corset_back,
            "price": self.price,
            "size_range": self.size_range,
        }
