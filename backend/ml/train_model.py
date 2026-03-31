import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import logging

logger = logging.getLogger(__name__)

# Advanced Mock dataset generation for training
def generate_training_data(n_samples=5000):
    np.random.seed(42)
    
    # Types
    types = {'hurricane': 1, 'strike': 2, 'tariff': 3, 'delay': 4, 'bankruptcy': 5, 'geopolitical': 6}
    
    data = []
    for _ in range(n_samples):
        # Base event features
        severity_val = np.random.choice([1, 2, 3, 4], p=[0.4, 0.3, 0.2, 0.1])
        type_str = np.random.choice(list(types.keys()))
        type_val = types[type_str]
        
        # Advanced Supply Chain Features
        weather_severity = np.random.randint(0, 5) if type_str == 'hurricane' else np.random.choice([0,1])
        distance_to_port = np.random.uniform(5, 1000) # km
        supplier_dependency_score = np.random.uniform(10, 100) # %
        historical_disruption_frequency = np.random.randint(0, 50) # per year
        
        # Calculate artificial target (disruption: 0 or 1)
        prob = 0.05
        
        if severity_val == 4: prob += 0.4
        elif severity_val == 3: prob += 0.2
        
        if type_val in [1, 2, 6]: prob += 0.15 # hurricane, strike, geopolitical
        
        if weather_severity >= 3: prob += 0.2
        if distance_to_port < 50: prob += 0.1 # Closer to port = higher disruption risk if port strike
        if supplier_dependency_score > 80: prob += 0.15
        if historical_disruption_frequency > 20: prob += 0.1
        
        target = 1 if np.random.random() < prob else 0
        
        data.append([
            severity_val, type_val, weather_severity, 
            distance_to_port, supplier_dependency_score, 
            historical_disruption_frequency, target
        ])
        
    df = pd.DataFrame(data, columns=[
        'severity', 'type', 'weather_severity', 
        'distance_to_port', 'supplier_dependency_score', 
        'historical_disruption_frequency', 'disrupted'
    ])
    return df

def train():
    logger.info("Generating advanced training data for XGBoost...")
    df = generate_training_data(10000)
    
    X = df.drop('disrupted', axis=1)
    y = df['disrupted']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    logger.info("Training XGBoost Classifier...")
    model = xgb.XGBClassifier(
        n_estimators=150, 
        max_depth=6, 
        learning_rate=0.1, 
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    logger.info(f"Model Accuracy: {acc:.2f}")
    logger.info(f"Classification Report:\n{classification_report(y_test, y_pred)}")
    
    # Verify feature importances are accessible
    feature_importances = model.feature_importances_
    for name, imp in zip(X.columns, feature_importances):
        logger.info(f"Feature '{name}' Importance: {imp:.4f}")
        
    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'risk_model.pkl')
    joblib.dump(model, model_path)
    logger.info(f"Advanced XGBoost Model saved to {model_path}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    train()
