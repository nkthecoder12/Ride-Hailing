const axios = require('axios');
const mapsConfig = require('../../config/maps');

// Calculate route distance and duration using Google Maps API
const calculateRouteDistance = async (origin, destination) => {
    try {
        if (!mapsConfig.googleMaps.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        const response = await axios.get(mapsConfig.googleMaps.directionsUrl, {
            params: {
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                key: mapsConfig.googleMaps.apiKey,
                mode: 'driving'
            }
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Google Maps API error: ${response.data.status}`);
        }

        const route = response.data.routes[0];
        const leg = route.legs[0];

        return {
            distance: leg.distance.value / 1000, // Convert to kilometers
            duration: Math.ceil(leg.duration.value / 60), // Convert to minutes
            polyline: route.overview_polyline.points,
            waypoints: route.legs.map(leg => ({
                address: leg.start_address,
                coordinates: {
                    lat: leg.start_location.lat,
                    lng: leg.start_location.lng
                }
            }))
        };
    } catch (error) {
        console.error('Route calculation error:', error);
        throw new Error('Failed to calculate route');
    }
};

// Estimate fare amount based on distance and vehicle type
const estimateFareAmount = async (origin, destination, vehicleType = 'standard') => {
    try {
        const routeInfo = await calculateRouteDistance(origin, destination);
        
        // Base fare rates (can be configured via environment variables)
        const baseRates = {
            standard: { base: 2.50, perKm: 1.50, perMinute: 0.30 },
            premium: { base: 4.00, perKm: 2.00, perMinute: 0.40 },
            xl: { base: 3.50, perKm: 1.80, perMinute: 0.35 }
        };

        const rate = baseRates[vehicleType] || baseRates.standard;
        
        const fare = rate.base + 
                    (routeInfo.distance * rate.perKm) + 
                    (routeInfo.duration * rate.perMinute);

        return {
            estimatedFare: Math.round(fare * 100) / 100, // Round to 2 decimal places
            distance: routeInfo.distance,
            duration: routeInfo.duration,
            vehicleType,
            breakdown: {
                baseFare: rate.base,
                distanceCost: routeInfo.distance * rate.perKm,
                timeCost: routeInfo.duration * rate.perMinute
            }
        };
    } catch (error) {
        console.error('Fare estimation error:', error);
        throw new Error('Failed to estimate fare');
    }
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Find nearby drivers within specified radius
const findNearbyDrivers = async (latitude, longitude, radius = 5000) => {
    try {
        const Driver = require('../models/driver.model');
        
        const nearbyDrivers = await Driver.find({
            isAvailable: true,
            isOnline: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radius
                }
            }
        }).select('name currentLocation vehicleInfo rating totalRides');

        return nearbyDrivers.map(driver => ({
            ...driver.toObject(),
            distance: calculateDistance(
                latitude, 
                longitude, 
                driver.currentLocation.lat, 
                driver.currentLocation.lng
            )
        })).sort((a, b) => a.distance - b.distance);
    } catch (error) {
        console.error('Find nearby drivers error:', error);
        throw new Error('Failed to find nearby drivers');
    }
};

// Update driver location and availability
const updateDriverLocation = async (driverId, latitude, longitude, isOnline = null) => {
    try {
        const Driver = require('../models/driver.model');
        
        const updateData = {
            currentLocation: { lat: latitude, lng: longitude },
            lastLocationUpdate: new Date()
        };

        if (isOnline !== null) {
            updateData.isOnline = isOnline;
        }

        await Driver.findByIdAndUpdate(driverId, updateData);
        return true;
    } catch (error) {
        console.error('Update driver location error:', error);
        throw new Error('Failed to update driver location');
    }
};

module.exports = {
    calculateRouteDistance,
    estimateFareAmount,
    calculateDistance,
    findNearbyDrivers,
    updateDriverLocation
};
