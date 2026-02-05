# Free API Keys Setup Guide

This guide shows you how to get FREE API keys for the data scraping system.

## 📌 Overview

Most data sources offer free tiers that are sufficient for development and moderate usage:

| Source | Free Tier | Limits | Cost After |
|--------|-----------|--------|------------|
| Google Places | $200/month credit | ~40,000 requests | $17 per 1,000 |
| Yelp Fusion | 100% Free | 500 calls/day | N/A |
| OpenCorporates | Free (public) | 500 calls/day | $15/month |
| SEC EDGAR | 100% Free | 10 req/sec | Always free |
| State SOS | 100% Free | Varies | Always free |

## 🔑 Getting Your API Keys

### 1. Google Places API (Recommended - Best Data)

**Free Tier**: $200 credit per month = ~40,000 Place Details requests

#### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable APIs:
   - Click "APIs & Services" → "Enable APIs and Services"
   - Search for "Places API" and enable it
   - Search for "Maps JavaScript API" and enable it (optional)
4. Create credentials:
   - Click "Credentials" → "Create Credentials" → "API Key"
   - Copy your API key
5. Restrict your key (Important for security):
   - Click on the API key name
   - Under "API restrictions", select "Restrict key"
   - Check "Places API"
   - Add your IP address under "Application restrictions"
6. Billing:
   - Go to "Billing" and add a payment method
   - Don't worry - you get $200 free monthly credit
   - Set up budget alerts to avoid unexpected charges

**Add to your `.env` file:**
```env
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Test it:**
```bash
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=Apple+Inc&key=YOUR_API_KEY"
```

---

### 2. Yelp Fusion API (100% Free)

**Free Tier**: 500 requests per day, forever free

#### Steps:
1. Go to [Yelp Fusion](https://www.yelp.com/developers)
2. Click "Get Started" or "Create App"
3. Sign in with your Yelp account (create one if needed)
4. Fill out the app form:
   - App Name: "BizCompare Data Scraper"
   - Industry: "Business Information"
   - Description: "Collecting business ratings and reviews"
5. Agree to terms and create app
6. Copy your API Key (starts with Bearer token)

**Add to your `.env` file:**
```env
YELP_API_KEY=YOUR_YELP_API_KEY_HERE
```

**Test it:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.yelp.com/v3/businesses/search?term=coffee&location=san+francisco"
```

---

### 3. OpenCorporates API (Free Public Access)

**Free Tier**: 500 requests per month without API key, unlimited public searches

#### Option A: No API Key (Limited)
You can use OpenCorporates without an API key for basic searches:
- 500 requests per month
- 200 results per search
- Rate limit: 1 request per second

Just leave `OPENCORPORATES_API_KEY` empty in `.env`

