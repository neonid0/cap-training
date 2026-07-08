service AppService {

    type UserContext {
        id        : UUID;
        firstname : String;
        lastname  : String;
        role      : String;
    }

    function getUserContext() returns UserContext;
}
