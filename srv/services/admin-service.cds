using {neonid0.captraining as db} from '../../db/schema';

service AdminService @(odata: '/admin') {
    entity Authors as projection on db.Authors;
    entity Books   as projection on db.Books;
    entity Genres  as projection on db.Genres;
}
