#!/usr/bin/env python3
"""
Terminal web scraper for missing email addresses in Solinatra prospect list.

Reads the Excel file, finds rows without public email, scrapes the organisation's
website (and any explicit contact URL) to find email addresses, and writes an
updated file with found emails.

Dependencies: pandas, openpyxl, requests, beautifulsoup4
Install with: pip install pandas openpyxl requests beautifulsoup4
"""

import re
import time
from urllib.parse import urljoin, urlparse

import pandas as pd
import requests
from bs4 import BeautifulSoup

# ============================================================================
# CONFIGURATION
# ============================================================================
INPUT_FILE = "Solinatra_plastic_free_planting_prospects_2026-09-01.xlsx"
OUTPUT_FILE = "Solinatra_prospects_with_found_emails.xlsx"
SHEET_NAME = "All prospects"   # main prospect sheet

REQUEST_DELAY = 1.0             # seconds between requests (be polite)
TIMEOUT = 15                    # seconds per request
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"

EMAIL_REGEX = re.compile(
    r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
)

# Keywords for contact pages (relative paths we can try)
CONTACT_PATHS = [
    "contact", "contact-us", "contactus", "about/contact",
    "about", "imprint", "impressum", "legal", "support",
]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def is_empty_email(email_val):
    """Return True if the email value is missing or explicitly says 'No public email'."""
    if pd.isna(email_val):
        return True
    if isinstance(email_val, str):
        val = email_val.strip().lower()
        if val == "" or val.startswith("no public email") or val.startswith("no email"):
            return True
    return False

def fetch_page(url, timeout=TIMEOUT):
    """Fetch a URL and return BeautifulSoup object, or None on failure."""
    headers = {"User-Agent": USER_AGENT}
    try:
        resp = requests.get(url, timeout=timeout, headers=headers)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        return soup
    except Exception as e:
        print(f"  ! Failed to fetch {url}: {e}")
        return None

def extract_emails_from_soup(soup):
    """Extract all email addresses from a BeautifulSoup object."""
    emails = set()

    # 1. mailto: links
    for link in soup.find_all("a", href=True):
        href = link["href"]
        if href.startswith("mailto:"):
            email = href[7:].split("?")[0].strip()
            if email:
                emails.add(email)

    # 2. Plain text email pattern
    text = soup.get_text()
    for match in EMAIL_REGEX.findall(text):
        emails.add(match)

    # 3. data-email attributes
    for elem in soup.find_all(attrs={"data-email": True}):
        email = elem["data-email"].strip()
        if email:
            emails.add(email)

    return emails

def scrape_organisation(org_name, website, contact_route):
    """
    Main scraping function for one organisation.
    Returns a set of found email addresses.
    """
    found_emails = set()

    if not website or not isinstance(website, str):
        print(f"Skipping {org_name}: no website.")
        return found_emails

    website = website.strip()
    if not website.startswith("http"):
        website = "https://" + website

    # Build list of URLs to try
    urls_to_try = [website]

    # If contact_route is given
    if contact_route and isinstance(contact_route, str):
        route = contact_route.strip()
        if route.startswith("http"):
            urls_to_try.append(route)
        else:
            urls_to_try.append(urljoin(website, route))

    # Add common contact paths
    for path in CONTACT_PATHS:
        urls_to_try.append(urljoin(website, path))

    # Remove duplicates while preserving order
    unique_urls = []
    for u in urls_to_try:
        if u not in unique_urls:
            unique_urls.append(u)

    print(f"Scraping {org_name}...")
    for url in unique_urls:
        time.sleep(REQUEST_DELAY)
        soup = fetch_page(url)
        if soup is None:
            continue
        emails = extract_emails_from_soup(soup)
        found_emails.update(emails)
        if found_emails:
            # We could break early, but sometimes a deeper page has more complete list.
            # Let's continue scanning all pages to get the fullest list.
            pass

    return found_emails

# ============================================================================
# MAIN
# ============================================================================

def main():
    print("Reading Excel file...")
    try:
        # The second row (index 1) contains the real column headers.
        df = pd.read_excel(INPUT_FILE, sheet_name=SHEET_NAME, engine="openpyxl", header=1)
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    print("Columns found:", list(df.columns))

    # Find required columns
    email_col = None
    website_col = None
    contact_col = None
    org_col = None

    for col in df.columns:
        col_lower = str(col).lower().strip()
        if "public email" in col_lower:
            email_col = col
        elif "website" in col_lower and "email" not in col_lower:
            website_col = col
        elif "contact route" in col_lower:
            contact_col = col
        elif "organisation" in col_lower:
            org_col = col

    if not all([email_col, website_col, org_col]):
        print("Could not find required columns. Available columns:")
        print(list(df.columns))
        return

    # Filter rows where email is missing
    missing_email_df = df[df[email_col].apply(is_empty_email)].copy()
    print(f"Found {len(missing_email_df)} organisations with missing email.")

    if missing_email_df.empty:
        print("No missing emails found.")
        return

    # Prepare results
    results = []
    for idx, row in missing_email_df.iterrows():
        org = str(row[org_col]) if pd.notna(row[org_col]) else "Unknown"
        website = row[website_col] if pd.notna(row[website_col]) else ""
        contact = row[contact_col] if pd.notna(row[contact_col]) else ""

        if not website:
            print(f"Skipping {org} – no website URL.")
            results.append({
                "Organisation": org,
                "Found emails": "",
                "Scraped URLs": "",
            })
            continue

        found_emails = scrape_organisation(org, website, contact)
        emails_str = ", ".join(sorted(found_emails)) if found_emails else ""
        print(f"  Found: {emails_str if emails_str else 'none'}")

        results.append({
            "Organisation": org,
            "Found emails": emails_str,
            "Scraped URLs": "",
        })

    found_df = pd.DataFrame(results)

    # Add a new column "Scraped email" to the original dataframe
    df["Scraped email"] = ""
    for idx, row in missing_email_df.iterrows():
        org = str(row[org_col])
        matching = found_df[found_df["Organisation"] == org]
        if not matching.empty:
            emails = matching.iloc[0]["Found emails"]
            df.loc[idx, "Scraped email"] = emails

    # Write output
    df.to_excel(OUTPUT_FILE, index=False, sheet_name="Updated prospects")
    print(f"\nDone! Output saved to {OUTPUT_FILE}")

    found_count = found_df[found_df["Found emails"] != ""].shape[0]
    print(f"Found emails for {found_count} organisations.")
    if found_count > 0:
        print("\nSample found emails:")
        print(found_df[found_df["Found emails"] != ""].head())

if __name__ == "__main__":
    main()

