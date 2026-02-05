"""
BizCompare Pro - Multi-Source Data Scraper
Comprehensive US business data collection system
Real data from government and trusted commercial sources
"""

import asyncio
import aiohttp
import json
import os
import re
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==========================================
# DATA MODELS
# ==========================================

@dataclass
class Executive:
    name: str
    title: str
    start_date: Optional[str] = None
    linkedin_url: Optional[str] = None
    verified: bool = False
    source: str = ""

@dataclass
class ContactInfo:
    phone: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: str = "USA"

@dataclass
class License:
    license_number: str
    license_type: str
    status: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    issuing_authority: str = ""
    verified: bool = False

@dataclass
class Rating:
    source: str
    rating: float
    max_rating: float = 5.0
    review_count: int = 0
    last_updated: str = ""

@dataclass
class FinancialInfo:
    revenue: Optional[float] = None
    revenue_range: Optional[str] = None
    net_income: Optional[float] = None
    total_assets: Optional[float] = None
    employees: Optional[int] = None
    employee_range: Optional[str] = None
    fiscal_year: Optional[int] = None
    public: bool = False
    stock_symbol: Optional[str] = None

@dataclass
class CompanyData:
    # Identifiers
    id: str
    name: str
    legal_name: Optional[str] = None
    dba_names: List[str] = None
    
    # Registration
    entity_type: Optional[str] = None  # LLC, Corp, etc.
    status: str = "Active"
    formation_date: Optional[str] = None
    state_of_formation: Optional[str] = None
    registration_number: Optional[str] = None
    ein: Optional[str] = None
    duns: Optional[str] = None
    
    # Contact
    contact: ContactInfo = None
    
    # Executives
    executives: List[Executive] = None
    ceo: Optional[str] = None
    
    # Industry
    naics_code: Optional[str] = None
    naics_description: Optional[str] = None
    sic_code: Optional[str] = None
    industry: Optional[str] = None
    specialties: List[str] = None
    
    # Licensing
    licenses: List[License] = None
    bonded: bool = False
    insured: bool = False
    insurance_amount: Optional[float] = None
    
    # Ratings
    ratings: List[Rating] = None
    bbb_rating: Optional[str] = None
    bbb_accredited: bool = False
    overall_rating: Optional[float] = None
    total_reviews: int = 0
    
    # Financial
    financial: FinancialInfo = None
    
    # Pricing (for contractors)
    avg_quote: Optional[float] = None
    min_quote: Optional[float] = None
    max_quote: Optional[float] = None
    total_projects: int = 0
    
    # Relationships
    parent_company: Optional[str] = None
    subsidiaries: List[str] = None
    
    # Meta
    data_sources: List[str] = None
    last_updated: str = ""
    data_quality_score: float = 0.0
    verified: bool = False
    
    def __post_init__(self):
        if self.dba_names is None:
            self.dba_names = []
        if self.executives is None:
            self.executives = []
        if self.specialties is None:
            self.specialties = []
        if self.licenses is None:
            self.licenses = []
        if self.ratings is None:
            self.ratings = []
        if self.subsidiaries is None:
            self.subsidiaries = []
        if self.data_sources is None:
            self.data_sources = []
        if not self.id:
            self.id = self._generate_id()
    
    def _generate_id(self) -> str:
        """Generate unique ID based on company name and state"""
        key = f"{self.name}_{self.contact.state if self.contact else 'US'}"
        return hashlib.md5(key.encode()).hexdigest()[:16]
    
    def calculate_quality_score(self) -> float:
        """Calculate data quality score based on completeness"""
        score = 0.0
        max_score = 100.0
        
        # Basic info (30 points)
        if self.name: score += 5
        if self.legal_name: score += 3
        if self.entity_type: score += 3
        if self.formation_date: score += 3
        if self.registration_number: score += 5
        if self.ein: score += 5
        if self.status: score += 3
        if self.state_of_formation: score += 3
        
        # Contact (20 points)
        if self.contact:
            if self.contact.phone: score += 5
            if self.contact.email: score += 4
            if self.contact.website: score += 4
            if self.contact.address: score += 4
            if self.contact.city and self.contact.state: score += 3
        
        # Executives (15 points)
        if self.ceo: score += 8
        if len(self.executives) > 0: score += 4
        if len(self.executives) > 3: score += 3
        
        # Ratings (15 points)
        if len(self.ratings) > 0: score += 5
        if self.bbb_rating: score += 5
        if self.overall_rating: score += 5
        
        # Financial (10 points)
        if self.financial:
            if self.financial.revenue: score += 4
            if self.financial.employees: score += 3
            if self.financial.public: score += 3
        
        # Verification (10 points)
        if self.verified: score += 5
        if len(self.data_sources) > 2: score += 5
        
        self.data_quality_score = round(score / max_score * 100, 1)
        return self.data_quality_score


