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
- [ ] `createTripDraft` (Processor) - tripId, dates, locations, vehicleId
- [ ] `assignDriver` (Processor) - tripId, driverId
- [ ] `cancelTrip` (Processor) - tripId, reason
- [ ] `updateTrip` (Processor) - tripId, updates

### ❌ MISSING Events
- [ ] `TripDraftCreated` - triggers on createTripDraft, listeners: Fleet Service (vehicle availability check)
- [ ] `TripPublished` - triggers on publishTrip, listeners: Driver Portal (show available trips)
- [ ] `DriverAssigned` - triggers on assignDriver, listeners: Notification Service (push to driver)
- [ ] `TripStatusChanged` - triggers on any status change, listeners: ElasticSearch (logging), WebSocket (UI updates)
- [ ] `TripCancelled` - triggers on cancelTrip, listeners: Notification Service (SMS if driver assigned)
- [ ] `TripReviewed` - triggers on reviewTrip, listeners: Audit logging

### ❌ MISSING Constraints in OperationService
- [ ] No validation that Processor role has permission to createTripDraft
- [ ] No check if vehicle is available during requested dates
- [ ] No REVIEW_LOG table for audit trail
- [ ] Missing `reason` parameter requirement for REJECT/BLOCK decisions
- [ ] No check if trip is IN_REVIEW before reviewTrip
- [ ] Missing @requires decorator precision for different actions

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
| `applyForTrip` | ✅ Corrected | Renamed from `applyTrip` to match spec |
| `revokeTrip` | ✅ Exists | Missing implementation details |

### ❌ MISSING Actions
- [ ] `startTrip` (Driver) - tripId
- [ ] `completeTrip` (Driver) - tripId
- [ ] `updateLocation` (Driver) - lat, long
- [ ] `changeDutyStatus` (Driver) - status (ON_DUTY/OFF_DUTY)

### ❌ MISSING Events
- [ ] `DriverAppliedForTrip` - triggers on applyForTrip, listeners: Operations Service (move trip to REVIEW)
- [ ] `TripStarted` - triggers on startTrip, listeners: Fleet Service (update vehicle to ON_TRIP)
- [ ] `TripCompleted` - triggers on completeTrip, listeners: Fleet Service (vehicle to AVAILABLE) + Invoicing Service
- [ ] `DriverStatusChanged` - triggers on changeDutyStatus, listeners: Operations Service (filter available drivers)

### ❌ MISSING Constraints in DriverService
- [ ] No validation that trip is in PUBLISHED status before applyForTrip
- [ ] No distance validation (< 50km from current location)
- [ ] No check that driver is ON_DUTY before starting/completing trip
- [ ] Missing location tracking table (PostGIS)
- [ ] No driver license class validation against vehicle requirements
- [ ] applyForTrip logic fix: checking if driver already applied returns 403, should update status or return 409

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
- [ ] `addVehicle` (Admin) - plate, class, make, model, year (PARTIALLY: no action, direct INSERT)
- [ ] `scheduleMaintenance` (Admin) - vehicleId, date
- [ ] `startMaintenance` (Admin) - maintenanceId
- [ ] `completeMaintenance` (Admin) - maintenanceId
- [ ] `acknowledgeAlert` (Admin) - maintenanceId

### ❌ MISSING Events
- [ ] `VehicleAdded` - triggers on addVehicle, listeners: Inventory Service
- [ ] `MaintenanceScheduled` - triggers on scheduleMaintenance, listeners: Notification Service
- [ ] `MaintenanceStarted` - triggers on startMaintenance, listeners: Operations Service (block trip creation)
- [ ] `MaintenanceCompleted` - triggers on completeMaintenance, listeners: Operations Service (open vehicle for trips)
- [ ] `VehicleStatusChanged` - triggers on any vehicle status change, listeners: Operations Service, Monitoring
- [ ] `MaintenanceAlertTriggered` - triggers on cron job (X hours before maintenance), listeners: Email Service, UI Notification Hub

