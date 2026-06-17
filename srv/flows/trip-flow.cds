using OperationService from '../operation-service.cds';

annotate OperationService.Trips with @flow.status: status actions {
    publishTrip                      @from       : #DRAFT      @to: [
        #PUBLISHED,
        #IN_REVIEW
    ];
    assignDriver                     @from       : [
        #DRAFT,
        #PUBLISHED
    ]                                                          @to: #IN_REVIEW;
    cancelTrip                       @from       : #ACCEPTED   @to: @CANCELLED;
    reviewTrip                       @from       : #IN_REVIEW  @to: [
        #DRAFT,
        #ACCEPTED,
        #REJECTED,
        #BLOCKED
    ];
}
