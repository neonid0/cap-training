using {VehicleService} from '../vehicle-service.cds';

annotate VehicleService with {

    year @assert.range: [
        1900,
        2026
    ]
}
