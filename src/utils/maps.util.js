const axios = require('axios');
const mapsConfig = require('../../config/maps');

const geocodeAddress = async (address) => {
    try {
        
        if (!mapsConfig.googleMaps.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        const response = await axios.get(mapsConfig.googleMaps.geocodingUrl, {
            params: {
                address: address,
                key: mapsConfig.googleMaps.apiKey
            }
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Geocoding failed: ${response.data.status}`);
        }

        const result = response.data.results[0];
        return {
            address: result.formatted_address,
            coordinates: {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng
            },
            placeId: result.place_id
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        throw new Error('Failed to geocode address');
    }
};

// Reverse geocode coordinates to address
const reverseGeocode = async (latitude, longitude) => {
    try {
        if (!mapsConfig.googleMaps.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        const response = await axios.get(mapsConfig.googleMaps.geocodingUrl, {
            params: {
                latlng: `${latitude},${longitude}`,
                key: mapsConfig.googleMaps.apiKey
            }
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Reverse geocoding failed: ${response.data.status}`);
        }

        const result = response.data.results[0];
        return {
            address: result.formatted_address,
            coordinates: {
                lat: latitude,
                lng: longitude
            },
            placeId: result.place_id,
            components: result.address_components
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw new Error('Failed to reverse geocode coordinates');
    }
};

// Get distance matrix between multiple origins and destinations
const getDistanceMatrix = async (origins, destinations, mode = 'driving') => {
    try {
        if (!mapsConfig.googleMaps.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        const response = await axios.get(mapsConfig.googleMaps.distanceMatrixUrl, {
            params: {
                origins: origins.map(origin => `${origin.lat},${origin.lng}`).join('|'),
                destinations: destinations.map(dest => `${dest.lat},${dest.lng}`).join('|'),
                mode: mode,
                key: mapsConfig.googleMaps.apiKey
            }
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Distance matrix failed: ${response.data.status}`);
        }

        return response.data.rows.map((row, i) => 
            row.elements.map((element, j) => ({
                origin: origins[i],
                destination: destinations[j],
                distance: element.distance,
                duration: element.duration,
                status: element.status
            }))
        ).flat();
    } catch (error) {
        console.error('Distance matrix error:', error);
        throw new Error('Failed to get distance matrix');
    }
};

// Validate coordinates
const validateCoordinates = (latitude, longitude) => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
        return false;
    }
    
    if (lat < -90 || lat > 90) {
        return false;
    }
    
    if (lng < -180 || lng > 180) {
        return false;
    }
    
    return true;
};

// Calculate bearing between two points
const calculateBearing = (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return bearing;
};

// Check if a point is within a polygon (useful for service areas)
const isPointInPolygon = (point, polygon) => {
    const x = point.lng;
    const y = point.lat;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng;
        const yi = polygon[i].lat;
        const xj = polygon[j].lng;
        const yj = polygon[j].lat;
        
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    
    return inside;
};

module.exports = {
    geocodeAddress,
    reverseGeocode,
    getDistanceMatrix,
    validateCoordinates,
    calculateBearing,
    isPointInPolygon
};
