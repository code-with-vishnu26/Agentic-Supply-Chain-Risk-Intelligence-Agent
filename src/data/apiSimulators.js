// Phase 1 — Event Monitoring (Data Ingestion)
// Simulates real-time feeds from Weather, News, Shipping, and Market/Trade APIs

import { randomInt, randomChoice } from './utils.js';

// ============ WEATHER API SIMULATOR ============
const WEATHER_FEED = [
  { type: 'Typhoon', region: 'Western Pacific', severity: 'critical', detail: 'Category 4 typhoon approaching Taiwan Strait. Wind speeds 210 km/h.' },
  { type: 'Flood', region: 'South China', severity: 'high', detail: 'Severe flooding in Guangdong province affecting inland logistics corridors.' },
  { type: 'Cyclone', region: 'Bay of Bengal', severity: 'high', detail: 'Tropical cyclone forming 400km east of Chennai. Landfall expected in 48h.' },
  { type: 'Storm', region: 'North Atlantic', severity: 'medium', detail: 'Winter storm system moving east toward European shipping lanes.' },
  { type: 'Drought', region: 'Central America', severity: 'medium', detail: 'Panama Canal water levels critically low. Draft restrictions in effect.' },
  { type: 'Fog', region: 'English Channel', severity: 'low', detail: 'Dense fog advisory issued. Visibility below 200m for next 12 hours.' },
  { type: 'Heatwave', region: 'Mediterranean', severity: 'medium', detail: 'Extreme heat 45°C disrupting port operations in Southern Europe.' },
  { type: 'Blizzard', region: 'Northern Europe', severity: 'high', detail: 'Heavy snowfall closing highway routes to Hamburg and Rotterdam ports.' },
  { type: 'Earthquake', region: 'Japan', severity: 'critical', detail: 'M6.2 earthquake near Tokyo Bay. Tsunami advisory issued for coastal facilities.' },
  { type: 'Monsoon', region: 'Southeast Asia', severity: 'medium', detail: 'Monsoon intensification causing port closures across Vietnam and Thailand.' },
];

const NEWS_FEED = [
  { type: 'Sanctions', region: 'Middle East', severity: 'critical', detail: 'New trade sanctions imposed. All exports from affected regions frozen effective immediately.' },
  { type: 'Conflict', region: 'Red Sea', severity: 'critical', detail: 'Maritime security alert: Armed attacks on commercial vessels in Bab el-Mandeb strait.' },
  { type: 'Policy Change', region: 'EU', severity: 'high', detail: 'EU announces new carbon border adjustment tariffs on imported goods starting Q2.' },
  { type: 'Strike', region: 'North America', severity: 'high', detail: 'Dockworkers union announces 72-hour strike at US West Coast ports.' },
  { type: 'Election', region: 'South America', severity: 'medium', detail: 'Election results may shift trade policy in Brazil. Market uncertainty rising.' },
  { type: 'Regulation', region: 'China', severity: 'medium', detail: 'New export control regulations on semiconductor components announced.' },
  { type: 'Diplomatic', region: 'Indo-Pacific', severity: 'low', detail: 'Trade talks between India and ASEAN nations show positive progress.' },
  { type: 'Cyber Attack', region: 'Global', severity: 'critical', detail: 'Ransomware attack targeting major shipping line IT infrastructure detected.' },
  { type: 'Border Closure', region: 'Eastern Europe', severity: 'high', detail: 'Land border crossing closed indefinitely affecting overland freight routes.' },
  { type: 'Trade Deal', region: 'Asia Pacific', severity: 'low', detail: 'New bilateral trade agreement reduces tariffs on electronics components.' },
];

const SHIPPING_FEED = [
  { type: 'Port Congestion', port: 'Shanghai', vessels_waiting: randomInt(15, 45), avg_wait: `${randomInt(3, 12)} days`, severity: 'high' },
  { type: 'Vessel Delay', vessel: 'MSC Adriana', route: 'Singapore → Rotterdam', delay_hours: randomInt(24, 168), severity: 'medium' },
  { type: 'Port Closure', port: 'Busan', reason: 'Typhoon warning', duration: `${randomInt(12, 72)}h`, severity: 'critical' },
  { type: 'Capacity Alert', corridor: 'Suez Canal', utilization: `${randomInt(85, 99)}%`, severity: 'high' },
  { type: 'Vessel Tracking', vessel: 'Evergreen Fortune', status: 'Off-route deviation detected', lat: 31.2, lng: 121.5, severity: 'medium' },
  { type: 'Berthing Delay', port: 'Los Angeles', slots_available: randomInt(0, 3), queue_length: randomInt(8, 25), severity: 'high' },
  { type: 'Container Shortage', region: 'Asia Pacific', deficit: `${randomInt(5, 20)}K TEU`, severity: 'medium' },
  { type: 'Speed Reduction', corridor: 'Strait of Malacca', reason: 'Emission compliance', reduction: '25%', severity: 'low' },
  { type: 'Grounding', location: 'Suez Canal', vessel: 'Bulk carrier', blockage: 'Partial', severity: 'critical' },
  { type: 'Piracy Alert', region: 'Gulf of Guinea', threat_level: 'Elevated', advisory: 'Armed escort recommended', severity: 'high' },
];

