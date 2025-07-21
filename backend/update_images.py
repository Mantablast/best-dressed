# update_images.py
import os
from app import app, db
from models import WeddingDress

IMAGE_FOLDER = 'static/images'

with app.app_context():
    dresses = WeddingDress.query.all()

    for dress in dresses:
        # Construct filename like dress_1.jpg, dress_2.jpg, etc.
        filename = f'{dress.id}.png'
        full_path = os.path.join(IMAGE_FOLDER, filename)

        # If the file actually exists, assign it
        if os.path.exists(full_path):
            dress.image_path = filename
        else:
            print(f"⚠️  No image found for Dress ID {dress.id}: {filename}")

    db.session.commit()
    print("📸 Image filenames assigned!")
