using {neonid0.logiflow as db} from '../db/schema';


service OperationService @(
    odata   : '/operation',
    requires: [
        'admin',
        'processor',
        'reviewer'
    ]
) {

    @readonly
    entity Trips            as projection on db.Trips
        actions {
            @(requires: 'processor')
            action createTripDraft(vehicle: db.Vehicles:ID,
                                   driver: db.Drivers:ID,
                                   start: DateTime,
                                   end: DateTime,
                                   payout: db.Price,
                                   currency: String(3) @cds.HandleAs: 'Currency',
                                   origin: String @cds.HandleAs: 'Geometry',
                                   destination: String @cds.HandleAs: 'Geometry',
                                   notes: String(1000))                                       returns Trips;

            @(requires: 'processor')
            action publishTrip(driver: db.Drivers:ID)                                         returns Trips;

            @(requires: 'processor')
            action assignDriver(driver: db.Drivers:ID)                                        returns Trips;

            @(requires: 'processor')
            action cancelTrip();

            @(requires: 'reviewer')
            action reviewTrip(decision: db.TripReviewDecision not null, reason: String(1000)) returns Trips;
        };

    @readonly
    entity Vehicles         as projection on db.Vehicles
        actions {

            @(requires: 'processor')
            action sendToMaintenance(start: DateTime, end: DateTime, description: String(1000)) returns VehicleSchedules;
        };

    @readonly
    entity Drivers          as projection on db.Drivers;

    @readonly
    entity Maintenances     as projection on db.Maintenances;

    @readonly
    entity VehicleSchedules as projection on db.VehicleSchedules;

    @readonly
    entity DriverSchedules  as projection on db.DriverSchedules;
}
