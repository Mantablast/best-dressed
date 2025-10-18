import math
import os
import time
from collections import deque
from typing import Any, Dict, Iterable, List, Optional, Tuple
import statistics

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
import sqlalchemy as sa

# App setup
app = Flask(__name__, instance_relative_config=True)
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "instance", "dresses.db")

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

ENABLE_DYNAMIC_SCORING = str(os.getenv("ENABLE_DYNAMIC_SCORING", "true")).lower() in {
    "1",
    "true",
    "yes",
    "on",
}
DEFAULT_LIMIT = int(os.getenv("DYNAMIC_SCORING_DEFAULT_LIMIT", 24))
MAX_LIMIT = int(os.getenv("DYNAMIC_SCORING_MAX_LIMIT", 48))
SECTION_DOMINANCE_BASE = float(os.getenv("DYNAMIC_SCORING_SECTION_BASE", 5.0))
VALUE_DECAY = float(os.getenv("DYNAMIC_SCORING_VALUE_DECAY", 0.65))

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

    def serialize(self) -> Dict[str, Any]:
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
            "corset_back": self.corset_back,
        }


SECTION_META: Dict[str, Dict[str, Any]] = {
    "color": {"type": "scalar", "column": WeddingDress.color, "attr": "color"},
    "silhouette": {"type": "scalar", "column": WeddingDress.silhouette, "attr": "silhouette"},
    "neckline": {"type": "scalar", "column": WeddingDress.neckline, "attr": "neckline"},
    "length": {"type": "scalar", "column": WeddingDress.length, "attr": "length"},
    "fabric": {"type": "scalar", "column": WeddingDress.fabric, "attr": "fabric"},
    "backstyle": {"type": "scalar", "column": WeddingDress.backstyle, "attr": "backstyle"},
    "collection": {"type": "scalar", "column": WeddingDress.collection, "attr": "collection"},
    "season": {"type": "scalar", "column": WeddingDress.season, "attr": "season"},
    "tags": {"type": "array", "column": WeddingDress.tags, "attr": "tags"},
    "embellishments": {"type": "array", "column": WeddingDress.embellishments, "attr": "embellishments"},
    "features": {"type": "array", "column": WeddingDress.features, "attr": "features"},
    "weddingvenue": {"type": "array", "column": WeddingDress.weddingvenue, "attr": "weddingvenue"},
    "has_pockets": {"type": "boolean", "column": WeddingDress.has_pockets, "attr": "has_pockets"},
    "corset_back": {"type": "boolean", "column": WeddingDress.corset_back, "attr": "corset_back"},
    "shipin48hrs": {"type": "boolean", "column": WeddingDress.shipin48hrs, "attr": "shipin48hrs"},
    "price": {"type": "price_bucket", "column": WeddingDress.price, "attr": "price"},
}
VALID_SECTION_KEYS = set(SECTION_META.keys())

_INDEX_STATEMENTS: Tuple[str, ...] = (
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_color ON wedding_dresses (color)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_silhouette ON wedding_dresses (silhouette)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_neckline ON wedding_dresses (neckline)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_length ON wedding_dresses (length)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_fabric ON wedding_dresses (fabric)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_backstyle ON wedding_dresses (backstyle)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_collection ON wedding_dresses (collection)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_season ON wedding_dresses (season)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_price ON wedding_dresses (price)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_ship48 ON wedding_dresses (shipin48hrs)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_pockets ON wedding_dresses (has_pockets)",
    "CREATE INDEX IF NOT EXISTS idx_wedding_dresses_corset ON wedding_dresses (corset_back)",
)


class LatencyTracker:
    def __init__(self, window: int = 200) -> None:
        self.samples: deque[float] = deque(maxlen=window)
        self.count = 0

    def record(self, duration_ms: float) -> Dict[str, float]:
        self.samples.append(duration_ms)
        self.count += 1
        payload: Dict[str, float] = {"samples": float(len(self.samples)), "duration_ms": duration_ms}
        if len(self.samples) >= 10:
            sorted_samples = sorted(self.samples)
            index = max(0, math.ceil(0.95 * len(sorted_samples)) - 1)
            payload["p95_ms"] = sorted_samples[index]
        return payload


