# seed.py
from app import app, db
from models import WeddingDress

dresses = [
    WeddingDress(
        name="Celestial Lace",
        silhouette="A-line",
        neckline="Sweetheart",
        fabric="Lace",
        color="Ivory",
        has_pockets=True,
        corset_back=True,
        price=1500,
        size_range="2-18"
    ),
    WeddingDress(
        name="Midnight Tulle",
        silhouette="Ballgown",
        neckline="Off-the-Shoulder",
        fabric="Tulle",
        color="Champagne",
        has_pockets=False,
        corset_back=True,
        price=2800,
        size_range="4-22"
    ),
    WeddingDress(
        name="Satin Whisper",
        silhouette="Sheath",
        neckline="V-neck",
        fabric="Satin",
        color="White",
        has_pockets=True,
        corset_back=False,
        price=1200,
        size_range="0-12"
    ),
    WeddingDress(
        name="Garden Muse",
        silhouette="Fit-and-Flare",
        neckline="High Neck",
        fabric="Chiffon",
        color="Blush",
        has_pockets=False,
        corset_back=False,
        price=1750,
        size_range="6-16"
    ),
    WeddingDress(
        name="Moonlight Veil",
        silhouette="Mermaid",
        neckline="Halter",
        fabric="Organza",
        color="Ivory",
        has_pockets=False,
        corset_back=True,
        price=3200,
        size_range="2-14"
    ),
    WeddingDress(
        name="Golden Hour",
        silhouette="A-line",
        neckline="Sweetheart",
        fabric="Tulle",
        color="Champagne",
        has_pockets=True,
        corset_back=True,
        price=2500,
        size_range="0-20"
    ),
    WeddingDress(
        name="Whispering Rose",
        silhouette="Ballgown",
        neckline="Sweetheart",
        fabric="Lace",
        color="Blush",
        has_pockets=False,
        corset_back=False,
        price=3100,
        size_range="4-18"
    ),
    WeddingDress(
        name="Ocean Pearl",
        silhouette="Sheath",
        neckline="V-neck",
        fabric="Satin",
        color="White",
        has_pockets=True,
        corset_back=True,
        price=1100,
        size_range="2-10"
    ),
    WeddingDress(
        name="Crystal Breeze",
        silhouette="A-line",
        neckline="Off-the-Shoulder",
        fabric="Organza",
        color="Ivory",
        has_pockets=False,
        corset_back=False,
        price=1400,
        size_range="6-16"
    ),
    WeddingDress(
        name="Twilight Mist",
        silhouette="Fit-and-Flare",
        neckline="High Neck",
        fabric="Chiffon",
        color="White",
        has_pockets=False,
        corset_back=True,
        price=2700,
        size_range="0-14"
    ),
]

with app.app_context():
    db.session.bulk_save_objects(dresses)
    db.session.commit()
    print("🌸 Dresses added to the collection!")
