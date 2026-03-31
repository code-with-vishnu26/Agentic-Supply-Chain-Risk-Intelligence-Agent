import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Wind, Loader2, AlertCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function SimulationControl({ onSimulationComplete }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  
  const handleSimulate = async (type) => {
    setIsSimulating(true);
    setActiveScenario(type);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/ingestion/simulate-scenario?scenario=${type}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      // Delay slightly for dramatic effect in UI
      setTimeout(() => {
        setIsSimulating(false);
        setActiveScenario(null);
        if (onSimulationComplete) onSimulationComplete(data);
      }, 1500);
      
    } catch (error) {
      console.error("Simulation failed:", error);
      setIsSimulating(false);
    }
  };

  return (
    <div className="simulation-widget glass-card">
      <div className="glass-card-header">
        <div className="glass-card-title"><Play size={16} /> Real-Time Demo Engine</div>
      </div>
      
      <div className="simulation-grid">
        <button 
          className={`sim-btn cyclone ${activeScenario === 'cyclone' ? 'active' : ''}`}
          onClick={() => handleSimulate('cyclone')}
          disabled={isSimulating}
        >
          {isSimulating && activeScenario === 'cyclone' ? <Loader2 className="spin" size={16} /> : <Wind size={16} />}
          Cyclone Scenario
        </button>
        
        <button 
          className={`sim-btn strike ${activeScenario === 'strike' ? 'active' : ''}`}
          onClick={() => handleSimulate('strike')}
          disabled={isSimulating}
        >
          {isSimulating && activeScenario === 'strike' ? <Loader2 className="spin" size={16} /> : <Zap size={16} />}
          Port Strike
        </button>
      </div>

      <AnimatePresence>
        {isSimulating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sim-status"
          >
            <div className="pulse-text">
              <AlertCircle size={14} /> Agent Analyzing Global Impact...
            </div>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