LATENCY_TRACKER = LatencyTracker()


def ensure_indexes() -> None:
    try:
        engine = db.engine
    except sa.exc.SQLAlchemyError as exc:  # pragma: no cover - defensive
        app.logger.warning("Unable to acquire engine for index creation: %s", exc)
        return

    with engine.begin() as connection:
        for statement in _INDEX_STATEMENTS:
            try:
                connection.execute(sa.text(statement))
            except sa.exc.DBAPIError as exc:  # pragma: no cover - missing table / sqlite quirks
                app.logger.info("Skipping index creation for statement %s: %s", statement, exc)
        try:
            connection.execute(sa.text("ANALYZE wedding_dresses"))
        except sa.exc.DBAPIError as exc:  # pragma: no cover - sqlite ANALYZE may be disabled
            app.logger.info("ANALYZE wedding_dresses skipped: %s", exc)


def _normalize_section_key(raw: Any) -> Optional[str]:
    if not isinstance(raw, str):
        return None
    key = raw.strip().lower()
    if key in VALID_SECTION_KEYS:
        return key
    return None


def _normalize_value(raw: Any) -> Optional[str]:
    if raw is None:
        return None
    if isinstance(raw, bool):
        return "true" if raw else "false"
    text = str(raw).strip()
    if not text:
        return None
    return text.lower()


def _as_bool(raw: Any) -> bool:
    if isinstance(raw, bool):
        return raw
    if isinstance(raw, str):
        return raw.strip().lower() in {"1", "true", "yes", "on"}
    return bool(raw)


def price_bucket(value: Optional[float]) -> Optional[str]:
    if value is None:
        return None
    try:
        price = float(value)
    except (TypeError, ValueError):
        return None
    if price < 500:
        return "0-500"
    if price < 1000:
        return "500-1000"
    if price < 1500:
        return "1000-1500"
    if price < 2000:
        return "1500-2000"
    return "2000+"


def canonical_section_weight(total_sections: int, index: int) -> float:
    dominance_power = total_sections - index - 1
    return math.pow(SECTION_DOMINANCE_BASE, dominance_power)


def canonical_value_weight(rank: int) -> float:
    return math.pow(VALUE_DECAY, rank)


def _resolve_priority_weights(payload: Dict[str, Any]) -> Tuple[Dict[str, Dict[str, Any]], Optional[str]]:
    weights_payload = payload.get("weights")
    priority_payload = payload.get("priority")

    resolved: Dict[str, Dict[str, Any]] = {}
    source: Optional[str] = None

    if isinstance(weights_payload, dict) and weights_payload:
        for raw_section, spec in weights_payload.items():
            section = _normalize_section_key(raw_section)
            if not section or not isinstance(spec, dict):
                continue
            section_weight = spec.get("section", 0)
            try:
                section_weight = float(section_weight)
            except (TypeError, ValueError):
                section_weight = 0.0
            value_map: Dict[str, float] = {}
            raw_values = spec.get("values") or {}
            if isinstance(raw_values, dict):
                for raw_value, raw_weight in raw_values.items():
                    value = _normalize_value(raw_value)
                    if not value:
                        continue
                    try:
                        numeric_weight = float(raw_weight)
                    except (TypeError, ValueError):
                        continue
                    value_map[value] = numeric_weight
            resolved[section] = {"section": max(section_weight, 0.0), "values": value_map}
        source = "weights"

    elif isinstance(priority_payload, dict) and priority_payload:
        sections = priority_payload.get("sections") or []
        values_map = priority_payload.get("values") or {}
        normalized_sections: List[str] = []
        for item in sections:
            section = _normalize_section_key(item)
            if section and section not in normalized_sections:
                normalized_sections.append(section)

        total = len(normalized_sections)
        for idx, section in enumerate(normalized_sections):
            section_weight = canonical_section_weight(total, idx)
            raw_items = values_map.get(section) or values_map.get(section.lower()) or []
            normalized_values: Dict[str, float] = {}
            if isinstance(raw_items, (list, tuple, set)):
                for j, raw_value in enumerate(raw_items):
                    normalized = _normalize_value(raw_value)
                    if not normalized:
                        continue
                    normalized_values[normalized] = canonical_value_weight(j)
            resolved[section] = {"section": section_weight, "values": normalized_values}
        if resolved:
            source = "priority"

    return resolved, source


