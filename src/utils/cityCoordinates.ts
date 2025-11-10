// src/utils/cityCoordinates.ts
export interface CityCoordinates {
    [key: string]: {
        lat: number;
        lng: number;
        country: string;
    };
}

export const cityCoordinates: CityCoordinates = {
    "New York": { lat: 40.7128, lng: -74.0060, country: "USA" },
    "Los Angeles": { lat: 34.0522, lng: -118.2437, country: "USA" },
    "Chicago": { lat: 41.8781, lng: -87.6298, country: "USA" },
    "Houston": { lat: 29.7604, lng: -95.3698, country: "USA" },
    "Phoenix": { lat: 33.4484, lng: -112.0740, country: "USA" },
    "Philadelphia": { lat: 39.9526, lng: -75.1652, country: "USA" },
    "San Antonio": { lat: 29.4241, lng: -98.4936, country: "USA" },
    "San Diego": { lat: 32.7157, lng: -117.1611, country: "USA" },
    "Dallas": { lat: 32.7767, lng: -96.7970, country: "USA" },
    "San Jose": { lat: 37.3382, lng: -121.8863, country: "USA" },
    "Austin": { lat: 30.2672, lng: -97.7431, country: "USA" },
    "Jacksonville": { lat: 30.3322, lng: -81.6557, country: "USA" },
    "Fort Worth": { lat: 32.7555, lng: -97.3308, country: "USA" },
    "Columbus": { lat: 39.9612, lng: -82.9988, country: "USA" },
    "Charlotte": { lat: 35.2271, lng: -80.8431, country: "USA" },
    "San Francisco": { lat: 37.7749, lng: -122.4194, country: "USA" },
    "Seattle": { lat: 47.6062, lng: -122.3321, country: "USA" },
    "Denver": { lat: 39.7392, lng: -104.9903, country: "USA" },
    "Washington": { lat: 38.9072, lng: -77.0369, country: "USA" },
    "Boston": { lat: 42.3601, lng: -71.0589, country: "USA" },
    "Dubai": { lat: 25.2048, lng: 55.2708, country: "UAE" },
    "London": { lat: 51.5074, lng: -0.1278, country: "UK" },
    "Singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore" },
    "Tokyo": { lat: 35.6762, lng: 139.6503, country: "Japan" },
    "Sydney": { lat: -33.8688, lng: 151.2093, country: "Australia" },
    "Paris": { lat: 48.8566, lng: 2.3522, country: "France" },
    "Berlin": { lat: 52.5200, lng: 13.4050, country: "Germany" },
    "Mumbai": { lat: 19.0760, lng: 72.8777, country: "India" },
    "São Paulo": { lat: -23.5505, lng: -46.6333, country: "Brazil" },
    "Toronto": { lat: 43.6532, lng: -79.3832, country: "Canada" },
    "Amsterdam": { lat: 52.3676, lng: 4.9041, country: "Netherlands" },
    "Hong Kong": { lat: 22.3193, lng: 114.1694, country: "China" },
    "Seoul": { lat: 37.5665, lng: 126.9780, country: "South Korea" },
    "Mexico City": { lat: 19.4326, lng: -99.1332, country: "Mexico" }
};