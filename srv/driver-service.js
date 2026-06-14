import cds from '@sap/cds';

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

        this.on('applyTrip', async req => {

            let { trip: tripId } = req.data;

            const trip = await SELECT.one.from(Trips).where({ ID: tripId });
            if (!trip) return req.reject(404, 'Trip not found');

            const tripDriverId = trip.driver_ID || trip.driver?.ID;

            if (tripDriverId && tripDriverId !== req.user.id)
                return req.reject(403)
            if (tripDriverId && tripDriverId == req.user.id)
                return req.reject(409, 'Already applied to trip.')
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
