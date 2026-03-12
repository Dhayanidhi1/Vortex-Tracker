# LinkedIn Post Extractor

A Python-based tool for extracting LinkedIn posts that mention specific keywords. Collects post data including author information, engagement metrics, and post content, then saves to CSV, JSON, and SQLite database formats.

## Features

- Automated LinkedIn login with session persistence (cookies)
- Keyword-based post search with pagination
- Extraction of post URLs, author details, text content, and engagement metrics
- Rate limiting and anti-detection measures
- CAPTCHA detection with manual intervention prompt
- Data storage in CSV, JSON, and SQLite formats
- HTML summary report generation
- Configurable via environment variables

## Requirements

- Python 3.10+
- Google Chrome browser
- ChromeDriver (matching your Chrome version)

## Installation

1. **Clone or download this project**

2. **Create a virtual environment** (recommended):
   ```bash
   cd linkedin_extractor
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Install ChromeDriver**:
   - Download from: https://chromedriver.chromium.org/downloads
   - Or use webdriver-manager: `pip install webdriver-manager`
   - Ensure ChromeDriver version matches your Chrome browser version

5. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your LinkedIn credentials
   ```

## Configuration

Edit the `.env` file with your settings:

```env
# Required
LINKEDIN_EMAIL=your_email@example.com
LINKEDIN_PASSWORD=your_password

# Keywords to search (comma-separated)
KEYWORDS=Shayak Mazumder,Adya AI

# How far back to search (months)
MONTHS_BACK=6

# Optional settings
OUTPUT_DIR=./output
HEADLESS=true  # Set to false to see the browser
REQUEST_DELAY_MIN=1.5
REQUEST_DELAY_MAX=3.0
```

## Usage

Run the extractor:

```bash
python main.py
```

The script will:
1. Launch Chrome (headless by default)
2. Log in to LinkedIn using your credentials
3. Search for posts containing each keyword
4. Extract post data and engagement metrics
5. Save results to CSV, JSON, and SQLite database
6. Generate an HTML summary report

## Output

After running, you'll find in the `output` directory:

- `posts_YYYY-MM-DD_HH-MM-SS.csv` - Spreadsheet format
- `posts_YYYY-MM-DD_HH-MM-SS.json` - JSON format
- `linkedin_posts.db` - SQLite database
- `report_YYYY-MM-DD_HH-MM-SS.html` - Visual summary report

Logs are saved in the `logs` directory.

## Data Fields

Each post record includes:

| Field | Description |
|-------|-------------|
| post_url | Direct link to the post |
| author_name | Name of the post author |
| author_profile_url | Link to author's profile |
| post_text | Full post content |
| date_posted | Parsed date/time |
| date_posted_raw | Original relative date text |
| likes_count | Number of reactions |
| comments_count | Number of comments |
| reposts_count | Number of reposts |
| matched_keywords | Keywords that matched |
| post_type | original, repost, article, shared |
| scraped_at | When the data was collected |

## Sample Output

### CSV Format
```csv
post_url,author_name,post_text,date_posted,likes_count,comments_count,reposts_count,matched_keywords
https://linkedin.com/posts/abc123,John Doe,"Great insights from Shayak Mazumder...",2024-01-15T10:30:00,45,12,5,"Shayak Mazumder"
```

### JSON Format
```json
[
  {
    "post_url": "https://linkedin.com/posts/abc123",
    "author_name": "John Doe",
    "post_text": "Great insights from Shayak Mazumder...",
    "date_posted": "2024-01-15T10:30:00",
    "likes_count": 45,
    "comments_count": 12,
    "reposts_count": 5,
    "matched_keywords": ["Shayak Mazumder"],
    "post_type": "original"
  }
]
```

## Troubleshooting

### CAPTCHA Detection
If LinkedIn shows a CAPTCHA, the script will pause and prompt you to solve it manually. After solving, the script continues automatically.

### Login Issues
- Ensure your credentials are correct
- Try setting `HEADLESS=false` to see what's happening
- Check if LinkedIn is requiring additional verification

### Rate Limiting
If you get blocked:
- Increase `REQUEST_DELAY_MIN` and `REQUEST_DELAY_MAX`
- Run the script less frequently
- Consider using proxies

### No Results
- Verify your search keywords are correct
- Check if posts exist for those keywords
- LinkedIn's search can be inconsistent

## Important Legal Notice

**LinkedIn's Terms of Service**: This tool automates interactions with LinkedIn, which may violate LinkedIn's Terms of Service. Use at your own risk. LinkedIn actively detects and blocks scraping activities and may suspend accounts engaging in automated access.

**Recommendations**:
- Use a secondary LinkedIn account
- Respect rate limits
- Do not use for commercial purposes without LinkedIn's permission
- Consider using LinkedIn's official API if available for your use case

## Project Structure

```
linkedin_extractor/
├── main.py              # Entry point
├── scraper.py           # Browser automation & login
├── parser.py            # HTML parsing & data extraction
├── storage.py           # CSV, JSON, SQLite handling
├── report.py            # HTML report generation
├── config.py            # Settings & configuration
├── .env.example         # Configuration template
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

## License

This project is for educational purposes only. Use responsibly and in accordance with all applicable laws and terms of service.
