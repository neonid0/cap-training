import cds from '@sap/cds';


export class AppService extends cds.ApplicationService {

    init() {

        this.on('getUserContext', async (req) => {
            let role = 'guest';

            if (req.user && req.user.is('logiflow.admin')) role = 'admin';
            else if (req.user && req.user.is('logiflow.processor')) role = 'processor';
            else if (req.user && req.user.is('logiflow.reviewer')) role = 'reviewer';
            else if (req.user && req.user.is('logiflow.driver')) role = 'driver';


            return {
                id: req.user.id,
                firstname: req.user.attr.firstname || '',
                lastname: req.user.attr.lastname || '',
                role: role
            };
        })
    }
}