def _extract_section_tokens(dress: WeddingDress, section_key: str) -> List[str]:
    meta = SECTION_META.get(section_key, {})
    attribute = meta.get("attr")
    section_type = meta.get("type")
    if not attribute or not section_type:
        return []
    value = getattr(dress, attribute, None)

    if section_type == "scalar":
        normalized = _normalize_value(value)
        return [normalized] if normalized else []

    if section_type == "array":
        if not value:
            return []
        tokens: List[str] = []
        for item in value:
            normalized = _normalize_value(item)
            if normalized:
                tokens.append(normalized)
        return tokens

    if section_type == "boolean":
        return [_normalize_value(bool(value))]

    if section_type == "price_bucket":
        normalized = _normalize_value(price_bucket(value))
        return [normalized] if normalized else []

    return []


def _score_dress(dress: WeddingDress, weights: Dict[str, Dict[str, Any]], debug: bool = False) -> Dict[str, Any]:
    total_score = 0.0
    debug_details: Dict[str, Any] = {}

    for section_key, spec in weights.items():
        meta = SECTION_META.get(section_key)
        if not meta:
            continue

        section_weight = float(spec.get("section", 0.0))
        value_weights = spec.get("values") or {}
        tokens = _extract_section_tokens(dress, section_key)

        if not tokens or (section_weight <= 0 and not value_weights):
            continue

        section_score = 0.0
        matches: List[Dict[str, Any]] = []

        if not value_weights:
            section_score = section_weight
            if debug:
                matches.append({"value": None, "weight": section_weight})
        elif meta["type"] == "array":
            running_total = 0.0
            for token in tokens:
                weight = float(value_weights.get(token, 0.0))
                if weight > 0:
                    running_total += weight
                    if debug:
                        matches.append({"value": token, "weight": weight})
            section_score = section_weight * running_total
        else:
            best_value: Optional[str] = None
            best_weight = 0.0
            for token in tokens:
                weight = float(value_weights.get(token, 0.0))
                if weight > best_weight:
                    best_weight = weight
                    best_value = token
            section_score = section_weight * best_weight
            if debug and best_value:
                matches.append({"value": best_value, "weight": best_weight})

        total_score += section_score
        if debug and matches:
            debug_details[section_key] = {
                "section_weight": section_weight,
                "section_type": meta.get("type"),
                "matches": matches,
                "section_score": section_score,
            }

    serialized = dress.serialize()
    serialized["score"] = round(total_score, 6)
    if debug and debug_details:
        serialized["_debug"] = debug_details
    return serialized


