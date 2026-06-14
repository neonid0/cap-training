using {neonid0.logiflow as db} from '../db/schema.cds';


service FleetService @(
    odata   : '/fleet',
    requires: [
        'admin',
        'processor'
    ]
) {
    // This service is about alerts and acknowledgements
}
