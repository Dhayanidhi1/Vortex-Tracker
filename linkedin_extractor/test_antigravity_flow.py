"""
Test the Antigravity implementation flow.
This script tests the login and search flow with the new implementation.
"""

import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from scraper import LinkedInScraper
from config import KEYWORDS

def main():
    print("=" * 70)
    print("TESTING ANTIGRAVITY'S IMPLEMENTATION")
    print("=" * 70)
    print()
    print("This will test:")
    print("1. Cookie-based login with /feed/ redirect check")
    print("2. Direct navigation to search page")
    print("3. Post extraction with correct selectors")
    print()
    print("=" * 70)
    
    scraper = LinkedInScraper()
    
    try:
        # Start browser
        print("\n[1/4] Starting browser...")
        scraper.start_browser()
        print("✓ Browser started")
        
        # Login (will check /feed/ first)
        print("\n[2/4] Logging in (checking /feed/ for cookie auto-login)...")
        if scraper.login():
            print("✓ Login successful!")
        else:
            print("✗ Login failed")
            return
        
        # Scrape posts
        print("\n[3/4] Scraping posts from search page...")
        print(f"Keywords: {KEYWORDS}")
        posts = scraper.scrape_all_keywords(KEYWORDS)
        
        # Results
        print("\n[4/4] Results:")
        print("=" * 70)
        print(f"Total posts found: {len(posts)}")
        
        if len(posts) > 0:
            print("\n✓ SUCCESS! Posts extracted:")
            for i, post in enumerate(posts[:5], 1):  # Show first 5
                print(f"\n  Post {i}:")
                print(f"    Author: {post.get('author_name', 'Unknown')}")
                print(f"    Text: {post.get('post_text', '')[:100]}...")
                print(f"    Keywords: {post.get('matched_keywords', [])}")
                print(f"    URL: {post.get('post_url', '')}")
            
            if len(posts) > 5:
                print(f"\n  ... and {len(posts) - 5} more posts")
        else:
            print("\n✗ No posts found")
            print("\nPossible issues:")
            print("  - Search page didn't load correctly")
            print("  - No posts matching keywords")
            print("  - Selectors need adjustment")
        
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        print("\nClosing browser...")
        scraper.close_browser()
        print("Done!")

if __name__ == "__main__":
    main()
