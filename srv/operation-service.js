import cds from '@sap/cds';
import { TripStatus, VehicleStatus, ReviewDecision } from '../db/schema.js';

export class OperationService extends cds.ApplicationService {

    init() {

        const { Trips, Vehicles, Drivers, Maintenances } = this.entities;

        this.on('publishTrip', async req => {

            let { trip: tripId, driver: driverId } = req.data;

            if (!driverId) {
                await INSERT.into(Trips).entries({ ID: tripId, status: TripStatus.PUBLISHED });
            } else {
                await INSERT.into(Trips).entries({ ID: tripId, status: TripStatus.IN_REVIEW, driver_ID: driverId });
            }
        })

        this.on('sendToMaintenance', async req => {

            let { vehicle: vehicleId, start, end, notes } = req.data;
            let vehicle = await SELECT.one.from(Vehicles).where({ ID: vehicleId });

            if (vehicle.status === VehicleStatus.MAINTANENCE) return req.reject(409, 'Vehicle is already in maintenance.');

            const isOccupied = vehicle.vehicleSchedule.some(schedule => {
                return schedule.start <= end && start <= schedule.end;
            })

            if (isOccupied) return req.reject(409, 'Vehicle is occupied during the requested maintenance period.');
        })

        this.on('reviewTrip', async req => {

            let { trip: tripId, decision, reason } = req.data;
            let trip = await SELECT.one.from(Trips).where({ ID: tripId });

            if (trip.status !== TripStatus.IN_REVIEW) return req.reject(409, 'Trip is not in review.');

            function mapToTrip(decision) {
                switch (decision) {
                    case ReviewDecision.APPROVED:
                        return TripStatus.ACCEPTED;
                    case ReviewDecision.REJECTED:
                        return TripStatus.REJECTED;
                    case ReviewDecision.BLOCKED:
                        return TripStatus.BLOCKED;
                    default:
                        req.reject(400, 'Invalid review decision.');
                }
            }

            await UPDATE(Trips).set({ status: mapToTrip(decision), reviewReason: reason }).where({ ID: tripId });
        })

        super.init()
    }
}
