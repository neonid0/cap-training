using {neonid0.logiflow as db} from '../db/schema';


service DriverService @(
    odata   : '/browse',
    requires: 'authenticated-user'
) {

    @readonly
    entity Trips as
        projection on db.Trips {

            *,
            currency.code as currency,
        // vehicle.make || ' ' || vehicle.model as vehicle, // its cause some errors
        }
        excluding {
            driver
        }
        where
            status = 'P'
        order by
            createdAt desc
}

extend service DriverService with {

    @(requires: 'driver')
    action applyForTrip(trip: db.Trips:ID);

    @(requires: 'driver')
    action revokeTrip(trip: db.Trips:ID);
}
