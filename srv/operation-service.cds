using {neonid0.logiflow as db} from '../db/schema.cds';


type ReviewDecision : String enum {
    ACCEPTED = 'A';
    REJECTED = 'R';
    BLOCK = 'B';
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
    action publishTrip(trip: db.Trips:ID,
                       driver: db.Drivers:ID);

    @(requires: 'processor')
    action sendToMaintenance(vehicle: db.Vehicles:ID not null, );
}

extend service OperationService with {

    @(requires: 'reviewer')
    action reviewTrip(trip: db.Trips:ID not null, decision: ReviewDecision not null, reason: String(1000));
}