#### Option B: Free API Key (Better Limits)
1. Go to [OpenCorporates API](https://opencorporates.com/api_accounts/new)
2. Sign up for a free account
3. Choose "Community" plan (Free)
4. Verify your email
5. Go to your account settings to get API token

**Free plan includes:**
- 500 API calls per day
- Higher rate limits
- Better data access

**Add to your `.env` file:**
```env
OPENCORPORATES_API_KEY=YOUR_OPENCORPORATES_TOKEN
```

**Test it:**
```bash
curl "https://api.opencorporates.com/v0.4/companies/search?q=Apple+Inc&jurisdiction_code=us_ca"
```

---

### 4. SEC EDGAR (Always Free - No Key Needed)

**Free Tier**: Completely free, no API key needed

#### Requirements:
- Must include User-Agent header with your email
- Rate limit: 10 requests per second
- No registration needed

The scraper already handles this automatically:
```python
headers = {"User-Agent": "BizCompare research@bizcompare.com"}
```

**Change the email in the scraper to your own:**
In `comprehensive_scraper.py`, line 173:
```python
headers = {"User-Agent": "BizCompare your-email@example.com"}
```

**Test it:**
```bash
curl -H "User-Agent: YourCompany your-email@example.com" \
  "https://data.sec.gov/submissions/CIK0000320193.json"
```

---

### 5. State Secretary of State (Always Free)

Most state websites are free to access, no API key needed. However:

- Some states require CAPTCHA solving
- Rate limits vary by state
- Best to use during off-peak hours

**No setup required** - the scraper handles this.

---

### 6. Better Business Bureau (Free - No Key)

BBB data is publicly accessible through their search interface. No API key required.

**No setup required** - the scraper handles this.

---

## 🚀 Quick Setup

### Complete `.env` File Template

Create a `.env` file in the project root:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Places API (Recommended - $200/month free)
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Yelp API (100% Free)
YELP_API_KEY=YOUR_YELP_API_KEY_HERE

# OpenCorporates (Optional - 500/day free)
OPENCORPORATES_API_KEY=YOUR_OPENCORPORATES_TOKEN

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_XXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXX
```

---

## 💡 Starting Without API Keys

You can still get data from:

### Free Sources (No Keys Required):
✅ SEC EDGAR - Public company data
✅ State SOS websites - Registration data
✅ BBB - Ratings and accreditation
✅ OSHA - Safety records

### Sources Needing Keys:
⚠️ Google Places - Best for reviews/ratings
⚠️ Yelp - Good for reviews
⚠️ OpenCorporates - Registration data

### Recommended Minimum Setup:
1. **Must have**: Supabase (database)
2. **Highly recommended**: Google Places ($200 free) + Yelp (100% free)
3. **Optional**: OpenCorporates

---

## 📊 API Usage Estimates

### Small Scale (10,000 companies)
For a database of 10,000 companies with 30-minute updates:

| Source | Requests/Day | Monthly Cost |
|--------|--------------|--------------|
| Google Places | ~700 | $0 (within free tier) |
| Yelp | ~700 | $0 (always free) |
| OpenCorporates | ~700 | $0 (free tier) |
| SEC EDGAR | ~200 | $0 (always free) |
| **Total** | **~2,300** | **$0** |

### 🚀 Large Scale (1,000,000+ companies - Full US Coverage)

**Reality Check**: The US has **~33 million businesses** (6M corporations + 27M sole proprietorships)

For comprehensive coverage, you need a different strategy:

#### Initial Data Collection (One-time)
| Source | Companies | Requests | Time | Cost |
|--------|-----------|----------|------|------|
| State SOS | 6M corps | 6M | 60 days | $0 |
| OpenCorporates | 6M | 6M | 120 days | $5,000 |
| Google Places | 5M SMBs | 5M | 30 days | $85,000 |
| SEC EDGAR | 5,000 | 5K | 1 day | $0 |
| BBB | 1M | 1M | 20 days | $0 |
| **Total** | **~18M** | **~18M** | **4-6 months** | **~$90,000** |

#### Ongoing Updates (30-minute refresh)
| Source | Updates/Day | Monthly | Cost/Month |
|--------|-------------|---------|------------|
| Google Places (reviews) | 500K | 15M | $255,000 |
| State changes | 10K | 300K | $0 |
| SEC filings | 1K | 30K | $0 |
| **Total** | **511K** | **15.3M** | **~$255,000** |

**💡 This is not practical for a startup!**

---

## 🎯 Practical Strategy for Full US Coverage

### Phase 1: Start with High-Value Segments (Free/$100/month)

**Target**: 100,000 - 500,000 companies

Focus on specific niches where users need the most value:

1. **Licensed Contractors** (500K companies)
   - Construction, roofing, plumbing, electrical, HVAC
   - State license boards (free data)
   - High search volume
   
2. **Public Companies** (5,000 companies)
   - SEC EDGAR (free, complete data)
   - High data quality
   - High user interest

3. **Large Private Companies** (50,000 companies)
   - Revenue > $10M
   - Available in D&B, OpenCorporates
   - Better data quality

4. **Popular Local Businesses** (100,000 companies)
   - High Google/Yelp review counts
   - Restaurants, retail, services
   - High user traffic

**Estimated Costs**: $0 - $100/month
**Coverage**: ~500K companies (top 1.5% by value)
**User Value**: Covers 80% of search queries

### Phase 2: Bulk Data Purchase (Smart Approach)

Instead of API calls, **buy bulk datasets**:

#### Option A: Commercial Data Vendors
| Vendor | Coverage | Cost | Update Frequency |
|--------|----------|------|------------------|
| **Dun & Bradstreet** | 30M US businesses | $10K-50K/year | Monthly updates |
| **InfoGroup (Data Axle)** | 33M businesses | $5K-20K/year | Quarterly |
| **ZoomInfo** | 100M+ contacts | $15K-30K/year | Real-time |
| **Factual/Foursquare** | 60M POIs | $5K-15K/year | Weekly |
| **SafeGraph** | 7M POIs | $3K-10K/year | Monthly |

**Best for startups**: Data Axle or SafeGraph (most affordable)

#### Option B: Government Bulk Downloads (FREE!)
| Source | Coverage | Format | Cost |
|--------|----------|--------|------|
| **IRS Exempt Organizations** | 1.8M nonprofits | CSV | FREE |
| **SAM.gov** | 500K contractors | API/CSV | FREE |
| **SEC EDGAR** | 10K+ public cos | JSON/XML | FREE |
| **State SOS Bulk** | Varies by state | CSV/DB | $0-$500 |
| **USPS Address Database** | All US addresses | CSV | $1,800 one-time |

**Many states offer bulk downloads** for $0-$500:
- California: $55 (6M+ businesses)
- Delaware: $200 (1.5M+ businesses)
- Nevada: Free (500K+ businesses)
- Wyoming: Free (200K+ businesses)

### Phase 3: Smart Updates (Minimize API Costs)

Instead of updating all companies every 30 minutes:

#### Tier-Based Update Strategy
| Company Tier | Update Frequency | % of Database | Reason |
|--------------|------------------|---------------|--------|
| **Hot** (viewed in last 7 days) | 30 minutes | 1% | Active user interest |
| **Warm** (viewed in last 30 days) | 6 hours | 5% | Recent interest |
| **Popular** (high search volume) | Daily | 10% | Maintain freshness |
| **Standard** (all others) | Weekly | 84% | Baseline updates |

**Result**: Reduce API calls by **95%** while maintaining data quality!

For 1M companies:
- Hot: 10K × 48 updates/day = 480K calls
- Warm: 50K × 4 updates/day = 200K calls  
- Popular: 100K × 1 update/day = 100K calls
- Standard: 840K × 0.14 updates/day = 120K calls

**Total**: 900K calls/day vs 48M calls/day (50x savings!)
**Monthly cost**: ~$15,000 vs ~$800,000

---

## 💰 Realistic Cost Projections

### Option 1: Focused Niche (Recommended for MVP)
- **Target**: 100K-500K high-value companies
- **Initial**: $0-1K (bulk downloads + free APIs)
- **Monthly**: $100-500 (API updates)
- **Data Quality**: High (focused effort)
- **Time to Launch**: 1-2 months

### Option 2: Bulk Data + Smart Updates
- **Target**: 5-10M companies
- **Initial**: $5K-15K (Data Axle or SafeGraph)
- **Monthly**: $2K-5K (tiered API updates)
- **Data Quality**: Medium-high
- **Time to Launch**: 2-3 months

### Option 3: Full Coverage (Not Recommended Initially)
- **Target**: 30M+ companies
- **Initial**: $50K-100K (multiple vendors)
- **Monthly**: $20K-50K (API costs)
- **Data Quality**: Medium (hard to maintain)
- **Time to Launch**: 6-12 months

---

## 🎓 Recommended Path for Your Platform

### Step 1: MVP Launch (Month 1-2) - FREE
Start with **free government data**:

1. **SEC EDGAR**: 5,000 public companies (free, excellent data)
2. **State License Boards**: 500K contractors (free scraping)
3. **SAM.gov**: 500K federal contractors (free API)
4. **Top BBB Companies**: 100K businesses (free scraping)

**Total**: ~1M companies with **$0 cost**
**Coverage**: Contractors, public companies, federal contractors

### Step 2: Add Reviews (Month 2-3) - $200-500/month
- Google Places API for top 50K companies
- Yelp API for supplement
- Focus on companies with high search volume

### Step 3: Expand with Bulk Data (Month 3-6) - $5K-10K
- Purchase Data Axle or SafeGraph dataset
- Get 5-10M additional companies
- Implement tier-based updates

### Step 4: Scale Smart (Month 6+) - $2K-5K/month
- Tiered update strategy
- Focus on high-value segments
- Let user searches drive data updates (pull model vs push)

---

## 🔧 Alternative: User-Driven Data Collection

**Smart approach**: Don't scrape everything upfront!

### On-Demand Data Fetching
1. User searches for "ABC Roofing, CA"
2. Check database - not found
3. **Fetch in real-time** from APIs (2-3 seconds)
4. Cache results for 30 days
5. Refresh if viewed again

**Benefits**:
- Only pay for companies users actually want
- Always fresh data
- Start with $0 database
- Scale naturally with users

**Costs**:
- 1,000 searches/day = $17/month
- 10,000 searches/day = $170/month
- 100,000 searches/day = $1,700/month

Much better than scraping 30M companies upfront!

---

## 🔒 Security Best Practices

### 1. Restrict API Keys
- Add IP restrictions on Google Cloud Console
- Never commit API keys to Git
- Use environment variables

### 2. Monitor Usage
- Set up billing alerts on Google Cloud
- Check Yelp dashboard regularly
- Monitor rate limits

### 3. Rotate Keys Regularly
- Change API keys every 3-6 months
- Immediately rotate if compromised

---

## 🧪 Testing Your Setup

Run this test script:

```bash
cd python-scraper
python3 -c "
import os
from dotenv import load_dotenv

load_dotenv('../.env')

print('🔍 Checking API Keys...\n')

# Check Supabase
if os.getenv('NEXT_PUBLIC_SUPABASE_URL'):
    print('✅ Supabase URL configured')
else:
    print('❌ Supabase URL missing')

# Check Google Places
if os.getenv('GOOGLE_PLACES_API_KEY'):
    print('✅ Google Places API Key configured')
else:
    print('⚠️  Google Places API Key missing (optional but recommended)')

# Check Yelp
if os.getenv('YELP_API_KEY'):
    print('✅ Yelp API Key configured')
else:
    print('⚠️  Yelp API Key missing (optional but recommended)')

# Check OpenCorporates
if os.getenv('OPENCORPORATES_API_KEY'):
    print('✅ OpenCorporates API Key configured')
else:
    print('ℹ️  OpenCorporates API Key not set (will use public access)')

print('\n✨ Setup complete! Ready to scrape data.')
"
```

---

## 🆘 Troubleshooting

### Google Places "API Key Invalid"
- Make sure you enabled "Places API" in Google Cloud Console
- Check that billing is enabled (required even for free tier)
- Verify IP restrictions aren't blocking your requests

### Yelp "Authentication Failed"
- Make sure you're using the full API key (starts with long alphanumeric)
- Include "Bearer " prefix in Authorization header
- Check that your app is approved

### OpenCorporates "Rate Limit Exceeded"
- Free tier: 500/day, 1 req/second
- Add delays between requests
- Consider getting free API key for better limits

### SEC EDGAR Blocks Requests
- Must include User-Agent with valid email
- Don't exceed 10 requests/second
- Avoid making requests during market hours (9:30 AM - 4 PM ET)

---

## 📦 Bulk Data Sources (For Scale)

### Free Government Bulk Downloads

#### 1. California Business Entities ($55)
- **6.5M+ businesses**
- https://bizfileonline.sos.ca.gov/
- CSV format, updated monthly
- Includes: Name, status, address, agent, filing date

#### 2. Delaware Corporations ($200)
- **1.5M+ businesses** 
- https://icis.corp.delaware.gov/
- Most US corporations incorporate here
- Complete officer information

#### 3. SAM.gov Entities (FREE)
- **500K+ federal contractors**
- https://sam.gov/data-services/Entity%20Management/Public%20V3
- Free API or bulk download
- Excellent data quality

#### 4. IRS Business Master File (FREE)
- **1.8M+ tax-exempt orgs**
- https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf
- Monthly updates
- Nonprofits, 501(c)(3)s

#### 5. SEC Company Tickers (FREE)
- **13,000+ public companies**
- https://www.sec.gov/files/company_tickers.json
- Real-time updates
- Includes CIK, ticker, name

### State Bulk Downloads (Most offer for $0-$500)

Check each state's Secretary of State website:
- **Nevada**: Free bulk download
- **Wyoming**: Free bulk download  
- **Texas**: $200-$500
- **New York**: $500
- **Florida**: $500

### Commercial Bulk Data Vendors

#### Budget-Friendly Options
1. **Data Axle (InfoGroup)** - $5K-10K/year
   - 33M US businesses
   - Phone, email, employee count
   - Good for SMBs

2. **SafeGraph** - $3K-10K/year
   - 7M POIs with foot traffic
   - Location data specialists
   - Good for retail/restaurants

3. **Factual/Foursquare** - $5K-15K/year
   - 60M global POIs
   - Rich place attributes
   - Good for local businesses

#### Enterprise Options
1. **Dun & Bradstreet** - $10K-50K/year
   - 30M+ businesses
   - D-U-N-S numbers
   - Credit scores
   - Most comprehensive

2. **ZoomInfo** - $15K-30K/year
   - 100M+ contacts
   - 14M+ companies
   - Best for B2B sales
   - Real-time updates

3. **Experian Business** - $15K-40K/year
   - Business credit data
   - Risk scores
   - Good for financial services

---

## 📚 Additional Resources

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Yelp Fusion API Docs](https://www.yelp.com/developers/documentation/v3)
- [OpenCorporates API Docs](https://api.opencorporates.com/)
- [SEC EDGAR API Guide](https://www.sec.gov/edgar/sec-api-documentation)

---

## 🎉 Summary

### Quick Start (Free - 0-2 weeks)
**Target**: 5K-10K companies to test the platform

1. **Required** (5 minutes):
   - Set up Supabase account (free tier)
   
2. **Recommended** (15 minutes):
   - Get Google Places API key ($200/month free)
   - Get Yelp API key (100% free forever)

3. **Optional** (5 minutes):
   - Get OpenCorporates API key (500/day free)

**Total Setup Time**: 25 minutes  
**Total Cost**: $0/month  
**Coverage**: Manual data entry or small scraping

---

### MVP Launch (Free/$100 - Month 1-2)
**Target**: 100K-500K high-value companies

1. **Free Government Data**:
   - SEC EDGAR (5K public companies)
   - State license boards (500K contractors)
   - SAM.gov (500K federal contractors)
   
2. **Bulk Downloads** ($0-500):
   - California businesses ($55)
   - Nevada/Wyoming (free)
   
3. **API for Reviews** ($100/month):
   - Google Places for top companies
   - Yelp for supplement

**Total Cost**: $100-600 initial + $100/month  
**Coverage**: 1M companies (high-value segments)  
**Time to Launch**: 4-8 weeks

---

### Growth Phase ($5K-10K - Month 3-6)
**Target**: 5-10M companies

1. **Bulk Data Purchase** ($5K-10K):
   - Data Axle or SafeGraph dataset
   
2. **Smart API Updates** ($500-2K/month):
   - Tiered update strategy
   - Focus on viewed companies

**Total Cost**: $5K-10K initial + $500-2K/month  
**Coverage**: 5-10M companies  
**Data Quality**: Medium-High

---

### Scale Phase ($20K+ - Month 6+)
**Target**: 30M+ companies (full US)

1. **Multiple Data Vendors** ($20K-50K):
   - D&B + Data Axle + SafeGraph
   
2. **API at Scale** ($5K-20K/month):
   - Sophisticated caching
   - User-driven updates

**Total Cost**: $50K+ initial + $10K-30K/month  
**Coverage**: Full US coverage  
**Recommended**: Only after proven product-market fit

---

### 🏆 Recommended Path

**Phase 1 (Free)**: Start with government data
- SEC, State SOS, SAM.gov
- 1M companies, $0 cost
- Validate business model

**Phase 2 ($100/mo)**: Add user value
- Google/Yelp reviews for top companies  
- On-demand data fetching
- Scale with user growth

**Phase 3 ($5K-10K)**: Buy bulk when profitable
- Only after revenue is proven
- Data Axle or similar
- Expand coverage strategically

**Don't try to scrape 30M companies on day 1!** 

Start small, validate with users, then scale. Most queries will focus on the top 1% of companies anyway. 🚀