### ❌ MISSING Constraints in FleetService
- [ ] No validation that past dates cannot be used for maintenance scheduling
- [ ] No check that vehicle isn't already in MAINTENANCE before starting new maintenance
- [ ] No validation that plate number is unique within tenant
- [ ] Missing vehicle status validation (can't have TRIP if vehicle doesn't exist in db)

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
- [ ] `registerTenant` (System) - companyName, planId
- [ ] `suspendTenant` (SuperAdmin) - tenantId

### ❌ MISSING Events
- [ ] `TenantRegistrationRequested` - triggers on registerTenant, listeners: CAP MTXS Service (provision HDI container, schema creation)
- [ ] `TenantProvisioned` - triggers on HDI provisioning complete, listeners: License Service, Operations Service
- [ ] `TenantSuspended` - triggers on suspendTenant, listeners: Gateway (403 Forbidden for all requests), Session Manager (close active sessions)

### ❌ MISSING Tenant Schema
- [ ] Create `Tenants` entity in db/schema.cds with fields: displayName, planId, status enum (ACTIVE, SUSPENDED, DELETED), subscriptionStart, subscriptionEnd

---

## 5. CROSS-CUTTING CONCERNS

### ❌ MISSING: Event Bus / Pub-Sub Infrastructure
- [ ] Define event types in CDS files
- [ ] Set up Fiori notification infrastructure
- [ ] Implement webhook mechanism
- [ ] Register event listeners

### ❌ MISSING: Audit & Logging
- [ ] Create REVIEW_LOG table for trip reviews
- [ ] Implement audit trail for state transitions
- [ ] Implement change tracking for sensitive operations

### ❌ MISSING: Data Validation (Constraints)
- [ ] Add @assert.format for plate number validation
- [ ] Add @assert.unique constraints for business keys (plateNumber + tenant_ID)
- [ ] Add @assert.range for distance validation (0-500 km)
- [ ] Add @assert.notNull for required fields

### ❌ MISSING: Tenant Isolation
- [ ] Add WHERE filters based on tenant context in all entities
- [ ] Add tenant_ID foreign keys to all entities
- [ ] Add @restrict annotations checking tenant membership

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
- [ ] `TenantMetadata` - For SaaS management
- [ ] `ReviewLogs` - For audit trail on trip reviews
- [ ] `MaintenanceAlerts` - For scheduled alerts
- [ ] `DriverLicenseClasses` - Mapping licenses to vehicle classes
- [ ] `EventAudit` - Event sourcing audit trail

### Missing Columns
- [ ] Trips table: add reviewedBy (UUID), reviewedAt (DateTime), reviewReason (String 1000)
- [ ] Drivers table: add tenant_ID (UUID), licenseClasses (array), currentLocation (Point/PostGIS)
- [ ] Vehicles table: add tenant_ID (UUID), registrationExpiry (Date), insuranceExpiry (Date)

---

## 7. MISSING BUSINESS LOGIC

### Operations Service
- [ ] Vehicle availability conflict detection (dates overlap)
- [ ] Driver license class validation
- [ ] Automatic state machine enforcement
- [ ] REVIEW_LOG audit trail creation

### Driver Service
- [ ] Distance validation (< 50km)
- [ ] Location update handling (PostGIS)
- [ ] Duty status enforcement
- [ ] Trip start/complete workflow

### Fleet Service
- [ ] Past date rejection for scheduling
- [ ] Maintenance alert trigger (cron)
- [ ] Active trip blocking for maintenance

---

## Summary Table: Implementation Status

| Component | Status | Priority | Effort |
|-----------|--------|----------|--------|
| Operations Service - Actions | 40% | HIGH | 3-4 days |
| Operations Service - Events | 0% | HIGH | 2-3 days |
| Driver Service - Actions | 50% | HIGH | 2-3 days |
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

