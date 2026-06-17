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
            if (isOccupiedVehicle) return req.reject(409, 'Vehicle is occupied during the requested period.');

            const driver = await SELECT.one.from(Drivers).where({ ID: driverId });
            if (driver.status === 'OFF_DUTY') return req.reject(409, 'Driver is not available.');

            const isOccupiedDriver = await isDriverOccupied(driverId, start, end);
            if (isOccupiedDriver) return req.reject(409, 'Driver is occupied during the requested period.');

            await INSERT.into(Trips).entries({ vehicle_ID: vehicleId, driver_ID: driverId, startTime: start, endTime: end, payout: payout, currency_code: currency, originLocation: origin, destinationLocation: destination, status: TripStatus.DRAFT, notes: notes });
        })

        this.on('publishTrip', async req => {

            let tripId = req.params[0];
            let { driver: driverId } = req.data;

            const trip = await SELECT.one.from(Trips, tripId);
            if (!trip) return req.reject(404, 'Trip not found.');

            if (driverId) {
                await UPDATE(Trips, tripId).set({ driver_ID: driverId, status: TripStatus.IN_REVIEW });
            } else {
                await UPDATE(Trips, tripId).set({ status: TripStatus.PUBLISHED });
            }

            return await SELECT.one.from(Trips, tripId);
        })

        this.on('assignDriver', async req => {

            const tripId = req.params[0];
            const { driver: driverId } = req.data;

            const trip = await SELECT.one.from(Trips, tripId);

            if (!trip) return req.reject(404, 'Trip not found.');

            const isOccupiedDriver = await isDriverOccupied(driverId, trip.start, trip.end);
            if (isOccupiedDriver) return req.reject(409, 'Driver is occupied during the requested period.');

            await UPDATE(Trips, tripId).set({ driver_ID: driverId });

            return await SELECT.one.from(Trips, tripId);
        })

        this.on('cancelTrip', async req => {

            const tripId = req.params[0];

            const trip = await SELECT.one.from(Trips, tripId);
            if (!trip) return req.reject(404, 'Trip not found.');
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

            const targetStatus = mapToTrip(decision);
            await UPDATE(Trips, tripId).set({ status: targetStatus, reviewReason: reason });
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

            console.log(`Trip ${trip.ID} updated with status ${trip.status}`);
        }))

        super.init()
    }
}
