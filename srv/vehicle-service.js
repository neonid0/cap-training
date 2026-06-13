import cds from '@sap/cds';

export class VehicleService extends cds.ApplicationService {

    init() {

        this.after('READ', 'Vehicles', results => results.forEach(vehicle => {

            if (vehicle.make === 'BMW') vehicle.plateNumber = 'DE ' + vehicle.plateNumber;
        }))

        return super.init();
    }
}
