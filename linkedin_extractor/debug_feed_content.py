"""
Debug script to inspect LinkedIn feed content and find working selectors.
"""

import time
import json
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def get_chrome_options():
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--window-size=1920,1080")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    return options

def main():
    print("Starting debug session...")
    driver = webdriver.Chrome(options=get_chrome_options())
    
    try:
        # Load cookies if available
        cookies_path = Path("output/linkedin_cookies.json")
        if cookies_path.exists():
            print("Loading saved cookies...")
            driver.get("https://www.linkedin.com")
            time.sleep(2)
            
            with open(cookies_path, "r") as f:
                cookies = json.load(f)
            
            for cookie in cookies:
                try:
                    driver.add_cookie(cookie)
                except:
                    pass
            
            print("Cookies loaded!")
        
        # Navigate to feed
        print("Navigating to feed...")
        driver.get("https://www.linkedin.com/feed/")
        time.sleep(10)  # Wait for initial load
        
        print("\n" + "="*60)
        print("WAITING 30 SECONDS FOR CONTENT TO LOAD...")
        print("Please wait while the page fully renders...")
        print("="*60 + "\n")
        
        # Scroll to trigger loading
        for i in range(5):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)
            print(f"Scroll {i+1}/5 complete")
        
        # Wait additional time
        time.sleep(10)
        
        print("\n" + "="*60)
        print("ANALYZING PAGE CONTENT...")
        print("="*60 + "\n")
        
        # Try to find ANY elements with text
        result = driver.execute_script("""
            const analysis = {
                totalElements: 0,
                elementsWithText: 0,
                potentialPosts: [],
                allSelectors: {
                    'div[data-urn]': 0,
                    'article': 0,
                    '[class*="feed"]': 0,
                    '[class*="update"]': 0,
                    '[class*="post"]': 0,
                    'div[data-id]': 0,
                    '[data-test-id]': 0
                },
                sampleTexts: []
            };
            
            // Count all elements
            analysis.totalElements = document.querySelectorAll('*').length;
            
            // Test each selector
            for (let selector in analysis.allSelectors) {
                const elements = document.querySelectorAll(selector);
                analysis.allSelectors[selector] = elements.length;
            }
            
            // Find elements with substantial text
            const allDivs = document.querySelectorAll('div, article, section');
            allDivs.forEach((elem, index) => {
                const text = (elem.innerText || '').trim();
                if (text.length > 100 && text.length < 5000) {
                    analysis.elementsWithText++;
                    
                    // Get element info
                    const classes = elem.className || '';
                    const id = elem.id || '';
                    const dataAttrs = {};
                    
                    for (let attr of elem.attributes) {
                        if (attr.name.startsWith('data-')) {
                            dataAttrs[attr.name] = attr.value;
                        }
                    }
                    
                    if (index < 10) {  // Only save first 10
                        analysis.potentialPosts.push({
                            tagName: elem.tagName,
                            classes: classes.substring(0, 200),
                            id: id,
                            dataAttributes: dataAttrs,
                            textLength: text.length,
                            textPreview: text.substring(0, 200)
                        });
                    }
                    
                    if (analysis.sampleTexts.length < 5) {
                        analysis.sampleTexts.push(text.substring(0, 300));
                    }
                }
            });
            
            return analysis;
        """)
        
        print(f"Total elements on page: {result['totalElements']}")
        print(f"Elements with text (100-5000 chars): {result['elementsWithText']}")
        print()
        
        print("Selector Test Results:")
        print("-" * 60)
        for selector, count in result['allSelectors'].items():
            print(f"  {selector:30} : {count} elements")
        print()
        
        print("Potential Post Elements (first 10):")
        print("-" * 60)
        for i, post in enumerate(result['potentialPosts'], 1):
            print(f"\n{i}. {post['tagName']}")
            print(f"   Classes: {post['classes'][:100]}...")
            print(f"   ID: {post['id']}")
            print(f"   Data attributes: {post['dataAttributes']}")
            print(f"   Text length: {post['textLength']}")
            print(f"   Preview: {post['textPreview'][:150]}...")
        
        print("\n" + "="*60)
        print("Sample Texts Found:")
        print("="*60)
        for i, text in enumerate(result['sampleTexts'], 1):
            print(f"\n{i}. {text}...")
        
        # Save page source
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        with open(output_dir / "debug_page_source.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        
        driver.save_screenshot(str(output_dir / "debug_screenshot.png"))
        
        print("\n" + "="*60)
        print("Files saved:")
        print("  - output/debug_page_source.html")
        print("  - output/debug_screenshot.png")
        print("="*60)
        
        print("\nClosing browser in 5 seconds...")
        time.sleep(5)
        
    finally:
        driver.quit()
        print("Browser closed.")

if __name__ == "__main__":
    main()
