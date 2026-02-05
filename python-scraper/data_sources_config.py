"""
BizCompare Pro - Data Sources Configuration
Multi-source data collection system for comprehensive US business data
Similar to Tianyancha/Qichacha functionality
"""

# ==========================================
# DATA SOURCES CONFIGURATION
# ==========================================

DATA_SOURCES = {
    # Government Data Sources (Most Reliable)
    "government": {
        "sec_edgar": {
            "name": "SEC EDGAR",
            "url": "https://www.sec.gov/cgi-bin/browse-edgar",
            "api_url": "https://data.sec.gov/submissions/",
            "description": "Public company filings, executives, financial data",
            "data_types": ["executives", "financials", "filings", "ownership"],
            "reliability": 10,
            "update_frequency": "daily",
            "rate_limit": 10,  # requests per second
        },
        "sam_gov": {
            "name": "SAM.gov",
            "url": "https://sam.gov/",
            "api_url": "https://api.sam.gov/entity-information/v3/entities",
            "description": "Federal contractor registration, entity information",
            "data_types": ["registration", "contacts", "certifications"],
            "reliability": 10,
            "update_frequency": "daily",
            "api_key_required": True,
        },
        "sba": {
            "name": "Small Business Administration",
            "url": "https://www.sba.gov/",
            "api_url": "https://api.sba.gov/",
            "description": "Small business certifications, loans, contracts",
            "data_types": ["certifications", "size_standards", "contracts"],
            "reliability": 9,
            "update_frequency": "weekly",
        },
        "state_sos": {
            "name": "State Secretary of State",
            "description": "State-level business registrations",
            "data_types": ["registration", "agents", "officers", "filings"],
            "reliability": 10,
            "states": {
                "CA": "https://businesssearch.sos.ca.gov/",
                "NY": "https://apps.dos.ny.gov/publicInquiry/",
                "TX": "https://mycpa.cpa.state.tx.us/coa/",
                "FL": "https://search.sunbiz.org/",
                "IL": "https://apps.ilsos.gov/corporatellc/",
                "PA": "https://www.corporations.pa.gov/search/corpsearch",
                "OH": "https://businesssearch.ohiosos.gov/",
                "GA": "https://ecorp.sos.ga.gov/",
                "NC": "https://www.sosnc.gov/online_services/search/by_title/_Business_Registration",
                "MI": "https://cofs.lara.state.mi.us/SearchApi/Search/Search",
                # Add all 50 states...
            },
        },
        "permits": {
            "name": "Building Permits",
            "description": "Local building permit databases",
            "data_types": ["permits", "contractors", "projects", "valuations"],
            "reliability": 9,
            "cities": {
                "chicago": "https://data.cityofchicago.org/",
                "austin": "https://data.austintexas.gov/",
                "seattle": "https://data.seattle.gov/",
                "los_angeles": "https://data.lacity.org/",
                "new_york": "https://data.cityofnewyork.us/",
                "houston": "https://cohgis-mycity.opendata.arcgis.com/",
                "phoenix": "https://www.phoenixopendata.com/",
                "philadelphia": "https://www.opendataphilly.org/",
                "san_antonio": "https://data.sanantonio.gov/",
                "san_diego": "https://data.sandiego.gov/",
            },
        },
    },
    
    # Commercial Data Sources
    "commercial": {
        "opencorporates": {
            "name": "OpenCorporates",
            "url": "https://opencorporates.com/",
            "api_url": "https://api.opencorporates.com/v0.4/",
            "description": "Global company registry data",
            "data_types": ["registration", "officers", "filings", "branch_data"],
            "reliability": 9,
            "api_key_required": True,
            "rate_limit": 500,  # per day for free tier
        },
        "bbb": {
            "name": "Better Business Bureau",
            "url": "https://www.bbb.org/",
            "description": "Business ratings, complaints, accreditation",
            "data_types": ["ratings", "complaints", "accreditation", "reviews"],
            "reliability": 8,
        },
        "dun_bradstreet": {
            "name": "Dun & Bradstreet",
            "url": "https://www.dnb.com/",
            "description": "DUNS numbers, business credit, company data",
            "data_types": ["duns", "credit", "firmographics", "hierarchy"],
            "reliability": 9,
            "api_key_required": True,
            "paid": True,
        },
    },
    
    # Review & Contact Sources
    "reviews": {
        "google_places": {
            "name": "Google Places API",
            "api_url": "https://maps.googleapis.com/maps/api/place/",
            "description": "Business details, reviews, photos, hours",
            "data_types": ["contact", "reviews", "photos", "hours", "location"],
            "reliability": 8,
            "api_key_required": True,
        },
        "yelp": {
            "name": "Yelp Fusion API",
            "api_url": "https://api.yelp.com/v3/",
            "description": "Business reviews, ratings, categories",
            "data_types": ["reviews", "ratings", "categories", "photos"],
            "reliability": 7,
            "api_key_required": True,
        },
    },
    
    # Professional Networks
    "professional": {
        "linkedin": {
            "name": "LinkedIn",
            "description": "Company profiles, employees, executives",
            "data_types": ["company_info", "employees", "executives", "updates"],
            "reliability": 8,
            "note": "Requires official API partnership or manual verification",
        },
    },
    
    # Industry-Specific Sources
    "industry": {
        "contractor_licenses": {
            "name": "State Contractor License Boards",
            "description": "Contractor licensing verification",
            "data_types": ["licenses", "bonds", "insurance", "disciplinary"],
            "reliability": 10,
            "states": {
                "CA": "https://www.cslb.ca.gov/",
                "TX": "https://www.tdlr.texas.gov/",
                "FL": "https://www.myfloridalicense.com/",
                "AZ": "https://roc.az.gov/",
                "NV": "https://www.nvcontractorsboard.com/",
            },
        },
        "osha": {
            "name": "OSHA",
            "url": "https://www.osha.gov/",
            "api_url": "https://www.osha.gov/pls/imis/establishment.html",
            "description": "Workplace safety records, violations",
            "data_types": ["inspections", "violations", "penalties"],
            "reliability": 10,
        },
    },
}