def _build_filter_conditions(filters: Dict[str, Any]) -> List[Any]:
    or_conditions: List[Any] = []

    if not isinstance(filters, dict):
        return or_conditions

    for key, meta in SECTION_META.items():
        column = meta.get("column")
        section_type = meta.get("type")
        if not column or section_type == "price_bucket":
            continue

        raw_value = filters.get(key)
        if raw_value is None:
            continue

        values: Iterable[Any]
        if isinstance(raw_value, (list, tuple, set)):
            values = raw_value
        else:
            values = [raw_value]

        if section_type == "boolean":
            for value in values:
                normalized = _normalize_value(value)
                if normalized == "true":
                    or_conditions.append(column.is_(True))
                elif normalized == "false":
                    or_conditions.append(column.is_(False))
            continue

        if section_type == "array":
            for value in values:
                if isinstance(value, str) and value.strip():
                    or_conditions.append(column.contains([value]))
            continue

        sanitized = [value for value in values if isinstance(value, str) and value.strip()]
        for value in sanitized:
            or_conditions.append(column == value)

    price_ranges = filters.get("price")
    if price_ranges:
        if not isinstance(price_ranges, (list, tuple, set)):
            price_ranges = [price_ranges]
        for range_str in price_ranges:
            if not isinstance(range_str, str):
                continue
            if "+" in range_str:
                try:
                    min_price = float(range_str.replace("+", ""))
                    or_conditions.append(WeddingDress.price >= min_price)
                except ValueError:
                    continue
            else:
                try:
                    min_str, max_str = range_str.split("-")
                    min_price = float(min_str)
                    max_price = float(max_str)
                    or_conditions.append(WeddingDress.price.between(min_price, max_price))
                except ValueError:
                    continue

    price_min = filters.get("priceMin")
    price_max = filters.get("priceMax")
    if isinstance(price_min, (int, float)):
        or_conditions.append(WeddingDress.price >= float(price_min))
    if isinstance(price_max, (int, float)):
        or_conditions.append(WeddingDress.price <= float(price_max))

    return or_conditions


