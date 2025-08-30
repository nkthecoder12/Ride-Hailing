const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Driver = require('../src/models/driver.model');
const Ride = require('../src/models/ride.model');
const User = require('../src/models/user.model');

describe('Navigation API Tests', () => {
    let testDriver;
    let testPassenger;
    let testRide;
    let authToken;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/ride_hailing_test');
        
        // Create test user and driver
        testPassenger = await User.create({
            name: 'Test Passenger',
            email: 'passenger@test.com',
            password: 'password123'
        });

        testDriver = await Driver.create({
            userId: testPassenger._id,
            name: 'Test Driver',
            phone: '+1234567890',
            licenseNumber: 'TEST123456',
            vehicleInfo: {
                make: 'Toyota',
                model: 'Camry',
                year: 2020,
                color: 'White',
                plateNumber: 'TEST123'
            },
            currentLocation: {
                lat: 40.7128,
                lng: -74.0060
            }
        });

        // Generate auth token
        authToken = 'test-token'; // In real tests, generate actual JWT token
    });

    afterAll(async () => {
        // Clean up test data
        await User.deleteMany({});
        await Driver.deleteMany({});
        await Ride.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear rides before each test
        await Ride.deleteMany({});
    });

    describe('Driver Location Management', () => {
        test('PUT /api/navigation/driver/location - Update driver location', async () => {
            const newLocation = {
                latitude: 40.7589,
                longitude: -73.9851
            };

            const response = await request(app)
                .put('/api/navigation/driver/location')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newLocation);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Location updated successfully');

            // Verify location was updated in database
            const updatedDriver = await Driver.findById(testDriver._id);
            expect(updatedDriver.currentLocation.lat).toBe(newLocation.latitude);
            expect(updatedDriver.currentLocation.lng).toBe(newLocation.longitude);
        });

        test('GET /api/navigation/drivers/nearby - Get nearby drivers', async () => {
            const response = await request(app)
                .get('/api/navigation/drivers/nearby')
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 5000
                });

            expect(response.status).toBe(200);
            expect(response.body.drivers).toBeDefined();
            expect(Array.isArray(response.body.drivers)).toBe(true);
        });
    });

    describe('Route and Fare Calculation', () => {
        test('POST /api/navigation/route/calculate - Calculate route', async () => {
            const routeRequest = {
                origin: { lat: 40.7128, lng: -74.0060 },
                destination: { lat: 40.7589, lng: -73.9851 }
            };

            const response = await request(app)
                .post('/api/navigation/route/calculate')
                .send(routeRequest);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('distance');
            expect(response.body).toHaveProperty('duration');
        });

        test('POST /api/navigation/fare/estimate - Estimate fare', async () => {
            const fareRequest = {
                origin: { lat: 40.7128, lng: -74.0060 },
                destination: { lat: 40.7589, lng: -73.9851 },
                vehicleType: 'standard'
            };

            const response = await request(app)
                .post('/api/navigation/fare/estimate')
                .send(fareRequest);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('estimatedFare');
            expect(response.body).toHaveProperty('distance');
            expect(response.body).toHaveProperty('vehicleType');
        });
    });

    describe('Ride Management', () => {
        test('POST /api/navigation/ride/start - Start new ride', async () => {
            const rideRequest = {
                driverId: testDriver._id,
                passengerId: testPassenger._id,
                origin: { lat: 40.7128, lng: -74.0060 },
                destination: { lat: 40.7589, lng: -73.9851 },
                estimatedFare: 25.50
            };

            const response = await request(app)
                .post('/api/navigation/ride/start')
                .set('Authorization', `Bearer ${authToken}`)
                .send(rideRequest);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Ride started successfully');
            expect(response.body).toHaveProperty('rideId');

            // Verify ride was created
            const createdRide = await Ride.findById(response.body.rideId);
            expect(createdRide).toBeDefined();
            expect(createdRide.status).toBe('active');
        });

        test('PUT /api/navigation/ride/end - End active ride', async () => {
            // Create a test ride first
            testRide = await Ride.create({
                driverId: testDriver._id,
                passengerId: testPassenger._id,
                origin: { lat: 40.7128, lng: -74.0060 },
                destination: { lat: 40.7589, lng: -73.9851 },
                estimatedFare: 25.50,
                status: 'active',
                startTime: new Date()
            });

            const endRideRequest = {
                rideId: testRide._id,
                finalFare: 27.00
            };

            const response = await request(app)
                .put('/api/navigation/ride/end')
                .set('Authorization', `Bearer ${authToken}`)
                .send(endRideRequest);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Ride completed successfully');
            expect(response.body.ride.status).toBe('completed');
        });

        test('GET /api/navigation/ride/:rideId/status - Get ride status', async () => {
            // Create a test ride first
            testRide = await Ride.create({
                driverId: testDriver._id,
                passengerId: testPassenger._id,
                origin: { lat: 40.7128, lng: -74.0060 },
                destination: { lat: 40.7589, lng: -73.9851 },
                estimatedFare: 25.50,
                status: 'active'
            });

            const response = await request(app)
                .get(`/api/navigation/ride/${testRide._id}/status`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.ride).toBeDefined();
            expect(response.body.ride._id).toBe(testRide._id.toString());
        });
    });

    describe('Error Handling', () => {
        test('Should handle missing coordinates', async () => {
            const response = await request(app)
                .put('/api/navigation/driver/location')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Latitude and longitude are required');
        });

        test('Should handle invalid ride ID', async () => {
            const invalidRideId = new mongoose.Types.ObjectId();
            
            const response = await request(app)
                .get(`/api/navigation/ride/${invalidRideId}/status`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Ride not found');
        });
    });
});
