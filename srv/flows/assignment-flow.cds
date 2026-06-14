using AssignmentService from '../assignment-service';

annotate AssignmentService.Assignments with @flow.status: Status actions {

    acceptAssignment                        @from       : [ #Open]  @to: #Accepted;
    rejectAssignment                        @from       : [ #Open]  @to: #Rejected;
}