const MARKET_FEED = [
  { type: 'Fuel Price', commodity: 'Bunker Fuel (VLSFO)', price: `$${randomInt(500, 850)}/mt`, change: `${randomChoice(['+', '-'])}${(randomInt(1, 15) / 10).toFixed(1)}%`, severity: 'medium' },
  { type: 'Tariff Update', corridor: 'US-China', category: 'Electronics', rate: `${randomInt(10, 35)}%`, change: `+${randomInt(2, 8)}%`, severity: 'high' },
  { type: 'FX Rate', pair: 'USD/CNY', rate: (6.8 + randomInt(0, 40) / 100).toFixed(4), volatility: 'High', severity: 'medium' },
  { type: 'Commodity', commodity: 'Copper', price: `$${randomInt(8000, 10500)}/mt`, trend: randomChoice(['Bullish', 'Bearish', 'Volatile']), severity: 'low' },
  { type: 'Freight Rate', route: 'Shanghai → LA', rate: `$${randomInt(1200, 4500)}/FEU`, change: `${randomChoice(['+', '-'])}${randomInt(3, 22)}%`, severity: 'high' },
  { type: 'Insurance', category: 'War Risk Premium', region: 'Red Sea', premium: `${(randomInt(5, 30) / 10).toFixed(1)}%`, status: 'Elevated', severity: 'medium' },
  { type: 'Demand Index', sector: 'Consumer Electronics', index: randomInt(60, 130), baseline: 100, trend: randomChoice(['Rising', 'Falling', 'Stable']), severity: 'low' },
  { type: 'Commodity', commodity: 'Lithium', price: `$${randomInt(25, 75)}K/mt`, trend: 'Volatile', severity: 'medium' },
];

// Generate timestamped feed item
function generateFeedItem(feed, source) {
  const item = { ...randomChoice(feed) };
  item.id = `${source.toUpperCase()}-${Date.now().toString(36)}-${randomInt(100, 999)}`;
  item.source = source;
  item.timestamp = new Date(Date.now() - randomInt(0, 300) * 1000).toISOString();
  item.ingested = true;
  return item;
}

// Public APIs
export function getWeatherFeed(count = 8) {
  return Array.from({ length: count }, () => generateFeedItem(WEATHER_FEED, 'weather'));
}

export function getNewsFeed(count = 8) {
  return Array.from({ length: count }, () => generateFeedItem(NEWS_FEED, 'news'));
}

export function getShippingFeed(count = 8) {
  return Array.from({ length: count }, () => generateFeedItem(SHIPPING_FEED, 'shipping'));
}

export function getMarketFeed(count = 8) {
  return Array.from({ length: count }, () => generateFeedItem(MARKET_FEED, 'market'));
}

export function getIngestionStats() {
  return {
    weather: { status: 'connected', eventsToday: randomInt(120, 380), ratePerMin: randomInt(2, 8), lastPing: `${randomInt(1, 30)}s ago`, uptime: '99.7%' },
    news: { status: 'connected', eventsToday: randomInt(80, 250), ratePerMin: randomInt(1, 5), lastPing: `${randomInt(1, 45)}s ago`, uptime: '99.2%' },
    shipping: { status: randomChoice(['connected', 'connected', 'connected', 'degraded']), eventsToday: randomInt(200, 600), ratePerMin: randomInt(5, 15), lastPing: `${randomInt(1, 20)}s ago`, uptime: '98.9%' },
    market: { status: 'connected', eventsToday: randomInt(150, 400), ratePerMin: randomInt(3, 10), lastPing: `${randomInt(1, 60)}s ago`, uptime: '99.5%' },
  };
}

export function getTotalIngestionMetrics() {
  return {
    totalEventsToday: randomInt(800, 2200),
    totalEventsWeek: randomInt(5000, 15000),
    avgLatency: `${randomInt(120, 450)}ms`,
    dataQuality: `${randomInt(94, 99)}.${randomInt(0, 9)}%`,
    apiCalls24h: randomInt(3000, 8000),
    failedCalls24h: randomInt(5, 45),
  };
}
