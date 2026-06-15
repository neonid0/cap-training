async function _checkOverlap(entityName, queryFilter) {

    const entity = cds.entities('neonid0.logiflow')[entityName];
    const conflicting = await SELECT.from(entity)
        .where(queryFilter)
        .limit(1);

    return conflicting.length > 0;
}

export async function isVehicleOccupied(vehicleId, start, end) {

    return _checkOverlap('VehicleSchedules', {
        vehicle_ID: vehicleId,
        start: { '<': end },
        end: { '>': start }
    });
}

export async function isDriverOccupied(driverId, start, end) {

    return _checkOverlap('DriverSchedules', {
        driver_ID: driverId,
        start: { '<': end },
        end: { '>': start }
    });
}
