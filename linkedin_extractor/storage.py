"""
Storage Manager — saves posts to SQLite, CSV, JSON (timestamped + posts.json for dashboard).
"""
import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

import pandas as pd

from config import OUTPUT_DIR

DB_PATH = os.path.join(OUTPUT_DIR, "linkedin_posts.db")
# This file is what the Next.js /api/posts route reads
POSTS_JSON = os.path.join(OUTPUT_DIR, "posts.json")


def _init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            post_url TEXT PRIMARY KEY,
            author_name TEXT,
            author_profile_url TEXT,
            post_text TEXT,
            date_posted TEXT,
            date_posted_raw TEXT,
            likes_count INTEGER,
            comments_count INTEGER,
            reposts_count INTEGER,
            matched_keywords TEXT,
            post_type TEXT,
            scraped_at TEXT
        )
    ''')
    conn.commit()
    conn.close()


def _normalize(post):
    """Normalise field names — handles both scraper versions."""
    return {
        "post_url": post.get("post_url", ""),
        "author_name": post.get("author_name", ""),
        "author_profile_url": post.get("author_profile_url", ""),
        "post_text": post.get("post_text", ""),
        "date_posted": post.get("date_posted", ""),
        "date_posted_raw": post.get("date_posted_raw", post.get("date_posted", "")),
        "likes_count": int(post.get("likes_count", post.get("likes", 0)) or 0),
        "comments_count": int(post.get("comments_count", post.get("comments", 0)) or 0),
        "reposts_count": int(post.get("reposts_count", post.get("reposts", 0)) or 0),
        "matched_keywords": post.get("matched_keywords", []),
        "post_type": post.get("post_type", "original"),
        "scraped_at": post.get("scraped_at", datetime.now().isoformat()),
    }


class StorageManager:
    def save_timestamped_only(self, posts_data):
        """Save posts to timestamped files and database only, don't overwrite posts.json"""
        if not posts_data:
            print("[STORAGE] No posts to save.")
            return {"csv_path": "", "json_path": "", "database_path": DB_PATH}

        os.makedirs(OUTPUT_DIR, exist_ok=True)
        normalized = [_normalize(p) for p in posts_data]

        # SQLite (deduplicated)
        _init_db()
        conn = sqlite3.connect(DB_PATH)
        new_count = 0
        for p in normalized:
            try:
                conn.execute('''
                    INSERT INTO posts (post_url, author_name, author_profile_url,
                                     post_text, date_posted, date_posted_raw,
                                     likes_count, comments_count, reposts_count,
                                     matched_keywords, post_type, scraped_at) 
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
                ''', (
                    p["post_url"], p["author_name"], p["author_profile_url"],
                    p["post_text"], p["date_posted"], p["date_posted_raw"],
                    p["likes_count"], p["comments_count"], p["reposts_count"],
                    json.dumps(p["matched_keywords"]), p["post_type"], p["scraped_at"]
                ))
                new_count += 1
            except sqlite3.IntegrityError:
                pass  # duplicate
        conn.commit()
        conn.close()
        print(f"[STORAGE] {new_count} new posts stored in SQLite (deduplicated).")

        # Timestamped files only
        ts = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        df = pd.DataFrame(normalized)
        csv_path = os.path.join(OUTPUT_DIR, f"posts_{ts}.csv")
        json_path = os.path.join(OUTPUT_DIR, f"posts_{ts}.json")
        df.to_csv(csv_path, index=False, encoding="utf-8")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(normalized, f, indent=2, ensure_ascii=False)

        print(f"[STORAGE] CSV: {csv_path}")
        print(f"[STORAGE] JSON: {json_path}")
        print(f"[STORAGE] posts.json left unchanged (real-time updates)")

        return {
            "csv_path": csv_path,
            "json_path": json_path,
            "database_path": DB_PATH,
        }

    def save_all(self, posts_data):
        if not posts_data:
            print("[STORAGE] No posts to save.")
            return {"csv_path": "", "json_path": "", "database_path": DB_PATH}

        os.makedirs(OUTPUT_DIR, exist_ok=True)
        normalized = [_normalize(p) for p in posts_data]

        # SQLite (deduplicated)
        _init_db()
        conn = sqlite3.connect(DB_PATH)
        new_count = 0
        for p in normalized:
            try:
                conn.execute('''
                    INSERT INTO posts (post_url, author_name, author_profile_url,
                                     post_text, date_posted, date_posted_raw,
                                     likes_count, comments_count, reposts_count,
                                     matched_keywords, post_type, scraped_at) 
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
                ''', (
                    p["post_url"], p["author_name"], p["author_profile_url"],
                    p["post_text"], p["date_posted"], p["date_posted_raw"],
                    p["likes_count"], p["comments_count"], p["reposts_count"],
                    json.dumps(p["matched_keywords"]), p["post_type"], p["scraped_at"]
                ))
                new_count += 1
            except sqlite3.IntegrityError:
                pass  # duplicate
        conn.commit()
        conn.close()
        print(f"[STORAGE] {new_count} new posts stored in SQLite (deduplicated).")

        # Timestamped files
        ts = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        df = pd.DataFrame(normalized)
        csv_path = os.path.join(OUTPUT_DIR, f"posts_{ts}.csv")
        json_path = os.path.join(OUTPUT_DIR, f"posts_{ts}.json")
        df.to_csv(csv_path, index=False, encoding="utf-8")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(normalized, f, indent=2, ensure_ascii=False)

        # ✅ posts.json — non-timestamped file; Next.js /api/posts reads this
        self._write_dashboard_json(normalized)

        print(f"[STORAGE] CSV: {csv_path}")
        print(f"[STORAGE] JSON: {json_path}")
        print(f"[STORAGE] Dashboard JSON updated: {POSTS_JSON}")

        return {
            "csv_path": csv_path,
            "json_path": json_path,
            "database_path": DB_PATH,
        }

    def _write_dashboard_json(self, new_posts):
        """Merge new posts into posts.json for the Next.js dashboard."""
        existing = []
        if os.path.exists(POSTS_JSON):
            try:
                with open(POSTS_JSON, "r", encoding="utf-8") as f:
                    existing = json.load(f)
                    if not isinstance(existing, list):
                        existing = []
            except Exception:
                existing = []

        existing_urls = {p.get("post_url") for p in existing}
        added = [p for p in new_posts if p["post_url"] not in existing_urls]
        merged = existing + added

        with open(POSTS_JSON, "w", encoding="utf-8") as f:
            json.dump(merged, f, indent=2, ensure_ascii=False)
        print(f"[STORAGE] posts.json: {len(merged)} total posts ({len(added)} new).")

    def get_stats(self):
        """Return summary stats for logging."""
        try:
            conn = sqlite3.connect(DB_PATH)
            df = pd.read_sql("SELECT * FROM posts", conn)
            conn.close()
            return {
                "total_posts": len(df),
                "total_engagement": {
                    "likes": int(df["likes_count"].sum()),
                    "comments": int(df["comments_count"].sum()),
                    "reposts": int(df["reposts_count"].sum()),
                },
                "top_authors": df["author_name"].value_counts().head(5).to_dict(),
            }
        except Exception:
            return {
                "total_posts": 0,
                "total_engagement": {"likes": 0, "comments": 0, "reposts": 0},
                "top_authors": {},
            }
