import time
from playwright.sync_api import sync_playwright
import os

STATE_FILE = "./output/linkedin_state.json"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    
    context_args = {
        "viewport": {"width": 1920, "height": 1080},
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
    if os.path.exists(STATE_FILE):
        print("Loading saved session...")
        context_args["storage_state"] = STATE_FILE
        
    context = browser.new_context(**context_args)
    page = context.new_page()
    
    # Try to access feed first
    print("Accessing LinkedIn feed...")
    try:
        page.goto("https://www.linkedin.com/feed/", timeout=30000)
        page.wait_for_load_state("domcontentloaded")
        time.sleep(2)
        print(f"Feed URL: {page.url}")
        print(f"Feed accessible: {'feed' in page.url.lower()}")
    except Exception as e:
        print(f"Error accessing feed: {e}")
    
    # Wait for inspection
    print("\nBrowser will stay open for 20 seconds...")
    time.sleep(20)
    
    browser.close()
