using {neonid0.logiflow as db} from '../db/schema.cds';


service DriverService @(
    odata   : '/browse',
    requires: 'authenticated-user'
) {

    @readonly
    entity Trips as
        projection on db.Trips {
            *,
            vehicle.make || '|' || vehicle.model as vehicle,
        }
        excluding {
            driver
        }
        where
            status = 'P'
}

extend service DriverService with @(requires: 'driver') {

    action applyTrip(trip: db.Trips:ID);
    action revokeTrip(trip: db.Trips:ID);
}