def _paginate(items: List[Dict[str, Any]], limit: int, offset: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    total = len(items)
    limit = max(1, min(limit, MAX_LIMIT))
    offset = max(0, offset)
    page = items[offset : offset + limit]
    page_info = {
        "limit": limit,
        "offset": offset,
        "returned": len(page),
        "total": total,
        "hasNextPage": offset + len(page) < total,
        "hasPrevPage": offset > 0,
    }
    return page, page_info


def _parse_pagination(payload: Dict[str, Any]) -> Tuple[int, int]:
    if not isinstance(payload, dict):
        return DEFAULT_LIMIT, 0
    raw_limit = payload.get("limit", DEFAULT_LIMIT)
    raw_offset = payload.get("offset", 0)
    try:
        limit = int(raw_limit)
    except (TypeError, ValueError):
        limit = DEFAULT_LIMIT
    try:
        offset = int(raw_offset)
    except (TypeError, ValueError):
        offset = 0
    return limit, offset


def _legacy_get_dresses() -> List[Dict[str, Any]]:
    or_conditions: List[Any] = []

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
        for value in values:
            if value:
                or_conditions.append(column == value)

    if request.args.get("shipin48hrs") == "true":
        or_conditions.append(WeddingDress.shipin48hrs.is_(True))
    if request.args.get("has_pockets") == "true":
        or_conditions.append(WeddingDress.has_pockets.is_(True))
    if request.args.get("corset_back") == "true":
        or_conditions.append(WeddingDress.corset_back.is_(True))

    list_fields = {
        "tags": WeddingDress.tags,
        "embellishments": WeddingDress.embellishments,
        "features": WeddingDress.features,
    }
    for key, column in list_fields.items():
        values = request.args.getlist(key)
        for value in values:
            if value:
                or_conditions.append(column.contains([value]))

    price_ranges = request.args.getlist("price")
    for range_str in price_ranges:
        if "+" in range_str:
            try:
                min_price = float(range_str.replace("+", ""))
                or_conditions.append(WeddingDress.price >= min_price)
            except ValueError:
                continue
        else:
            try:
                min_str, max_str = range_str.split("-")
                min_price = float(min_str)
                max_price = float(max_str)
                or_conditions.append(WeddingDress.price.between(min_price, max_price))
            except ValueError:
                continue

    query = db.session.query(WeddingDress)
    if or_conditions:
        query = query.filter(or_(*or_conditions))
    results = query.all()
    return [dress.serialize() for dress in results]


def _filters_from_query_params() -> Dict[str, Any]:
    filters: Dict[str, Any] = {}
    args = request.args

    for key in VALID_SECTION_KEYS:
        values = args.getlist(key)
        if values:
            filters[key] = values

    for key in ("shipin48hrs", "has_pockets", "corset_back"):
        value = args.get(key)
        if value is not None:
            filters[key] = value

    price_values = args.getlist("price")
    if price_values:
        filters["price"] = price_values

    price_min = args.get("priceMin")
    price_max = args.get("priceMax")
    try:
        if price_min is not None:
            filters["priceMin"] = float(price_min)
    except ValueError:
        pass
    try:
        if price_max is not None:
            filters["priceMax"] = float(price_max)
    except ValueError:
        pass

    return filters


def _pagination_from_query_params() -> Dict[str, Any]:
    args = request.args
    pagination: Dict[str, Any] = {}
    if "limit" in args:
        pagination["limit"] = args.get("limit")
    if "offset" in args:
        pagination["offset"] = args.get("offset")
    return pagination


@app.route("/api/dresses", methods=["GET", "POST"])
def dresses() -> Any:
    if request.method == "GET" and not ENABLE_DYNAMIC_SCORING:
        dresses_payload = _legacy_get_dresses()
        return jsonify(dresses_payload)

    payload = request.get_json(silent=True) or {}
    filters = payload.get("filters") or {}
    pagination = payload.get("page") or payload.get("pagination") or {}
    debug = _as_bool(payload.get("debug"))
    if not debug:
        debug = _as_bool(request.args.get("debug"))

    if request.method == "GET":
        query_filters = _filters_from_query_params()
        if query_filters:
            if not filters:
                filters = query_filters
            else:
                merged = dict(query_filters)
                merged.update(filters)
                filters = merged
        if not pagination:
            pagination = _pagination_from_query_params()

    weights, source = _resolve_priority_weights(payload)
    if not weights:
        weights = {}

    or_conditions = _build_filter_conditions(filters)

    query = db.session.query(WeddingDress)
    if or_conditions:
        query = query.filter(or_(*or_conditions))
    dresses = query.all()

    start = time.perf_counter()
    scored = [_score_dress(dress, weights, debug=bool(debug)) for dress in dresses]
    scored.sort(key=lambda item: (-item.get("score", 0), item.get("price", 0) or 0, item.get("name") or ""))
    duration_ms = (time.perf_counter() - start) * 1000.0

    score_values = [item.get("score", 0.0) for item in scored if isinstance(item.get("score"), (int, float))]
    score_stats: Optional[Dict[str, float]] = None
    if score_values:
        score_stats = {
            "count": float(len(score_values)),
            "min": min(score_values),
            "median": statistics.median(score_values),
            "max": max(score_values),
        }
        app.logger.debug(
            "dynamic_scoring_scores count=%d min=%.3f median=%.3f max=%.3f",
            int(score_stats["count"]),
            score_stats["min"],
            score_stats["median"],
            score_stats["max"],
        )

    limit, offset = _parse_pagination(pagination)
    page_items, page_info = _paginate(scored, limit, offset)

    telemetry = LATENCY_TRACKER.record(duration_ms)
    if "p95_ms" in telemetry:
        app.logger.info(
            "dynamic_scoring_request duration_ms=%.2f p95_ms=%.2f samples=%d",
            telemetry["duration_ms"],
            telemetry["p95_ms"],
            int(telemetry["samples"]),
        )
    else:
        app.logger.info(
            "dynamic_scoring_request duration_ms=%.2f samples=%d",
            telemetry["duration_ms"],
            int(telemetry["samples"]),
        )

    response: Dict[str, Any] = {
        "items": page_items,
        "total_count": len(scored),
        "pageInfo": page_info,
    }

    if debug:
        response["debug"] = {
            "weights_source": source,
            "weights": weights,
            "filters": filters,
            "duration_ms": round(duration_ms, 3),
        }
        if score_stats:
            response["debug"]["score_stats"] = score_stats

    return jsonify(response)


with app.app_context():
    ensure_indexes()


if __name__ == "__main__":
    print(f"🌐 Using DB at {db_path}")
    print(f"ENABLE_DYNAMIC_SCORING={ENABLE_DYNAMIC_SCORING}")
    app.run(debug=True, host="0.0.0.0", port=5050)
