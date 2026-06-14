using {neonid0.vehlo as db} from '../db/schema-old';

@cds.query.limit: {
    default: 20,
    max    : 100
}
service VehicleService @(odata: '/vehicle') {

    @cds.query.limit: 4
    @readonly
    entity Vehicles as
        projection on db.Vehicles {

            *,
            tenant.displayName as tenant,
        }
        excluding {
            managed
        }
        // where
        //     tenant.status = 'ASD'
        order by
            plateNumber desc

}

// it is a good way to separate concerns
extend service VehicleService with {

    @requires: 'authenticated-user'
    action assignDriver(vehicle: db.Vehicles:ID, driver: db.Drivers:ID);
}
