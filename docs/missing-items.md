# Missing Actions, Events, Constraints, and Access Controls Analysis

## Executive Summary
Based on the DDD/Modular Monolith specification provided, the current codebase is **incomplete**. 
Many critical Actions, Events, Access Controls, and Constraints are missing or improperly implemented.

---

## 1. OPERATIONS SERVICE ANALYSIS

### ✅ Implemented Actions
| Action | Status | Notes |
|--------|--------|-------|
| `publishTrip` | ✅ Exists | Partially implemented, missing validation |
| `reviewTrip` | ✅ Exists | Implemented with decision mapping |
| `sendToMaintenance` | ✅ Exists | Wrong name, should be internal |

### ❌ MISSING Actions
| Action | Required Roles | Parameters | Status |
|--------|---|---|---|
| `createTripDraft` | Processor | tripId, dates, locations, vehicleId | **MISSING** |
| `assignDriver` | Processor | tripId, driverId | **MISSING** |
| `cancelTrip` | Processor | tripId, reason | **MISSING** |
| `updateTrip` | Processor | tripId, updates | **MISSING** |

### ❌ MISSING Events
| Event | Triggers | Listeners | Status |
|-------|----------|-----------|--------|
| `TripDraftCreated` | createTripDraft | Fleet Service (vehicle availability check) | **MISSING** |
| `TripPublished` | publishTrip | Driver Portal (show available trips) | **MISSING** |
| `DriverAssigned` | assignDriver | Notification Service (push to driver) | **MISSING** |
| `TripStatusChanged` | Any status change | ElasticSearch (logging), WebSocket (UI updates) | **MISSING** |
| `TripCancelled` | cancelTrip | Notification Service (SMS if driver assigned) | **MISSING** |
| `TripReviewed` | reviewTrip | Audit logging | **MISSING** |

### ❌ MISSING Constraints in OperationService
- No validation that Processor role has permission to createTripDraft
- No check if vehicle is available during requested dates
- No REVIEW_LOG table for audit trail
- Missing `reason` parameter requirement for REJECT/BLOCK decisions
- No check if trip is IN_REVIEW before reviewTrip
- Missing @requires decorator precision for different actions

### ❌ Access Control Issues
```cds
// Current (too permissive)
service OperationService @(
    odata: '/operation',
    requires: ['admin', 'processor', 'reviewer']
)

// Missing: Action-level @requires decorators
// Example:
@(requires: 'processor')
action createTripDraft(...);

@(requires: 'reviewer')
action reviewTrip(...);
```

---

## 2. DRIVER PORTAL SERVICE ANALYSIS

### ✅ Implemented Actions
| Action | Status | Notes |
|--------|--------|-------|
| `applyTrip` | ⚠️ Partial | Called `applyTrip`, spec says `applyForTrip` |
| `revokeTrip` | ✅ Exists | Missing implementation details |

### ❌ MISSING Actions
| Action | Required Roles | Parameters | Status |
|--------|---|---|---|
| `startTrip` | Driver | tripId | **MISSING** |
| `completeTrip` | Driver | tripId | **MISSING** |
| `updateLocation` | Driver | lat, long | **MISSING** |
| `changeDutyStatus` | Driver | status (ON_DUTY/OFF_DUTY) | **MISSING** |

### ❌ MISSING Events
| Event | Triggers | Listeners | Status |
|-------|----------|-----------|--------|
| `DriverAppliedForTrip` | applyForTrip | Operations Service (move trip to REVIEW) | **MISSING** |
| `TripStarted` | startTrip | Fleet Service (update vehicle to ON_TRIP) | **MISSING** |
| `TripCompleted` | completeTrip | Fleet Service (vehicle to AVAILABLE) + Invoicing Service | **MISSING** |
| `DriverStatusChanged` | changeDutyStatus | Operations Service (filter available drivers) | **MISSING** |

### ❌ MISSING Constraints in DriverService
- No validation that trip is in PUBLISHED status before applyForTrip
- No distance validation (< 50km from current location)
- No check that driver is ON_DUTY before starting/completing trip
- Missing location tracking table (PostGIS)
- No driver license class validation against vehicle requirements
- applyTrip has logic bug: checking if driver already applied returns 403, should update status or return 409

