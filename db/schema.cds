using {
    Currency,
    managed,
    cuid,
    sap
} from '@sap/cds/common';

namespace neonid0.vehlo;

entity Vehicles : cuid, managed {
    tenant : Association to Tenants;


}

entity Tenants : cuid, managed {

}

entity UserAccounts : cuid, managed {

}

entity Drivers : managed, cuid {

}

entity Assignments : cuid, managed {

}

entity MaintanenceRecords : cuid, managed {

}

entity Alerts : cuid, managed {

}
