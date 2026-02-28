"""
Water Prediction Training Module
Trains multiple ML models for water consumption prediction.
Algorithms: Linear Regression, Random Forest, Gradient Boosting
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os
import json
from datetime import datetime

from fao56 import calculate_et0, get_crop_coefficient


def generate_training_data(n_samples=1000):
    """Generate synthetic training data for water prediction."""
    np.random.seed(42)

    data = []
    crop_types = ['wheat', 'tomato', 'olive', 'cucumber', 'corn', 'grape', 'citrus']
    growth_stages = ['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity']
    soil_types = ['clay', 'sandy', 'loamy', 'silt']

    for _ in range(n_samples):
        # Random weather conditions
        temperature = np.random.uniform(10, 40)
        humidity = np.random.uniform(20, 90)
        wind_speed = np.random.uniform(0.5, 8)
        solar_radiation = np.random.uniform(10, 30)
        rainfall = np.random.choice([0, 0, 0, 0, 0, 2, 5, 10, 20], p=[0.5, 0.1, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05])

        crop_type = np.random.choice(crop_types)
        growth_stage = np.random.choice(growth_stages)
        soil_type = np.random.choice(soil_types)
        field_size = np.random.uniform(5, 100)

        # Calculate ET0
        day_of_year = np.random.randint(1, 366)
        et0 = calculate_et0(temperature, humidity, wind_speed, solar_radiation,
                           day_of_year=day_of_year)

        kc = get_crop_coefficient(growth_stage, crop_type)

        # Soil moisture factor
        soil_factor = {'clay': 0.85, 'sandy': 1.2, 'loamy': 1.0, 'silt': 0.95}
        sf = soil_factor.get(soil_type, 1.0)

        # True water consumption with noise
        base_water = et0 * kc * field_size * sf
        effective_rain = rainfall * 0.8 * field_size
        true_water = max(0, base_water - effective_rain)
        noise = np.random.normal(0, true_water * 0.1)  # 10% noise
        actual_water = max(0, true_water + noise)

        data.append({
            'temperature': round(temperature, 1),
            'humidity': round(humidity, 1),
            'wind_speed': round(wind_speed, 1),
            'solar_radiation': round(solar_radiation, 1),
            'rainfall': round(rainfall, 1),
            'crop_type': crop_type,
            'growth_stage': growth_stage,
            'soil_type': soil_type,
            'field_size': round(field_size, 1),
            'day_of_year': day_of_year,
            'et0': et0,
            'kc': kc,
            'actual_consumption': round(actual_water, 2)
        })

    return pd.DataFrame(data)


def prepare_features(df):
    """Prepare feature matrix from dataframe."""
    # One-hot encode categorical features
    df_encoded = pd.get_dummies(df, columns=['crop_type', 'growth_stage', 'soil_type'])

    # Feature columns (exclude target)
    feature_cols = [c for c in df_encoded.columns if c != 'actual_consumption']

    X = df_encoded[feature_cols].values.astype(float)
    y = df_encoded['actual_consumption'].values

    return X, y, feature_cols


def train_models(X, y, feature_cols):
    """Train all prediction models."""
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    models = {
        'linear_regression': LinearRegression(),
        'random_forest': RandomForestRegressor(
            n_estimators=100, max_depth=15, min_samples_split=5, random_state=42
        ),
        'gradient_boosting': GradientBoostingRegressor(
            n_estimators=150, max_depth=8, learning_rate=0.1, random_state=42
        )
    }

    results = {}
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)

    for name, model in models.items():
        print(f"\nTraining {name}...")

        if name == 'linear_regression':
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

        # Metrics
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        # Cross-validation
        if name == 'linear_regression':
            cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
        else:
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')

        results[name] = {
            'rmse': round(rmse, 3),
            'mae': round(mae, 3),
            'r2': round(r2, 4),
            'cv_r2_mean': round(cv_scores.mean(), 4),
            'cv_r2_std': round(cv_scores.std(), 4)
        }

        print(f"  RMSE: {rmse:.3f}")
        print(f"  MAE:  {mae:.3f}")
        print(f"  R²:   {r2:.4f}")
        print(f"  CV R² mean: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

        # Save model
        joblib.dump(model, os.path.join(model_dir, f'{name}.pkl'))

    # Save scaler and feature columns
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.pkl'))
    with open(os.path.join(model_dir, 'feature_cols.json'), 'w') as f:
        json.dump(feature_cols, f)

    # Save results
    with open(os.path.join(model_dir, 'training_results.json'), 'w') as f:
        json.dump({
            'trained_at': datetime.now().isoformat(),
            'n_samples': len(X),
            'n_features': len(feature_cols),
            'results': results
        }, f, indent=2)

    print("\n✅ All models trained and saved!")
    return results


if __name__ == '__main__':
    print("Generating training data...")
    df = generate_training_data(2000)
    print(f"Generated {len(df)} samples")

    # Save training data
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    df.to_csv(os.path.join(data_dir, 'training_data.csv'), index=False)

    print("\nPreparing features...")
    X, y, feature_cols = prepare_features(df)
    print(f"Feature matrix: {X.shape}")

    print("\nTraining models...")
    results = train_models(X, y, feature_cols)

    print("\n📊 Model Comparison:")
    for name, metrics in results.items():
        print(f"\n  {name}:")
        for k, v in metrics.items():
            print(f"    {k}: {v}")
