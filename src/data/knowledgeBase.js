// Phase 2 — Knowledge Retrieval (Memory + Context)
// Simulates vector DB, supplier profiles, and historical disruption patterns

import { randomInt, randomChoice } from './utils.js';

// ============ VECTOR DB — PAST EVENTS ============
export function getVectorDBStats() {
  return {
    totalDocuments: randomInt(12000, 25000),
    totalVectors: randomInt(45000, 85000),
    indexSize: `${randomInt(2, 8)}.${randomInt(1, 9)} GB`,
    lastIndexed: new Date(Date.now() - randomInt(60, 3600) * 1000).toISOString(),
    avgQueryTime: `${randomInt(12, 85)}ms`,
    collections: ['events', 'suppliers', 'routes', 'disruptions', 'resolutions'],
  };
}

export function searchVectorDB(query = '') {
  const results = [
    { id: 'DOC-001', title: 'Suez Canal Blockage — March 2021', similarity: 0.94, collection: 'disruptions', snippet: 'Container ship Ever Given ran aground in the Suez Canal, blocking traffic for 6 days. 400+ vessels delayed. Global supply chain impact estimated at $9.6B/day.' },
    { id: 'DOC-002', title: 'Shanghai Port COVID Lockdown — April 2022', similarity: 0.91, collection: 'disruptions', snippet: 'Two-month lockdown of Shanghai resulted in massive port congestion. Container throughput dropped 25%. Ripple effects lasted 4+ months across global shipping.' },
    { id: 'DOC-003', title: 'Red Sea Shipping Crisis — 2024', similarity: 0.89, collection: 'events', snippet: 'Houthi attacks on commercial vessels forced major carriers to reroute via Cape of Good Hope. Transit times increased 10-14 days. Freight rates surged 300%.' },
    { id: 'DOC-004', title: 'Thailand Flood Impact on HDD Supply — 2011', similarity: 0.86, collection: 'disruptions', snippet: 'Severe flooding in Thailand destroyed factories producing 25% of global hard drives. Component shortage lasted 6 months. Prices doubled.' },
    { id: 'DOC-005', title: 'Japan Earthquake Supply Chain Impact — 2011', similarity: 0.83, collection: 'disruptions', snippet: 'Tōhoku earthquake and tsunami disrupted automotive and electronics supply chains. Toyota production fell 40%. Global auto output dropped 30%.' },
    { id: 'DOC-006', title: 'US West Coast Port Strike — 2014-2015', similarity: 0.79, collection: 'events', snippet: 'Labor dispute at 29 ports caused months of delays. Ships waited 2+ weeks to unload. Estimated $2.5B/day economic impact.' },
    { id: 'DOC-007', title: 'Semiconductor Shortage — 2020-2023', similarity: 0.76, collection: 'disruptions', snippet: 'Global chip shortage caused by pandemic demand shifts and fab capacity limits. Auto production cut by millions of units. Recovery took 3+ years.' },
    { id: 'DOC-008', title: 'European Energy Crisis — 2022', similarity: 0.72, collection: 'events', snippet: 'Natural gas supply disruption from Russia caused energy prices to spike 10x. Manufacturing costs in Europe surged. Several plants idled.' },
  ];
  return results;
}

