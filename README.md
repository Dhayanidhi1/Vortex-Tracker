# Vortex Tracker - LinkedIn Post Analytics Dashboard

A modern Next.js application for extracting, analyzing, and managing LinkedIn posts with real-time analytics and beautiful visualizations.

![Status](https://img.shields.io/badge/status-production%20ready-success)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the application
npm run dev

# Open your browser
http://localhost:3000
```

## ⚠️ IMPORTANT: LinkedIn Credentials Setup

**Before using the real LinkedIn scraper, you MUST configure your credentials:**

1. Navigate to `linkedin_extractor/.env`
2. Replace the placeholder values with your LinkedIn credentials:

```env
LINKEDIN_EMAIL=your-email@example.com
LINKEDIN_PASSWORD=your-password-here
```

**Security Note:** Never commit your actual credentials to GitHub! The `.env` file should contain only placeholder values in the repository.

## ✨ Features

- 📊 **Real-time Analytics** - View engagement metrics with theme-based colors
- 🔍 **Smart Search** - Search posts by text or author name
- 📥 **Import/Export** - Support for JSON and CSV formats
- 🎨 **Modern UI** - Dark/light mode with beautiful gradients
- 🤖 **Demo Scraper** - Generates realistic sample data instantly
- 🔐 **Python Scraper** - Real LinkedIn data extraction with your credentials
- 🎯 **Duplicate Name Fix** - Automatically cleans duplicated author names
- 🌈 **Theme-Based Charts** - Vibrant colors in dark mode, professional colors in light mode

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Overview)

### Analytics Panel
![Analytics](https://via.placeholder.com/800x400?text=Analytics+Panel)

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Quick setup for new machines
- **[WHATSCHANGED.txt](WHATSCHANGED.txt)** - Complete change history
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Detailed project status

## 🎯 What Works

| Feature | Status |
|---------|--------|
| Dashboard | ✅ 100% |
| Demo Scraper | ✅ 100% |
| Analytics | ✅ 100% |
| Filters | ✅ 100% |
| Import/Export | ✅ 100% |
| Python Login | ✅ 100% |
| Post Extraction | ⚠️ Limited* |

*LinkedIn's anti-scraping measures prevent automated post extraction. Use Demo Mode or LinkedIn Official API.

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Scraper:** Python, Playwright
- **Database:** SQLite
- **UI Components:** Radix UI, shadcn/ui
- **Charts:** Recharts with theme-based colors

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.8+ (for real LinkedIn scraper)
- LinkedIn Account (for real scraper)

### Full Setup

```bash
# 1. Clone the repository
git clone https://github.com/Dhayanidhi1/Vortex-Tracker.git
cd Vortex-Tracker

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies (for real scraper)
cd linkedin_extractor
py -m pip install -r requirements.txt
cd ..

# 4. Configure LinkedIn credentials (REQUIRED for real scraper)
# Edit linkedin_extractor/.env and add your credentials:
# LINKEDIN_EMAIL=your-email@example.com
# LINKEDIN_PASSWORD=your-password-here

# 5. Start the application
npm run dev
```

## 🎮 Usage

### Demo Mode (No Login Required)
1. Open http://localhost:3000
2. Click "Demo Scraper"
3. Sample data appears instantly
4. All features work perfectly

### Real LinkedIn Scraper (Requires Credentials)
1. **IMPORTANT:** Configure `linkedin_extractor/.env` with YOUR LinkedIn credentials
2. Click "Run Real LinkedIn Scraper" in dashboard
3. Enter keywords in settings (gear icon)
4. Set max posts (10-100)
5. Solve CAPTCHA if prompted
6. Posts appear in real-time on dashboard

## 📁 Project Structure

```
vortex-tracker/
├── app/                    # Next.js application
│   ├── api/               # API routes
│   ├── info/              # Info page
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── dashboard/        # Dashboard UI components
│   └── ui/               # Reusable UI components
├── linkedin_extractor/   # Python scraper
│   ├── scraper.py       # Scraping logic
│   ├── .env             # ⚠️ ADD YOUR CREDENTIALS HERE
│   ├── .env.example     # Example configuration
│   └── output/          # Scraped data output
├── lib/                  # Utility functions
├── public/              # Static assets
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables (IMPORTANT!)

Edit `linkedin_extractor/.env` and add YOUR credentials:

```env
# LinkedIn Credentials - REQUIRED for real scraper
LINKEDIN_EMAIL=your-email@example.com
LINKEDIN_PASSWORD=your-password-here

# Search Configuration
KEYWORDS=
MAX_PAGES=50

# Browser Configuration
HEADLESS=false  # Set to true for background scraping
```

**⚠️ Security Warning:** 
- Never commit your actual credentials to GitHub
- Keep your `.env` file private
- Use strong, unique passwords

## 🐛 Troubleshooting

### "Module not found"
```bash
npm install
cd linkedin_extractor && py -m pip install -r requirements.txt
```

### "Scraper already running"
- Refresh the page (auto-reset enabled)

### CAPTCHA issues
- Ensure `HEADLESS=false` in `.env`
- Solve manually in browser window

### No posts appearing
- Check that you've added YOUR LinkedIn credentials in `.env`
- Make sure keywords are entered in settings
- Check browser console for errors

## 📊 Recent Updates

- ✅ Rebranded to Vortex Tracker
- ✅ Theme-based analytics colors (vibrant in dark, professional in light)
- ✅ Fixed duplicate author names
- ✅ Improved search functionality
- ✅ Increased scraper capacity (up to 100 posts)
- ✅ White text in dark mode for better visibility

## 🤝 Contributing

This is a personal project by Dhayanidhi R. Suggestions and feedback are welcome!

## 👨‍💻 Author

**Dhayanidhi R**
- LinkedIn: [dhayanidhi-r-4200b5286](https://www.linkedin.com/in/dhayanidhi-r-4200b5286/)
- GitHub: [Dhayanidhi1](https://github.com/Dhayanidhi1)

## 📝 License

MIT License - feel free to use for personal projects.

## 🙏 Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Icons from Lucide React
- Scraping with Playwright

---

**Made with ❤️ by Dhayanidhi R**

**⚠️ Important:** This project is for educational purposes. Always respect LinkedIn's Terms of Service and use responsibly.
