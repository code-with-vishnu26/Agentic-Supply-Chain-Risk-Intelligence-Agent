// Phase 3 — Agent Intelligence (The Brain)
// Simulates event parser, risk scorer, and predictive engine

import { randomInt, randomChoice } from './utils.js';

// ============ EVENT PARSER ============
export function parseEvent(rawEvent = null) {
  const types = ['weather', 'geopolitical', 'logistics', 'shipping'];
  const severities = ['critical', 'high', 'medium', 'low'];
  const locations = ['Shanghai Port', 'Suez Canal', 'Rotterdam Port', 'Los Angeles Port', 'Singapore Strait', 'Mumbai Port', 'Panama Canal', 'Busan Port'];

  return {
    eventId: `EVT-${Date.now().toString(36).toUpperCase()}-${randomInt(100, 999)}`,
    classifiedType: randomChoice(types),
    classifiedSeverity: randomChoice(severities),
    classifiedLocation: randomChoice(locations),
    confidence: randomInt(75, 99),
    entities: [randomChoice(['Port closure', 'Route blockage', 'Supply shortage', 'Price spike', 'Capacity reduction']),
      randomChoice(['Shipping delay', 'Inventory risk', 'Cost increase', 'Compliance issue'])],
    processingTime: `${randomInt(45, 250)}ms`,
    modelVersion: 'v3.2.1',
    timestamp: new Date().toISOString(),
  };
}

export function getParserStats() {
  return {
    totalParsed: randomInt(1200, 3500),
    avgConfidence: `${randomInt(85, 96)}%`,
    avgProcessingTime: `${randomInt(80, 180)}ms`,
    classificationAccuracy: `${randomInt(91, 98)}.${randomInt(0, 9)}%`,
    eventsPerHour: randomInt(50, 150),
    queueDepth: randomInt(0, 12),
  };
}

// ============ RISK SCORER ============
export function getSupplierRiskScores() {
  return [
    { supplier: 'TechComp Asia', location: 'Shanghai', baseRisk: randomInt(30, 55), eventRisk: randomInt(10, 40), totalRisk: 0, trend: randomChoice(['up', 'down', 'stable']), impactedBy: ['Port congestion', 'Typhoon warning'] },
    { supplier: 'EuroParts GmbH', location: 'Hamburg', baseRisk: randomInt(15, 30), eventRisk: randomInt(5, 20), totalRisk: 0, trend: randomChoice(['up', 'down', 'stable']), impactedBy: ['Energy costs', 'Blizzard conditions'] },
    { supplier: 'IndiaTextiles Ltd', location: 'Mumbai', baseRisk: randomInt(35, 60), eventRisk: randomInt(15, 35), totalRisk: 0, trend: randomChoice(['up', 'down', 'stable']), impactedBy: ['Monsoon season', 'Port delays'] },
    { supplier: 'KoreaSemicon Inc', location: 'Busan', baseRisk: randomInt(10, 25), eventRisk: randomInt(5, 15), totalRisk: 0, trend: randomChoice(['up', 'down', 'stable']), impactedBy: ['Earthquake risk'] },
    { supplier: 'GulfPetro LLC', location: 'Dubai', baseRisk: randomInt(25, 45), eventRisk: randomInt(10, 30), totalRisk: 0, trend: randomChoice(['up', 'down', 'stable']), impactedBy: ['Red Sea crisis', 'Oil price volatility'] },
    { supplier: 'BrazilAgro SA', location: 'Santos', baseRisk: randomInt(20, 40), eventRisk: randomInt(5, 25), totalRisk: 0, trend: randomChoice(['up', 'down', 'stable']), impactedBy: ['Harvest season', 'FX volatility'] },
  ].map(s => ({ ...s, totalRisk: Math.min(100, s.baseRisk + s.eventRisk) }));
}