// ============ SUPPLIER PROFILES ============
export function getSupplierProfiles() {
  return [
    {
      id: 'SP-001', name: 'TechComp Asia Ltd', location: 'Shanghai, China', category: 'Electronics',
      reliability: randomInt(82, 92), riskScore: randomInt(35, 65), tier: 1,
      leadTime: '14-21 days', capacity: '50K units/month', certifications: ['ISO 9001', 'ISO 14001'],
      alternates: ['ShenTech Corp', 'AsiaElec Ltd'],
      riskHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, risk: randomInt(20, 70) })),
      recentEvents: ['Port congestion delayed 3 shipments', 'Quality audit passed with minor findings'],
    },
    {
      id: 'SP-002', name: 'EuroParts GmbH', location: 'Hamburg, Germany', category: 'Automotive',
      reliability: randomInt(90, 98), riskScore: randomInt(15, 40), tier: 1,
      leadTime: '7-14 days', capacity: '30K units/month', certifications: ['IATF 16949', 'ISO 9001'],
      alternates: ['AutoTech France', 'BalticParts'],
      riskHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, risk: randomInt(10, 45) })),
      recentEvents: ['Energy costs impacting margins', 'New automated line operational'],
    },
    {
      id: 'SP-003', name: 'IndiaTextiles Ltd', location: 'Mumbai, India', category: 'Textiles',
      reliability: randomInt(72, 85), riskScore: randomInt(40, 75), tier: 2,
      leadTime: '21-35 days', capacity: '200K meters/month', certifications: ['OEKO-TEX', 'GOTS'],
      alternates: ['BanglaFabrics', 'VietnamTextile Co'],
      riskHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, risk: randomInt(30, 80) })),
      recentEvents: ['Monsoon season delays expected', 'New dyeing facility reduces lead time'],
    },
    {
      id: 'SP-004', name: 'KoreaSemicon Inc', location: 'Busan, South Korea', category: 'Semiconductors',
      reliability: randomInt(92, 99), riskScore: randomInt(10, 30), tier: 1,
      leadTime: '30-45 days', capacity: '5M chips/month', certifications: ['ISO 9001', 'IECQ'],
      alternates: ['TSMC (Taiwan)', 'GlobalFoundries'],
      riskHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, risk: randomInt(8, 35) })),
      recentEvents: ['Capacity expansion on track', 'New 3nm process qualified'],
    },
    {
      id: 'SP-005', name: 'GulfPetro LLC', location: 'Dubai, UAE', category: 'Petrochemicals',
      reliability: randomInt(85, 93), riskScore: randomInt(30, 55), tier: 1,
      leadTime: '10-18 days', capacity: '100K barrels/month', certifications: ['ISO 9001', 'RC14001'],
      alternates: ['SaudiChem Corp', 'OmanPetro'],
      riskHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, risk: randomInt(20, 60) })),
      recentEvents: ['Red Sea disruptions increasing shipping costs', 'Long-term contract renewed'],
    },
    {
      id: 'SP-006', name: 'BrazilAgro SA', location: 'Santos, Brazil', category: 'Agriculture',
      reliability: randomInt(78, 88), riskScore: randomInt(25, 50), tier: 2,
      leadTime: '25-40 days', capacity: '10K tons/month', certifications: ['GlobalGAP', 'Rainforest Alliance'],
      alternates: ['ArgentinaAgri', 'ColombiaHarvest'],
      riskHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, risk: randomInt(15, 55) })),
      recentEvents: ['Harvest season outlook positive', 'Port congestion at Santos improving'],
    },
  ];
}

// ============ HISTORICAL DISRUPTION PATTERNS ============
export function getHistoricalPatterns() {
  return [
    {
      id: 'HP-001', pattern: 'Seasonal Typhoon Disruption', frequency: 'Annual (Jun-Nov)',
      regions: ['Western Pacific', 'South China Sea'], avgImpactDays: 12,
      probability: 85, historicalOccurrences: 23,
      description: 'Recurring typhoon season causes 2-3 major port closures per year in the Western Pacific. Average delay of 12 days per event with cascading effects on trans-Pacific routes.',
      mitigation: 'Pre-position inventory 30 days before season. Activate northern route alternatives.',
    },
    {
      id: 'HP-002', pattern: 'Geopolitical Trade Route Blockage', frequency: 'Irregular (2-5yr cycle)',
      regions: ['Suez Canal', 'Red Sea', 'Strait of Hormuz'], avgImpactDays: 30,
      probability: 45, historicalOccurrences: 8,
      description: 'Armed conflicts and political instability periodically block major chokepoints. Cape of Good Hope rerouting adds 10-14 days and 30% fuel costs.',
      mitigation: 'Maintain contracts with carriers offering multi-route options. Build strategic buffer stock.',
    },
    {
      id: 'HP-003', pattern: 'Pandemic Supply Disruption', frequency: 'Rare (10-20yr cycle)',
      regions: ['Global'], avgImpactDays: 180,
      probability: 15, historicalOccurrences: 3,
      description: 'Global health emergencies cause factory shutdowns, labor shortages, and demand shifts. Recovery typically takes 12-24 months for full normalization.',
      mitigation: 'Diversify supplier base across regions. Increase automation. Build 60-day safety stock.',
    },
    {
      id: 'HP-004', pattern: 'Port Labor Action', frequency: 'Regular (1-3yr cycle)',
      regions: ['North America', 'Europe'], avgImpactDays: 14,
      probability: 60, historicalOccurrences: 15,
      description: 'Union contract negotiations and strikes regularly disrupt port operations. US West Coast and Northern European ports most affected.',
      mitigation: 'Pre-ship critical inventory before contract expiry dates. Use East Coast / Gulf alternatives.',
    },
    {
      id: 'HP-005', pattern: 'Climate-Driven Canal Restrictions', frequency: 'Increasing (annual)',
      regions: ['Panama Canal', 'Rhine River'], avgImpactDays: 45,
      probability: 70, historicalOccurrences: 6,
      description: 'Drought conditions lowering water levels restrict vessel drafts and daily transits. Panama Canal has reduced daily transits from 38 to 24 in severe drought.',
      mitigation: 'Book canal slots early. Use intermodal rail alternatives. Lighten vessel loads.',
    },
  ];
}
