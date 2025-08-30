const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    vehicleInfo: {
        make: String,
        model: String,
        year: Number,
        color: String,
        plateNumber: {
            type: String,
            required: true,
            unique: true
        }
    },
    currentLocation: {
        lat: {
            type: Number,
            default: 0
        },
        lng: {
            type: Number,
            default: 0
        }
    },
    lastLocationUpdate: {
        type: Date,
        default: Date.now
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRides: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    documents: {
        license: String,
        insurance: String,
        vehicleRegistration: String
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Create geospatial index for location-based queries
driverSchema.index({ currentLocation: '2dsphere' });

// Create compound index for availability and location queries
driverSchema.index({ isAvailable: 1, currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
