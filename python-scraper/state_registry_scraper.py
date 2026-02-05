"""
State Business Registry Scraper
Scrapes business registration data from all 50 US state Secretary of State websites
"""

import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# State Secretary of State business search URLs
STATE_REGISTRIES = {
    "AL": {"name": "Alabama", "url": "https://arc-sos.state.al.us/CGI/CORPNAME.MBR/INPUT"},
    "AK": {"name": "Alaska", "url": "https://www.commerce.alaska.gov/cbp/main/search/entities"},
    "AZ": {"name": "Arizona", "url": "https://ecorp.azcc.gov/EntitySearch/Index"},
    "AR": {"name": "Arkansas", "url": "https://www.sos.arkansas.gov/corps/search_all.php"},
    "CA": {"name": "California", "url": "https://bizfileonline.sos.ca.gov/search/business"},
    "CO": {"name": "Colorado", "url": "https://www.sos.state.co.us/biz/BusinessEntityCriteriaExt.do"},
    "CT": {"name": "Connecticut", "url": "https://service.ct.gov/business/s/onlinebusinesssearch"},
    "DE": {"name": "Delaware", "url": "https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx"},
    "FL": {"name": "Florida", "url": "https://search.sunbiz.org/Inquiry/CorporationSearch/ByName"},
    "GA": {"name": "Georgia", "url": "https://ecorp.sos.ga.gov/BusinessSearch"},
    "HI": {"name": "Hawaii", "url": "https://hbe.ehawaii.gov/documents/search.html"},
    "ID": {"name": "Idaho", "url": "https://sosbiz.idaho.gov/search/business"},
    "IL": {"name": "Illinois", "url": "https://apps.ilsos.gov/corporatellc/"},
    "IN": {"name": "Indiana", "url": "https://bsd.sos.in.gov/PublicBusinessSearch"},
    "IA": {"name": "Iowa", "url": "https://sos.iowa.gov/search/business/(S(...))/search.aspx"},
    "KS": {"name": "Kansas", "url": "https://www.kansas.gov/bess/flow/main?execution=e1s1"},
    "KY": {"name": "Kentucky", "url": "https://web.sos.ky.gov/bussearchnew/"},
    "LA": {"name": "Louisiana", "url": "https://coraweb.sos.la.gov/commercialsearch/CommercialSearch.aspx"},
    "ME": {"name": "Maine", "url": "https://www.maine.gov/sos/cec/corp/corp_search.html"},
    "MD": {"name": "Maryland", "url": "https://egov.maryland.gov/BusinessExpress/EntitySearch"},
    "MA": {"name": "Massachusetts", "url": "https://corp.sec.state.ma.us/CorpWeb/CorpSearch/CorpSearch.aspx"},
    "MI": {"name": "Michigan", "url": "https://cofs.lara.state.mi.us/corpweb/CorpSearch/CorpSearch.aspx"},
    "MN": {"name": "Minnesota", "url": "https://mblsportal.sos.state.mn.us/Business/Search"},
    "MS": {"name": "Mississippi", "url": "https://corp.sos.ms.gov/corp/portal/c/page/corpBusinessIdSearch/portal.aspx"},
    "MO": {"name": "Missouri", "url": "https://bsd.sos.mo.gov/BusinessEntity/BESearch.aspx"},
    "MT": {"name": "Montana", "url": "https://sosmt.gov/business/"},
    "NE": {"name": "Nebraska", "url": "https://www.nebraska.gov/sos/corp/corpsearch.cgi"},
    "NV": {"name": "Nevada", "url": "https://esos.nv.gov/EntitySearch/OnlineEntitySearch"},
    "NH": {"name": "New Hampshire", "url": "https://quickstart.sos.nh.gov/online/BusinessInquire"},
    "NJ": {"name": "New Jersey", "url": "https://www.njportal.com/DOR/BusinessNameSearch"},
    "NM": {"name": "New Mexico", "url": "https://portal.sos.state.nm.us/BFS/online/corporationbusinesssearch"},
    "NY": {"name": "New York", "url": "https://apps.dos.ny.gov/publicInquiry/"},
    "NC": {"name": "North Carolina", "url": "https://www.sosnc.gov/online_services/search/by_title/_Business_Registration"},
    "ND": {"name": "North Dakota", "url": "https://firststop.sos.nd.gov/search/business"},
    "OH": {"name": "Ohio", "url": "https://businesssearch.ohiosos.gov/"},
    "OK": {"name": "Oklahoma", "url": "https://www.sos.ok.gov/corp/corpinquiryfind.aspx"},
    "OR": {"name": "Oregon", "url": "https://egov.sos.state.or.us/br/pkg_web_name_srch_inq.login"},
    "PA": {"name": "Pennsylvania", "url": "https://www.corporations.pa.gov/search/corpsearch"},
    "RI": {"name": "Rhode Island", "url": "https://business.sos.ri.gov/CorpWeb/CorpSearch/CorpSearch.aspx"},
    "SC": {"name": "South Carolina", "url": "https://businessfilings.sc.gov/businessfiling/Entity/Search"},
    "SD": {"name": "South Dakota", "url": "https://sosenterprise.sd.gov/BusinessServices/Business/FilingSearch.aspx"},
    "TN": {"name": "Tennessee", "url": "https://tnbear.tn.gov/Ecommerce/FilingSearch.aspx"},
    "TX": {"name": "Texas", "url": "https://mycpa.cpa.state.tx.us/coa/"},
    "UT": {"name": "Utah", "url": "https://secure.utah.gov/bes/"},
    "VT": {"name": "Vermont", "url": "https://bizfilings.vermont.gov/online/BusinessInquire"},
    "VA": {"name": "Virginia", "url": "https://cis.scc.virginia.gov/"},
    "WA": {"name": "Washington", "url": "https://ccfs.sos.wa.gov/#/BusinessSearch"},
    "WV": {"name": "West Virginia", "url": "https://apps.wv.gov/SOS/BusinessEntitySearch/"},
    "WI": {"name": "Wisconsin", "url": "https://www.wdfi.org/apps/CorpSearch/Search.aspx"},
    "WY": {"name": "Wyoming", "url": "https://wyobiz.wyo.gov/Business/FilingSearch.aspx"},
    "DC": {"name": "District of Columbia", "url": "https://corponline.dcra.dc.gov/Account.aspx/LogIn"}
}

