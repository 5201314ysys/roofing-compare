"""
Data Scheduler - Automated 30-minute data updates
Uses APScheduler for reliable scheduling
"""

import asyncio
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from supabase import create_client, Client

from comprehensive_scraper import DataAggregator, CompanyData
from state_registry_scraper import StateRegistryScraper, BBBScraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ==========================================
# SUPABASE CLIENT
# ==========================================

def get_supabase_client() -> Optional[Client]:
    """Initialize Supabase client"""
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        logger.warning("Supabase credentials not configured")
        return None
    
    return create_client(url, key)


# ==========================================
# DATA SYNC JOBS
# ==========================================

class DataSyncManager:
    """Manages data synchronization with database"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
        self.aggregator = DataAggregator()
        self.state_scraper = StateRegistryScraper()
        self.bbb_scraper = BBBScraper()
        self.stats = {
            "last_run": None,
            "companies_updated": 0,
            "errors": 0,
            "total_runs": 0
        }
    
    async def sync_company(self, company: CompanyData):
        """Sync single company to database"""
        if not self.supabase:
            logger.warning("No database connection")
            return False
        
        try:
            # Prepare data for upsert
            company_data = {
                "id": company.id,
                "name": company.name,
                "legal_name": company.legal_name,
                "entity_type": company.entity_type,
                "status": company.status,
                "formation_date": company.formation_date,
                "state_of_formation": company.state_of_formation,
                "registration_number": company.registration_number,
                "ein": company.ein,
                "naics_code": company.naics_code,
                "industry": company.industry,
                "ceo": company.ceo,
                "overall_rating": company.overall_rating,
                "total_reviews": company.total_reviews,
                "bbb_rating": company.bbb_rating,
                "bbb_accredited": company.bbb_accredited,
                "avg_quote": company.avg_quote,
                "total_projects": company.total_projects,
                "bonded": company.bonded,
                "insured": company.insured,
                "verified": company.verified,
                "data_quality_score": company.data_quality_score,
                "data_sources": company.data_sources,
                "last_updated": datetime.now().isoformat()
            }
            
            # Add contact info
            if company.contact:
                company_data.update({
                    "phone": company.contact.phone,
                    "email": company.contact.email,
                    "website": company.contact.website,
                    "address": company.contact.address,
                    "city": company.contact.city,
                    "state": company.contact.state,
                    "zip_code": company.contact.zip_code
                })
            
            # Add financial info
            if company.financial:
                company_data.update({
                    "revenue": company.financial.revenue,
                    "revenue_range": company.financial.revenue_range,
                    "employees": company.financial.employees,
                    "employee_range": company.financial.employee_range,
                    "is_public": company.financial.public,
                    "stock_symbol": company.financial.stock_symbol
                })
            
            # Upsert to database
            result = self.supabase.table("companies").upsert(
                company_data,
                on_conflict="id"
            ).execute()
            
            # Sync executives
            if company.executives:
                await self._sync_executives(company.id, company.executives)
            
            # Sync licenses
            if company.licenses:
                await self._sync_licenses(company.id, company.licenses)
            
            # Sync ratings
            if company.ratings:
                await self._sync_ratings(company.id, company.ratings)
            
            logger.info(f"Synced company: {company.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error syncing company {company.name}: {e}")
            self.stats["errors"] += 1
            return False
    
    async def _sync_executives(self, company_id: str, executives: list):
        """Sync executives to database"""
        if not self.supabase:
            return
        
        for exec in executives:
            exec_data = {
                "company_id": company_id,
                "name": exec.name,
                "title": exec.title,
                "start_date": exec.start_date,
                "linkedin_url": exec.linkedin_url,
                "verified": exec.verified,
                "source": exec.source
            }
            
            try:
                self.supabase.table("company_executives").upsert(
                    exec_data,
                    on_conflict="company_id,name"
                ).execute()
            except Exception as e:
                logger.error(f"Error syncing executive: {e}")
    
    async def _sync_licenses(self, company_id: str, licenses: list):
        """Sync licenses to database"""
        if not self.supabase:
            return
        
        for lic in licenses:
            lic_data = {
                "company_id": company_id,
                "license_number": lic.license_number,
                "license_type": lic.license_type,
                "status": lic.status,
                "issue_date": lic.issue_date,
                "expiry_date": lic.expiry_date,
                "issuing_authority": lic.issuing_authority,
                "verified": lic.verified
            }
            
            try:
                self.supabase.table("company_licenses").upsert(
                    lic_data,
                    on_conflict="company_id,license_number"
                ).execute()
            except Exception as e:
                logger.error(f"Error syncing license: {e}")
    
    async def _sync_ratings(self, company_id: str, ratings: list):
        """Sync ratings to database"""
        if not self.supabase:
            return
        
        for rating in ratings:
            rating_data = {
                "company_id": company_id,
                "source": rating.source,
                "rating": rating.rating,
                "max_rating": rating.max_rating,
                "review_count": rating.review_count,
                "last_updated": rating.last_updated
            }
            
            try:
                self.supabase.table("company_ratings").upsert(
                    rating_data,
                    on_conflict="company_id,source"
                ).execute()
            except Exception as e:
                logger.error(f"Error syncing rating: {e}")
    
    async def get_companies_to_update(self, limit: int = 100) -> list:
        """Get companies that need updating"""
        if not self.supabase:
            return []
        
        # Get companies not updated in last 30 minutes
        cutoff = (datetime.now() - timedelta(minutes=30)).isoformat()
        
        try:
            result = self.supabase.table("companies").select("*").or_(
                f"last_updated.lt.{cutoff},last_updated.is.null"
            ).limit(limit).execute()
            
            return result.data
        except Exception as e:
            logger.error(f"Error getting companies to update: {e}")
            return []
    
    async def run_update_cycle(self):
        """Run a complete update cycle"""
        logger.info("Starting update cycle...")
        self.stats["last_run"] = datetime.now().isoformat()
        self.stats["total_runs"] += 1
        updated = 0
        
        try:
            # Get companies needing update
            companies = await self.get_companies_to_update(100)
            logger.info(f"Found {len(companies)} companies to update")
            
            for company_data in companies:
                name = company_data.get("name", "")
                state = company_data.get("state", "")
                
                if name:
                    # Fetch fresh data
                    fresh_data = await self.aggregator.get_full_company_data(name, state)
                    
                    if fresh_data:
                        success = await self.sync_company(fresh_data)
                        if success:
                            updated += 1
                    
                    # Rate limit
                    await asyncio.sleep(0.5)
            
            self.stats["companies_updated"] = updated
            logger.info(f"Update cycle complete. Updated {updated} companies.")
            
        except Exception as e:
            logger.error(f"Error in update cycle: {e}")
            self.stats["errors"] += 1
        
        return updated
    
    async def discover_new_companies(self, industry: str = "", state: str = ""):
        """Discover new companies from various sources"""
        logger.info(f"Discovering new companies - Industry: {industry}, State: {state}")
        discovered = 0
        
        # Search state registries
        if state:
            results = await self.state_scraper.search_state_registry(industry, state)
            for result in results[:50]:
                name = result.get("name", "")
                if name:
                    company = await self.aggregator.get_full_company_data(name, state)
                    if company:
                        await self.sync_company(company)
                        discovered += 1
                    await asyncio.sleep(0.5)
        
        logger.info(f"Discovered {discovered} new companies")
        return discovered
    
    async def close(self):
        """Clean up resources"""
        await self.aggregator.close()
        await self.state_scraper.close_session()
        await self.bbb_scraper.close_session()


# ==========================================
# SCHEDULER
# ==========================================

class DataScheduler:
    """Automated data update scheduler"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.sync_manager = DataSyncManager()
        self.is_running = False
    
    def setup_jobs(self):
        """Setup scheduled jobs"""
        
        # Main update job - every 30 minutes
        self.scheduler.add_job(
            self._run_update_job,
            IntervalTrigger(minutes=30),
            id="main_update",
            name="30-minute company data update",
            replace_existing=True
        )
        
        # Daily discovery job - 2 AM
        self.scheduler.add_job(
            self._run_discovery_job,
            CronTrigger(hour=2, minute=0),
            id="daily_discovery",
            name="Daily new company discovery",
            replace_existing=True
        )
        
        # Weekly deep refresh - Sunday 3 AM
        self.scheduler.add_job(
            self._run_deep_refresh,
            CronTrigger(day_of_week="sun", hour=3, minute=0),
            id="weekly_refresh",
            name="Weekly deep data refresh",
            replace_existing=True
        )
        
        logger.info("Scheduled jobs configured")
    
    async def _run_update_job(self):
        """Run the main update job"""
        logger.info("Running scheduled update job...")
        await self.sync_manager.run_update_cycle()
    
    async def _run_discovery_job(self):
        """Run company discovery job"""
        logger.info("Running scheduled discovery job...")
        
        # Discover companies in major states
        states = ["CA", "TX", "NY", "FL", "IL", "PA", "OH", "GA", "NC", "MI"]
        industries = ["construction", "roofing", "plumbing", "electrical", "hvac"]
        
        for state in states:
            for industry in industries:
                await self.sync_manager.discover_new_companies(industry, state)
                await asyncio.sleep(60)  # Wait between searches
    
    async def _run_deep_refresh(self):
        """Run deep refresh of all data"""
        logger.info("Running weekly deep refresh...")
        # Force update of all companies regardless of last update time
        if not self.sync_manager.supabase:
            return
        
        try:
            result = self.sync_manager.supabase.table("companies").select("name,state").execute()
            
            for company in result.data:
                name = company.get("name", "")
                state = company.get("state", "")
                
                if name:
                    fresh_data = await self.sync_manager.aggregator.get_full_company_data(name, state)
                    if fresh_data:
                        await self.sync_manager.sync_company(fresh_data)
                    await asyncio.sleep(1)
        
        except Exception as e:
            logger.error(f"Error in deep refresh: {e}")
    
    def start(self):
        """Start the scheduler"""
        if not self.is_running:
            self.setup_jobs()
            self.scheduler.start()
            self.is_running = True
            logger.info("Data scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Data scheduler stopped")
    
    def get_status(self) -> dict:
        """Get scheduler status"""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "next_run": str(job.next_run_time) if job.next_run_time else None
            })
        
        return {
            "running": self.is_running,
            "jobs": jobs,
            "stats": self.sync_manager.stats
        }


# ==========================================
# MAIN
# ==========================================

async def main():
    """Main function to run the scheduler"""
    scheduler = DataScheduler()
    
    try:
        scheduler.start()
        
        # Run initial update
        logger.info("Running initial update...")
        await scheduler.sync_manager.run_update_cycle()
        
        # Keep running
        while True:
            status = scheduler.get_status()
            logger.info(f"Scheduler status: {status}")
            await asyncio.sleep(300)  # Log status every 5 minutes
    
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        scheduler.stop()
        await scheduler.sync_manager.close()


if __name__ == "__main__":
    asyncio.run(main())
