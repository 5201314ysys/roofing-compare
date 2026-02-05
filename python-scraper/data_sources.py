"""
全美各州政府公开数据API配置
"""

# 各州建筑许可证数据API
STATE_PERMIT_APIS = {
    # 加利福尼亚州
    'CA': {
        'los_angeles': {
            'url': 'https://data.lacity.org/resource/yv23-pmwf.json',
            'name': 'LA Building Permits',
            'fields': {
                'permit_number': 'pcis_permit',
                'issue_date': 'issue_date',
                'address': 'address',
                'cost': 'valuation',
                'description': 'work_description'
            }
        },
        'san_francisco': {
            'url': 'https://data.sfgov.org/resource/i98e-djp9.json',
            'name': 'SF Building Permits',
            'fields': {
                'permit_number': 'permit_number',
                'issue_date': 'issued_date',
                'address': 'street_number',
                'cost': 'estimated_cost',
                'description': 'description'
            }
        },
        'san_diego': {
            'url': 'https://seshat.datasd.org/permits/permits_all_types_datasd.json',
            'name': 'San Diego Permits',
        }
    },
    
    # 德克萨斯州
    'TX': {
        'austin': {
            'url': 'https://data.austintexas.gov/resource/3syk-w9eu.json',
            'name': 'Austin Building Permits',
        },
        'houston': {
            'url': 'https://cohgis-mycity.opendata.arcgis.com/datasets/permits',
            'name': 'Houston Permits',
        }
    },
    
    # 纽约州
    'NY': {
        'new_york_city': {
            'url': 'https://data.cityofnewyork.us/resource/ipu4-2vj7.json',
            'name': 'NYC DOB Permit Issuance',
            'fields': {
                'permit_number': 'job__',
                'issue_date': 'issuance_date',
                'address': 'house__',
                'cost': 'initial_cost',
                'description': 'job_description'
            }
        }
    },
    
    # 佛罗里达州
    'FL': {
        'miami': {
            'url': 'https://opendata.miamidade.gov/resource/building-permits.json',
            'name': 'Miami-Dade Building Permits',
        }
    },
    
    # 伊利诺伊州
    'IL': {
        'chicago': {
            'url': 'https://data.cityofchicago.org/resource/ydr8-5enu.json',
            'name': 'Chicago Building Permits',
            'fields': {
                'permit_number': 'permit_',
                'issue_date': 'issue_date',
                'address': 'street_number',
                'cost': 'reported_cost',
                'description': 'work_description',
                'contractor': 'contact_1_name'
            }
        }
    },
    
    # 华盛顿州
    'WA': {
        'seattle': {
            'url': 'https://data.seattle.gov/resource/76t5-zqzr.json',
            'name': 'Seattle Building Permits',
        }
    },
    
    # 科罗拉多州
    'CO': {
        'denver': {
            'url': 'https://www.denvergov.org/opendata/dataset/city-and-county-of-denver-building-permits',
            'name': 'Denver Building Permits',
        }
    },
    
    # 亚利桑那州
    'AZ': {
        'phoenix': {
            'url': 'https://www.phoenixopendata.com/dataset/building-permits',
            'name': 'Phoenix Building Permits',
        }
    },
    
    # 乔治亚州
    'GA': {
        'atlanta': {
            'url': 'https://opendata.atlantaga.gov/datasets/building-permits',
            'name': 'Atlanta Building Permits',
        }
    },
    
    # 马萨诸塞州
    'MA': {
        'boston': {
            'url': 'https://data.boston.gov/api/3/action/datastore_search?resource_id=6ddcd912-32a0-43df-9908-63574f8c7e77',
            'name': 'Boston Building Permits',
        }
    }
}

# 行业分类映射
INDUSTRY_MAPPING = {
    'roofing': {
        'keywords': ['roof', 'roofing', 'shingle', 'tile roof', 're-roof'],
        'work_types': ['ROOFING', 'RE-ROOF', 'ROOF REPAIR']
    },
    'hvac': {
        'keywords': ['hvac', 'heating', 'cooling', 'air condition', 'furnace', 'duct'],
        'work_types': ['HVAC', 'MECHANICAL', 'HEATING', 'COOLING']
    },
    'plumbing': {
        'keywords': ['plumb', 'pipe', 'drain', 'sewer', 'water heater'],
        'work_types': ['PLUMBING', 'PLUMBER']
    },
    'electrical': {
        'keywords': ['electric', 'wiring', 'panel', 'circuit', 'outlet'],
        'work_types': ['ELECTRICAL', 'ELECTRIC']
    },
    'construction': {
        'keywords': ['construct', 'build', 'addition', 'remodel', 'renovation'],
        'work_types': ['NEW CONSTRUCTION', 'ADDITION', 'ALTERATION', 'REMODEL']
    },
    'landscaping': {
        'keywords': ['landscape', 'garden', 'irrigation', 'lawn', 'tree'],
        'work_types': ['LANDSCAPING', 'IRRIGATION']
    }
}

# 联邦数据源
FEDERAL_DATA_SOURCES = {
    'sam_gov': {
        'url': 'https://api.sam.gov/entity-information/v3/entities',
        'description': 'System for Award Management - 企业注册信息',
        'api_key_required': True
    },
    'usa_spending': {
        'url': 'https://api.usaspending.gov/api/v2',
        'description': 'USASpending - 政府合同数据',
        'api_key_required': False
    },
    'sec_edgar': {
        'url': 'https://data.sec.gov/submissions',
        'description': 'SEC EDGAR - 上市公司信息',
        'api_key_required': False
    },
    'census': {
        'url': 'https://api.census.gov/data',
        'description': 'US Census Bureau - 商业统计数据',
        'api_key_required': True
    }
}

# 州代码映射
STATE_CODES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
}
