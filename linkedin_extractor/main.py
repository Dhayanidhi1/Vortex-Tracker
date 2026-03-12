"""
LinkedIn Post Extractor — Main Entry Point
"""
import sys
import logging
import argparse
from datetime import datetime
from pathlib import Path

from config import KEYWORDS, MONTHS_BACK, OUTPUT_DIR, LOG_DIR, ensure_directories, MAX_PAGES
from scraper import LinkedInScraper
from storage import StorageManager


def setup_logging():
    ensure_directories()
    ts = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_file = Path(LOG_DIR) / f"scraper_{ts}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    logger = logging.getLogger("linkedin_extractor")
    logger.info(f"Log file: {log_file}")
    return logger


def parse_args():
    parser = argparse.ArgumentParser(description="LinkedIn Post Extractor")
    parser.add_argument("--keywords", type=str, help="Comma-separated keywords to search for")
    parser.add_argument("--max-posts", type=int, help="Maximum number of posts to extract")
    return parser.parse_args()


def main():
    args = parse_args()
    
    # Use command line arguments if provided, otherwise use config defaults
    keywords = args.keywords.split(",") if args.keywords else KEYWORDS
    keywords = [k.strip() for k in keywords if k.strip()]  # Clean up keywords
    max_posts = args.max_posts if args.max_posts else MAX_PAGES
    
    logger = setup_logging()
    logger.info("=" * 60)
    logger.info("LinkedIn Post Extractor")
    logger.info(f"Keywords: {keywords}")
    logger.info(f"Max Posts: {max_posts}")
    logger.info(f"Time Range: Last {MONTHS_BACK} months")
    logger.info(f"Output Directory: {OUTPUT_DIR}")
    logger.info("=" * 60)

    # Update the scraper to use the max_posts parameter
    scraper = LinkedInScraper(keywords=keywords, months_back=MONTHS_BACK, max_posts=max_posts)
    storage = StorageManager()

    try:
        posts = scraper.scrape_all_keywords(keywords)

        logger.info(f"\nTotal posts collected: {len(posts)}")

        if not posts:
            logger.warning("No posts collected.")
            return 0

        # Don't save all posts at the end since we're saving them individually
        # Just save to timestamped files and database for backup
        storage_results = storage.save_timestamped_only(posts)
        logger.info(f"CSV saved: {storage_results['csv_path']}")
        logger.info(f"JSON saved: {storage_results['json_path']}")
        logger.info(f"Database: {storage_results['database_path']}")
        
        # The main posts.json file is already updated in real-time by the scraper

        stats = storage.get_stats()
        logger.info("\n" + "=" * 60)
        logger.info("EXTRACTION SUMMARY")
        logger.info(f"Total Posts in DB: {stats['total_posts']}")
        logger.info(f"Likes: {stats['total_engagement']['likes']:,}")
        logger.info(f"Comments: {stats['total_engagement']['comments']:,}")
        logger.info(f"Reposts: {stats['total_engagement']['reposts']:,}")
        logger.info("Top Authors:")
        for author, count in list(stats["top_authors"].items())[:5]:
            logger.info(f"  - {author}: {count} posts")
        logger.info("=" * 60)
        return 0

    except KeyboardInterrupt:
        logger.info("Extraction interrupted by user.")
        return 1
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
