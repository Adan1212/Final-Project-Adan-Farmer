"""
FAO-56 Penman-Monteith Reference Evapotranspiration (ET0) Calculator
Based on the UN FAO Irrigation and Drainage Paper No. 56
"""

import math


def calculate_et0(temperature, humidity, wind_speed, solar_radiation,
                  latitude=31.5, altitude=100, day_of_year=180,
                  temp_min=None, temp_max=None, pressure=None):
    """
    Calculate reference evapotranspiration (ET0) using FAO-56 Penman-Monteith.

    Parameters:
    -----------
    temperature : float - Mean daily temperature (°C)
    humidity : float - Mean relative humidity (%)
    wind_speed : float - Wind speed at 2m height (m/s)
    solar_radiation : float - Solar radiation (MJ/m²/day)
    latitude : float - Latitude in degrees (default: 31.5 for Israel)
    altitude : float - Altitude above sea level (m)
    day_of_year : int - Day of the year (1-365)
    temp_min : float - Minimum temperature (°C), defaults to temperature - 5
    temp_max : float - Maximum temperature (°C), defaults to temperature + 5
    pressure : float - Atmospheric pressure (kPa)

    Returns:
    --------
    float - Reference ET0 (mm/day)
    """
    T = temperature
    T_min = temp_min if temp_min is not None else T - 5
    T_max = temp_max if temp_max is not None else T + 5
    RH = humidity
    u2 = wind_speed
    Rs = solar_radiation

    # Atmospheric pressure (kPa)
    if pressure is None:
        P = 101.3 * ((293 - 0.0065 * altitude) / 293) ** 5.26
    else:
        P = pressure

    # Psychrometric constant (kPa/°C)
    gamma = 0.000665 * P

    # Saturation vapour pressure (kPa)
    e_Tmin = 0.6108 * math.exp((17.27 * T_min) / (T_min + 237.3))
    e_Tmax = 0.6108 * math.exp((17.27 * T_max) / (T_max + 237.3))
    es = (e_Tmin + e_Tmax) / 2  # Mean saturation vapour pressure

    # Actual vapour pressure (kPa)
    ea = es * (RH / 100)

    # Slope of saturation vapour pressure curve (kPa/°C)
    delta = (4098 * 0.6108 * math.exp((17.27 * T) / (T + 237.3))) / ((T + 237.3) ** 2)

    # Extraterrestrial radiation (Ra)
    lat_rad = latitude * math.pi / 180
    dr = 1 + 0.033 * math.cos(2 * math.pi / 365 * day_of_year)
    delta_s = 0.409 * math.sin(2 * math.pi / 365 * day_of_year - 1.39)
    ws = math.acos(-math.tan(lat_rad) * math.tan(delta_s))
    Ra = (24 * 60 / math.pi) * 0.0820 * dr * (
        ws * math.sin(lat_rad) * math.sin(delta_s) +
        math.cos(lat_rad) * math.cos(delta_s) * math.sin(ws)
    )

    # Clear-sky solar radiation
    Rso = (0.75 + 2e-5 * altitude) * Ra

    # Net shortwave radiation
    Rns = (1 - 0.23) * Rs  # albedo = 0.23

    # Net longwave radiation
    sigma = 4.903e-9  # Stefan-Boltzmann constant (MJ/K⁴/m²/day)
    Rnl = sigma * ((T_max + 273.16) ** 4 + (T_min + 273.16) ** 4) / 2 * \
          (0.34 - 0.14 * math.sqrt(ea)) * (1.35 * Rs / max(Rso, 0.01) - 0.35)

    # Net radiation
    Rn = Rns - Rnl

    # Soil heat flux (G) - assumed 0 for daily calc
    G = 0

    # FAO-56 Penman-Monteith equation
    numerator = 0.408 * delta * (Rn - G) + gamma * (900 / (T + 273)) * u2 * (es - ea)
    denominator = delta + gamma * (1 + 0.34 * u2)

    ET0 = numerator / denominator

    return max(0, round(ET0, 2))


