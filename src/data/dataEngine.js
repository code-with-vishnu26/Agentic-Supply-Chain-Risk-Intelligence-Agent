// Supply Chain Risk Intelligence - Data Engine
// Simulates real-time events, risk scoring, predictions, and mitigation strategies

const EVENT_TYPES = ['weather', 'geopolitical', 'logistics', 'shipping'];
const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low'];

const LOCATIONS = [
  { name: 'Shanghai Port', lat: 31.23, lng: 121.47, region: 'Asia Pacific' },
  { name: 'Singapore Strait', lat: 1.35, lng: 103.82, region: 'Asia Pacific' },
  { name: 'Suez Canal', lat: 30.46, lng: 32.35, region: 'Middle East' },
  { name: 'Rotterdam Port', lat: 51.92, lng: 4.48, region: 'Europe' },
  { name: 'Los Angeles Port', lat: 33.74, lng: -118.27, region: 'North America' },
  { name: 'Panama Canal', lat: 9.08, lng: -79.68, region: 'Central America' },
  { name: 'Mumbai Port', lat: 18.95, lng: 72.84, region: 'South Asia' },
  { name: 'Hamburg Port', lat: 53.55, lng: 9.97, region: 'Europe' },
  { name: 'Busan Port', lat: 35.1, lng: 129.03, region: 'Asia Pacific' },
  { name: 'Santos Port', lat: -23.95, lng: -46.33, region: 'South America' },
  { name: 'Dubai Port', lat: 25.27, lng: 55.29, region: 'Middle East' },
  { name: 'Cape Town Port', lat: -33.92, lng: 18.42, region: 'Africa' },
  { name: 'Tokyo Bay', lat: 35.65, lng: 139.77, region: 'Asia Pacific' },
  { name: 'Strait of Malacca', lat: 2.5, lng: 101.8, region: 'Asia Pacific' },
  { name: 'English Channel', lat: 50.8, lng: -0.9, region: 'Europe' },
];

const WEATHER_EVENTS = [
  'Typhoon approaching shipping lanes',
  'Severe flooding disrupting inland transport',
  'Blizzard conditions at major port',
  'Hurricane warning issued for coastal region',
  'Extreme heatwave affecting warehouse operations',
  'Dense fog causing port visibility issues',
  'Monsoon season intensifying beyond forecast',
  'Tornado warning near distribution center',
  'Arctic ice blocking northern shipping route',
  'Drought affecting canal water levels',
];

const GEOPOLITICAL_EVENTS = [
  'Trade sanctions imposed on export region',
  'Border closure affecting land transport',
  'Political unrest near major port facility',
  'New tariff regulations announced',
  'Military exercises blocking shipping lane',
  'Diplomatic tensions escalating between trading nations',
  'Export ban on critical raw materials',
  'Labor strike at major transportation hub',
  'Government policy change on import quotas',
  'Cybersecurity threat to port infrastructure',
];

const LOGISTICS_EVENTS = [
  'Container shortage at major terminal',
  'Rail network congestion causing delays',
  'Warehouse capacity at critical levels',
  'Truck driver shortage in transit corridor',
  'Equipment malfunction at loading dock',
  'Customs processing delays exceeding 48 hours',
  'Inventory system outage at distribution hub',
  'Air freight capacity reduced by 40%',
  'Last-mile delivery network overwhelmed',
  'Cold chain integrity breach detected',
];

const SHIPPING_EVENTS = [
  'Vessel grounding blocking channel',
  'Port congestion causing 7-day delays',
  'Container ship mechanical failure',
  'Piracy alert in transit corridor',
  'Fuel shortage affecting fleet operations',
  'Port worker strike announced',
  'Vessel rerouted due to weather conditions',
  'Container tracking system malfunction',
  'Berthing slot unavailable for 5 days',
  'Emission regulations forcing speed reduction',
];

const EVENT_DESCRIPTIONS = {
  weather: WEATHER_EVENTS,
  geopolitical: GEOPOLITICAL_EVENTS,
  logistics: LOGISTICS_EVENTS,
  shipping: SHIPPING_EVENTS,
};