### ❌ Access Control Issues
```cds
// Current (generic)
@(requires: 'driver')
action applyTrip(trip: db.Trips:ID);

// Missing: Tenant isolation
// Driver should only see/apply for trips in their own tenant
// Missing: Driver can only work with their own driver ID
@(requires: 'driver')
@restrict: [{grant: 'READ', where: 'driver_ID = $user.id'}]
```

---

## 3. FLEET MANAGEMENT SERVICE ANALYSIS

### ✅ Implemented Entities
- Vehicles with READ/WRITE access control structure

### ❌ MISSING Actions
| Action | Required Roles | Parameters | Status |
|--------|---|---|---|
| `addVehicle` | Admin | plate, class, make, model, year | **PARTIALLY** (no action, direct INSERT) |
| `scheduleMaintenance` | Admin | vehicleId, date | **MISSING** |
| `startMaintenance` | Admin | maintenanceId | **MISSING** |
| `completeMaintenance` | Admin | maintenanceId | **MISSING** |
| `acknowledgeAlert` | Admin | maintenanceId | **MISSING** |

### ❌ MISSING Events
| Event | Triggers | Listeners | Status |
|-------|----------|-----------|--------|
| `VehicleAdded` | addVehicle | Inventory Service | **MISSING** |
| `MaintenanceScheduled` | scheduleMaintenance | Notification Service | **MISSING** |
| `MaintenanceStarted` | startMaintenance | Operations Service (block trip creation) | **MISSING** |
| `MaintenanceCompleted` | completeMaintenance | Operations Service (open vehicle for trips) | **MISSING** |
| `VehicleStatusChanged` | Any vehicle status change | Operations Service, Monitoring | **MISSING** |
| `MaintenanceAlertTriggered` | Cron job (X hours before maintenance) | Email Service, UI Notification Hub | **MISSING** |

### ❌ MISSING Constraints in FleetService
- No validation that past dates cannot be used for maintenance scheduling
- No check that vehicle isn't already in MAINTENANCE before starting new maintenance
- No validation that plate number is unique within tenant
- Missing vehicle status validation (can't have TRIP if vehicle doesn't exist in db)

### ❌ Access Control Issues
```cds
// Current (incomplete)
@requires: [{
    grant: ['INSERT', 'UPDATE', 'DELETE'],
    to: 'admin'
}]

// Issues:
// 1. Processor role can READ but not MODIFY - correct but undocumented
// 2. Missing @restrict for tenant isolation
// 3. No action-level authorization
```

---

## 4. TENANT PROVISIONING SERVICE (MISSING ENTIRELY)

### ❌ MISSING Service Definition
The entire Tenant Provisioning Service is missing from the codebase.

### ❌ MISSING Actions
| Action | Required Roles | Parameters | Status |
|--------|---|---|---|
| `registerTenant` | System | companyName, planId | **MISSING** |
| `suspendTenant` | SuperAdmin | tenantId | **MISSING** |

### ❌ MISSING Events
| Event | Triggers | Listeners | Status |
|-------|----------|-----------|--------|
| `TenantRegistrationRequested` | registerTenant | CAP MTXS Service (provision HDI container, schema creation) | **MISSING** |
| `TenantProvisioned` | HDI provisioning complete | License Service, Operations Service | **MISSING** |
| `TenantSuspended` | suspendTenant | Gateway (403 Forbidden for all requests), Session Manager (close active sessions) | **MISSING** |

### ❌ MISSING Tenant Schema
```cds
// No Tenant entity exists in db/schema.cds
entity Tenants : cuid, managed {
    displayName: String;
    planId: String;
    status: TenantStatus enum {ACTIVE, SUSPENDED, DELETED};
    subscriptionStart: Date;
    subscriptionEnd: Date;
}
```

---

## 5. CROSS-CUTTING CONCERNS

### ❌ MISSING: Event Bus / Pub-Sub Infrastructure
- No event definitions in CDS files
- No Fiori notification setup
- No webhook mechanism
- No event listeners registered

