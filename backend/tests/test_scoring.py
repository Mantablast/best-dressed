from typing import Dict

import pytest

from app import _resolve_priority_weights, WeddingDress

# Verifies that priority sections yield higher weights for earlier sections and values.
def test_priority_weight_derivation_orders_sections():
    payload = {
        "priority": {
            "sections": ["Color", "Fabric"],
            "values": {
                "color": ["Ivory", "Black"],
                "fabric": ["Lace"],
            },
        }
    }

    weights, source = _resolve_priority_weights(payload)

    assert source == "priority"
    assert "color" in weights and "fabric" in weights
    assert weights["color"]["section"] > weights["fabric"]["section"]
    assert weights["color"]["values"]["ivory"] == pytest.approx(1.0)
    assert weights["color"]["values"]["black"] < weights["color"]["values"]["ivory"]
    assert weights["fabric"]["values"]["lace"] == pytest.approx(1.0)


def _score_map(response_json: Dict) -> Dict[int, Dict]:
    items = response_json.get("items") or []
    return {int(item["id"]): item for item in items}

# Ensures dresses matching top-priority section/value bubble to the top of the results.
def test_api_sorts_by_priority(client):
    payload = {
        "priority": {
            "sections": ["Color", "Silhouette"],
            "values": {
                "color": ["Ivory"],
                "silhouette": ["A-line"],
            },
        }
    }

    response = client.post("/api/dresses", json=payload)
    assert response.status_code == 200

    data = response.get_json()
    assert data["items"], "Expected at least one dress in response"
    top = data["items"][0]
    assert top["color"].lower() == "ivory"
    assert top["silhouette"].lower() == "a-line"

# Confirms adding an extra preferred value never reduces scores for dresses matching existing preferences.
def test_more_preferred_values_do_not_reduce_scores(client, session):
    base_payload = {
        "priority": {
            "sections": ["color"],
            "values": {"color": ["Ivory"]},
        }
    }
    expanded_payload = {
        "priority": {
            "sections": ["color"],
            "values": {"color": ["Ivory", "White"]},
        }
    }

    base_response = client.post("/api/dresses", json=base_payload)
    expanded_response = client.post("/api/dresses", json=expanded_payload)

    assert base_response.status_code == 200
    assert expanded_response.status_code == 200

    base_scores = _score_map(base_response.get_json())
    expanded_scores = _score_map(expanded_response.get_json())

    ivory_ids = [
        dress.id for dress in session.query(WeddingDress).filter(WeddingDress.color == "Ivory").all()
    ]

    for dress_id in ivory_ids:
        assert dress_id in expanded_scores and dress_id in base_scores
        assert expanded_scores[dress_id]["score"] >= base_scores[dress_id]["score"]

# Validates that dresses not matching any preferred values receive lower scores when more preferences are added.
def test_more_preferred_values_reduce_scores_for_non_matching_dresses(client, session):
    base_payload = {
        "priority": {
            "sections": ["color"],
            "values": {"color": ["Ivory"]},
        }
    }
    expanded_payload = {
        "priority": {
            "sections": ["color"],
            "values": {"color": ["Ivory", "Black"]},
        }
    }

    base_response = client.post("/api/dresses", json=base_payload)
    expanded_response = client.post("/api/dresses", json=expanded_payload)

    assert base_response.status_code == 200
    assert expanded_response.status_code == 200

    base_scores = _score_map(base_response.get_json())
    expanded_scores = _score_map(expanded_response.get_json())

    non_matching_ids = [
        dress.id
        for dress in session.query(WeddingDress).filter(WeddingDress.color.notin_(["Ivory", "Black"])).all()
    ]

    for dress_id in non_matching_ids:
        assert dress_id in expanded_scores and dress_id in base_scores
        assert expanded_scores[dress_id]["score"] <= base_scores[dress_id]["score"]

# Ensures that event if lower priority dresses match more preferred values, higher priority dresses still score better.
## In my opinion, this is the most important test to validate priority handling and outlines the key of the entire project :)
def test_priority_overrides_quantity_of_matches(client):
    payload = {
        "priority": {
            "sections": ["Color", "Fabric"],
            "values": {
                "color": ["Ivory"],
                "fabric": ["Satin", "Lace"],
            },
        }
    }

    response = client.post("/api/dresses", json=payload)
    assert response.status_code == 200

    data = response.get_json()
    assert data["items"], "Expected at least one dress in response"

    top_dress = data["items"][0]
    assert top_dress["color"].lower() == "ivory", "Top dress should match highest priority color"