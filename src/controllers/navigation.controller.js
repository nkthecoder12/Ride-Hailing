const Driver = require('../models/driver.model');
const Ride = require('../models/ride.model');
const { calculateRouteDistance, estimateFareAmount } = require('../services/navigation.service');

// Update driver's current location
const updateDriverLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const driverId = req.user.userId;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        await Driver.findByIdAndUpdate(driverId, {
            currentLocation: { lat: latitude, lng: longitude },
            lastLocationUpdate: new Date()
        });

        res.status(200).json({ message: 'Location updated successfully' });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get nearby drivers within specified radius
const getNearbyDrivers = async (req, res) => {
    try {
        const { latitude, longitude, radius = 5000 } = req.query; // radius in meters

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const nearbyDrivers = await Driver.find({
            isAvailable: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        }).select('name currentLocation vehicleInfo rating');

        res.status(200).json({ drivers: nearbyDrivers });
    } catch (error) {
        console.error('Get nearby drivers error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Calculate route between two points
const calculateRoute = async (req, res) => {
    try {
        const { origin, destination } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({ message: 'Origin and destination are required' });
        }

        const routeInfo = await calculateRouteDistance(origin, destination);
        res.status(200).json(routeInfo);
    } catch (error) {
        console.error('Calculate route error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Estimate fare for a ride
const estimateFare = async (req, res) => {
    try {
        const { origin, destination, vehicleType = 'standard' } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({ message: 'Origin and destination are required' });
        }

        const fareEstimate = await estimateFareAmount(origin, destination, vehicleType);
        res.status(200).json(fareEstimate);
    } catch (error) {
        console.error('Estimate fare error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Start a new ride
const startRide = async (req, res) => {
    try {
        const { driverId, passengerId, origin, destination, estimatedFare } = req.body;

        if (!driverId || !passengerId || !origin || !destination || !estimatedFare) {
            return res.status(400).json({ message: 'All ride details are required' });
        }

        const ride = await Ride.create({
            driverId,
            passengerId,
            origin,
            destination,
            estimatedFare,
            status: 'active',
            startTime: new Date()
        });

        // Update driver availability
        await Driver.findByIdAndUpdate(driverId, { isAvailable: false });

        res.status(201).json({ 
            message: 'Ride started successfully', 
            rideId: ride._id 
        });
    } catch (error) {
        console.error('Start ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// End an active ride
const endRide = async (req, res) => {
    try {
        const { rideId, finalFare } = req.body;

        if (!rideId || !finalFare) {
            return res.status(400).json({ message: 'Ride ID and final fare are required' });
        }

        const ride = await Ride.findByIdAndUpdate(rideId, {
            status: 'completed',
            endTime: new Date(),
            finalFare
        }, { new: true });

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Update driver availability
        await Driver.findByIdAndUpdate(ride.driverId, { isAvailable: true });

        res.status(200).json({ 
            message: 'Ride completed successfully', 
            ride 
        });
    } catch (error) {
        console.error('End ride error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get ride status
const getRideStatus = async (req, res) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findById(rideId)
            .populate('driverId', 'name vehicleInfo')
            .populate('passengerId', 'name');

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        res.status(200).json({ ride });
    } catch (error) {
        console.error('Get ride status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    updateDriverLocation,
    getNearbyDrivers,
    calculateRoute,
    estimateFare,
    startRide,
    endRide,
    getRideStatus
};
