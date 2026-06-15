import cds from '@sap/cds';
import { TripStatus, VehicleStatus } from '../db/schema.js';
import { mapToTrip } from './utils/mapToStatus.js';
import { isDriverOccupied, isVehicleOccupied } from './utils/isOccupied.js'

export class OperationService extends cds.ApplicationService {

    init() {

        const { Trips, Vehicles, Drivers, Maintenances, VehicleSchedules, DriverSchedules } = this.entities;

        this.on('createTripDraft', async req => {

            let { vehicle: vehicleId, driver: driverId, start, end, payout, currency, origin, destination, notes } = req.data;

            const vehicle = await SELECT.one.from(Vehicles).where({ ID: vehicleId });
            if (vehicle.status === VehicleStatus.MAINTENANCE || vehicle.status === VehicleStatus.ON_TRIP) return req.reject(409, 'Vehicle is not available.');

            const isOccupiedVehicle = await isVehicleOccupied(vehicleId, start, end);
            console.log(isOccupiedVehicle)
            if (isOccupiedVehicle) return req.reject(409, 'Vehicle is occupied during the requested period.');

            const driver = await SELECT.one.from(Drivers).where({ ID: driverId });
            if (driver.status === 'ON_TRIP') return req.reject(409, 'Driver is not available.');

            const isOccupiedDriver = await isDriverOccupied(driverId, start, end);
            if (isOccupiedDriver) return req.reject(409, 'Driver is occupied during the requested period.');

            const asd = await INSERT.into(Trips).entries({ vehicle_ID: vehicleId, driver_ID: driverId, start, end, payout, currency_code: currency, originLocation: origin, destinationLocation: destination, status: TripStatus.DRAFT, notes });

            return asd
        })

        this.on('publishTrip', async req => {

            let { trip: tripId, driver: driverId } = req.data;

            const trip = await SELECT.one.from(Trips, tripId);
            if (trip.status != TripStatus.DRAFT) req.reject(400, 'Trip must be in draft')

            let data
            if (!driverId) {
                data = await UPDATE(Trips, tripId).set({ status: TripStatus.PUBLISHED });
            } else {
                data = await UPDATE(Trips, tripId).set({ status: TripStatus.IN_REVIEW, driver_ID: driverId });
            }

            return data;
        })

        this.on('assignDriver', async req => {

            let { trip: tripId, driver: driverId } = req.data;

            const trip = await SELECT.one.from(Trips)
                .where({ ID: tripId })
                .forUpdate();

            if (!trip) return req.reject(404, 'Trip not found.');
            if (!(trip.status !== TripStatus.DRAFT || trip.status != TripStatus.PUBLISHED)) return req.reject(409, 'Only trips in DRAFT and PUBLISHED status can be assigned a driver.');

            const isOccupiedDriver = await isDriverOccupied(driverId, trip.start, trip.end);
            if (isOccupiedDriver) return req.reject(409, 'Driver is occupied during the requested period.');

            await UPDATE(Trips, tripId).set({ driver_ID: driverId, status: TripStatus.IN_REVIEW });

            // i guess event handling should be done on a separate service/file
            req.tx.emit('DriverAssigned', { trip: tripId, driver: driverId });
            req.tx.emit('sentTripForReview', { trip: tripId });
            req.tx.emit('sendNotification', { user: driverId, message: `You have been assigned to trip ${tripId}. Please review and accept or reject the trip.` });
        })

        this.on('cancelTrip', async req => {

            let { trip: tripId } = req.data;

            const trip = await SELECT.one.from(Trips, tripId).forUpdate();
            if (!trip) req.reject(404, 'Trip not found.')
            if (trip.status != TripStatus.ACCEPTED) req.reject(400, 'Cannot cancel a non-scheduled trip.')

            await UPDATE(Trips, tripId).set({ status: TripStatus.CANCELLED });
        })

        this.on('sendToMaintenance', async req => {

            let { vehicle: vehicleId, start, end, notes } = req.data;

            const isOccupiedVehicle = await isVehicleOccupied(vehicleId, start, end)
            if (isOccupiedVehicle) return req.reject(409, 'Vehicle is occupied during the requested maintenance period.');

            await INSERT.into(Maintenances).entries({ vehicle_ID: vehicleId, start, end, notes });
        })

        this.on('reviewTrip', async req => {

            let { trip: tripId, decision, reason } = req.data;

            let trip = await SELECT.one.from(Trips, tripId).forUpdate();
            if (trip.status !== TripStatus.IN_REVIEW) return req.reject(409, 'Trip is not in review.');

            await UPDATE(Trips, tripId).set({ status: mapToTrip(decision), reviewReason: reason });
        })

        // maybe there can be a better way
        this.after('UPDATE', Trips, results => results.forEach(async trip => {

            if (trip.status === TripStatus.CANCELLED) {
                await DELETE.from(VehicleSchedules).where({ trip_ID: trip.ID });
                await DELETE.from(DriverSchedules).where({ trip_ID: trip.ID });

                // req.on('succeed', () => {
                //     this.emit('TripCancelled', { trip: trip.ID });
                // })
            }
        }))

        super.init()
    }
}
