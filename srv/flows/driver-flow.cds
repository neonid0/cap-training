using DriverService from '../driver-service.cds';

annotate DriverService.Trips with @flow.status: status actions {
    applyForTrip                  @from       : #PUBLISHED  @to: #IN_REVIEW;
    revokeTrip                    @from       : [
        #IN_REVIEW,
        #ACCEPTED,
        #REJECTED
    ]                                                       @to: #PUBLISHED;
}
