import time
import os
import random
import logging
import sys
import json
from datetime import datetime
from playwright.sync_api import sync_playwright
import re
from config import LINKEDIN_EMAIL, LINKEDIN_PASSWORD, USE_PROXY, PROXY_SERVER, PROXY_USERNAME, PROXY_PASSWORD, OUTPUT_DIR, HEADLESS, MAX_PAGES
from parser import parse_post_html

log_file = os.path.join(OUTPUT_DIR, f"scraper_{int(time.time())}.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

STATE_FILE = os.path.join(OUTPUT_DIR, "linkedin_state.json")

def random_sleep(min_sec=2.0, max_sec=5.0):
    time.sleep(random.uniform(min_sec, max_sec))

class LinkedInScraper:
    def __init__(self, keywords=None, months_back=6, max_posts=50):
        self.keywords = keywords or []
        self.months_back = months_back
        self.max_posts = max_posts  # Maximum number of posts to collect
        self.posts_data = []
        
        # Initialize posts file
        self._init_realtime_file()

    def scrape_all_keywords(self, keywords=None):
        """Public method expected by main.py."""
        self.keywords = keywords or self.keywords
        self.run()
        return self.posts_data

    def run(self):
        with sync_playwright() as p:
            proxy = None
            if USE_PROXY and PROXY_SERVER:
                proxy = {
                    "server": PROXY_SERVER,
                    "username": PROXY_USERNAME,
                    "password": PROXY_PASSWORD
                }

            # Launch browser in headless mode for background operation (no browser window)
            browser = p.chromium.launch(headless=True, proxy=proxy)
            
            context_args = {
                "viewport": {"width": 1920, "height": 1080},
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }
            if os.path.exists(STATE_FILE):
                logging.info("Found saved session state.")
                context_args["storage_state"] = STATE_FILE
                
            context = browser.new_context(**context_args)
            page = context.new_page()

            try:
                self._login(page, context)
            except Exception as e:
                logging.error(f"Login failed: {e}")
                browser.close()
                return []

            for keyword in self.keywords:
                logging.info(f"Starting search for: {keyword} (target: {self.max_posts} posts)")
                try:
                    self._search_keyword(page, keyword)
                except Exception as e:
                    logging.error(f"Error during search for '{keyword}': {e}")
                time.sleep(0.5)  # Much faster between keywords

            browser.close()
            logging.info("Scraping completed.")
            return self.posts_data

    def _login(self, page, context):
        logging.info("Checking login status...")
        page.goto("https://www.linkedin.com/feed/", timeout=60000)
        
        url = page.url.lower()
        if ("feed" in url or "dashboard" in url) and "authwall" not in url and "login" not in url:
            logging.info("Already logged in.")
            return

        logging.info("Not logged in. Performing login...")
        page.goto("https://www.linkedin.com/login", timeout=60000)
        
        try:
            page.fill("input#username, input#session_key", LINKEDIN_EMAIL, timeout=10000)
            time.sleep(0.5)  # Faster
            page.fill("input#password, input#session_password", LINKEDIN_PASSWORD, timeout=10000)
            time.sleep(0.5)  # Faster
            page.click("button[type='submit']")
            page.wait_for_load_state("networkidle")
        except Exception as e:
            logging.warning(f"Auto-login failed or not a standard login page: {e}. Please log in manually.")
        
        if "checkpoint/challenge" in page.url or "captcha" in page.content().lower() or "login" in page.url:
            logging.warning("CAPTCHA, challenge, or manual login detected!")
            logging.warning("Running in headless mode - attempting to use saved session...")
            
            # In headless mode, try to use existing session state
            if os.path.exists(STATE_FILE):
                logging.info("Found existing session state, attempting to continue...")
                try:
                    # Try to navigate to feed with existing session
                    page.goto("https://www.linkedin.com/feed/", timeout=30000)
                    page.wait_for_load_state("domcontentloaded")
                    
                    # Check if we successfully reached the feed
                    if "feed" in page.url.lower() and "authwall" not in page.url.lower():
                        logging.info("Successfully accessed feed with existing session")
                        return
                except Exception as e:
                    logging.warning(f"Failed to use existing session: {e}")
            
            # If we still can't access, the session might be expired
            logging.error("Session expired or invalid. Please run scraper with HEADLESS=false once to re-authenticate.")
            raise Exception("Authentication required - session expired. Please re-authenticate manually.")

        context.storage_state(path=STATE_FILE)
        logging.info("Login successful. State saved.")

    def _search_keyword(self, page, keyword):
        # Search without quotes for broader results
        encoded_kw = keyword.replace(" ", "%20")
        search_url = f'https://www.linkedin.com/search/results/content/?keywords={encoded_kw}&origin=FACETED_SEARCH&sortBy=date_posted'
        
        page.goto(search_url)
        page.wait_for_load_state("domcontentloaded")
        time.sleep(0.5)  # Much faster initial wait
        
        seen_urns = set()
        posts_collected_for_keyword = 0
        # Dynamic max scrolls based on target posts - allow more scrolls for higher targets
        max_scrolls = min(50, max(10, self.max_posts // 2))  # Increased limits
        scroll_count = 0
        
        logging.info(f"Target: {self.max_posts} posts for keyword '{keyword}'")
        
        while posts_collected_for_keyword < self.max_posts and scroll_count < max_scrolls:
            scroll_count += 1
            logging.info(f"Scroll {scroll_count}/{max_scrolls} for '{keyword}' - Collected: {posts_collected_for_keyword}/{self.max_posts}")
            
            # Scroll down to load more content - much faster
            for _ in range(2):  # Reduced from 3 scrolls to 2
                page.keyboard.press("PageDown")
                time.sleep(0.2)  # Much faster - reduced from 0.5 seconds
            
            time.sleep(0.8)  # Much faster - reduced from 1-2 seconds
            
            post_elements = page.locator("div[data-urn]").all()
            new_posts_found = 0
            
            for index, el in enumerate(post_elements):
                # Stop if we've reached our target
                if posts_collected_for_keyword >= self.max_posts:
                    break
                    
                try:
                    urn = el.get_attribute("data-urn")
                    if not urn or urn in seen_urns:
                        continue
                        
                    post_data = {
                        'id': urn,  # Use URN as unique ID
                        'post_url': f"https://www.linkedin.com/feed/update/{urn}/",
                        'author_name': '',
                        'author_profile_url': '',
                        'post_text': '',
                        'date_posted': '',
                        'likes': 0,
                        'comments': 0,
                        'reposts': 0,
                        'matched_keywords': [],
                        'post_type': 'original'
                    }

                    # Extract Content within this specific post element
                    try:
                        html_content = el.evaluate("node => node.outerHTML")
                        post_data = parse_post_html(html_content, self.keywords)
                        
                        # Add missing bits
                        if not post_data['post_url'] and urn:
                            post_data['post_url'] = f"https://www.linkedin.com/feed/update/{urn}/"
                            
                        # If author_name is empty, we might have an issue, but we still append
                    except Exception as e:
                        logging.warning(f"Failed to parse a post element: {e}")
                        continue

                    seen_urns.add(urn)
                    self.posts_data.append(post_data)
                    posts_collected_for_keyword += 1
                    new_posts_found += 1
                    logging.info(f"Extracted post {posts_collected_for_keyword}/{self.max_posts}: {urn} by {post_data.get('author_name', 'Unknown')}")
                    
                    # Save post immediately for real-time dashboard updates
                    self._save_post_immediately(post_data)
                    
                except Exception as e:
                    logging.warning(f"Failed to parse a post element: {e}")
            
            # If no new posts were found in this scroll, try clicking "Show more" button
            if new_posts_found == 0:
                try:
                    show_more = page.locator("button:has-text('Show more')")
                    if show_more.is_visible():
                        show_more.click()
                        logging.info("Clicked 'Show more' button.")
                        time.sleep(1)  # Much faster - reduced from 2-4 seconds
                        continue  # Try scrolling again after clicking show more
                except Exception:
                    pass
                
                # Check if we've reached the end
                if page.locator("text='No more results'").is_visible() or page.locator("text='No results found'").is_visible():
                    logging.info("Reached end of search results.")
                    break
                    
                # If still no new posts and no "show more" button, we might be at the end
                logging.info("No new posts found in this scroll, might have reached the end.")
                break
        
        logging.info(f"Completed search for '{keyword}': collected {posts_collected_for_keyword} posts")
    
    def _init_realtime_file(self):
        """Initialize the main posts.json file for fresh start"""
        try:
            # Ensure output directory exists
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            
            # Clear main posts.json file for fresh start
            main_posts_file = os.path.join(OUTPUT_DIR, "posts.json")
            with open(main_posts_file, 'w', encoding='utf-8') as f:
                json.dump([], f)
            logging.info(f"Cleared main posts.json for fresh start: {main_posts_file}")
            
        except Exception as e:
            logging.error(f"Failed to initialize posts file: {e}")
            # Try to create the directory and file again
            try:
                os.makedirs(OUTPUT_DIR, exist_ok=True)
                main_posts_file = os.path.join(OUTPUT_DIR, "posts.json")
                with open(main_posts_file, 'w', encoding='utf-8') as f:
                    json.dump([], f)
                logging.info(f"Successfully created posts.json after retry: {main_posts_file}")
            except Exception as e2:
                logging.error(f"Failed to create posts.json even after retry: {e2}")
    
    def _save_post_immediately(self, post_data):
        """Save a single post immediately for real-time dashboard updates"""
        try:
            # Add timestamp for real-time tracking
            post_data['scraped_at'] = datetime.now().isoformat()
            
            # Save to the main posts.json file that the dashboard reads
            main_posts_file = os.path.join(OUTPUT_DIR, "posts.json")
            main_posts = []
            
            # Read existing posts
            if os.path.exists(main_posts_file):
                try:
                    with open(main_posts_file, 'r', encoding='utf-8') as f:
                        content = f.read().strip()
                        if content:
                            main_posts = json.loads(content)
                        else:
                            main_posts = []
                except Exception as e:
                    logging.warning(f"Could not read existing posts.json: {e}, starting fresh")
                    main_posts = []
            
            # Check if post already exists (avoid duplicates)
            existing_urls = {p.get("post_url") for p in main_posts if p.get("post_url")}
            if post_data.get("post_url") not in existing_urls:
                main_posts.append(post_data)
                
                # Save to main posts.json with error handling
                try:
                    with open(main_posts_file, 'w', encoding='utf-8') as f:
                        json.dump(main_posts, f, indent=2, ensure_ascii=False)
                    
                    logging.info(f"Saved post to dashboard: {post_data.get('author_name', 'Unknown')} - Total posts: {len(main_posts)}")
                except Exception as e:
                    logging.error(f"Failed to write to posts.json: {e}")
                    # Try to create the directory if it doesn't exist
                    os.makedirs(OUTPUT_DIR, exist_ok=True)
                    with open(main_posts_file, 'w', encoding='utf-8') as f:
                        json.dump(main_posts, f, indent=2, ensure_ascii=False)
                    logging.info(f"Saved post to dashboard (after creating dir): {post_data.get('author_name', 'Unknown')} - Total posts: {len(main_posts)}")
            else:
                logging.debug(f"Post already exists, skipping: {post_data.get('post_url')}")
            
        except Exception as e:
            logging.error(f"Failed to save post immediately: {e}")
            import traceback
            logging.error(f"Full traceback: {traceback.format_exc()}")
