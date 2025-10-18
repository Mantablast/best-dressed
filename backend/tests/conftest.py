import os
import sys
from pathlib import Path

import pytest

os.environ.setdefault("ENABLE_DYNAMIC_SCORING", "true")

backend_root = Path(__file__).resolve().parents[1]
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app import app as flask_app, db  # noqa: E402  (import after env setup)


@pytest.fixture()
def app():
    flask_app.config.update(
        {
            "TESTING": True,
        }
    )
    with flask_app.app_context():
        yield flask_app


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def session(app):
    yield db.session
