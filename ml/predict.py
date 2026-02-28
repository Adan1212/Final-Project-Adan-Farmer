"""
Water Prediction Service
Flask API for serving water consumption predictions.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from fao56 import calculate_et0, get_crop_coefficient, calculate_crop_water_requirement

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')


def load_models():
    """Load trained models."""
    models = {}
    model_names = ['linear_regression', 'random_forest', 'gradient_boosting']

    for name in model_names:
        path = os.path.join(MODEL_DIR, f'{name}.pkl')
        if os.path.exists(path):
            models[name] = joblib.load(path)

    scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
    scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None

    cols_path = os.path.join(MODEL_DIR, 'feature_cols.json')
    feature_cols = json.load(open(cols_path)) if os.path.exists(cols_path) else []

    return models, scaler, feature_cols


# Load models on startup
try:
    MODELS, SCALER, FEATURE_COLS = load_models()
    print(f"Loaded {len(MODELS)} models")
except Exception as e:
    print(f"Warning: Could not load models: {e}")
    MODELS, SCALER, FEATURE_COLS = {}, None, []


@app.route('/api/ml/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'models_loaded': list(MODELS.keys()),
        'feature_count': len(FEATURE_COLS)
    })


@app.route('/api/ml/predict', methods=['POST'])
def predict():
    """Generate water consumption prediction."""
    try:
        data = request.json

        temperature = data.get('temperature', 25)
        humidity = data.get('humidity', 50)
        wind_speed = data.get('windSpeed', 2)
        solar_radiation = data.get('solarRadiation', 20)
        rainfall = data.get('rainfall', 0)
        crop_type = data.get('cropType', 'general')
        growth_stage = data.get('growthStage', 'vegetative')
        soil_type = data.get('soilType', 'loamy')
        field_size = data.get('fieldSize', 30)
        day_of_year = data.get('dayOfYear', 180)

        # Calculate ET0
        et0 = calculate_et0(temperature, humidity, wind_speed, solar_radiation,
                           day_of_year=day_of_year)

        kc = get_crop_coefficient(growth_stage, crop_type)

        # FAO-56 prediction
        water_req = calculate_crop_water_requirement(et0, kc, field_size, rainfall)

        predictions = {
            'fao56': {
                'predicted': water_req['daily_water_m3'],
                'confidence': 78,
                'et0': et0,
                'kc': kc,
                'details': water_req
            }
        }

        # ML model predictions
        if MODELS and FEATURE_COLS:
            input_df = pd.DataFrame([{
                'temperature': temperature,
                'humidity': humidity,
                'wind_speed': wind_speed,
                'solar_radiation': solar_radiation,
                'rainfall': rainfall,
                'field_size': field_size,
                'day_of_year': day_of_year,
                'et0': et0,
                'kc': kc,
                'crop_type': crop_type,
                'growth_stage': growth_stage,
                'soil_type': soil_type
            }])

            input_encoded = pd.get_dummies(input_df, columns=['crop_type', 'growth_stage', 'soil_type'])

            # Align with training features
            for col in FEATURE_COLS:
                if col not in input_encoded.columns:
                    input_encoded[col] = 0
            input_encoded = input_encoded[FEATURE_COLS]
            X = input_encoded.values.astype(float)

            confidence_map = {
                'linear_regression': 72,
                'random_forest': 85,
                'gradient_boosting': 88
            }

            for name, model in MODELS.items():
                if name == 'linear_regression' and SCALER:
                    X_input = SCALER.transform(X)
                else:
                    X_input = X
                pred = model.predict(X_input)[0]
                predictions[name] = {
                    'predicted': round(max(0, pred), 2),
                    'confidence': confidence_map.get(name, 75)
                }

            # Ensemble (weighted average)
            weights = {'linear_regression': 0.2, 'random_forest': 0.35, 'gradient_boosting': 0.35, 'fao56': 0.1}
            ensemble_pred = sum(
                predictions[algo]['predicted'] * weights.get(algo, 0.25)
                for algo in predictions if algo in weights
            )
            predictions['ensemble'] = {
                'predicted': round(ensemble_pred, 2),
                'confidence': 87
            }

        return jsonify({
            'success': True,
            'data': {
                'predictions': predictions,
                'weather': {
                    'temperature': temperature,
                    'humidity': humidity,
                    'windSpeed': wind_speed,
                    'rainfall': rainfall
                },
                'field': {
                    'size': field_size,
                    'soilType': soil_type,
                    'cropType': crop_type,
                    'growthStage': growth_stage
                }
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ml/et0', methods=['POST'])
def calc_et0():
    """Calculate reference evapotranspiration."""
    try:
        data = request.json
        et0 = calculate_et0(
            temperature=data.get('temperature', 25),
            humidity=data.get('humidity', 50),
            wind_speed=data.get('windSpeed', 2),
            solar_radiation=data.get('solarRadiation', 20),
            latitude=data.get('latitude', 31.5),
            altitude=data.get('altitude', 100),
            day_of_year=data.get('dayOfYear', 180)
        )
        return jsonify({'success': True, 'data': {'et0': et0}})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ml/models/info', methods=['GET'])
def model_info():
    """Get training results and model info."""
    results_path = os.path.join(MODEL_DIR, 'training_results.json')
    if os.path.exists(results_path):
        with open(results_path) as f:
            results = json.load(f)
        return jsonify({'success': True, 'data': results})
    return jsonify({'success': False, 'message': 'No training results found'})


if __name__ == '__main__':
    print("🧠 Starting ML Prediction Service...")
    app.run(host='0.0.0.0', port=5001, debug=True)
