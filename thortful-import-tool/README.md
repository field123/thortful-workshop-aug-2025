# Thortful to Elastic Path Import Tool

A Python tool to import products from Thortful.com to Elastic Path Commerce Cloud.

## Features

- Extract products from Thortful's API
- Convert data to Elastic Path format
- Upload product images
- Import products with proper tag formatting
- Create and import price books

## Prerequisites

- Python 3.7+
- Elastic Path client credentials

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up Elastic Path credentials:

   **Option A: Using .env file (Recommended)**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your credentials
   nano .env
   ```

   **Option B: Using environment variables**
   ```bash
   export EP_CLIENT_ID='your-client-id'
   export EP_CLIENT_SECRET='your-client-secret'
   ```

   Optional: Set custom API URL (default: https://epcc-integration.global.ssl.fastly.net)
   ```bash
   export EP_API_URL='https://your-api-url.com'
   ```

## Usage

### Quick Start (Import Everything)

```bash
python thortful_to_elastic_path.py all
```

This will:
1. Extract 5 pages of products from Thortful
2. Convert to Elastic Path format
3. Upload all product images
4. Import products to Elastic Path

### Step-by-Step Usage

1. **Extract products from Thortful:**
```bash
python thortful_to_elastic_path.py extract --pages 10
```

2. **Convert to Elastic Path format:**
```bash
python thortful_to_elastic_path.py convert
```

3. **Upload product images:**
```bash
python thortful_to_elastic_path.py upload-images
```

4. **Import to Elastic Path:**
```bash
python thortful_to_elastic_path.py import
```

### Price Book Management

1. **Create price book JSONL file:**
```bash
python thortful_to_elastic_path.py create-pricebook
```

2. **Import price book to Elastic Path:**
```bash
python thortful_to_elastic_path.py import-pricebook
```

### Command Options

- `extract`: Extract products from Thortful
  - `--pages N`: Number of pages to extract (default: 5, max 50 per page)
  
- `extract-pricing`: Extract pricing from Thortful product pages
  - `--input FILE`: Product JSON file
  - `--max-pricing N`: Limit number of products to process
  
- `convert`: Convert Thortful JSON to Elastic Path CSV
  - `--input FILE`: Specify input file (auto-detects latest if not provided)
  
- `upload-images`: Upload product images to Elastic Path
  
- `import`: Import products to Elastic Path
  - `--input FILE`: Specify CSV file (auto-detects latest if not provided)
  
- `create-pricebook`: Generate price book JSONL file
  - `--input FILE`: Product JSON file
  - `--output FILE`: Output JSONL file
  
- `import-pricebook`: Import price book to Elastic Path
  - `--input FILE`: JSONL file to import
  
- `all`: Run the complete import process

## Data Files

All data files are stored in the `data/` directory:
- `thortful_products_*.json` - Raw product data from Thortful
- `elastic_path_products_*.csv` - Converted product data
- `elastic_path_products_*_with_images.csv` - Product data with image IDs
- `thortful_pricebook_*.jsonl` - Price book import files

## Important Notes

1. **Thortful Token**: The Thortful API token may expire. If extraction fails, you may need to update the token in the script.

2. **Rate Limiting**: The tool includes delays between API calls to avoid rate limits.

3. **Tag Format**: Tags are automatically converted to Elastic Path format:
   - Spaces replaced with hyphens
   - Special characters removed
   - Pipe-separated format
   - Duplicates removed

4. **Image Upload**: Images are uploaded directly from Thortful's CDN URLs.

5. **Currency**: Price books support both GBP and USD. The store's currency settings must match.

## Troubleshooting

### Authentication Failed
Make sure your environment variables are set:
```bash
echo $EP_CLIENT_ID
echo $EP_CLIENT_SECRET
```

### Import Failed
The tool will display specific error messages from Elastic Path. Common issues:
- Tags with spaces or commas (automatically fixed by the tool)
- Duplicate SKUs
- Field length limits
- Currency mismatch (ensure store supports the currency in price book)

### Token Expired
If you see 401 errors, the tool will automatically refresh the access token.

## Example Output

```
🚀 Running complete import process...

Step 1: Extracting products from Thortful...
Fetching page 1...
Found 20 cards on page 1
...
✅ Extracted 100 products to data/thortful_products_20250806_123456.json

Step 2: Converting to Elastic Path format...
✅ Converted 100 products to data/elastic_path_products_20250806_123456.csv

Step 3: Uploading images...
Uploading 1/100: Funny Birthday Card...
  ✓ Uploaded: 185da781-86b0-4173-85c5-99e21d87a8b3
...
✅ Uploaded 100 images
✅ Updated CSV: data/elastic_path_products_20250806_123456_with_images.csv

Step 4: Importing products...
Import job created: 77d6376d-dc64-43b4-9846-f5ea5789a871
Job status: pending
Job status: started
Job status: success
✅ Import completed successfully!

🎉 Complete! All products imported successfully.
```