# ==========================================
# DATA FIELDS MAPPING
# ==========================================

COMPANY_DATA_FIELDS = {
    # Basic Information
    "basic": [
        "company_name",
        "legal_name",
        "dba_names",  # Doing Business As
        "entity_type",  # LLC, Corp, Partnership, etc.
        "status",  # Active, Inactive, Dissolved
        "formation_date",
        "state_of_formation",
        "ein",  # Employer Identification Number
        "duns_number",
    ],
    
    # Registration Information
    "registration": [
        "registration_number",
        "registered_agent",
        "registered_address",
        "filing_date",
        "last_annual_report",
        "next_annual_report_due",
        "good_standing",
    ],
    
    # Executive Information
    "executives": [
        "ceo_name",
        "ceo_title",
        "cfo_name",
        "president_name",
        "directors",
        "officers",
        "key_personnel",
        "total_employees",
        "employee_range",
    ],
    
    # Contact Information
    "contact": [
        "headquarters_address",
        "mailing_address",
        "phone",
        "fax",
        "email",
        "website",
        "social_media",
    ],
    
    # Financial Information
    "financial": [
        "revenue",
        "revenue_range",
        "net_income",
        "total_assets",
        "fiscal_year_end",
        "public_private",
        "stock_symbol",
        "stock_exchange",
    ],
    
    # Industry & Classification
    "industry": [
        "naics_code",
        "naics_description",
        "sic_code",
        "sic_description",
        "primary_industry",
        "secondary_industries",
    ],
    
    # Licensing & Certifications
    "licensing": [
        "licenses",
        "certifications",
        "bonded",
        "insured",
        "insurance_amount",
        "workers_comp",
    ],
    
    # Ratings & Reviews
    "ratings": [
        "bbb_rating",
        "bbb_accredited",
        "google_rating",
        "google_review_count",
        "yelp_rating",
        "yelp_review_count",
        "overall_rating",
    ],
    
    # Legal & Compliance
    "legal": [
        "lawsuits",
        "judgments",
        "liens",
        "bankruptcies",
        "violations",
        "complaints",
    ],
    
    # Relationships
    "relationships": [
        "parent_company",
        "subsidiaries",
        "affiliates",
        "branches",
    ],
}

# ==========================================
# UPDATE SCHEDULE
# ==========================================

UPDATE_SCHEDULE = {
    "real_time": {
        "interval_minutes": 30,
        "sources": ["permits", "reviews"],
        "priority": "high",
    },
    "hourly": {
        "interval_minutes": 60,
        "sources": ["google_places", "yelp"],
        "priority": "medium",
    },
    "daily": {
        "interval_minutes": 1440,
        "sources": ["sec_edgar", "state_sos", "bbb"],
        "priority": "low",
    },
    "weekly": {
        "interval_minutes": 10080,
        "sources": ["opencorporates", "dun_bradstreet"],
        "priority": "low",
    },
}

# ==========================================
# API KEYS CONFIGURATION (Environment Variables)
# ==========================================

API_KEYS = {
    "GOOGLE_PLACES_API_KEY": "env:GOOGLE_PLACES_API_KEY",
    "YELP_API_KEY": "env:YELP_API_KEY",
    "OPENCORPORATES_API_KEY": "env:OPENCORPORATES_API_KEY",
    "SAM_GOV_API_KEY": "env:SAM_GOV_API_KEY",
    "DNB_API_KEY": "env:DNB_API_KEY",
}
