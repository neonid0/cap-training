using OperationService from '../operation-service.cds';

annotate OperationService.Trips with @flow.status: Status actions {

    publishTrip                      @from       : #Draft      @to: #Published;
    reviewTrip                       @from       : #Published  @to: [
        #Draft,
        #Accepted,
        #Rejected
    ];

}
