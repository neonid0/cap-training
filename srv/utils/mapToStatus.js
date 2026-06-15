export function mapToTrip(decision) {
    switch (decision) {
        case ReviewDecision.APPROVED:
            return TripStatus.ACCEPTED;
        case ReviewDecision.REJECTED:
            return TripStatus.REJECTED;
        case ReviewDecision.BLOCKED:
            return TripStatus.BLOCKED;
        default:
            req.reject(400, 'Invalid review decision.');
    }
}
