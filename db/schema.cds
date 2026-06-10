using {
    Currency,
    managed,
    sap
} from '@sap/cds/common';

namespace neonid0.captraining;

entity Authors : managed {
    key ID    : Integer;
        name  : String;
        books : Association to many Books
                    on books.author = $self;
}

entity Books : managed {
    key ID       : Integer;
        title    : localized String;
        descr    : localized String;
        author   : Association to Authors;
        genre    : Association to Genres;
        stock    : Integer;
        price    : Decimal;
        currency : Currency;
}

entity Genres : sap.common.CodeList {
    key ID     : Integer;
        parent : Association to Genres;
}
