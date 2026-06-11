using {neonid0.vehlo as db} from '../db/schema.cds';

service VehicleService @(odata: '/vehicle') {

    @readonly
    entity Vehicle as
        projection on db.Vehicles {
            *,
            tenant.displayName as tenant,
        }
        excluding {
            createdAt,
            createdBy,
            modifiedAt,
            modifiedBy,
        };
}

extend service VehicleService with {

    @requires: 'authenticated-user'
    action assignDriver(vehicle: db.Vehicles:ID, driver: db.Drivers:ID);
}
