using {
    cuid,
    managed,
    User
} from '@sap/cds/common';

namespace neonid0.vehlo;

entity Vehicles : cuid, managed {

    tenant        : Association to Tenants;

    plateNumber   : String;
    make          : String;
    model         : String;
    year          : Integer;
    status        : localized String; // this is for an example of localization
    vin           : String;
    lastServiceAt : DateTime;
}

entity Tenants : cuid, managed {

    // These are just backlinks when we use them for one-to-many associations for navigations
    //    vehicle           : Association to many Vehicles
    //                            on vehicle.tenant = $self;
    //    userAccount       : Association to many UserAccounts
    //                            on userAccount.tenant = $self;
    //    driver            : Association to many Drivers
    //                            on driver.tenant = $self;
    //    maintanenceRecord : Association to many MaintanenceRecords
    //                            on maintanenceRecord.tenant = $self;
    //    assignment        : Association to many Assignments
    //                            on assignment.tenant = $self;
    //    alert             : Association to many Alerts
    //                            on alert.tenant = $self;

    subdomain   : String;
    displayName : String;
    planTier    : String;
    status      : String;
}

entity UserAccounts : cuid, managed {

    tenant            : Association to Tenants;


    // i dont know is it good?
    maintanenceRecord : Association to many MaintanenceRecords
                            on maintanenceRecord.assignedTechnician = $self;
    driver            : Association to many Drivers
                            on driver.userAccount = $self;

    firstName         : String;
    lastName          : String;
    name              : String = firstName || ' ' || lastName;
    email             : String;
    role              : String  @cds.on.insert: 'inserted'  @cds.on.update: 'updated'; // this is huge !!
    isActive          : Boolean default true;
}

entity Drivers : managed, cuid {

    tenant        : Association to Tenants;
    userAccount   : Association to UserAccounts;

    licenseNumber : String;
    licenseClass  : String;
    licenseExpiry : DateTime;
    status        : String;
}

entity Assignments : cuid, managed {

    tenant    : Association to Tenants;
    vehicle   : Association to Vehicles;
    driver    : Association to Drivers;

    startTime : DateTime @cds.validfrom;
    endTime   : DateTime @cds.validto;
    status    : String;
    notes     : String;
}

// This for OCC
annotate Assignments with {
    modifiedAt @odata.etag
}

entity MaintanenceRecords : cuid, managed {

    tenant             : Association to Tenants;
    vehicle            : Association to Vehicles;
    assignedTechnician : Association to UserAccounts;

    type               : String;
    severity           : String;
    status             : String;
    description        : String;
    resolutionNotes    : String;
    cost               : Double;
    scheduledAt        : DateTime;
    completedAt        : DateTime;
}

entity Alerts : cuid {

    tenant            : Association to Tenants;
    vehicle           : Association to Vehicles;
    maintanenceRecord : Association to MaintanenceRecords;

    alertType         : String;
    severity          : String;
    status            : String;
    message           : String;
    trigerredAt       : DateTime;
    acknowledgedAt    : Timestamp  @cds.on.insert: $now   @cds.on.update: $now;
    acknowledgedBy    : User       @cds.on.insert: $user  @cds.on.update: $user;
}

entity AuditLogs : cuid {

    tenant     : Association to Tenants;

    entityType : String;
    entityId   : UUID;
    action     : String;
    actorId    : String;
    changes    : Binary;
    occuredAt  : DateTime;
}
