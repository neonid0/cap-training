using {neonid0.logiflow as db} from '../db/schema.cds';


service FleetService @(
    odata   : '/fleet',
    requires: [
        'admin',
        'processor'
    ]
) {

    @requires: [{
        grant: [ // I couldn't decide how to handle that so it'll be changed
            'INSERT',
            'UPDATE',
            'DELETE',
        ],
        to   : 'admin'
    }]
    entity Vehicle as projection on db.Vehicles;
}


extend service FleetService with {}
