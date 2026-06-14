// JS projection of status enums for use in service handlers
// Keep this file in sync with db/schema.cds enums
export const TripStatus = {
    DRAFT: 'D',
    PUBLISHED: 'P',
    IN_REVIEW: 'R',
    ACCEPTED: 'A',
    REJECTED: 'R',
    BLOCKED: 'B',
    COMPLETED: 'C'
};

export const VehicleStatus = {
    AVAILABLE: 'A',
    ON_TRIP: 'O',
    MAINTENANCE: 'M'
};

export const MaintenanceStatus = {
    SCHEDULED: 'S',
    IN_PROGRESS: 'P',
    RESOLVED: 'R'
};

export const ReviewDecision = {
    ACCEPTED: 'A',
    REJECTED: 'R',
    BLOCKED: 'B'
};

export default {
    TripStatus,
    VehicleStatus,
    MaintenanceStatus,
    ReviewDecision
};
