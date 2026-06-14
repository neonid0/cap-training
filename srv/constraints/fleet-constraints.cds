using {FleetService} from '../fleet-service.cds';


annotate FleetService.Vehicles with {

    make        @assert      : (case
                                    when make       is null
                                         then 'Make must be specified.'
                                    when trim(make) =  ''
                                         then 'Make must not be empty.'
                                end);

    model       @assert      : (case
                                    when model       is null
                                         then 'Model must be specified.'
                                    when trim(model) =  ''
                                         then 'Model must not be empty.'
                                end);

    plateNumber @assert      : (case
                                    when plateNumber       is null
                                         then 'Plate number must be specified.'
                                    when trim(plateNumber) =  ''
                                         then 'Plate number must not be empty.'
                                end);

    year        @assert.range: [
        1900,
        (year(current_date))
    ]
}
