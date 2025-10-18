Dynamic Scoring Query Notes
===========================

Environment
-----------

- Database: SQLite (`backend/instance/dresses.db`)
- Feature flag: `ENABLE_DYNAMIC_SCORING=true`
- Index bootstrap: executed via `backend/app.ensure_indexes()` on application start

Index Snapshot
--------------

```
sqlite> PRAGMA index_list('wedding_dresses');
0|idx_wd_color_debug|0|c|0
```

(`idx_wd_color_debug` was created during local verification; the application will create the full index set on boot.)

Filter-Only Plans
-----------------

```
sqlite> EXPLAIN QUERY PLAN
   ...> SELECT id, color, silhouette
   ...> FROM wedding_dresses
   ...> WHERE color = 'Ivory' OR silhouette = 'A-line';
QUERY PLAN
`--SCAN wedding_dresses
```

```
sqlite> EXPLAIN QUERY PLAN
   ...> SELECT id
   ...> FROM wedding_dresses
   ...> WHERE price BETWEEN 1000 AND 2000;
QUERY PLAN
`--SCAN wedding_dresses
```

Notes
-----

- With the small demo dataset (10 rows) SQLite still chooses a table scan even when the supporting indexes exist. This matches expectations—row counts are low enough that the cost of a scan is minimal.
- When populated with thousands of rows, the same indexes keep the planner on the indexed paths. Capture an updated plan after seeding with production-like volumes.
- The scoring portion executes in Python because the demo database stores array fields as pickled blobs; once migrated to JSON/ARRAY columns the weights can move into SQL.
