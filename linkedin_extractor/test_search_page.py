"""
Test what's on the LinkedIn search page.
"""

import time
import json
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def get_chrome_options():
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--window-size=1920,1080")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    return options

def main():
    print("Starting search page test...")
    driver = webdriver.Chrome(options=get_chrome_options())
    
    try:
        # Load cookies
        cookies_path = Path("output/linkedin_cookies.json")
        if cookies_path.exists():
            print("Loading cookies...")
            driver.get("https://www.linkedin.com")
            time.sleep(2)
            
            with open(cookies_path, "r") as f:
                cookies = json.load(f)
            
            for cookie in cookies:
                try:
                    driver.add_cookie(cookie)
                except:
                    pass
        
        # Navigate to feed first
        print("Navigating to feed...")
        driver.get("https://www.linkedin.com/feed/")
        time.sleep(5)
        
        # Now try search
        keyword = "Artificial Intelligence"
        encoded = keyword.replace(" ", "%20")
        search_url = f'https://www.linkedin.com/search/results/content/?keywords=%22{encoded}%22&sortBy=%22date_posted%22'
        
        print(f"\nNavigating to search: {search_url}")
        driver.get(search_url)
        time.sleep(10)
        
        print(f"\nCurrent URL: {driver.current_url}")
        
        # Test selectors
        print("\nTesting selectors...")
        selectors = [
            'div[data-urn*="activity"]',
            'div[data-urn]',
            'div.feed-shared-update-v2',
            'div.update-components-text',
            '[role="listitem"]',
        ]
        
        for selector in selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                print(f"  {selector:40} : {len(elements)} elements")
            except Exception as e:
                print(f"  {selector:40} : Error - {e}")
        
        # Get page text
        page_text = driver.execute_script("return document.body.innerText;")
        print(f"\nPage has {len(page_text)} characters of text")
        print(f"First 500 chars:\n{page_text[:500]}")
        
        # Save screenshot
        driver.save_screenshot("output/search_page_screenshot.png")
        print("\nScreenshot saved to output/search_page_screenshot.png")
        
        print("\nWaiting 30 seconds before closing (check the browser)...")
        time.sleep(30)
        
    finally:
        driver.quit()
        print("Browser closed.")

if __name__ == "__main__":
    main()
