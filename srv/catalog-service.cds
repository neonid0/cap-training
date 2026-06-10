using {neonid0.captraining as db} from '../db/schema';


service CatalogService @(odata: '/browse') {
    @readonly
    entity Books as
        projection on db.Books {
            *,
            author.name as author,
            genre.name  as genre,
        }
        excluding {
            createdBy,
            modifiedBy
        };

}