### ❌ MISSING: Audit & Logging
- No REVIEW_LOG table for trip reviews
- No audit trail for state transitions
- No change tracking for sensitive operations

### ❌ MISSING: Data Validation (Constraints)
```cds
// Missing in all services:
@assert.format: /^[A-Z]{2}\d{3}[A-Z]{2}$/ // Plate format validation
@assert.unique: [{elements: ['plateNumber', 'tenant_ID']}] // Uniqueness per tenant
@assert.range: [0, 500] // Distance in km
@assert.notNull: true // For required fields
```

### ❌ MISSING: Tenant Isolation
Current services DO NOT implement:
- WHERE filters based on tenant context
- Tenant_ID foreign keys
- @restrict annotations checking tenant membership

Example missing:
```cds
@restrict: [{
    grant: ['READ'],
    where: 'tenant_ID = $user.tenant_ID'
}]
```

### ❌ MISSING: Role-Based Access Control (RBAC) Refinement
| Component | Current | Required |
|-----------|---------|----------|
| Service-level @requires | ✅ Yes | ✅ Yes |
| Entity-level @restrict | ❌ Minimal | ✅ Needed |
| Field-level redaction | ❌ None | ✅ Needed for sensitive data |
| Action-level authorization | ❌ None | ✅ Critical |

---

## 6. DATABASE SCHEMA GAPS

### Missing Tables
- `TenantMetadata` - For SaaS management
- `ReviewLogs` - For audit trail on trip reviews
- `MaintenanceAlerts` - For scheduled alerts
- `DriverLicenseClasses` - Mapping licenses to vehicle classes
- `EventAudit` - Event sourcing audit trail

### Missing Columns
```sql
-- Missing in Trips table:
ALTER TABLE Trips ADD COLUMN reviewedBy UUID;
ALTER TABLE Trips ADD COLUMN reviewedAt DateTime;
ALTER TABLE Trips ADD COLUMN reviewReason String(1000);

-- Missing in Drivers table:
ALTER TABLE Drivers ADD COLUMN tenant_ID UUID; -- For multi-tenant
ALTER TABLE Drivers ADD COLUMN licenseClasses array of String;
ALTER TABLE Drivers ADD COLUMN currentLocation Point; -- PostGIS

-- Missing in Vehicles table:
ALTER TABLE Vehicles ADD COLUMN tenant_ID UUID; -- For multi-tenant
ALTER TABLE Vehicles ADD COLUMN registrationExpiry Date;
ALTER TABLE Vehicles ADD COLUMN insuranceExpiry Date;
```

---

## 7. MISSING BUSINESS LOGIC

### Operations Service
- ❌ Vehicle availability conflict detection (dates overlap)
- ❌ Driver license class validation
- ❌ Automatic state machine enforcement
- ❌ REVIEW_LOG audit trail creation

### Driver Service
- ❌ Distance validation (< 50km)
- ❌ Location update handling (PostGIS)
- ❌ Duty status enforcement
- ❌ Trip start/complete workflow

### Fleet Service
- ❌ Past date rejection for scheduling
- ❌ Maintenance alert trigger (cron)
- ❌ Active trip blocking for maintenance

---

## Summary Table: Implementation Status

| Component | Status | Priority | Effort |
|-----------|--------|----------|--------|
| Operations Service - Actions | 40% | HIGH | 3-4 days |
| Operations Service - Events | 0% | HIGH | 2-3 days |
| Driver Service - Actions | 40% | HIGH | 2-3 days |
| Driver Service - Events | 0% | HIGH | 1-2 days |
| Fleet Service - Actions | 20% | MEDIUM | 2-3 days |
| Fleet Service - Events | 0% | MEDIUM | 1-2 days |
| Tenant Provisioning Service | 0% | HIGH | 3-4 days |
| Event Bus Infrastructure | 0% | HIGH | 2-3 days |
| RBAC & Access Control | 30% | HIGH | 2-3 days |
| Database Schema | 60% | MEDIUM | 1-2 days |
| Audit & Logging | 0% | MEDIUM | 1-2 days |

**Total Estimated Effort: 20-35 days**

---

