const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    passengerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    origin: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    destination: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    estimatedFare: {
        type: Number,
        required: true
    },
    finalFare: {
        type: Number
    },
    distance: {
        type: Number, // in kilometers
        default: 0
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    pickupTime: {
        type: Date
    },
    dropoffTime: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'wallet'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    cancellationReason: {
        type: String
    },
    cancelledBy: {
        type: String,
        enum: ['driver', 'passenger', 'system']
    },
    rating: {
        driverRating: {
            type: Number,
            min: 1,
            max: 5
        },
        passengerRating: {
            type: Number,
            min: 1,
            max: 5
        },
        driverComment: String,
        passengerComment: String
    },
    route: {
        polyline: String,
        waypoints: [{
            address: String,
            coordinates: {
                lat: Number,
                lng: Number
            }
        }]
    }
}, {
    timestamps: true
});

// Create indexes for common queries
rideSchema.index({ driverId: 1, status: 1 });
rideSchema.index({ passengerId: 1, status: 1 });
rideSchema.index({ status: 1, createdAt: -1 });
rideSchema.index({ 'origin.coordinates': '2dsphere' });
rideSchema.index({ 'destination.coordinates': '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);
