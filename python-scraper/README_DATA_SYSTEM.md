# BizCompare Pro - Real Data Scraping System

## Overview

This system collects authentic business data from multiple trusted sources across the United States, similar to services like 天眼查 (Tianyancha) and 企查查 (Qichacha) in China.

## Data Sources

### Government Sources (High Reliability)
| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| SEC EDGAR | Public company filings, executives, financials | Real-time |
| State SOS | Business registrations, officers, status | Daily |
| City Permits | Construction/project permits, costs | Daily |
| OSHA | Safety inspections, violations | Weekly |
| SAM.gov | Federal contractors, capabilities | Daily |

### Commercial Sources (Medium-High Reliability)
| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| OpenCorporates | Registration data, officers | Daily |
| BBB | Ratings, complaints, accreditation | Daily |
| D&B | Business credit, DUNS | Weekly |

### Review Sources (Medium Reliability)
| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| Google Places | Ratings, reviews, contact info | 30 minutes |
| Yelp | Ratings, reviews | 30 minutes |

## Data Fields Collected

### Basic Information
- Company name (legal and DBA names)
- Entity type (LLC, Corp, Partnership, etc.)
- Registration number
- EIN (Employer Identification Number)
- DUNS number
- Formation date
- State of formation
- Current status

### Contact Information
- Phone numbers
- Email addresses
- Website
- Physical address
- Mailing address

### Executives & Officers
- CEO/President
- All officers with titles
- Board members
- Start/end dates
- LinkedIn profiles (when available)

### Financial Data
- Revenue (exact or range)
- Employee count
- Assets and liabilities
- Public/private status
- Stock symbol (if public)
- Historical financials

### Licensing & Compliance
- Professional licenses
- License status and expiry
- Insurance status
- Bond amounts
- Safety certifications

### Ratings & Reviews
- Google rating & reviews
- Yelp rating & reviews
- BBB rating & accreditation
- Industry-specific ratings

### Legal & Safety
- Lawsuits
- Bankruptcies
- Liens and judgments
- OSHA violations
- Safety inspections

### Relationships
- Parent company
- Subsidiaries
- Affiliates
- Acquisition history

## Update Schedule

| Update Type | Frequency | Description |
|-------------|-----------|-------------|
| Real-time | 30 minutes | Ratings, reviews, contact info |
| Hourly | 1 hour | Price changes, status updates |
| Daily | 24 hours | Registration data, licenses |
| Weekly | 7 days | Financial data, deep refresh |

## Setup Instructions

### 1. Install Dependencies

```bash
cd python-scraper
pip install -r requirements.txt
```

### 2. Configure API Keys

Create a `.env` file in the project root:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Data Source APIs
GOOGLE_PLACES_API_KEY=your_google_api_key
YELP_API_KEY=your_yelp_api_key
OPENCORPORATES_API_KEY=your_opencorp_key  # Optional, free tier available
```

### 3. Initialize Database

Run the extended schema in Supabase:

```sql
-- Run supabase-schema-complete.sql first
-- Then run supabase-schema-extended.sql
```

### 4. Run Initial Data Collection

```bash
cd python-scraper
python comprehensive_scraper.py
```

### 5. Start Automated Updates

**Option A: Local Scheduler**
```bash
python data_scheduler.py
```

**Option B: GitHub Actions (Recommended)**
The workflow is configured in `.github/workflows/data-update.yml` and runs automatically every 30 minutes.

## API Endpoints

### Search Companies
```
GET /api/companies/search?q=Apple&state=CA&industry=tech&page=1
```

### Get Company Details
```
GET /api/companies/[id]
```

Response includes:
- Complete company profile
- Executives list
- Licenses
- Ratings from all sources
- Financial history
- Legal records (premium)
- Safety records
- Recent projects
- Reviews

## Data Quality Scoring

Each company receives a data quality score (0-100) based on:

| Category | Max Points |
|----------|------------|
| Basic info (name, registration, EIN) | 30 |
| Contact info (phone, email, website) | 20 |
| Executives (CEO, officers) | 15 |
| Ratings & reviews | 15 |
| Financial data | 10 |
| Verification | 10 |

## File Structure

```
python-scraper/
├── comprehensive_scraper.py    # Main multi-source scraper
├── state_registry_scraper.py   # 50-state SOS scrapers
├── data_scheduler.py           # 30-minute update scheduler
├── data_sources_config.py      # Source configuration
└── requirements.txt            # Python dependencies

.github/
└── workflows/
    └── data-update.yml         # GitHub Actions automation

app/
├── api/
│   └── companies/
│       ├── [id]/route.ts       # Company details API
│       └── search/route.ts     # Search API
└── types/
    └── company.ts              # TypeScript types
```

## Compliance Notes

- All data is collected from publicly available sources
- Respects robots.txt and rate limits
- No personal information beyond public business records
- Complies with SEC, state SOS, and other government data policies

## Extending to New Sources

To add a new data source:

1. Create a new class extending `DataSource` in `comprehensive_scraper.py`
2. Implement `search_company()` and `get_company_details()` methods
3. Add the source to `DataAggregator._init_sources()`
4. Update the data merge logic in `_merge_data()`

## Troubleshooting

### Rate Limiting
If you encounter rate limits, adjust the `rate_limit` property on data sources.

### Missing Data
Check the `data_sources` field on companies to see which sources provided data.

### API Key Issues
Verify API keys are correctly set in environment variables.

## Support

For issues or feature requests, please open a GitHub issue.
