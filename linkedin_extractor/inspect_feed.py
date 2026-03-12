#!/usr/bin/env python3
"""
LinkedIn Feed Inspector - Diagnostic tool to find correct selectors
"""

import time
import logging
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from config import LINKEDIN_FEED_URL, COOKIES_PATH, OUTPUT_DIR, ensure_directories
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def inspect_feed():
    """Inspect LinkedIn feed HTML structure."""
    ensure_directories()
    
    # Setup Chrome
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        # Load cookies
        if Path(COOKIES_PATH).exists():
            logger.info("Loading cookies...")
            driver.get("https://www.linkedin.com")
            time.sleep(2)
            
            with open(COOKIES_PATH, "r") as f:
                cookies = json.load(f)
            
            for cookie in cookies:
                try:
                    driver.add_cookie(cookie)
                except Exception:
                    pass
        
        # Navigate to feed
        logger.info("Navigating to feed...")
        driver.get(LINKEDIN_FEED_URL)
        time.sleep(10)  # Wait for content to load
        
        # Save full page source
        page_source = driver.page_source
        source_path = Path(OUTPUT_DIR) / "feed_page_source.html"
        with open(source_path, "w", encoding="utf-8") as f:
            f.write(page_source)
        logger.info(f"Saved page source to {source_path}")
        
        # Save screenshot
        screenshot_path = Path(OUTPUT_DIR) / "feed_inspect.png"
        driver.save_screenshot(str(screenshot_path))
        logger.info(f"Saved screenshot to {screenshot_path}")
        
        # Try different selectors
        selectors_to_try = [
            ("div.feed-shared-update-v2", "Feed update v2"),
            ("div[data-id]", "Elements with data-id"),
            ("div.feed-shared-update", "Feed update"),
            ("article", "Article elements"),
            ("div[class*='feed']", "Divs with 'feed' in class"),
            ("div[class*='update']", "Divs with 'update' in class"),
            ("div[class*='post']", "Divs with 'post' in class"),
            ("main", "Main element"),
            ("div[role='main']", "Main role div"),
            ("div.scaffold-finite-scroll__content", "Scaffold scroll content"),
            ("li.profile-creator-shared-feed-update__container", "Profile creator feed"),
            ("div.feed-shared-actor", "Feed shared actor"),
        ]
        
        logger.info("\n" + "="*60)
        logger.info("SELECTOR INSPECTION RESULTS")
        logger.info("="*60)
        
        for selector, description in selectors_to_try:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                logger.info(f"\n{description} ({selector}):")
                logger.info(f"  Found: {len(elements)} elements")
                
                if elements and len(elements) > 0:
                    # Get first element's classes
                    first_elem = elements[0]
                    classes = first_elem.get_attribute("class")
                    tag_name = first_elem.tag_name
                    logger.info(f"  First element tag: {tag_name}")
                    logger.info(f"  First element classes: {classes}")
                    
                    # Try to get text content
                    text = first_elem.text[:100] if first_elem.text else "(no text)"
                    logger.info(f"  First element text preview: {text}...")
                    
            except Exception as e:
                logger.error(f"  Error with {selector}: {e}")
        
        # Look for any divs with specific patterns
        logger.info("\n" + "="*60)
        logger.info("SEARCHING FOR COMMON PATTERNS")
        logger.info("="*60)
        
        all_divs = driver.find_elements(By.TAG_NAME, "div")
        logger.info(f"\nTotal div elements: {len(all_divs)}")
        
        # Count divs by class patterns
        patterns = {}
        for div in all_divs[:500]:  # Check first 500 divs
            classes = div.get_attribute("class") or ""
            if "feed" in classes.lower():
                patterns["feed"] = patterns.get("feed", 0) + 1
            if "update" in classes.lower():
                patterns["update"] = patterns.get("update", 0) + 1
            if "post" in classes.lower():
                patterns["post"] = patterns.get("post", 0) + 1
            if "share" in classes.lower():
                patterns["share"] = patterns.get("share", 0) + 1
            if "activity" in classes.lower():
                patterns["activity"] = patterns.get("activity", 0) + 1
        
        logger.info("\nClass pattern counts (first 500 divs):")
        for pattern, count in sorted(patterns.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"  '{pattern}': {count} elements")
        
        logger.info("\n" + "="*60)
        logger.info("Inspection complete!")
        logger.info(f"Check {source_path} for full HTML")
        logger.info(f"Check {screenshot_path} for visual")
        logger.info("="*60)
        
    finally:
        driver.quit()

if __name__ == "__main__":
    inspect_feed()
