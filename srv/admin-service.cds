using {neonid0.vehlo as db} from '../db/schema';

service AdminService @(odata: '/admin') {
    entity Vehicles     as
        projection on db.Vehicles {
            *,
            tenant.displayName as tenant
        };

    entity Tenants      as
        projection on db.Tenants {
            *
        };

    entity UserAccounts as
        projection on db.UserAccounts {
            *,
            tenant.displayName as tenant
        };

    entity Drivers      as
        projection on db.Drivers {
            *,
            tenant.displayName as tenant
        };
}
