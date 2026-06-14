using {neonid0.logiflow as db} from '../db/schema';


service FleetService @(
    odata   : '/fleet',
    requires: [
        'admin',
        'processor'
    ]
) {

    entity Vehicles as projection on db.Vehicles;
}


extend service FleetService with {}