export function getRouteRiskScores() {
  return [
    { route: 'Shanghai → Los Angeles', baseRisk: randomInt(40, 60), eventRisk: randomInt(10, 30), totalRisk: 0, transitDays: 14, status: randomChoice(['normal', 'elevated', 'critical']) },
    { route: 'Rotterdam → Mumbai', baseRisk: randomInt(35, 55), eventRisk: randomInt(10, 25), totalRisk: 0, transitDays: 18, status: randomChoice(['normal', 'elevated']) },
    { route: 'Singapore → Hamburg', baseRisk: randomInt(30, 50), eventRisk: randomInt(15, 35), totalRisk: 0, transitDays: 24, status: randomChoice(['normal', 'elevated', 'critical']) },
    { route: 'Busan → Panama Canal', baseRisk: randomInt(20, 35), eventRisk: randomInt(5, 20), totalRisk: 0, transitDays: 20, status: randomChoice(['normal', 'elevated']) },
    { route: 'Dubai → Rotterdam', baseRisk: randomInt(35, 55), eventRisk: randomInt(20, 40), totalRisk: 0, transitDays: 15, status: randomChoice(['elevated', 'critical']) },
    { route: 'Mumbai → Suez Canal', baseRisk: randomInt(45, 70), eventRisk: randomInt(15, 35), totalRisk: 0, transitDays: 7, status: randomChoice(['elevated', 'critical']) },
  ].map(r => ({ ...r, totalRisk: Math.min(100, r.baseRisk + r.eventRisk) }));
}

// ============ PREDICTIVE ENGINE ============
export function getPredictions() {
  return [
    { id: 'PRED-001', title: 'Western Pacific Typhoon Season Escalation', probability: randomInt(78, 95), timeline: '7-14 days', impact: 'high', region: 'Asia Pacific', category: 'weather', confidence: randomInt(82, 95), modelOutput: 'LSTM + transformer ensemble predicts 87% chance of at least 2 category-4+ typhoons making landfall near major ports within 14 days.' },
    { id: 'PRED-002', title: 'European Port Congestion Surge', probability: randomInt(60, 80), timeline: '3-7 days', impact: 'medium', region: 'Europe', category: 'logistics', confidence: randomInt(78, 90), modelOutput: 'Time series analysis indicates a 73% probability of port throughput dropping below 75% capacity at Rotterdam and Hamburg within 7 days.' },
    { id: 'PRED-003', title: 'Red Sea Route Disruption Escalation', probability: randomInt(50, 75), timeline: '14-30 days', impact: 'critical', region: 'Middle East', category: 'geopolitical', confidence: randomInt(70, 88), modelOutput: 'NLP analysis of diplomatic signals and news feeds indicates 62% probability of further military escalation affecting commercial shipping.' },
    { id: 'PRED-004', title: 'Semiconductor Supply Tightening', probability: randomInt(40, 65), timeline: '30-60 days', impact: 'high', region: 'Asia Pacific', category: 'logistics', confidence: randomInt(72, 85), modelOutput: 'Demand-supply gap analysis projects 55% chance of chip allocation cuts within 60 days. Auto and electronics most affected.' },
    { id: 'PRED-005', title: 'Bunker Fuel Price Spike', probability: randomInt(45, 70), timeline: '7-21 days', impact: 'medium', region: 'Global', category: 'shipping', confidence: randomInt(75, 90), modelOutput: 'OPEC output and geopolitical risk model forecasts 58% probability of VLSFO prices exceeding $800/mt within 21 days.' },
  ];
}

export function getPipelineStats() {
  return {
    eventsProcessed: randomInt(500, 1500),
    avgPipelineLatency: `${randomInt(350, 900)}ms`,
    predictionsGenerated: randomInt(50, 200),
    modelAccuracy: `${randomInt(87, 96)}.${randomInt(0, 9)}%`,
    lastTraining: '2 days ago',
    nextRetraining: 'in 5 days',
  };
}
