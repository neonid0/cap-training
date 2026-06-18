import cds from '@sap/cds';
import { TripStatus } from '../db/schema.js';

export class DriverService extends cds.ApplicationService {

    init() {

        const { Trips } = this.entities;

        const THREE_HOURS = 3 * 60 * 60 * 1000;

        this.after('READ', Trips, results => results.forEach(trip => {

            if (!trip || !trip.createdAt) return;

            const created = new Date(trip.createdAt);
            const now = new Date();

            if (now - created < THREE_HOURS) {
                trip.notes = `New Offer - ${trip.notes || ''}`;
            }
        }));

        this.on('applyForTrip', async req => {

            let { trip: tripId } = req.data;
            const trip = await SELECT.one.from(Trips, tripId);

            console.log('Applying for trip:', tripId, 'User:', req.user.id);
            console.log('Trip details:', trip);

            if (!trip) return req.reject(404, 'Trip not found');

            const tripDriverId = trip.driver_ID || trip.driver?.ID;

            if (tripDriverId && tripDriverId !== req.user.id) return req.reject(403)
            if (tripDriverId && tripDriverId == req.user.id) return req.reject(409, 'Already applied to trip.')

            await UPDATE(Trips, tripId).set({ driver_ID: req.user.id, status: TripStatus.IN_REVIEW });

            // Update the object in memory and return it
            trip.driver_ID = req.user.id
            trip.status = TripStatus.IN_REVIEW
            trip.modifiedAt = new Date()
            trip.modifiedBy = req.user.id

            return trip
            return await SELECT.one.from(Trips, tripId);
        })

        this.on('revokeTrip', async req => {

            let { trip: tripId } = req.data;
            const trip = await SELECT.one.from(Trips).where({ ID: tripId });

            if (!trip) return req.reject(404, 'Trip not found');

            const tripDriverId = trip.driver_ID || trip.driver?.ID;

            if (tripDriverId != req.user.id) req.reject(401);
        })

        super.init();
    }
}
