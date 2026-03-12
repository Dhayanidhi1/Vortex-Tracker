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
    
    # Navigate to search page WITHOUT quotes
    keyword = "Google"
    encoded_kw = keyword.replace(" ", "%20")
    search_url = f'https://www.linkedin.com/search/results/content/?keywords={encoded_kw}&origin=FACETED_SEARCH&sortBy=%22date_posted%22'
    
    print(f"Navigating to: {search_url}")
    page.goto(search_url)
    page.wait_for_load_state("domcontentloaded")
    time.sleep(3)
    
    # Check for posts
    post_elements = page.locator("div[data-urn]").all()
    print(f"Found {len(post_elements)} elements with data-urn")
    
    if len(post_elements) > 0:
        print("\nFirst post URN:", post_elements[0].get_attribute("data-urn"))
    
    # Check for "No results" message
    no_results = page.locator("text='No results found'").is_visible()
    no_more = page.locator("text='No more results'").is_visible()
    print(f"No results found: {no_results}")
    print(f"No more results: {no_more}")
    
    print(f"Current URL: {page.url}")
    
    # Wait for user to inspect
    print("\nBrowser will stay open for 30 seconds for inspection...")
    time.sleep(30)
    
    browser.close()
