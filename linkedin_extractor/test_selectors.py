"""
Simple test to check what selectors work on LinkedIn feed.
"""

import time
import json
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def get_chrome_options():
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--window-size=1920,1080")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    return options

def main():
    print("Starting selector test...")
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
        
        # Navigate to feed
        print("Navigating to feed...")
        driver.get("https://www.linkedin.com/feed/")
        time.sleep(15)  # Wait longer for content to load
        
        print("\nTesting selectors...")
        
        # Test different selectors
        selectors = [
            '[role="listitem"]',
            'div[data-urn]',
            'article',
            '[class*="feed-shared-update"]',
            'div[class*="update"]',
            'div[class*="post"]',
            'main div',
        ]
        
        for selector in selectors:
            count = driver.execute_script(f"""
                return document.querySelectorAll('{selector}').length;
            """)
            print(f"  {selector:40} : {count} elements")
        
        # Try to get any text content
        print("\nLooking for any substantial text...")
        result = driver.execute_script("""
            const allDivs = document.querySelectorAll('div');
            let count = 0;
            let samples = [];
            
            for (let div of allDivs) {
                const text = (div.innerText || '').trim();
                if (text.length > 200 && text.length < 1000) {
                    count++;
                    if (samples.length < 3) {
                        samples.push(text.substring(0, 150));
                    }
                }
            }
            
            return {count: count, samples: samples};
        """)
        
        print(f"\nFound {result['count']} divs with 200-1000 characters of text")
        print("\nSample texts:")
        for i, sample in enumerate(result['samples'], 1):
            print(f"\n{i}. {sample}...")
        
        print("\n\nWaiting 10 seconds before closing...")
        time.sleep(10)
        
    finally:
        driver.quit()
        print("Browser closed.")

if __name__ == "__main__":
    main()
