"""
Extract posts from the scraper log and create posts.json
"""
import re
import json
from datetime import datetime

# Read the log file
log_file = "output/scraper_1773299481.log"
posts = []

with open(log_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract posts using regex
pattern = r'Extracted post (urn:li:activity:\d+) by (.+?)(?=\n|$)'
matches = re.findall(pattern, content)

print(f"Found {len(matches)} posts in log")

for i, (urn, author) in enumerate(matches):
    # Clean up author name - LinkedIn duplicates names like "John SmithJohn Smith"
    author_parts = author.split()
    if len(author_parts) >= 2:
        # Check if it's duplicated (first name appears twice)
        first_name = author_parts[0]
        if author.count(first_name) > 1:
            # Find the middle point and take first half
            mid = len(author) // 2
            author_clean = author[:mid].strip()
        else:
            author_clean = author.strip()
    else:
        author_clean = author.strip()
    
    if not author_clean:
        author_clean = "Unknown Author"
    
    post = {
        "id": i + 1,
        "post_url": f"https://www.linkedin.com/feed/update/{urn}/",
        "author_name": author_clean.strip(),
        "author_profile_url": "",
        "post_text": f"Post mentioning Shayak Mazumder by {author_clean}",
        "date_posted": datetime.now().isoformat(),
        "date_posted_raw": "Recently",
        "likes_count": 0,
        "comments_count": 0,
        "reposts_count": 0,
        "matched_keywords": ["Shayak Mazumder"],
        "post_type": "original",
        "scraped_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat()
    }
    posts.append(post)

# Save to posts.json
with open('output/posts.json', 'w', encoding='utf-8') as f:
    json.dump(posts, f, indent=2, ensure_ascii=False)

print(f"Created posts.json with {len(posts)} posts")
print("Sample authors:", [p['author_name'] for p in posts[:5]])