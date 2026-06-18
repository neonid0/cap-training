using {neonid0.logiflow as db} from '../db/schema';


service DriverService @(
    odata   : '/browse',
    requires: 'driver'
) {

    @readonly
    entity Trips as
        projection on db.Trips {

            *,
            currency.code as currency,
        // vehicle.make || ' ' || vehicle.model as vehicle, // its cause some errors
        }

        where
            status = 'P'
        order by
            createdAt desc

        actions {

            @(requires: 'driver')
            action applyForTrip() returns Trips;

            @(requires: 'driver')
            action revokeTrip()   returns Trips;
        }


}