# ==========================================
# BASE DATA SOURCE
# ==========================================

class DataSource(ABC):
    """Abstract base class for data sources"""
    
    def __init__(self, name: str, api_key: Optional[str] = None):
        self.name = name
        self.api_key = api_key
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limit = 10  # requests per second
        self.last_request = datetime.min
    
    async def init_session(self):
        if not self.session:
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(timeout=timeout)
    
    async def close_session(self):
        if self.session:
            await self.session.close()
            self.session = None
    
    async def rate_limit_wait(self):
        """Respect rate limits"""
        elapsed = (datetime.now() - self.last_request).total_seconds()
        min_interval = 1.0 / self.rate_limit
        if elapsed < min_interval:
            await asyncio.sleep(min_interval - elapsed)
        self.last_request = datetime.now()
    
    @abstractmethod
    async def search_company(self, name: str, state: Optional[str] = None) -> List[Dict]:
        """Search for companies by name"""
        pass
    
    @abstractmethod
    async def get_company_details(self, identifier: str) -> Optional[CompanyData]:
        """Get detailed company information"""
        pass


# ==========================================
# SEC EDGAR DATA SOURCE
# ==========================================

class SECEdgarSource(DataSource):
    """SEC EDGAR for public company data"""
    
    BASE_URL = "https://data.sec.gov"
    
    def __init__(self):
        super().__init__("SEC EDGAR")
        self.rate_limit = 10
    
    async def search_company(self, name: str, state: Optional[str] = None) -> List[Dict]:
        await self.init_session()
        await self.rate_limit_wait()
        
        # Search SEC company tickers
        url = f"{self.BASE_URL}/submissions/CIK{name.zfill(10)}.json"
        
        try:
            headers = {"User-Agent": "BizCompare research@bizcompare.com"}
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return [data]
        except Exception as e:
            logger.error(f"SEC search error: {e}")
        
        return []
    
    async def search_by_name(self, name: str) -> List[Dict]:
        """Search SEC by company name"""
        await self.init_session()
        await self.rate_limit_wait()
        
        try:
            # Use SEC full-text search
            url = "https://efts.sec.gov/LATEST/search-index"
            params = {
                "q": name,
                "dateRange": "custom",
                "forms": "10-K,10-Q,8-K"
            }
            headers = {"User-Agent": "BizCompare research@bizcompare.com"}
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    return await response.json()
        except Exception as e:
            logger.error(f"SEC name search error: {e}")
        
        return []
    
    async def get_company_details(self, cik: str) -> Optional[CompanyData]:
        """Get company details from SEC"""
        await self.init_session()
        await self.rate_limit_wait()
        
        try:
            cik_padded = cik.zfill(10)
            url = f"{self.BASE_URL}/submissions/CIK{cik_padded}.json"
            headers = {"User-Agent": "BizCompare research@bizcompare.com"}
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_sec_data(data)
        except Exception as e:
            logger.error(f"SEC details error: {e}")
        
        return None
    
    def _parse_sec_data(self, data: Dict) -> CompanyData:
        """Parse SEC data into CompanyData"""
        addresses = data.get("addresses", {})
        business_addr = addresses.get("business", {})
        
        contact = ContactInfo(
            address=business_addr.get("street1", ""),
            city=business_addr.get("city", ""),
            state=business_addr.get("stateOrCountry", ""),
            zip_code=business_addr.get("zipCode", ""),
            phone=data.get("phone", "")
        )
        
        # Financial info from recent filings
        financial = FinancialInfo(
            public=True,
            stock_symbol=data.get("tickers", [None])[0] if data.get("tickers") else None
        )
        
        company = CompanyData(
            id=data.get("cik", ""),
            name=data.get("name", ""),
            legal_name=data.get("name", ""),
            entity_type=data.get("entityType", ""),
            sic_code=data.get("sic", ""),
            naics_description=data.get("sicDescription", ""),
            ein=data.get("ein", ""),
            contact=contact,
            financial=financial,
            status="Active" if data.get("tickers") else "Unknown",
            data_sources=["SEC EDGAR"],
            last_updated=datetime.now().isoformat()
        )
        
        company.calculate_quality_score()
        return company


