using {
    cuid,
    managed,
    temporal,
    Currency
} from '@sap/cds/common';

namespace neonid0.logiflow;


type Price             : Decimal(9, 2);

type VehicleClass      : String enum {
    TRUCK = 'T';
}

type VehicleStatus     : String enum {
    AVAILABLE = 'A';
    ON_TRIP = 'O';
    MAINTENANCE = 'M';
}

type ScheduleType      : String enum {
    TRIP = 'T';
    MAINT = 'M';
    BLOCK = 'B';
    SHIFT = 'S';
}

type DriverStatus      : String enum {
    ACTIVE = 'A';
    OFF_DUTY = 'O';
}

type TripStatus        : String enum {
    DRAFT = 'D';
    PUBLISHED = 'P';
    IN_REVIEW = 'R';
    ACCEPTED = 'A';
    REJECTED = 'R';
    BLOCKED = 'B';
    COMPLETED = 'C';
}

type MaintenanceStatus : String enum {
    SCHEDULED = 'S';
    IN_PROGRESS = 'P';
    RESOLVED = 'R';
}

entity Vehicles : cuid, managed {

    key plateNumber : String;
        schedule    : Association to many DriverSchedules
                          on schedule.vehicle = $self;

        make        : String(32);
        model       : String(64);
        class       : VehicleClass;
        year        : Integer;
        status      : VehicleStatus default 'A';
        location    : Binary;
}

entity VehicleSchedules : cuid, managed {

    vehicle     : Association to Vehicles;
    trip        : Association to Trips;
    Maintenance : Association to Maintenances;

    type        : ScheduleType;
    start       : DateTime;
    end         : DateTime;
    notes       : String(1000);
}

entity Drivers : cuid, managed {

    schedule              : Association to many DriverSchedules
                                on schedule.driver = $self;

    firstName             : String(64);
    lastName              : String(64);
    name                  : String = firstName || ' ' || lastName;
    allowedVehicleClasses : array of VehicleClass;
    location              : Binary;
    status                : DriverStatus default 'A';
}

entity DriverSchedules : cuid, managed {

    vehicle     : Association to Vehicles;
    driver      : Association to Drivers;
    trip        : Association to Trips;
    maintenance : Association to Maintenances;

    type        : ScheduleType;
    start       : DateTime;
    end         : DateTime;
    notes       : String(1000);
}

entity Trips : cuid, managed, temporal {

    vehicle              : Association to Vehicles;
    driver               : Association to Drivers;

    start                : DateTime;
    end                  : DateTime;
    payout               : Price;
    currency             : Currency default 'EUR';
    originLocation       : Binary;
    destionationLocation : Binary;
    status               : TripStatus default 'D';
    notes                : String(1000);
}

entity Maintenances : cuid, managed {

    vehicle     : Association to Vehicles;

    start       : DateTime;
    end         : DateTime;
    description : String(1000);
    status      : MaintenanceStatus default 'S';
}


annotate Vehicles with {
    modifiedAt @odata.etag
}

annotate Trips with {
    modifiedAt @odata.etag
}

annotate Maintenances with {
    modifiedAt @odata.etag
}
