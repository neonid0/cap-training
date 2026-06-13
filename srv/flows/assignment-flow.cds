using AssignmentService from '../assignemnt-service.cds';

annotate AssignmentService.Assignments with @flow.status: Status actions {

    acceptAssignment                        @from       : [ #Open]  @to: #Accepted;
    rejectAssignment                        @from       : [ #Open]  @to: #Rejected;
}
