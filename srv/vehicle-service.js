import cds from '@sap/cds';

export class VehicleService extends cds.ApplicationService {

    init() {

        this.on('assignDriver', async req => {

            let { vehicle: vehicleId, driver: driverId } = req.data;

            let existingAssignment = await SELECT.one.from(Vehicles)
                .where`driver.ID = ${driverId}`

            if (existingAssignment) {
                if (existingAssignment.ID === vehicleId) {
                    req.error`Driver is already signet to this vehicle.`
                }

                req.error`Driver is already signed to another vehicle`
            }
        })
    }
}