const SUPPLY_ROUTES = [
  { id: 'RT-001', name: 'Shanghai → Los Angeles', from: 'Shanghai Port', to: 'Los Angeles Port', risk: 72 },
  { id: 'RT-002', name: 'Rotterdam → Mumbai', from: 'Rotterdam Port', to: 'Mumbai Port', risk: 58 },
  { id: 'RT-003', name: 'Singapore → Hamburg', from: 'Singapore Strait', to: 'Hamburg Port', risk: 65 },
  { id: 'RT-004', name: 'Busan → Panama Canal', from: 'Busan Port', to: 'Panama Canal', risk: 43 },
  { id: 'RT-005', name: 'Dubai → Rotterdam', from: 'Dubai Port', to: 'Rotterdam Port', risk: 51 },
  { id: 'RT-006', name: 'Santos → Cape Town', from: 'Santos Port', to: 'Cape Town Port', risk: 37 },
  { id: 'RT-007', name: 'Tokyo → Los Angeles', from: 'Tokyo Bay', to: 'Los Angeles Port', risk: 61 },
  { id: 'RT-008', name: 'Mumbai → Suez Canal', from: 'Mumbai Port', to: 'Suez Canal', risk: 78 },
];

const SUPPLIERS = [
  { id: 'SP-001', name: 'TechComp Asia', location: 'Shanghai Port', category: 'Electronics', reliability: 87 },
  { id: 'SP-002', name: 'EuroParts GmbH', location: 'Hamburg Port', category: 'Automotive', reliability: 92 },
  { id: 'SP-003', name: 'IndiaTextiles Ltd', location: 'Mumbai Port', category: 'Textiles', reliability: 78 },
  { id: 'SP-004', name: 'BrazilAgro SA', location: 'Santos Port', category: 'Agriculture', reliability: 83 },
  { id: 'SP-005', name: 'KoreaSemicon', location: 'Busan Port', category: 'Semiconductors', reliability: 95 },
  { id: 'SP-006', name: 'GulfPetro LLC', location: 'Dubai Port', category: 'Petrochemicals', reliability: 88 },
];

// Utility functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId() {
  return 'EVT-' + Date.now().toString(36).toUpperCase() + '-' + randomInt(100, 999);
}

// Generate a single event
export function generateEvent(timestamp = null) {
  const type = randomChoice(EVENT_TYPES);
  const severity = randomChoice(SEVERITY_LEVELS);
  const location = randomChoice(LOCATIONS);
  const description = randomChoice(EVENT_DESCRIPTIONS[type]);
  
  const severityScore = { critical: randomInt(85, 100), high: randomInt(65, 84), medium: randomInt(40, 64), low: randomInt(10, 39) };
  
  const affectedRoutes = SUPPLY_ROUTES
    .filter(r => r.from === location.name || r.to === location.name || Math.random() > 0.7)
    .slice(0, randomInt(1, 3));
  
  const affectedSuppliers = SUPPLIERS
    .filter(s => s.location === location.name || Math.random() > 0.75)
    .slice(0, randomInt(1, 2));

  return {
    id: generateId(),
    type,
    severity,
    riskScore: severityScore[severity],
    title: description,
    description: `${description}. Monitoring indicates ${severity} level impact on supply chain operations in the ${location.region} region. Immediate assessment recommended.`,
    location,
    timestamp: timestamp || new Date(Date.now() - randomInt(0, 72 * 60 * 60 * 1000)).toISOString(),
    affectedRoutes: affectedRoutes.map(r => r.name),
    affectedSuppliers: affectedSuppliers.map(s => s.name),
    estimatedImpact: {
      financialLoss: `$${(randomInt(50, 5000) / 10).toFixed(1)}M`,
      delayDays: randomInt(1, 21),
      affectedShipments: randomInt(5, 200),
    },
    status: randomChoice(['active', 'monitoring', 'resolved', 'escalated']),
  };
}

// Generate event batch
export function generateEventBatch(count = 20) {
  const events = [];
  for (let i = 0; i < count; i++) {
    const hoursAgo = randomInt(0, 168);
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    events.push(generateEvent(timestamp));
  }
  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Risk scoring per category
export function getRiskByCategory() {
  return EVENT_TYPES.map(type => ({
    category: type.charAt(0).toUpperCase() + type.slice(1),
    risk: randomInt(25, 92),
    trend: randomChoice(['up', 'down', 'stable']),
    events: randomInt(3, 25),
  }));
}

// Overall KPIs
export function getKPIs() {
  return {
    overallRisk: randomInt(55, 85),
    activeDisruptions: randomInt(8, 24),
    affectedRoutes: randomInt(3, SUPPLY_ROUTES.length),
    financialExposure: `$${randomInt(120, 890)}M`,
    resolvedToday: randomInt(2, 8),
    avgResolutionTime: `${randomInt(4, 72)}h`,
    monitoredNodes: randomInt(140, 350),
    alertsTriggered: randomInt(12, 45),
  };
}

// 30-day risk forecast
export function getRiskForecast() {
  const data = [];
  let baseRisk = randomInt(45, 65);
  for (let i = 0; i < 30; i++) {
    baseRisk += randomInt(-5, 7);
    baseRisk = Math.max(20, Math.min(95, baseRisk));
    const date = new Date();
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      risk: baseRisk,
      upper: Math.min(100, baseRisk + randomInt(5, 15)),
      lower: Math.max(0, baseRisk - randomInt(5, 15)),
    });
  }
  return data;
}

