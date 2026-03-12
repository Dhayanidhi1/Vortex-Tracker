# How to Run the Updated Scraper (Session 9)

## Quick Start

### Option 1: Via Dashboard (Recommended)
```bash
# In project root
npm run dev

# Then in browser:
# 1. Go to http://localhost:3000
# 2. Click "Run Real LinkedIn Scraper"
# 3. Solve CAPTCHA if prompted
# 4. Wait for results
```

### Option 2: Direct Python Script
```bash
cd linkedin_extractor
py main.py
```

### Option 3: Test Script (For Debugging)
```bash
cd linkedin_extractor
py test_antigravity_flow.py
```

## What to Expect

### First Run (No Cookies)
1. Browser opens (not headless - HEADLESS=false in .env)
2. Navigates to /feed/ → redirects to /login
3. You manually enter credentials
4. Solve CAPTCHA if prompted
5. Script detects login success
6. Saves cookies to `output/linkedin_cookies.json`
7. Navigates to search page
8. Extracts posts
9. Browser closes
10. Results saved to `output/posts.json`

### Subsequent Runs (With Cookies)
1. Browser opens
2. Loads cookies from `output/linkedin_cookies.json`
3. Navigates to /feed/ → stays on /feed (auto-login!)
4. Script detects login success immediately
5. Navigates to search page
6. Extracts posts
7. Browser closes
8. Results saved to `output/posts.json`

## Expected Output

### Console Output
```
Starting Chrome browser...
Browser started successfully
Checking login status...
Cookies loaded successfully
Navigating to /feed/ to check login state...
After feed navigation, URL is: https://www.linkedin.com/feed/
Already logged in via cookies!
Scraping posts for keywords: ['Artificial Intelligence', 'Machine Learning', 'OpenAI', 'ChatGPT']
Navigating directly to search URL: https://www.linkedin.com/search/results/content/?keywords=...
Current URL after search navigation: https://www.linkedin.com/search/results/content/?keywords=...
Waiting for posts to load...
Posts found!
Found 15 post elements
✓ Found post by John Doe matching ['Artificial Intelligence']
✓ Found post by Jane Smith matching ['Machine Learning', 'OpenAI']
...
Search scraping complete. Found 12 matching posts
Total unique posts collected: 12
```

### File Output
```
linkedin_extractor/
├── output/
│   ├── posts.json              ← Extracted posts
│   ├── linkedin_cookies.json   ← Session cookies
│   └── linkedin_posts.db       ← SQLite database
└── logs/
    └── scraper_2026-03-12_XX-XX-XX.log  ← Detailed logs
```

## Troubleshooting

### Issue: "Redirected to login/authwall - session expired"
**Solution**: Cookies expired. Delete `output/linkedin_cookies.json` and run again.

### Issue: "No posts found on search page"
**Possible causes**:
1. No posts matching your keywords
2. LinkedIn changed their HTML structure
3. Need to adjust wait times

**Debug steps**:
```bash
cd linkedin_extractor
py test_search_page.py  # Check what selectors find
```

### Issue: CAPTCHA keeps appearing
**Solution**: 
1. Make sure HEADLESS=false in .env
2. Solve CAPTCHA manually in browser
3. Wait for script to continue automatically

### Issue: "Login failed"
**Check**:
1. Credentials correct in .env file
2. No typos in email/password
3. Account not locked/suspended

## Configuration

Edit `linkedin_extractor/.env`:

```env
# Credentials
LINKEDIN_EMAIL=your.email@example.com
LINKEDIN_PASSWORD=yourpassword

# Keywords (comma-separated)
KEYWORDS=Artificial Intelligence,Machine Learning,OpenAI,ChatGPT

# Browser (false = show browser, true = headless)
HEADLESS=false

# Wait times (seconds)
REQUEST_DELAY_MIN=1.5
REQUEST_DELAY_MAX=3.0
TIMEOUT=30
```

## Viewing Results

### JSON File
```bash
# Pretty print
py -c "import json; print(json.dumps(json.load(open('output/posts.json')), indent=2))"
```

### Database
```bash
# View in SQLite
sqlite3 output/linkedin_posts.db
sqlite> SELECT author_name, post_text FROM posts LIMIT 5;
```

### Dashboard
Results automatically appear in the Next.js dashboard at http://localhost:3000

## Success Indicators

✅ Login successful
✅ Cookies saved
✅ Search page loaded
✅ Posts found (div[data-urn*='activity'])
✅ Post data extracted (author, text, URL)
✅ Results saved to JSON/database
✅ Browser closed cleanly

## Performance

- Login: ~5-10 seconds (first time), ~3 seconds (with cookies)
- Search page load: ~4-6 seconds
- Post extraction: ~2-3 seconds per scroll
- Total time: ~30-60 seconds for 10-20 posts

## Next Steps After Successful Run

1. Check `output/posts.json` for extracted data
2. View results in dashboard at http://localhost:3000
3. Adjust keywords in .env if needed
4. Run again to collect more posts
5. Export data from dashboard (CSV/JSON)