def get_crop_coefficient(growth_stage, crop_type='general'):
    """
    Get crop coefficient (Kc) based on growth stage and crop type.

    Based on FAO-56 Table 12 typical Kc values.
    """
    # Kc values by growth stage
    kc_by_stage = {
        'seedling': {'ini': 0.3},
        'vegetative': {'mid': 0.7},
        'flowering': {'mid': 1.1},
        'fruiting': {'mid': 1.0},
        'maturity': {'end': 0.8},
        'harvest_ready': {'end': 0.5}
    }

    # Crop-specific Kc adjustments (FAO-56 Table 12)
    crop_kc = {
        'wheat': {'ini': 0.3, 'mid': 1.15, 'end': 0.25},
        'corn': {'ini': 0.3, 'mid': 1.20, 'end': 0.60},
        'tomato': {'ini': 0.6, 'mid': 1.15, 'end': 0.80},
        'cotton': {'ini': 0.35, 'mid': 1.20, 'end': 0.70},
        'olive': {'ini': 0.65, 'mid': 0.70, 'end': 0.70},
        'grape': {'ini': 0.30, 'mid': 0.85, 'end': 0.45},
        'citrus': {'ini': 0.70, 'mid': 0.65, 'end': 0.70},
        'cucumber': {'ini': 0.60, 'mid': 1.00, 'end': 0.75},
        'pepper': {'ini': 0.60, 'mid': 1.05, 'end': 0.90},
        'general': {'ini': 0.40, 'mid': 1.00, 'end': 0.70}
    }

    crop = crop_type.lower() if crop_type else 'general'
    if crop not in crop_kc:
        crop = 'general'

    stage_map = {
        'seedling': 'ini',
        'vegetative': 'mid',
        'flowering': 'mid',
        'fruiting': 'mid',
        'maturity': 'end',
        'harvest_ready': 'end'
    }

    period = stage_map.get(growth_stage, 'mid')
    return crop_kc[crop].get(period, 1.0)


def calculate_crop_water_requirement(et0, kc, field_size_dunam, rainfall=0):
    """
    Calculate crop water requirement.

    Parameters:
    -----------
    et0 : float - Reference evapotranspiration (mm/day)
    kc : float - Crop coefficient
    field_size_dunam : float - Field size in dunam (1 dunam = 1000 m²)
    rainfall : float - Effective rainfall (mm/day)

    Returns:
    --------
    dict with water requirement details
    """
    # Crop ET (mm/day)
    etc = et0 * kc

    # Effective rainfall (assuming 80% efficiency)
    effective_rain = rainfall * 0.8

    # Net irrigation requirement (mm/day)
    net_irrigation = max(0, etc - effective_rain)

    # Convert to cubic meters (1 mm on 1 dunam = 1 m³)
    field_area_m2 = field_size_dunam * 1000
    daily_water_m3 = (net_irrigation / 1000) * field_area_m2

    return {
        'et0': et0,
        'kc': kc,
        'etc': round(etc, 2),
        'effective_rainfall': round(effective_rain, 2),
        'net_irrigation_mm': round(net_irrigation, 2),
        'daily_water_m3': round(daily_water_m3, 2),
        'weekly_water_m3': round(daily_water_m3 * 7, 2),
        'monthly_water_m3': round(daily_water_m3 * 30, 2)
    }


if __name__ == '__main__':
    # Example calculation
    et0 = calculate_et0(
        temperature=28,
        humidity=55,
        wind_speed=2.5,
        solar_radiation=22,
        latitude=31.5,
        altitude=100,
        day_of_year=180
    )
    print(f"Reference ET0: {et0} mm/day")

    kc = get_crop_coefficient('flowering', 'tomato')
    print(f"Crop coefficient (Kc): {kc}")

    req = calculate_crop_water_requirement(et0, kc, field_size_dunam=30, rainfall=0)
    print(f"Water requirement: {req}")
