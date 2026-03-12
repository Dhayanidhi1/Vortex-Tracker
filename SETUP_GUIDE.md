# LinkedIn Post Extractor - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd linkedin_extractor
py -m pip install -r requirements.txt
cd ..
```

### 2. Configure LinkedIn Credentials
Edit `linkedin_extractor/.env`:
```env
LINKEDIN_EMAIL=your_email@gmail.com
LINKEDIN_PASSWORD=your_password
HEADLESS=false
```

### 3. Run the Application
```bash
# Start the dashboard
npm run dev

# Open browser
http://localhost:3000
```

## 📱 Using the Dashboard

### Demo Mode (Recommended - Works 100%)
1. Click "Start Scraping" button
2. Sample data appears instantly
3. All features work: filters, analytics, export

### Real LinkedIn Scraper
1. Click "Run Real LinkedIn Scraper"
2. Browser opens automatically
3. Solve CAPTCHA if prompted
4. Login detected automatically
5. **Note**: Currently finds 0 posts due to LinkedIn's dynamic loading

## 🔧 Troubleshooting

### "Module not found" Error
```bash
cd linkedin_extractor
py -m pip install -r requirements.txt
```

### "Scraper already running"
- Just refresh the page (auto-reset enabled)

### CAPTCHA not appearing
- Make sure `HEADLESS=false` in `.env`

### Python not found
- Install Python 3.x from python.org
- Use `py` or `python` or `python3` command

## 📁 Important Files

### Configuration
- `linkedin_extractor/.env` - LinkedIn credentials
- `package.json` - Node.js dependencies
- `linkedin_extractor/requirements.txt` - Python dependencies

### Data Output
- `linkedin_extractor/output/posts.json` - Scraped data
- `linkedin_extractor/output/linkedin_cookies.json` - Session cookies
- `linkedin_extractor/logs/` - Scraper logs

### Code
- `app/page.tsx` - Main dashboard
- `linkedin_extractor/scraper.py` - Scraping logic
- `components/dashboard/` - UI components

## 🎯 What Works

✅ Dashboard with analytics
✅ Demo scraper (generates sample data)
✅ Python scraper login & CAPTCHA handling
✅ Cookie management
✅ Data import/export
✅ Filters and search
✅ Real-time updates

❌ Real LinkedIn post extraction (LinkedIn blocks with dynamic loading)

## 💡 Recommendation

**Use Demo Mode** for development and testing. It provides all functionality
with sample data. The Python scraper login works perfectly, but LinkedIn's
anti-scraping measures prevent actual post extraction.

## 📝 Moving to New PC/Laptop

1. Copy entire project folder
2. Run `npm install`
3. Run `cd linkedin_extractor && py -m pip install -r requirements.txt`
4. Update `.env` with your credentials
5. Run `npm run dev`

That's it! Check `WHATSCHANGED.txt` for detailed change history.

## 🆘 Need Help?

- Check `WHATSCHANGED.txt` for all changes made
- Check `linkedin_extractor/logs/` for scraper logs
- Check browser console for dashboard errors
- Demo mode always works if real scraper has issues
