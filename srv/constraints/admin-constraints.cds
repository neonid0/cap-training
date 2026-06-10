using {AdminService} from './../services/admin-service.cds';

annotate AdminService.Books with {
    title  @mandatory;

    author @assert      : (case
                               when not exists author
                                    then 'Specified Author does not exist.'
                           end);

    genre  @mandatory  @assert: (case
                                     when not exists genre
                                          then 'Specified Genre does not exist.'
                                 end);

    price  @assert.range: [
        1,
        100
    ];
    stock  @assert.range: [
        (0),
        _
    ];
}
