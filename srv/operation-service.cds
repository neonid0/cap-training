using {neonid0.logiflow as db} from '../db/schema';


type ReviewDecision : String enum {
    APPROVED = 'A';
    REJECTED = 'R';
    BLOCKED = 'B';
}

service OperationService @(
    odata   : '/operation',
    requires: [
        'admin',
        'processor',
        'reviewer'
    ]
) {

    @readonly
    entity Trips        as projection on db.Trips;

    @readonly
    entity Vehicles     as projection on db.Vehicles;

    @readonly
    entity Drivers      as projection on db.Drivers;

    @readonly
    entity Maintenances as projection on db.Maintenances;
}

extend service OperationService with {

    @(requires: 'processor')
    action publishTrip(trip: db.Trips:ID not null,
                       driver: db.Drivers:ID);

    @(requires: 'processor')
    action sendToMaintenance(vehicle: db.Vehicles:ID not null, start: DateTime, end: DateTime, notes: String(1000));
}

extend service OperationService with {

    @(requires: 'reviewer')
    action reviewTrip(trip: db.Trips:ID not null, decision: ReviewDecision not null, reason: String(1000));
}
