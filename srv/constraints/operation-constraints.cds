using {OperationService} from '../operation-service.cds';

annotate OperationService.Vehicles with {

    plateNumber  @mandatory  @assert.unique;

    year         @mandatory  @assert.range : [
        1900,
        (year(current_date))
    ];

    make         @mandatory  @assert.format: [
        '^[a-zA-Z0-9 ]+$',
        'Make must only contain letters, numbers, and spaces.'
    ];

}
