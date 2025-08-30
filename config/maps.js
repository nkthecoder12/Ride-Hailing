// Google Maps API / OpenStreetMap configuration
module.exports = {
    googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
        baseUrl: 'https://maps.googleapis.com/maps/api',
        geocodingUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
        directionsUrl: 'https://maps.googleapis.com/maps/api/directions/json',
        distanceMatrixUrl: 'https://maps.googleapis.com/maps/api/distancematrix/json'
    },
    openStreetMap: {
        baseUrl: 'https://nominatim.openstreetmap.org',
        geocodingUrl: 'https://nominatim.openstreetmap.org/search',
        reverseGeocodingUrl: 'https://nominatim.openstreetmap.org/reverse'
    },
    defaultLocation: {
        lat: 0,
        lng: 0
    }
};
