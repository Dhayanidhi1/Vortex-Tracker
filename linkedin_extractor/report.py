"""
LinkedIn Post Extractor - HTML Report Generator
Creates a visual summary report of collected posts.
"""

import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

from config import OUTPUT_DIR
from storage import StorageManager

logger = logging.getLogger(__name__)


class ReportGenerator:
    """Generates HTML summary reports for collected posts."""
    
    def __init__(self):
        self.storage = StorageManager()
    
    def generate_report(self, posts: List[Dict[str, Any]] = None) -> str:
        """Generate an HTML report summarizing the collected posts."""
        if posts is None:
            posts = self.storage.get_all_posts()
        
        stats = self._calculate_stats(posts)
        
        html = self._build_html_report(stats, posts)
        
        # Save report
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"report_{timestamp}.html"
        filepath = Path(OUTPUT_DIR) / filename
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        
        logger.info(f"Report generated: {filepath}")
        return str(filepath)
    
    def _calculate_stats(self, posts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate statistics from posts."""
        stats = {
            "total_posts": len(posts),
            "total_likes": sum(p.get("likes_count", 0) for p in posts),
            "total_comments": sum(p.get("comments_count", 0) for p in posts),
            "total_reposts": sum(p.get("reposts_count", 0) for p in posts),
            "by_month": {},
            "by_author": {},
            "by_keyword": {},
            "by_type": {},
        }
        
        for post in posts:
            # By month
            date_str = post.get("date_posted", "")
            if date_str:
                try:
                    month = date_str[:7]  # YYYY-MM
                    stats["by_month"][month] = stats["by_month"].get(month, 0) + 1
                except Exception:
                    pass
            
            # By author
            author = post.get("author_name", "Unknown")
            stats["by_author"][author] = stats["by_author"].get(author, 0) + 1
            
            # By keyword
            keywords = post.get("matched_keywords", "")
            if isinstance(keywords, str):
                keywords = [k.strip() for k in keywords.split(",") if k.strip()]
            for kw in keywords:
                stats["by_keyword"][kw] = stats["by_keyword"].get(kw, 0) + 1
            
            # By type
            post_type = post.get("post_type", "unknown")
            stats["by_type"][post_type] = stats["by_type"].get(post_type, 0) + 1
        
        # Sort
        stats["by_author"] = dict(
            sorted(stats["by_author"].items(), key=lambda x: x[1], reverse=True)[:10]
        )
        stats["by_month"] = dict(sorted(stats["by_month"].items()))
        
        return stats
    
    def _build_html_report(self, stats: Dict[str, Any], posts: List[Dict[str, Any]]) -> str:
        """Build the HTML report string."""
        
        # Build monthly chart data
        months = list(stats["by_month"].keys())
        month_counts = list(stats["by_month"].values())
        max_count = max(month_counts) if month_counts else 1
        
        month_bars = ""
        for month, count in stats["by_month"].items():
            height = (count / max_count) * 200
            month_bars += f'''
                <div class="bar-container">
                    <div class="bar" style="height: {height}px;">
                        <span class="bar-value">{count}</span>
                    </div>
                    <span class="bar-label">{month}</span>
                </div>
            '''
        
        # Build author table
        author_rows = ""
        for author, count in list(stats["by_author"].items())[:10]:
            author_rows += f'''
                <tr>
                    <td>{author}</td>
                    <td>{count}</td>
                </tr>
            '''
        
        # Build keyword stats
        keyword_items = ""
        for kw, count in stats["by_keyword"].items():
            keyword_items += f'<span class="keyword-badge">{kw}: {count}</span>'
        
        # Build recent posts
        recent_posts_html = ""
        for post in posts[:20]:
            text = post.get("post_text", "")[:200]
            if len(post.get("post_text", "")) > 200:
                text += "..."
            
            recent_posts_html += f'''
                <div class="post-card">
                    <div class="post-header">
                        <strong>{post.get("author_name", "Unknown")}</strong>
                        <span class="post-date">{post.get("date_posted_raw", "")}</span>
                    </div>
                    <p class="post-text">{text}</p>
                    <div class="post-metrics">
                        <span>👍 {post.get("likes_count", 0)}</span>
                        <span>💬 {post.get("comments_count", 0)}</span>
                        <span>🔄 {post.get("reposts_count", 0)}</span>
                    </div>
                    <a href="{post.get("post_url", "#")}" target="_blank" class="post-link">View on LinkedIn →</a>
                </div>
            '''
        
        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Post Extraction Report</title>
    <style>
        :root {{
            --bg-primary: #0a0a0a;
            --bg-secondary: #171717;
            --bg-card: #1f1f1f;
            --text-primary: #fafafa;
            --text-secondary: #a1a1aa;
            --accent: #3b82f6;
            --accent-hover: #2563eb;
            --border: #27272a;
            --success: #22c55e;
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }}
        
        header {{
            text-align: center;
            padding: 2rem 0;
            border-bottom: 1px solid var(--border);
            margin-bottom: 2rem;
        }}
        
        h1 {{
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }}
        
        .subtitle {{
            color: var(--text-secondary);
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }}
        
        .stat-card {{
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
        }}
        
        .stat-value {{
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--accent);
        }}
        
        .stat-label {{
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-top: 0.25rem;
        }}
        
        .section {{
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }}
        
        .section h2 {{
            margin-bottom: 1rem;
            font-size: 1.25rem;
        }}
        
        .chart {{
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 1rem;
            height: 250px;
            padding: 1rem;
        }}
        
        .bar-container {{
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        
        .bar {{
            width: 50px;
            background: linear-gradient(to top, var(--accent), #60a5fa);
            border-radius: 6px 6px 0 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 0.5rem;
            min-height: 30px;
        }}
        
        .bar-value {{
            font-size: 0.8rem;
            font-weight: bold;
        }}
        
        .bar-label {{
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        
        th, td {{
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }}
        
        th {{
            color: var(--text-secondary);
            font-weight: 500;
        }}
        
        .keyword-badge {{
            display: inline-block;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 9999px;
            padding: 0.5rem 1rem;
            margin: 0.25rem;
            font-size: 0.875rem;
        }}
        
        .posts-list {{
            display: grid;
            gap: 1rem;
        }}
        
        .post-card {{
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1rem;
        }}
        
        .post-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }}
        
        .post-date {{
            color: var(--text-secondary);
            font-size: 0.85rem;
        }}
        
        .post-text {{
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
        }}
        
        .post-metrics {{
            display: flex;
            gap: 1rem;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }}
        
        .post-link {{
            color: var(--accent);
            text-decoration: none;
            font-size: 0.9rem;
        }}
        
        .post-link:hover {{
            text-decoration: underline;
        }}
        
        footer {{
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 0.875rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>LinkedIn Post Extraction Report</h1>
            <p class="subtitle">Generated on {datetime.now().strftime("%B %d, %Y at %H:%M")}</p>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{stats["total_posts"]}</div>
                <div class="stat-label">Total Posts</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats["total_likes"]:,}</div>
                <div class="stat-label">Total Likes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats["total_comments"]:,}</div>
                <div class="stat-label">Total Comments</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats["total_reposts"]:,}</div>
                <div class="stat-label">Total Reposts</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Posts by Month</h2>
            <div class="chart">
                {month_bars if month_bars else '<p style="color: var(--text-secondary);">No data available</p>'}
            </div>
        </div>
        
        <div class="section">
            <h2>Keyword Matches</h2>
            <div>
                {keyword_items if keyword_items else '<p style="color: var(--text-secondary);">No keywords tracked</p>'}
            </div>
        </div>
        
        <div class="section">
            <h2>Top Authors</h2>
            <table>
                <thead>
                    <tr>
                        <th>Author</th>
                        <th>Posts</th>
                    </tr>
                </thead>
                <tbody>
                    {author_rows if author_rows else '<tr><td colspan="2" style="color: var(--text-secondary);">No authors found</td></tr>'}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>Recent Posts</h2>
            <div class="posts-list">
                {recent_posts_html if recent_posts_html else '<p style="color: var(--text-secondary);">No posts collected yet</p>'}
            </div>
        </div>
        
        <footer>
            <p>LinkedIn Post Extractor Report</p>
            <p>Data extracted for keywords: {", ".join(stats["by_keyword"].keys()) if stats["by_keyword"] else "None"}</p>
        </footer>
    </div>
</body>
</html>
'''
        
        return html