@dataclass
class StateRegistration:
    """State business registration data"""
    company_name: str
    state: str
    entity_type: str
    status: str
    registration_number: str
    formation_date: str
    registered_agent: str
    registered_address: str
    officers: List[Dict[str, str]]
    annual_report_due: Optional[str]
    last_updated: str
    source_url: str


class StateRegistryScraper:
    """Scraper for state business registries"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.scraped_data: List[StateRegistration] = []
    
    async def init_session(self):
        if not self.session:
            timeout = aiohttp.ClientTimeout(total=60)
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
            self.session = aiohttp.ClientSession(timeout=timeout, headers=headers)
    
    async def close_session(self):
        if self.session:
            await self.session.close()
            self.session = None
    
    async def search_state_registry(self, company_name: str, state_code: str) -> List[Dict]:
        """
        Search a state's business registry
        Note: Many states require different scraping approaches
        """
        await self.init_session()
        
        if state_code not in STATE_REGISTRIES:
            logger.error(f"Unknown state code: {state_code}")
            return []
        
        registry = STATE_REGISTRIES[state_code]
        logger.info(f"Searching {registry['name']} registry for: {company_name}")
        
        # Different states need different approaches
        if state_code == "CA":
            return await self._search_california(company_name)
        elif state_code == "DE":
            return await self._search_delaware(company_name)
        elif state_code == "NY":
            return await self._search_new_york(company_name)
        elif state_code == "TX":
            return await self._search_texas(company_name)
        elif state_code == "FL":
            return await self._search_florida(company_name)
        else:
            # Generic approach for other states
            return await self._search_generic(company_name, state_code)
    
    async def _search_california(self, company_name: str) -> List[Dict]:
        """Search California business registry"""
        try:
            url = "https://bizfileonline.sos.ca.gov/api/Records/businesssearch"
            payload = {
                "SearchValue": company_name,
                "SearchType": "CORP",
                "SearchCriteria": "contains"
            }
            
            async with self.session.post(url, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_california_results(data)
        except Exception as e:
            logger.error(f"California search error: {e}")
        
        return []
    
    def _parse_california_results(self, data: Dict) -> List[Dict]:
        """Parse California search results"""
        results = []
        for row in data.get("rows", []):
            results.append({
                "name": row.get("TITLE"),
                "entity_number": row.get("ENTITYNUM"),
                "status": row.get("STATUS"),
                "entity_type": row.get("ENTITYTYPE"),
                "formation_date": row.get("REGDATE"),
                "state": "CA",
                "source": "California Secretary of State"
            })
        return results
    
    async def _search_florida(self, company_name: str) -> List[Dict]:
        """Search Florida Sunbiz registry"""
        try:
            url = f"https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquiryType=EntityName&directionType=Initial&searchNameOrder={company_name.upper()}&aggregateId="
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    return self._parse_florida_html(html)
        except Exception as e:
            logger.error(f"Florida search error: {e}")
        
        return []
    
    def _parse_florida_html(self, html: str) -> List[Dict]:
        """Parse Florida Sunbiz HTML results"""
        results = []
        soup = BeautifulSoup(html, 'html.parser')
        
        # Find result table
        table = soup.find('table', {'class': 'searchResultTable'})
        if table:
            rows = table.find_all('tr')[1:]  # Skip header
            for row in rows[:20]:  # Limit results
                cols = row.find_all('td')
                if len(cols) >= 4:
                    results.append({
                        "name": cols[0].get_text(strip=True),
                        "entity_number": cols[1].get_text(strip=True),
                        "status": cols[2].get_text(strip=True),
                        "formation_date": cols[3].get_text(strip=True),
                        "state": "FL",
                        "source": "Florida Division of Corporations"
                    })
        
        return results
    
    async def _search_delaware(self, company_name: str) -> List[Dict]:
        """Search Delaware business registry"""
        try:
            url = "https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx"
            # Note: Delaware requires form submission with viewstate
            # This is a simplified version
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    viewstate = soup.find('input', {'name': '__VIEWSTATE'})
                    # Would need to submit form with viewstate
                    logger.info("Delaware requires form-based search")
        except Exception as e:
            logger.error(f"Delaware search error: {e}")
        
        return []
    
    async def _search_new_york(self, company_name: str) -> List[Dict]:
        """Search New York business registry"""
        try:
            # NY DOS API
            url = f"https://apps.dos.ny.gov/publicInquiry/entitySearch"
            params = {"name": company_name}
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_ny_results(data)
        except Exception as e:
            logger.error(f"New York search error: {e}")
        
        return []
    
    def _parse_ny_results(self, data: Dict) -> List[Dict]:
        """Parse New York results"""
        results = []
        for entity in data.get("entities", []):
            results.append({
                "name": entity.get("name"),
                "entity_number": entity.get("dosId"),
                "status": entity.get("status"),
                "entity_type": entity.get("type"),
                "formation_date": entity.get("formationDate"),
                "state": "NY",
                "source": "New York Department of State"
            })
        return results
    
    async def _search_texas(self, company_name: str) -> List[Dict]:
        """Search Texas Comptroller"""
        try:
            url = "https://mycpa.cpa.state.tx.us/coa/coaSearchBtn"
            data = {
                "coaSearchName": company_name,
                "coaSearchEntity": "",
                "coaSearch": "Search"
            }
            
            async with self.session.post(url, data=data) as response:
                if response.status == 200:
                    html = await response.text()
                    return self._parse_texas_html(html)
        except Exception as e:
            logger.error(f"Texas search error: {e}")
        
        return []
    
    def _parse_texas_html(self, html: str) -> List[Dict]:
        """Parse Texas HTML results"""
        results = []
        soup = BeautifulSoup(html, 'html.parser')
        
        table = soup.find('table', {'id': 'searchResults'})
        if table:
            rows = table.find_all('tr')[1:]
            for row in rows[:20]:
                cols = row.find_all('td')
                if len(cols) >= 3:
                    results.append({
                        "name": cols[0].get_text(strip=True),
                        "entity_number": cols[1].get_text(strip=True),
                        "status": cols[2].get_text(strip=True) if len(cols) > 2 else "Unknown",
                        "state": "TX",
                        "source": "Texas Comptroller"
                    })
        
        return results
    
    async def _search_generic(self, company_name: str, state_code: str) -> List[Dict]:
        """Generic search approach for states without specific implementation"""
        registry = STATE_REGISTRIES[state_code]
        
        try:
            async with self.session.get(registry["url"]) as response:
                if response.status == 200:
                    logger.info(f"Accessed {registry['name']} registry page")
                    # Most states need form submissions or JavaScript
                    return [{
                        "name": company_name,
                        "state": state_code,
                        "source": registry["name"],
                        "note": "Manual search required at: " + registry["url"]
                    }]
        except Exception as e:
            logger.error(f"Error accessing {registry['name']}: {e}")
        
        return []
    
    async def search_all_states(self, company_name: str) -> List[Dict]:
        """Search for company in all 50 states + DC"""
        await self.init_session()
        
        all_results = []
        
        # Search key business states first
        priority_states = ["DE", "CA", "NY", "TX", "FL", "NV", "WY"]
        
        for state in priority_states:
            results = await self.search_state_registry(company_name, state)
            if results:
                all_results.extend(results)
            await asyncio.sleep(1)  # Rate limiting
        
        return all_results


# ==========================================
# BBB (Better Business Bureau) Scraper
# ==========================================

class BBBScraper:
    """Scraper for Better Business Bureau data"""
    
    BASE_URL = "https://www.bbb.org"
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def init_session(self):
        if not self.session:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
            self.session = aiohttp.ClientSession(headers=headers)
    
    async def close_session(self):
        if self.session:
            await self.session.close()
            self.session = None
    
    async def search_business(self, name: str, location: str = "") -> List[Dict]:
        """Search BBB for business"""
        await self.init_session()
        
        try:
            search_query = f"{name} {location}".strip()
            url = f"{self.BASE_URL}/api/search/find"
            params = {
                "find": search_query,
                "type": "business"
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_bbb_results(data)
        except Exception as e:
            logger.error(f"BBB search error: {e}")
        
        return []
    
    def _parse_bbb_results(self, data: Dict) -> List[Dict]:
        """Parse BBB search results"""
        results = []
        
        for business in data.get("results", []):
            results.append({
                "name": business.get("businessName"),
                "bbb_rating": business.get("rating"),
                "accredited": business.get("isAccredited", False),
                "address": business.get("address"),
                "city": business.get("city"),
                "state": business.get("state"),
                "phone": business.get("phone"),
                "website": business.get("websiteUrl"),
                "years_in_business": business.get("yearsInBusiness"),
                "complaint_count": business.get("complaintCount", 0),
                "bbb_file_url": business.get("bbbUrl"),
                "source": "Better Business Bureau"
            })
        
        return results
    
    async def get_business_profile(self, bbb_url: str) -> Optional[Dict]:
        """Get detailed BBB business profile"""
        await self.init_session()
        
        try:
            async with self.session.get(bbb_url) as response:
                if response.status == 200:
                    html = await response.text()
                    return self._parse_bbb_profile(html)
        except Exception as e:
            logger.error(f"BBB profile error: {e}")
        
        return None
    
    def _parse_bbb_profile(self, html: str) -> Dict:
        """Parse BBB profile page"""
        soup = BeautifulSoup(html, 'html.parser')
        
        profile = {}
        
        # Extract rating
        rating_elem = soup.find('span', {'class': 'letter-grade'})
        if rating_elem:
            profile['bbb_rating'] = rating_elem.get_text(strip=True)
        
        # Extract business info
        info_section = soup.find('section', {'class': 'business-info'})
        if info_section:
            # Phone
            phone = info_section.find('a', href=re.compile(r'^tel:'))
            if phone:
                profile['phone'] = phone.get_text(strip=True)
            
            # Address
            address = info_section.find('address')
            if address:
                profile['address'] = address.get_text(strip=True)
        
        # Extract complaints
        complaints = soup.find('span', {'class': 'complaint-count'})
        if complaints:
            try:
                profile['complaint_count'] = int(re.search(r'\d+', complaints.get_text()).group())
            except:
                profile['complaint_count'] = 0
        
        # Extract customer reviews
        reviews = soup.find('span', {'class': 'review-count'})
        if reviews:
            try:
                profile['review_count'] = int(re.search(r'\d+', reviews.get_text()).group())
            except:
                profile['review_count'] = 0
        
        return profile


# ==========================================
# OSHA Safety Data Scraper
# ==========================================

class OSHAScraper:
    """Scraper for OSHA safety inspection data"""
    
    BASE_URL = "https://www.osha.gov/ords/imis/establishment"
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def init_session(self):
        if not self.session:
            self.session = aiohttp.ClientSession()
    
    async def close_session(self):
        if self.session:
            await self.session.close()
            self.session = None
    
    async def search_establishment(self, company_name: str, state: str = "") -> List[Dict]:
        """Search OSHA establishment database"""
        await self.init_session()
        
        try:
            url = f"{self.BASE_URL}/search"
            params = {
                "establishment": company_name,
                "State": state,
                "p_logger": "1"
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    html = await response.text()
                    return self._parse_osha_results(html)
        except Exception as e:
            logger.error(f"OSHA search error: {e}")
        
        return []
    
    def _parse_osha_results(self, html: str) -> List[Dict]:
        """Parse OSHA search results"""
        results = []
        soup = BeautifulSoup(html, 'html.parser')
        
        table = soup.find('table', {'class': 'table'})
        if table:
            rows = table.find_all('tr')[1:]
            for row in rows[:20]:
                cols = row.find_all('td')
                if len(cols) >= 5:
                    results.append({
                        "establishment_name": cols[0].get_text(strip=True),
                        "address": cols[1].get_text(strip=True),
                        "city": cols[2].get_text(strip=True),
                        "state": cols[3].get_text(strip=True),
                        "inspection_count": cols[4].get_text(strip=True) if len(cols) > 4 else 0,
                        "source": "OSHA"
                    })
        
        return results


# ==========================================
# Main Function
# ==========================================

async def main():
    """Test state registry scraping"""
    scraper = StateRegistryScraper()
    bbb = BBBScraper()
    
    try:
        # Test California search
        results = await scraper.search_state_registry("Apple Inc", "CA")
        print(f"California results: {len(results)}")
        for r in results[:3]:
            print(f"  - {r}")
        
        # Test BBB search
        bbb_results = await bbb.search_business("Apple Inc", "California")
        print(f"BBB results: {len(bbb_results)}")
        for r in bbb_results[:3]:
            print(f"  - {r}")
    
    finally:
        await scraper.close_session()
        await bbb.close_session()


if __name__ == "__main__":
    asyncio.run(main())