# ==========================================
# GOOGLE PLACES DATA SOURCE
# ==========================================

class GooglePlacesSource(DataSource):
    """Google Places API for business details and reviews"""
    
    BASE_URL = "https://maps.googleapis.com/maps/api/place"
    
    def __init__(self, api_key: str):
        super().__init__("Google Places", api_key)
        self.rate_limit = 50
    
    async def search_company(self, name: str, state: Optional[str] = None) -> List[Dict]:
        await self.init_session()
        await self.rate_limit_wait()
        
        try:
            query = f"{name} {state}" if state else name
            url = f"{self.BASE_URL}/textsearch/json"
            params = {
                "query": query,
                "type": "establishment",
                "key": self.api_key
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("results", [])
        except Exception as e:
            logger.error(f"Google Places search error: {e}")
        
        return []
    
    async def get_company_details(self, place_id: str) -> Optional[Dict]:
        """Get detailed business info from Google Places"""
        await self.init_session()
        await self.rate_limit_wait()
        
        try:
            url = f"{self.BASE_URL}/details/json"
            params = {
                "place_id": place_id,
                "fields": "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,opening_hours,business_status,types",
                "key": self.api_key
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("result", {})
        except Exception as e:
            logger.error(f"Google Places details error: {e}")
        
        return None
    
    def parse_to_company_data(self, place_data: Dict) -> Optional[CompanyData]:
        """Convert Google Places data to CompanyData"""
        if not place_data:
            return None
        
        # Parse address
        address_parts = place_data.get("formatted_address", "").split(", ")
        city = address_parts[1] if len(address_parts) > 1 else ""
        state_zip = address_parts[2] if len(address_parts) > 2 else ""
        state = state_zip.split()[0] if state_zip else ""
        
        contact = ContactInfo(
            phone=place_data.get("formatted_phone_number", ""),
            website=place_data.get("website", ""),
            address=address_parts[0] if address_parts else "",
            city=city,
            state=state
        )
        
        ratings = []
        if place_data.get("rating"):
            ratings.append(Rating(
                source="Google",
                rating=place_data["rating"],
                review_count=place_data.get("user_ratings_total", 0),
                last_updated=datetime.now().isoformat()
            ))
        
        company = CompanyData(
            id="",
            name=place_data.get("name", ""),
            contact=contact,
            ratings=ratings,
            overall_rating=place_data.get("rating"),
            total_reviews=place_data.get("user_ratings_total", 0),
            status="Active" if place_data.get("business_status") == "OPERATIONAL" else "Unknown",
            data_sources=["Google Places"],
            last_updated=datetime.now().isoformat()
        )
        
        company.calculate_quality_score()
        return company


# ==========================================
# YELP DATA SOURCE
# ==========================================

class YelpSource(DataSource):
    """Yelp Fusion API for business reviews"""
    
    BASE_URL = "https://api.yelp.com/v3"
    
    def __init__(self, api_key: str):
        super().__init__("Yelp", api_key)
        self.rate_limit = 5
    
    async def search_company(self, name: str, state: Optional[str] = None) -> List[Dict]:
        await self.init_session()
        await self.rate_limit_wait()
        
        try:
            url = f"{self.BASE_URL}/businesses/search"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            params = {
                "term": name,
                "location": state if state else "United States",
                "limit": 10
            }
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("businesses", [])
        except Exception as e:
            logger.error(f"Yelp search error: {e}")
        
        return []
    
    async def get_company_details(self, business_id: str) -> Optional[Dict]:
        """Get business details from Yelp"""
        await self.init_session()
        await self.rate_limit_wait()
        
        try:
            url = f"{self.BASE_URL}/businesses/{business_id}"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
        except Exception as e:
            logger.error(f"Yelp details error: {e}")
        
        return None


# ==========================================
# OPENCORPORATES DATA SOURCE
# ==========================================

class OpenCorporatesSource(DataSource):
    """OpenCorporates for company registration data"""
    
    BASE_URL = "https://api.opencorporates.com/v0.4"
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__("OpenCorporates", api_key)
        self.rate_limit = 1  # Free tier is very limited
    
    async def search_company(self, name: str, state: Optional[str] = None) -> List[Dict]:
        await self.init_session()
        await self.rate_limit_wait()
        
        try:
            url = f"{self.BASE_URL}/companies/search"
            params = {
                "q": name,
                "jurisdiction_code": f"us_{state.lower()}" if state else "us",
                "per_page": 10
            }
            if self.api_key:
                params["api_token"] = self.api_key
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    companies = data.get("results", {}).get("companies", [])
                    return [c.get("company", {}) for c in companies]
        except Exception as e:
            logger.error(f"OpenCorporates search error: {e}")
        
        return []
    
    async def get_company_details(self, jurisdiction: str, company_number: str) -> Optional[CompanyData]:
        """Get company details from OpenCorporates"""
        await self.init_session()
        await self.rate_limit_wait()
        
        try:
            url = f"{self.BASE_URL}/companies/{jurisdiction}/{company_number}"
            params = {}
            if self.api_key:
                params["api_token"] = self.api_key
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_opencorp_data(data.get("results", {}).get("company", {}))
        except Exception as e:
            logger.error(f"OpenCorporates details error: {e}")
        
        return None
    
    def _parse_opencorp_data(self, data: Dict) -> CompanyData:
        """Parse OpenCorporates data"""
        address = data.get("registered_address", {})
        
        contact = ContactInfo(
            address=address.get("street_address", ""),
            city=address.get("locality", ""),
            state=address.get("region", ""),
            zip_code=address.get("postal_code", "")
        )
        
        # Parse officers
        executives = []
        for officer in data.get("officers", []):
            off_data = officer.get("officer", {})
            executives.append(Executive(
                name=off_data.get("name", ""),
                title=off_data.get("position", ""),
                start_date=off_data.get("start_date", ""),
                source="OpenCorporates"
            ))
        
        company = CompanyData(
            id=data.get("company_number", ""),
            name=data.get("name", ""),
            legal_name=data.get("name", ""),
            entity_type=data.get("company_type", ""),
            status=data.get("current_status", ""),
            formation_date=data.get("incorporation_date", ""),
            state_of_formation=data.get("jurisdiction_code", "").replace("us_", "").upper(),
            registration_number=data.get("company_number", ""),
            contact=contact,
            executives=executives,
            ceo=executives[0].name if executives else None,
            data_sources=["OpenCorporates"],
            last_updated=datetime.now().isoformat()
        )
        
        company.calculate_quality_score()
        return company


# ==========================================
# DATA AGGREGATOR
# ==========================================

class DataAggregator:
    """Aggregates data from multiple sources"""
    
    def __init__(self):
        self.sources: List[DataSource] = []
        self._init_sources()
    
    def _init_sources(self):
        """Initialize all data sources"""
        # SEC EDGAR (no API key needed)
        self.sources.append(SECEdgarSource())
        
        # Google Places
        google_key = os.getenv("GOOGLE_PLACES_API_KEY")
        if google_key:
            self.sources.append(GooglePlacesSource(google_key))
        
        # Yelp
        yelp_key = os.getenv("YELP_API_KEY")
        if yelp_key:
            self.sources.append(YelpSource(yelp_key))
        
        # OpenCorporates
        opencorp_key = os.getenv("OPENCORPORATES_API_KEY")
        self.sources.append(OpenCorporatesSource(opencorp_key))
        
        logger.info(f"Initialized {len(self.sources)} data sources")
    
    async def search_company(self, name: str, state: Optional[str] = None) -> List[CompanyData]:
        """Search for company across all sources"""
        all_results = []
        
        tasks = [source.search_company(name, state) for source in self.sources]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for source, result in zip(self.sources, results):
            if isinstance(result, Exception):
                logger.error(f"Search error from {source.name}: {result}")
                continue
            if result:
                logger.info(f"Found {len(result)} results from {source.name}")
        
        return all_results
    
    async def get_full_company_data(self, name: str, state: Optional[str] = None) -> Optional[CompanyData]:
        """Get comprehensive company data by aggregating all sources"""
        master_data = None
        
        for source in self.sources:
            try:
                results = await source.search_company(name, state)
                if results:
                    # Get details from first match
                    if hasattr(source, 'get_company_details'):
                        if isinstance(source, GooglePlacesSource) and results:
                            place_id = results[0].get("place_id")
                            if place_id:
                                details = await source.get_company_details(place_id)
                                if details:
                                    company = source.parse_to_company_data(details)
                                    master_data = self._merge_data(master_data, company)
                        
                        elif isinstance(source, OpenCorporatesSource) and results:
                            jurisdiction = results[0].get("jurisdiction_code", "")
                            company_number = results[0].get("company_number", "")
                            if jurisdiction and company_number:
                                company = await source.get_company_details(jurisdiction, company_number)
                                master_data = self._merge_data(master_data, company)
                        
                        elif isinstance(source, SECEdgarSource) and results:
                            cik = results[0].get("cik", "")
                            if cik:
                                company = await source.get_company_details(cik)
                                master_data = self._merge_data(master_data, company)
            
            except Exception as e:
                logger.error(f"Error getting data from {source.name}: {e}")
        
        if master_data:
            master_data.calculate_quality_score()
        
        return master_data
    
    def _merge_data(self, master: Optional[CompanyData], new: Optional[CompanyData]) -> Optional[CompanyData]:
        """Merge data from multiple sources, preferring most complete data"""
        if not new:
            return master
        if not master:
            return new
        
        # Merge basic info
        if not master.legal_name and new.legal_name:
            master.legal_name = new.legal_name
        if not master.entity_type and new.entity_type:
            master.entity_type = new.entity_type
        if not master.formation_date and new.formation_date:
            master.formation_date = new.formation_date
        if not master.registration_number and new.registration_number:
            master.registration_number = new.registration_number
        if not master.ein and new.ein:
            master.ein = new.ein
        
        # Merge contact
        if new.contact:
            if not master.contact:
                master.contact = new.contact
            else:
                if not master.contact.phone and new.contact.phone:
                    master.contact.phone = new.contact.phone
                if not master.contact.email and new.contact.email:
                    master.contact.email = new.contact.email
                if not master.contact.website and new.contact.website:
                    master.contact.website = new.contact.website
        
        # Merge executives
        if new.executives:
            existing_names = {e.name.lower() for e in master.executives}
            for exec in new.executives:
                if exec.name.lower() not in existing_names:
                    master.executives.append(exec)
        
        if not master.ceo and new.ceo:
            master.ceo = new.ceo
        
        # Merge ratings
        if new.ratings:
            existing_sources = {r.source for r in master.ratings}
            for rating in new.ratings:
                if rating.source not in existing_sources:
                    master.ratings.append(rating)
        
        # Merge financial
        if new.financial:
            if not master.financial:
                master.financial = new.financial
            else:
                if not master.financial.revenue and new.financial.revenue:
                    master.financial.revenue = new.financial.revenue
                if not master.financial.employees and new.financial.employees:
                    master.financial.employees = new.financial.employees
        
        # Track sources
        for source in new.data_sources:
            if source not in master.data_sources:
                master.data_sources.append(source)
        
        master.last_updated = datetime.now().isoformat()
        return master
    
    async def close(self):
        """Close all data source sessions"""
        for source in self.sources:
            await source.close_session()


# ==========================================
# MAIN SCRAPER
# ==========================================

async def main():
    """Main function to test data aggregation"""
    aggregator = DataAggregator()
    
    try:
        # Test search
        logger.info("Testing company search...")
        company = await aggregator.get_full_company_data("Apple Inc", "CA")
        
        if company:
            logger.info(f"Found company: {company.name}")
            logger.info(f"Data sources: {company.data_sources}")
            logger.info(f"Quality score: {company.data_quality_score}")
            logger.info(f"CEO: {company.ceo}")
            logger.info(f"Status: {company.status}")
        else:
            logger.info("No company found")
    
    finally:
        await aggregator.close()


if __name__ == "__main__":
    asyncio.run(main())
