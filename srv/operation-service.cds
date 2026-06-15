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
                                   notes: String(1000))                           returns db.ApiResponse;

            @(requires: 'processor')
            action publishTrip(trip: db.Trips:ID not null, driver: db.Drivers:ID) returns db.ApiResponse;

            @(requires: 'processor')
            action assignDriver(trip: db.Trips:ID not null, driver: db.Drivers:ID);

            @(requires: 'processor')
            action cancelTrip(trip: db.Trips:ID not null);

            @(requires: 'reviewer')
            action reviewTrip(trip: db.Trips:ID not null, decision: db.TripReviewDecision not null, reason: String(1000));
        };

    @readonly
    entity Vehicles         as projection on db.Vehicles
        actions {

            @(requires: 'processor')
            action sendToMaintenance(vehicle: db.Vehicles:ID not null, start: DateTime, end: DateTime, notes: String(1000));
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
