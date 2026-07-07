import cds from '@sap/cds';

// ai generated. approuter should handle this properly.
// Expose a simple endpoint /user that returns minimal authenticated user info.
// This runs on the CDS/Express server and will be reachable via the approuter
// when the approuter forwards the auth token (forwardAuthToken: true).

cds.on('bootstrap', (app) => {
    app.get('/user', (req, res) => {
        try {
            // Minimal, safe payload for the UI
            const user = req.user || {};
            const info = {
                id: user.id || null,
                name: user.name || user.displayName || user.id || null
            };

            // Attempt to include roles if available (non-sensitive)
            if (user.roles) info.roles = user.roles;

            res.json(info);
        } catch (e) {
            // Don't leak internals
            res.status(500).json({ error: 'failed to read user info' });
        }
    });
});
