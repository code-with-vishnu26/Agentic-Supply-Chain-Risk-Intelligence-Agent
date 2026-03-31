import os
import joblib
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

# Global variable to cache the loaded model
_model = None

def get_model():
    global _model
    if _model is None:
        model_path = os.path.join(os.path.dirname(__file__), 'risk_model.pkl')
        try:
            _model = joblib.load(model_path)
            logger.info("XGBoost Model loaded successfully.")
        except FileNotFoundError:
            logger.warning(f"Model file not found at {model_path}. You need to run train_model.py first.")
            return None
    return _model

def predict_risk(features: Dict[str, Any]) -> Tuple[float, str]:
    """
    Takes a dictionary of features and returns (probability_of_disruption, risk_level_string)
    """
    model = get_model()
    
    if not model:
        raise RuntimeError("ML model is not available.")
    
    # Preprocess categorical features mapping
    # Note: severity in db is 'low', 'medium', etc., but model expects 1-4
    severity_map = {"low": 1, "medium": 2, "high": 3, "critical": 4}
    sev_val = severity_map.get(features.get("severity", "low"), 1)
    
    types = {'hurricane': 1, 'strike': 2, 'tariff': 3, 'delay': 4, 'bankruptcy': 5, 'geopolitical': 6}
    type_val = types.get(features.get("type", "").lower(), 4) # def to delay
    
    # Advanced features mapping (default fallbacks if missing)
    weather_severity = float(features.get("weather_severity", 0.0))
    distance_to_port = float(features.get("distance_to_port", 100.0))
    supplier_dependency_score = float(features.get("supplier_dependency_score", 50.0))
    historical_disruption_frequency = float(features.get("historical_disruption_frequency", 5.0))
    
    # Order matched exactly what train_model.py built
    # ['severity', 'type', 'weather_severity', 'distance_to_port', 'supplier_dependency_score', 'historical_disruption_frequency']
    import pandas as pd
    
    # XGBoost usually expects pandas DataFrame with feature names if trained with feature names 
    X_input = pd.DataFrame([{
        "severity": sev_val,
        "type": type_val,
        "weather_severity": weather_severity,
        "distance_to_port": distance_to_port,
        "supplier_dependency_score": supplier_dependency_score,
        "historical_disruption_frequency": historical_disruption_frequency
    }])
    
    # predict_proba returns [[prob_0, prob_1]]
    probabilities = model.predict_proba(X_input)[0]
    prob_disrupted = probabilities[1]
    
    risk_level = "low"
    if prob_disrupted > 0.8:
        risk_level = "critical"
    elif prob_disrupted > 0.5:
        risk_level = "high"
    elif prob_disrupted > 0.25:
        risk_level = "medium"
        
    return float(prob_disrupted), risk_level

