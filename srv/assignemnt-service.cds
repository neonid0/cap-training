using {neonid0.vehlo as db} from '../db/schema.cds';


service AssignmentService @(odata: '/assignment') {

    @restrict: [{
        grant: 'READ',
        where: 'createdBy  = $user'
    }]
    @readonly
    entity Assignments as

        projection on db.Assignments {

            *,
            tenant.displayName   as tenant,
            vehicle.plateNumber  as vehicle,
            driver.licenseNumber as driver
        }
        excluding {
            // createdBy, cannot exclude that cuz restriction binded with AssignmentService.Assignments
            modifiedBy
        }
        order by
            tenant desc;
}

extend service AssignmentService with {

    @requires: 'authenticated-user'
    @insertonly
    action assignDriver(vehicle: db.Vehicles:ID, driver: db.Drivers:ID);

    @requires: 'authenticated-user'
    @insertonly
    action revokeDriver(vehicle: db.Vehicles:ID, driver: db.Drivers:ID);

    @requires: 'authenticated-user'
    @insertonly
    action acceptAssignment(assignment: AssignmentService.Assignments:ID);

    @requires: 'authenticated-user'
    @insertonly
    action rejectAssignment(assignment: AssignmentService.Assignments:ID);
}