// Trend data per category over last 12 weeks
export function getCategoryTrends() {
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const entry = { week: `W${12 - i}` };
    EVENT_TYPES.forEach(type => {
      entry[type] = randomInt(20, 90);
    });
    weeks.push(entry);
  }
  return weeks;
}

// Risk heatmap data (region x category)
export function getRiskHeatmap() {
  const regions = ['Asia Pacific', 'Europe', 'North America', 'Middle East', 'South America', 'Africa', 'South Asia', 'Central America'];
  return regions.map(region => {
    const row = { region };
    EVENT_TYPES.forEach(type => {
      row[type] = randomInt(10, 100);
    });
    return row;
  });
}

// Predicted disruptions
export function getPredictedDisruptions() {
  return [
    { id: 'PD-001', title: 'Typhoon Season Escalation - Western Pacific', probability: 87, category: 'weather', region: 'Asia Pacific', timeframe: '7-14 days', impact: 'high', details: 'Meteorological models predict above-average typhoon activity affecting major shipping routes between China, Japan, and Southeast Asia.' },
    { id: 'PD-002', title: 'Port Congestion Surge - European Ports', probability: 73, category: 'logistics', region: 'Europe', timeframe: '3-7 days', impact: 'medium', details: 'Increased cargo volumes and labor shortages expected to cause significant delays at Rotterdam, Hamburg, and Antwerp ports.' },
    { id: 'PD-003', title: 'Trade Policy Shift - South Asia Region', probability: 62, category: 'geopolitical', region: 'South Asia', timeframe: '14-30 days', impact: 'high', details: 'Diplomatic signals suggest potential changes to import/export regulations that could affect textile and electronics supply chains.' },
    { id: 'PD-004', title: 'Fuel Price Spike - Global Markets', probability: 55, category: 'shipping', region: 'Global', timeframe: '7-21 days', impact: 'medium', details: 'OPEC production adjustments and Middle East tensions may drive fuel costs up by 15-25%, impacting shipping rates.' },
    { id: 'PD-005', title: 'Cold Chain Disruption - Central America', probability: 48, category: 'logistics', region: 'Central America', timeframe: '5-10 days', impact: 'medium', details: 'Power grid instability could compromise cold chain integrity for perishable goods transiting through Panama.' },
    { id: 'PD-006', title: 'Cyber Attack Risk - Maritime Systems', probability: 41, category: 'geopolitical', region: 'Global', timeframe: '30+ days', impact: 'critical', details: 'Intelligence reports indicate increased cyber threat activity targeting port management and vessel tracking systems.' },
  ];
}

