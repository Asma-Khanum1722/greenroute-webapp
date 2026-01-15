/**
 * Centralized API service for GreenRoute.
 * This file handles all external REST API communications.
 */

const SARGODHA_COORDS = {
  lat: 32.074,
  lng: 72.686
};

/**
 * Fetches real-time weather data for Sargodha using the Open-Meteo REST API.
 * This is a free, professional-grade API used for live environmental data.
 */
export const fetchSargodhaWeather = async () => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${SARGODHA_COORDS.lat}&longitude=${SARGODHA_COORDS.lng}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
    );
    if (!response.ok) throw new Error("Weather API failed");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};

/**
 * Note on Map API:
 * The Map component consumes the OpenStreetMap Tile API. 
 * This is a RESTful service that serves map tiles via HTTP GET requests.
 */
export const MAP_TILE_API_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
