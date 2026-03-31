import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Maximize } from 'lucide-react';
import { useState } from 'react';

// Component to handle map centering when events change
function MapRecenter({ center }) {
  const map = useMap();
  if (center) map.setView(center, map.getZoom());
  return null;
}

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#10b981'
};

export default function GlobalRiskMap({ events = [] }) {
  const defaultCenter = [20, 0];
  const [mapCenter, setMapCenter] = useState(null);
  
  const handleRecenter = () => {
    setMapCenter([...defaultCenter]);
    // Reset after a brief moment so subsequent clicks still trigger the effect
    setTimeout(() => setMapCenter(null), 100);
  };

  return (
    <div className="leaflet-map-wrapper" style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={2} 
        style={{ height: '100%', width: '100%', background: '#0a0e1a' }}
        zoomControl={true}
      >
        <MapRecenter center={mapCenter} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {events.map((event) => {
          if (!event.latitude || !event.longitude) return null;
          
          const color = SEVERITY_COLORS[event.severity?.toLowerCase()] || SEVERITY_COLORS.medium;
          const radius = event.severity === 'critical' ? 500000 : event.severity === 'high' ? 300000 : 150000;
          
          return (
            <Circle
              key={event.id}
              center={[event.latitude, event.longitude]}
              pathOptions={{
                fillColor: color,
                color: color,
                fillOpacity: 0.4,
                weight: 2
              }}
              radius={radius}
            >
              <Popup className="custom-leaflet-popup">
                <div style={{ color: '#f1f5f9', background: '#111827', padding: '8px', borderRadius: '4px' }}>
                  <strong style={{ color: color, textTransform: 'uppercase' }}>{event.type}</strong>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>{event.location}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{event.description}</div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
      
      {/* Map Actions Overlay */}
      <div className="map-actions-overlay">
        <button className="map-action-btn" onClick={handleRecenter} title="Recenter Map">
          <Maximize size={16} />
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="map-legend">
        {Object.entries(SEVERITY_COLORS).map(([lvl, col]) => (
          <div key={lvl} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: col }} />
            <span className="legend-text">{lvl.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
