# How to Get Real LinkedIn Data

The built-in web scraper shows **demo data** with sample posts. To get **real LinkedIn posts** with working links, use the Python scraper.

## Quick Start

### 1. Set Up Python Scraper

```bash
cd linkedin_extractor
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Credentials

```bash
cp .env.example .env
```

Edit `.env` file:
```env
LINKEDIN_EMAIL=your_email@example.com
LINKEDIN_PASSWORD=your_password
KEYWORDS=Shayak Mazumder,Adya AI
MONTHS_BACK=6
```

### 3. Run the Scraper

```bash
python main.py
```

The scraper will:
- Log in to LinkedIn
- Search for posts with your keywords
- Extract real post data with working URLs
- Save to `output/posts_*.json`

### 4. View in Dashboard

The Next.js app automatically reads from:
- `linkedin_extractor/data/posts.json`
- `linkedin_extractor/output/posts.json`
- `data/posts.json`

Just refresh the dashboard after the Python scraper completes!

## Output Files

After running, you'll find:
- `output/posts_*.json` - Real LinkedIn posts with working URLs
- `output/posts_*.csv` - Spreadsheet format
- `output/report_*.html` - Visual summary
- `linkedin_posts.db` - SQLite database

## Real vs Demo Data

| Feature | Demo Mode | Python Scraper |
|---------|-----------|----------------|
| Post URLs | Fake demo URLs | Real LinkedIn URLs ✓ |
| Author Links | Generic profiles | Real LinkedIn profiles ✓ |
| Post Content | Sample text | Actual post content ✓ |
| Engagement | Random numbers | Real likes/comments ✓ |
| Redirects | Won't work | Works perfectly ✓ |

## Important Notes

⚠️ **LinkedIn Terms of Service**: Automated scraping may violate LinkedIn's ToS. Use responsibly:
- Use a secondary account
- Respect rate limits
- Don't use for commercial purposes without permission

## Troubleshooting

**No data showing?**
- Check that `output/posts_*.json` exists
- Verify the file has content
- Refresh the dashboard (it auto-checks every 30 seconds)

**CAPTCHA appears?**
- Set `HEADLESS=false` in `.env`
- Solve the CAPTCHA manually
- Script will continue automatically

**Login fails?**
- Verify credentials in `.env`
- Check if LinkedIn requires 2FA
- Try with `HEADLESS=false` to see what's happening

## Need Help?

See the full documentation: `linkedin_extractor/README.md`