// Mitigation strategies
export function getMitigationStrategies() {
  return [
    {
      id: 'MS-001', title: 'Diversify Shipping Routes', priority: 'critical',
      description: 'Establish alternative shipping corridors to reduce dependency on high-risk routes. Activate secondary lanes through Cape of Good Hope and Arctic Northern Sea Route.',
      riskReduction: 35, estimatedCost: '$2.4M', timeline: '2-4 weeks',
      affectedRisks: ['weather', 'geopolitical', 'shipping'],
      steps: ['Identify alternative routing options', 'Negotiate carrier contracts', 'Update logistics management systems', 'Conduct trial shipments'],
      status: 'recommended',
    },
    {
      id: 'MS-002', title: 'Increase Safety Stock Levels', priority: 'high',
      description: 'Temporarily increase inventory buffers at key distribution centers to absorb potential supply disruptions. Focus on critical components with single-source dependencies.',
      riskReduction: 28, estimatedCost: '$8.7M', timeline: '1-2 weeks',
      affectedRisks: ['logistics', 'shipping'],
      steps: ['Audit current inventory levels', 'Calculate optimal safety stock', 'Place additional purchase orders', 'Arrange warehouse space'],
      status: 'in-progress',
    },
    {
      id: 'MS-003', title: 'Activate Backup Suppliers', priority: 'high',
      description: 'Engage pre-qualified backup suppliers in low-risk regions. Prioritize suppliers with shorter lead times and proven quality track records.',
      riskReduction: 42, estimatedCost: '$5.1M', timeline: '3-6 weeks',
      affectedRisks: ['geopolitical', 'logistics'],
      steps: ['Review backup supplier list', 'Send RFQs to qualified vendors', 'Negotiate emergency pricing', 'Establish quality checkpoints'],
      status: 'recommended',
    },
    {
      id: 'MS-004', title: 'Implement Real-Time Tracking', priority: 'medium',
      description: 'Deploy IoT sensors and GPS tracking across the entire supply chain for real-time visibility into shipment locations, conditions, and estimated arrival times.',
      riskReduction: 22, estimatedCost: '$3.8M', timeline: '4-8 weeks',
      affectedRisks: ['shipping', 'logistics'],
      steps: ['Select IoT platform provider', 'Install tracking devices on containers', 'Integrate with supply chain management system', 'Train operations team'],
      status: 'planned',
    },
    {
      id: 'MS-005', title: 'Negotiate Force Majeure Clauses', priority: 'medium',
      description: 'Renegotiate contracts with carriers and suppliers to include comprehensive force majeure protections and penalty waivers for disruption scenarios.',
      riskReduction: 18, estimatedCost: '$0.5M', timeline: '2-4 weeks',
      affectedRisks: ['weather', 'geopolitical'],
      steps: ['Review existing contracts', 'Draft revised terms', 'Negotiate with counterparties', 'Execute amendments'],
      status: 'recommended',
    },
    {
      id: 'MS-006', title: 'Establish Regional Warehousing', priority: 'low',
      description: 'Set up satellite warehousing facilities in strategic locations to reduce last-mile delivery risks and improve regional supply chain resilience.',
      riskReduction: 30, estimatedCost: '$15.2M', timeline: '8-16 weeks',
      affectedRisks: ['logistics', 'weather', 'shipping'],
      steps: ['Conduct location feasibility analysis', 'Secure warehouse leases', 'Set up warehouse management systems', 'Transfer initial inventory'],
      status: 'under-review',
    },
  ];
}

// Alerts data
export function getAlerts() {
  const alertTypes = [
    { title: 'Critical Risk Threshold Exceeded', severity: 'critical', channel: 'Email + SMS', threshold: 'Risk Score > 85' },
    { title: 'New Geopolitical Event Detected', severity: 'high', channel: 'Dashboard + Email', threshold: 'Any geopolitical event' },
    { title: 'Shipping Delay > 48 Hours', severity: 'high', channel: 'Email', threshold: 'Delay > 48h' },
    { title: 'Supplier Reliability Drop', severity: 'medium', channel: 'Dashboard', threshold: 'Reliability < 80%' },
    { title: 'Weather Advisory Update', severity: 'medium', channel: 'Dashboard + Email', threshold: 'Severe weather alert' },
    { title: 'Port Congestion Warning', severity: 'medium', channel: 'Dashboard', threshold: 'Wait time > 72h' },
    { title: 'Container Tracking Lost', severity: 'high', channel: 'Email + SMS', threshold: 'No signal > 6h' },
    { title: 'Cost Overrun Detected', severity: 'low', channel: 'Dashboard', threshold: 'Cost > 110% budget' },
  ];

  return alertTypes.map((alert, i) => ({
    id: `ALR-${String(i + 1).padStart(3, '0')}`,
    ...alert,
    triggered: randomInt(0, 12),
    lastTriggered: i < 5 ? new Date(Date.now() - randomInt(0, 48) * 60 * 60 * 1000).toISOString() : null,
    status: randomChoice(['active', 'acknowledged', 'snoozed']),
    enabled: Math.random() > 0.15,
  }));
}

// Alert history
export function getAlertHistory() {
  const history = [];
  for (let i = 0; i < 15; i++) {
    const hoursAgo = randomInt(1, 168);
    history.push({
      id: `AH-${String(i + 1).padStart(3, '0')}`,
      title: randomChoice(['Route risk elevated', 'Supplier delay warning', 'Weather disruption alert', 'Port congestion notice', 'Shipment tracking lost', 'Cost threshold exceeded']),
      severity: randomChoice(SEVERITY_LEVELS),
      timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      acknowledged: Math.random() > 0.3,
      resolvedAt: Math.random() > 0.4 ? new Date(Date.now() - (hoursAgo - randomInt(1, hoursAgo)) * 60 * 60 * 1000).toISOString() : null,
    });
  }
  return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export { SUPPLY_ROUTES, SUPPLIERS, LOCATIONS, EVENT_TYPES, SEVERITY_LEVELS };
