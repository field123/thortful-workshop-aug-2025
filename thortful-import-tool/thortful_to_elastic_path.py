#!/usr/bin/env python3
"""
Thortful to Elastic Path Import Tool

This script handles the complete process of importing Thortful products to Elastic Path:
1. Extract products from Thortful API
2. Convert to Elastic Path format
3. Upload images
4. Import products

Usage:
    python thortful_to_elastic_path.py --help
    python thortful_to_elastic_path.py extract
    python thortful_to_elastic_path.py convert
    python thortful_to_elastic_path.py upload-images
    python thortful_to_elastic_path.py import
    python thortful_to_elastic_path.py all
"""

import argparse
import json
import csv
import os
import sys
import time
import requests
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import urllib.parse
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class ThortfulExtractor:
    """Extract products from Thortful API"""
    
    def __init__(self):
        self.base_url = "https://www.thortful.com/api/v3/explore"
        self.headers = {
            "user_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiJhbm9ueW1vdXMiLCJhbm9ueW1vdXNfaWQiOiI2ODkzNDkxODcwZmY3YzViYWY3MjQxOWQiLCJyb2xlcyI6IkFOT05ZTU9VUyIsImV4cCI6MTc1NDQ5MDE2ODg1MX0.V7An2oAIlYhQBQih6lTzecMctZB1R6Z5NxFy51S4530",
            "Content-Type": "application/json"
        }
        self.cards_data = []
    
    def create_request_body(self, page_number: int, previous_id: str = None) -> Dict[str, Any]:
        return {
            "previous_id": previous_id or "6892601b0f72f624fcf1b43e",
            "page": {"number": page_number},
            "criteria": {
                "card_types": ["STANDARD"],
                "tags": [],
                "keywords": [""],
                "search_query": [""],
                "source": None,
                "indexing_mode": None,
                "keyword_criteria": {"search_type": "A_SEARCH"},
                "categories": ["560bdf1477c804a23c0eac24"],  # Birthday category
                "recipient": {
                    "gender": None,
                    "single_age": None,
                    "min_age": None,
                    "max_age": None
                },
                "excluded_tags": []
            },
            "usage_type": "OUTSIDE_LINK",
            "usage_info": None,
            "platform": {
                "type": "web",
                "os": "Mac OS",
                "os_version": "10.15",
                "browser": "Firefox",
                "browser_version": "141.0",
                "app_version": 1998,
                "screen_size": {"height": 1080, "width": 1920}
            }
        }
    
    def fetch_page(self, page_number: int, previous_id: str = None) -> Dict[str, Any]:
        print(f"Fetching page {page_number}...")
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=self.create_request_body(page_number, previous_id),
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page {page_number}: {e}")
            return None
    
    def extract_all(self, max_pages: int = 5, delay_seconds: float = 1.0) -> str:
        """Extract products and save to JSON file"""
        previous_id = None
        
        for page_num in range(1, max_pages + 1):
            response_data = self.fetch_page(page_num, previous_id)
            
            if not response_data:
                print(f"Failed to fetch page {page_num}, stopping...")
                break
            
            cards = response_data.get("cards", [])
            if not cards:
                print(f"No more cards found on page {page_num}, stopping...")
                break
            
            print(f"Found {len(cards)} cards on page {page_num}")
            self.cards_data.extend(cards)
            
            if cards:
                previous_id = cards[-1].get("_id")
            
            if page_num < max_pages:
                time.sleep(delay_seconds)
        
        # Enhance image URLs
        enhanced_data = []
        for card in self.cards_data:
            enhanced_card = self._enhance_image_urls(card)
            enhanced_data.append(enhanced_card)
        
        # Save data
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"data/thortful_products_{timestamp}.json"
        os.makedirs("data", exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enhanced_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Extracted {len(enhanced_data)} products to {output_file}")
        return output_file
    
    def _enhance_image_urls(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """Convert image URLs to CDN format"""
        enhanced_product = product.copy()
        
        if 'image' in product and isinstance(product['image'], dict):
            enhanced_image = {}
            for size, url in product['image'].items():
                if size != 'status' and url:
                    enhanced_image[size] = self._convert_image_url(url, size)
                elif size == 'status':
                    enhanced_image[size] = url
            
            enhanced_product['image'] = enhanced_image
            
            # Add preferred image URL
            if enhanced_image.get('large'):
                enhanced_product['preferred_image_url'] = enhanced_image['large']
            elif enhanced_image.get('medium'):
                enhanced_product['preferred_image_url'] = enhanced_image['medium']
        
        return enhanced_product
    
    def _convert_image_url(self, original_url: str, size: str = 'medium') -> str:
        """Convert to CDN format with quality parameters"""
        if not original_url:
            return ""
        
        parts = original_url.split('/')
        if 'card' in parts:
            card_idx = parts.index('card')
            if card_idx + 2 < len(parts):
                card_id = parts[card_idx + 1]
                filename_with_params = parts[card_idx + 2]
                
                version = "1"
                if '?version=' in filename_with_params:
                    filename, version_param = filename_with_params.split('?version=')
                    version = version_param
                else:
                    filename = filename_with_params
                
                width_map = {
                    'thumbnail': 80,
                    'small': 120,
                    'medium': 160,
                    'large': 320,
                    'xlarge': 640
                }
                width = width_map.get(size, 160)
                
                new_url = f"https://images.thortful.com/cdn-cgi/image/quality=60,width={width},format=auto/card/{card_id}/{filename}?version={version}"
                return new_url
        
        return original_url


class ThortfulPricingExtractor:
    """Extract pricing from Thortful product pages"""
    
    def __init__(self):
        self.base_url = "https://www.thortful.com/card/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        })
    
    def extract_pricing(self, products: List[Dict[str, Any]], max_products: int = None) -> Tuple[List[Dict[str, Any]], int]:
        """Extract pricing for products and return updated list"""
        if max_products:
            products = products[:max_products]
        
        success_count = 0
        print(f"\nExtracting pricing for {len(products)} products...")
        
        for i, product in enumerate(products):
            pdp_url = product.get('pdp_url', '')
            if not pdp_url:
                continue
            
            print(f"Product {i+1}/{len(products)}: {product.get('description', {}).get('title', 'Untitled')[:40]}...")
            
            try:
                pricing = self._fetch_product_pricing(pdp_url)
                if pricing:
                    product['pricing'] = pricing
                    standard_price = pricing.get('Standard Card (A5)', '')
                    if standard_price:
                        product['standard_card_price'] = standard_price
                        print(f"  ✓ Standard Card: {standard_price}")
                        success_count += 1
                else:
                    print(f"  ✗ No pricing found")
            except Exception as e:
                print(f"  ✗ Error: {str(e)}")
            
            # Rate limiting
            if i < len(products) - 1:
                time.sleep(1.5)
        
        print(f"\nPricing extraction complete: {success_count}/{len(products)} products")
        return products, success_count
    
    def _fetch_product_pricing(self, pdp_url: str) -> Optional[Dict[str, str]]:
        """Fetch pricing for a single product"""
        full_url = self.base_url + pdp_url
        
        response = self.session.get(full_url, timeout=30)
        if response.status_code != 200:
            return None
        
        return self._extract_pricing_from_html(response.text)
    
    def _extract_pricing_from_html(self, html: str) -> Optional[Dict[str, str]]:
        """Extract pricing from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        pricing_data = {}
        
        # Method 1: Look for the specific pricing structure
        # The page shows: "Standard Card (A5)\n\n£3.69"
        text_content = soup.get_text()
        lines = text_content.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            if line == 'Standard Card (A5)':
                # Look for price in next few lines
                for j in range(i+1, min(i+5, len(lines))):
                    next_line = lines[j].strip()
                    if next_line.startswith('£') and any(c.isdigit() for c in next_line):
                        pricing_data['Standard Card (A5)'] = next_line
                        break
            elif line == 'Large Card (A4)':
                for j in range(i+1, min(i+5, len(lines))):
                    next_line = lines[j].strip()
                    if next_line.startswith('£') and any(c.isdigit() for c in next_line):
                        pricing_data['Large Card (A4)'] = next_line
                        break
        
        # Method 2: Fallback to regex patterns
        if not pricing_data or 'Standard Card (A5)' not in pricing_data:
            patterns = [
                (r'Standard Card \(A5\)\s*[\n\r\s]*£(\d+\.\d{2})', 'Standard Card (A5)'),
                (r'Large Card \(A4\)\s*[\n\r\s]*£(\d+\.\d{2})', 'Large Card (A4)')
            ]
            for pattern, label in patterns:
                match = re.search(pattern, text_content, re.MULTILINE | re.DOTALL)
                if match and label not in pricing_data:
                    pricing_data[label] = f'£{match.group(1)}'
        
        return pricing_data if pricing_data else None


class ElasticPathAuth:
    """Handle Elastic Path OAuth authentication"""
    
    def __init__(self, api_url: str = None, client_id: str = None, client_secret: str = None):
        self.api_url = api_url or os.getenv('EP_API_URL', 'https://epcc-integration.global.ssl.fastly.net')
        self.client_id = client_id or os.getenv('EP_CLIENT_ID')
        self.client_secret = client_secret or os.getenv('EP_CLIENT_SECRET')
        self.token_cache_file = 'data/.ep_token_cache.json'
        
        if not self.client_id or not self.client_secret:
            raise ValueError("Client ID and Secret must be provided via EP_CLIENT_ID and EP_CLIENT_SECRET environment variables")
    
    def get_access_token(self) -> str:
        """Get access token (from cache or new)"""
        # Try cache first
        if os.path.exists(self.token_cache_file):
            try:
                with open(self.token_cache_file, 'r') as f:
                    cache = json.load(f)
                
                expiry_time = datetime.fromisoformat(cache['expires_at'])
                if datetime.now() < expiry_time - timedelta(minutes=5):
                    return cache['access_token']
            except Exception:
                pass
        
        # Get new token
        print("Getting new access token...")
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'client_credentials'
        }
        
        response = requests.post(f"{self.api_url}/oauth/access_token", headers=headers, data=data)
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data['access_token']
            expires_in = token_data.get('expires_in', 3600)
            
            # Cache token
            os.makedirs("data", exist_ok=True)
            cache = {
                'access_token': access_token,
                'expires_at': (datetime.now() + timedelta(seconds=expires_in)).isoformat()
            }
            with open(self.token_cache_file, 'w') as f:
                json.dump(cache, f)
            
            return access_token
        else:
            raise Exception(f"Failed to get access token: {response.status_code}")


class ElasticPathConverter:
    """Convert Thortful data to Elastic Path format"""
    
    def convert(self, input_file: str) -> str:
        """Convert Thortful JSON to Elastic Path CSV"""
        with open(input_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        output_file = input_file.replace('.json', '.csv').replace('thortful_products', 'elastic_path_products')
        
        rows = []
        for product in products:
            row = self._convert_product(product)
            rows.append(row)
        
        # Write CSV
        headers = ['external_ref', 'name', 'sku', 'slug', 'commodity_type', 'description', 'status', 'tags', 'main_image_id', 'price']
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers, quoting=csv.QUOTE_ALL)
            writer.writeheader()
            writer.writerows(rows)
        
        print(f"✅ Converted {len(rows)} products to {output_file}")
        return output_file
    
    def _convert_product(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """Convert single product"""
        description_data = product.get('description', {})
        classification_data = product.get('classification', {})
        
        # Process tags for Elastic Path (pipe-separated, no spaces)
        tags = self._process_tags(classification_data.get('tags', []))
        
        # Clean and limit text fields
        name = self._clean_text(description_data.get('title', 'Untitled'))[:255]
        description = self._clean_text(description_data.get('description', ''))[:1000]
        sku = self._create_sku(product.get('pdp_url', ''))
        slug = self._create_slug(product.get('pdp_url', ''))
        
        # Extract price if available
        price = ''
        if 'standard_card_price' in product:
            # Remove £ symbol and convert to pence (multiply by 100)
            price_str = product['standard_card_price'].replace('£', '').strip()
            try:
                price_float = float(price_str)
                price = str(int(price_float * 100))  # Convert to pence
            except ValueError:
                price = ''
        
        return {
            'external_ref': product.get('id', '')[:50],
            'name': name,
            'sku': sku,
            'slug': slug,
            'commodity_type': 'physical',
            'description': description,
            'status': 'live' if product.get('listed', False) else 'draft',
            'tags': tags,
            'main_image_id': '',  # Will be filled by image upload
            'price': price
        }
    
    def _process_tags(self, tags: List[str]) -> str:
        """Process tags for Elastic Path format"""
        clean_tags = []
        seen_tags = set()
        
        for tag in tags[:20]:  # Limit to 20 tags
            # Replace spaces with hyphens, remove special characters
            clean_tag = re.sub(r'[^a-zA-Z0-9-]', '', tag.replace(' ', '-'))
            
            if clean_tag and clean_tag not in seen_tags:
                clean_tags.append(clean_tag)
                seen_tags.add(clean_tag)
        
        return ','.join(clean_tags)
    
    def _clean_text(self, text: str) -> str:
        """Clean text for CSV"""
        if not text:
            return ""
        text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
        text = text.replace('"', '""')
        return text.strip()
    
    def _create_sku(self, pdp_url: str) -> str:
        """Create SKU from PDP URL"""
        if not pdp_url:
            return ""
        sku = re.sub(r'[^a-zA-Z0-9-]', '', pdp_url)
        return sku.strip('-')[:64]
    
    def _create_slug(self, pdp_url: str) -> str:
        """Create slug from PDP URL"""
        return self._create_sku(pdp_url)  # Same as SKU


class ElasticPathImageUploader:
    """Upload images to Elastic Path"""
    
    def __init__(self, api_url: str, access_token: str):
        self.api_url = api_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
    
    def upload_all(self, json_file: str, csv_file: str) -> str:
        """Upload all product images and update CSV"""
        # Load products
        with open(json_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Load CSV
        rows = []
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        print(f"Uploading images for {len(products)} products...")
        
        # Upload images
        image_map = {}
        for i, product in enumerate(products):
            product_id = product.get('id')
            image_url = product.get('preferred_image_url')
            
            if image_url:
                print(f"Uploading {i+1}/{len(products)}: {product.get('description', {}).get('title', 'Untitled')[:50]}...")
                file_id = self._upload_image(image_url)
                if file_id:
                    image_map[product_id] = file_id
                    print(f"  ✓ Uploaded: {file_id}")
                else:
                    print(f"  ✗ Failed")
                
                time.sleep(0.5)  # Rate limiting
        
        # Update CSV with image IDs
        for row in rows:
            external_ref = row.get('external_ref')
            if external_ref in image_map:
                row['main_image_id'] = image_map[external_ref]
        
        # Save updated CSV
        output_file = csv_file.replace('.csv', '_with_images.csv')
        if rows:
            headers = list(rows[0].keys())
            with open(output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=headers, quoting=csv.QUOTE_ALL)
                writer.writeheader()
                writer.writerows(rows)
        else:
            print("No rows to write")
            return csv_file
        
        print(f"\n✅ Uploaded {len(image_map)} images")
        print(f"✅ Updated CSV: {output_file}")
        return output_file
    
    def _upload_image(self, image_url: str) -> Optional[str]:
        """Upload single image by URL"""
        try:
            files = {'file_location': (None, image_url)}
            response = requests.post(
                f"{self.api_url}/v2/files",
                headers=self.headers,
                files=files,
                timeout=60
            )
            
            if response.status_code == 201:
                return response.json()['data']['id']
            else:
                return None
        except Exception:
            return None


class ElasticPathPriceBookGenerator:
    """Generate price book JSONL for Elastic Path import"""
    
    def __init__(self):
        self.pricebook_ref = "thortful-standard-pb"
        self.pricebook_name = "Thortful Standard Pricing (USD)"
        self.default_price = 369  # £3.69 in pence
    
    def generate_pricebook_jsonl(self, products: List[Dict[str, Any]], output_file: str = None) -> str:
        """Generate JSONL file with price book and product prices"""
        if not output_file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"data/thortful_pricebook_{timestamp}.jsonl"
        
        os.makedirs("data", exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            # Write price book object
            pricebook_obj = {
                "data": {
                    "type": "pricebook",
                    "attributes": {
                        "external_ref": self.pricebook_ref,
                        "name": self.pricebook_name,
                        "description": "Standard pricing for Thortful greeting cards imported from Thortful.com"
                    }
                }
            }
            f.write(json.dumps(pricebook_obj) + '\n')
            
            # Write product price objects
            price_count = 0
            for product in products:
                # Get SKU from pdp_url or id
                sku = self._create_sku(product.get('pdp_url', ''))
                if not sku and product.get('id'):
                    sku = product['id']
                
                if not sku:
                    continue
                
                # Get price from product or use default
                price_in_pence = self.default_price
                if 'standard_card_price' in product:
                    try:
                        price_str = product['standard_card_price'].replace('£', '').strip()
                        price_in_pence = int(float(price_str) * 100)
                    except (ValueError, AttributeError):
                        pass
                
                # Create price object
                # Convert GBP to USD (approximate conversion rate)
                price_in_cents = int(price_in_pence * 1.27)  # Approximate GBP to USD conversion
                price_obj = {
                    "data": {
                        "type": "product-price",
                        "pricebook_external_ref": self.pricebook_ref,
                        "attributes": {
                            "external_ref": f"price-{product.get('id', sku)}",
                            "currencies": {
                                "USD": {
                                    "amount": price_in_cents,
                                    "includes_tax": True
                                }
                            },
                            "sku": sku
                        }
                    }
                }
                
                f.write(json.dumps(price_obj) + '\n')
                price_count += 1
        
        print(f"✅ Generated price book JSONL with {price_count} product prices")
        print(f"   Output file: {output_file}")
        return output_file
    
    def _create_sku(self, pdp_url: str) -> str:
        """Create SKU from PDP URL"""
        if not pdp_url:
            return ""
        sku = re.sub(r'[^a-zA-Z0-9-]', '', pdp_url)
        return sku.strip('-')[:64]


class ElasticPathImporter:
    """Import products to Elastic Path"""
    
    def __init__(self, api_url: str, access_token: str):
        self.api_url = api_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
    
    def import_pricebook(self, jsonl_file: str) -> bool:
        """Import price book from JSONL file"""
        print(f"Importing price book from {jsonl_file}...")
        
        with open(jsonl_file, 'rb') as f:
            files = {'file': (os.path.basename(jsonl_file), f, 'application/x-ndjson')}
            response = requests.post(
                f"{self.api_url}/pcm/pricebooks/import",
                headers=self.headers,
                files=files,
                timeout=120
            )
        
        if response.status_code == 201:
            job_data = response.json()
            job_id = job_data['data']['id']
            print(f"Price book import job created: {job_id}")
            
            # Wait for completion
            return self._wait_for_job(job_id)
        else:
            print(f"Failed to create price book import job: {response.status_code}")
            print(response.text)
            return False
    
    def import_products(self, csv_file: str) -> bool:
        """Import products from CSV"""
        print(f"Importing products from {csv_file}...")
        
        with open(csv_file, 'rb') as f:
            files = {'file': (os.path.basename(csv_file), f, 'text/csv')}
            response = requests.post(
                f"{self.api_url}/pcm/products/import",
                headers=self.headers,
                files=files,
                timeout=120
            )
        
        if response.status_code == 201:
            job_data = response.json()
            job_id = job_data['data']['id']
            print(f"Import job created: {job_id}")
            
            # Wait for completion
            return self._wait_for_job(job_id)
        else:
            print(f"Failed to create import job: {response.status_code}")
            print(response.text)
            return False
    
    def _wait_for_job(self, job_id: str) -> bool:
        """Wait for job completion"""
        for _ in range(30):  # Max 5 minutes
            response = requests.get(
                f"{self.api_url}/pcm/jobs/{job_id}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                job_data = response.json()
                status = job_data['data']['attributes']['status']
                print(f"Job status: {status}")
                
                if status == 'success':
                    print("✅ Import completed successfully!")
                    return True
                elif status == 'failed':
                    print("❌ Import failed!")
                    self._get_job_errors(job_id)
                    return False
                
                time.sleep(10)
        
        print("❌ Import timed out")
        return False
    
    def _get_job_errors(self, job_id: str):
        """Get job error details"""
        response = requests.get(
            f"{self.api_url}/pcm/jobs/{job_id}/errors",
            headers=self.headers
        )
        
        if response.status_code == 200:
            errors = response.json().get('data', [])
            print(f"\nFound {len(errors)} errors:")
            for error in errors[:10]:
                print(f"  - {error['attributes']['message']}")


def main():
    parser = argparse.ArgumentParser(description='Thortful to Elastic Path Import Tool')
    parser.add_argument('command', choices=['extract', 'extract-pricing', 'convert', 'upload-images', 'import', 'create-pricebook', 'import-pricebook', 'all'],
                        help='Command to run')
    parser.add_argument('--pages', type=int, default=5, help='Number of pages to extract (default: 5)')
    parser.add_argument('--input', help='Input file (for convert/upload/import commands)')
    parser.add_argument('--max-pricing', type=int, help='Maximum number of products to extract pricing for')
    parser.add_argument('--output', help='Output file (for create-pricebook command)')
    
    args = parser.parse_args()
    
    # Check authentication for Elastic Path commands
    if args.command in ['upload-images', 'import', 'import-pricebook', 'all']:
        if not os.getenv('EP_CLIENT_ID') or not os.getenv('EP_CLIENT_SECRET'):
            print("❌ ERROR: Missing Elastic Path credentials!")
            print("Please set environment variables:")
            print("  export EP_CLIENT_ID='your-client-id'")
            print("  export EP_CLIENT_SECRET='your-client-secret'")
            sys.exit(1)
    
    # Execute commands
    if args.command == 'extract':
        extractor = ThortfulExtractor()
        extractor.extract_all(max_pages=args.pages)
    
    elif args.command == 'extract-pricing':
        if not args.input:
            # Find latest JSON file
            files = sorted([f for f in os.listdir('data') if f.startswith('thortful_products_') and f.endswith('.json')])
            if files:
                args.input = f"data/{files[-1]}"
            else:
                print("❌ No input file found. Run 'extract' first.")
                sys.exit(1)
        
        # Load products
        with open(args.input, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Extract pricing
        pricing_extractor = ThortfulPricingExtractor()
        updated_products, success_count = pricing_extractor.extract_pricing(products, args.max_pricing)
        
        # Save updated products
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"data/thortful_products_with_pricing_{timestamp}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(updated_products, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Saved products with pricing to {output_file}")
    
    elif args.command == 'convert':
        if not args.input:
            # Find latest JSON file
            files = sorted([f for f in os.listdir('data') if f.startswith('thortful_products_') and f.endswith('.json')])
            if files:
                args.input = f"data/{files[-1]}"
            else:
                print("❌ No input file found. Run 'extract' first.")
                sys.exit(1)
        
        converter = ElasticPathConverter()
        converter.convert(args.input)
    
    elif args.command == 'upload-images':
        auth = ElasticPathAuth()
        token = auth.get_access_token()
        
        # Find files
        json_files = sorted([f for f in os.listdir('data') if f.startswith('thortful_products_') and f.endswith('.json')])
        csv_files = sorted([f for f in os.listdir('data') if f.startswith('elastic_path_products_') and f.endswith('.csv') and 'with_images' not in f])
        
        if not json_files or not csv_files:
            print("❌ Required files not found. Run 'extract' and 'convert' first.")
            sys.exit(1)
        
        uploader = ElasticPathImageUploader(auth.api_url, token)
        uploader.upload_all(f"data/{json_files[-1]}", f"data/{csv_files[-1]}")
    
    elif args.command == 'import':
        auth = ElasticPathAuth()
        token = auth.get_access_token()
        
        if not args.input:
            # Find latest CSV with images
            files = sorted([f for f in os.listdir('data') if 'with_images.csv' in f])
            if files:
                args.input = f"data/{files[-1]}"
            else:
                print("❌ No CSV with images found. Run 'upload-images' first.")
                sys.exit(1)
        
        importer = ElasticPathImporter(auth.api_url, token)
        importer.import_products(args.input)
    
    elif args.command == 'create-pricebook':
        if not args.input:
            # Find latest JSON file, preferring ones with pricing
            files = sorted([f for f in os.listdir('data') if f.startswith('thortful_products') and f.endswith('.json')])
            # Prefer files with pricing
            pricing_files = [f for f in files if 'with_pricing' in f]
            if pricing_files:
                args.input = f"data/{pricing_files[-1]}"
            elif files:
                args.input = f"data/{files[-1]}"
                print("⚠️  Using products without pricing data. All products will be priced at £3.69")
            else:
                print("❌ No input file found. Run 'extract' first.")
                sys.exit(1)
        
        # Load products
        with open(args.input, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Generate price book
        generator = ElasticPathPriceBookGenerator()
        output_file = generator.generate_pricebook_jsonl(products, args.output)
        
        print(f"\n📋 Price book JSONL ready for import:")
        print(f"   curl -X POST https://api.elastic-path.com/pcm/pricebooks/import \\")
        print(f"        -H 'Authorization: Bearer YOUR_TOKEN' \\")
        print(f"        -F 'file=@{output_file}'")
    
    elif args.command == 'import-pricebook':
        auth = ElasticPathAuth()
        token = auth.get_access_token()
        
        if not args.input:
            # Find latest JSONL file
            files = sorted([f for f in os.listdir('data') if f.startswith('thortful_pricebook') and f.endswith('.jsonl')])
            if files:
                args.input = f"data/{files[-1]}"
            else:
                print("❌ No price book JSONL file found. Run 'create-pricebook' first.")
                sys.exit(1)
        
        importer = ElasticPathImporter(auth.api_url, token)
        success = importer.import_pricebook(args.input)
        
        if success:
            print("\n✅ Price book imported successfully!")
        else:
            print("\n❌ Price book import failed.")
    
    elif args.command == 'all':
        print("🚀 Running complete import process...\n")
        
        # Extract
        print("Step 1: Extracting products from Thortful...")
        extractor = ThortfulExtractor()
        json_file = extractor.extract_all(max_pages=args.pages)
        
        # Extract pricing
        print("\nStep 2: Extracting pricing information...")
        with open(json_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        pricing_extractor = ThortfulPricingExtractor()
        updated_products, _ = pricing_extractor.extract_pricing(products, args.max_pricing)
        
        # Save products with pricing
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_with_pricing = f"data/thortful_products_with_pricing_{timestamp}.json"
        with open(json_with_pricing, 'w', encoding='utf-8') as f:
            json.dump(updated_products, f, indent=2, ensure_ascii=False)
        
        # Convert
        print("\nStep 3: Converting to Elastic Path format...")
        converter = ElasticPathConverter()
        csv_file = converter.convert(json_with_pricing)
        
        # Upload images
        print("\nStep 4: Uploading images...")
        auth = ElasticPathAuth()
        token = auth.get_access_token()
        uploader = ElasticPathImageUploader(auth.api_url, token)
        csv_with_images = uploader.upload_all(json_with_pricing, csv_file)
        
        # Import
        print("\nStep 5: Importing products...")
        importer = ElasticPathImporter(auth.api_url, token)
        success = importer.import_products(csv_with_images)
        
        if success:
            print("\n🎉 Complete! All products imported successfully.")
        else:
            print("\n❌ Import failed. Check the errors above.")


if __name__ == "__main__":
    main()