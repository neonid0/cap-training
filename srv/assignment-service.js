import cds from '@sap/cds';

export class AssignmentService extends cds.ApplicationService {


    init() {

        // this not working cuz managed fields are automanaged from cap. cannot manupilate them
        // this.after('READ', 'Assignments', results => results.forEach(assignment => {
        //     delete assignment.createdBy
        // }))


        this.on('AssignDriver', async req => {

            let {
                vehicle: vehicleId, driver: driverId
            } = req.data

        })

        return super.init();
    }
}
