```
entity Foo { //...
  managed   : Timestamp @cds.on.insert: $now;
  defaulted : Timestamp default $now;
}
```

While both behave identical for database-level INSERTs, they differ for CREATE requests on higher-level service providers: Values for managed in the request payload will be ignored, while provided values for default will be written to the database.

--------------------------

For example, the following request would create a new Book with a reference to an existing Author, with {ID:12} being the foreign key value filled in for association author:

```http
POST .../Books {
  ID:121, title: 'Jane Eyre', author: {ID:12}
}

POST .../Orders {
  ID:1, title: 'new order', header: { // to-one
    ID:2, status: 'open', items: [{   // to-many
      ID:3, description: 'child of child entity'
    },{
      ID:4, description: 'another child of child entity'
    }]
  }
}

PUT .../Orders/1 {
  title: 'changed title of existing order', header: {
    ID:2, items: [{
      ID:3, description: 'modified child of child entity'
    },{
      ID:5, description: 'new child of child entity'
    }]
  }]
}
```

Deleting a root of a composition hierarchy results in a cascaded delete of all nested children.
sql

```http
DELETE .../Orders/1  -- would also delete all headers and items
```


------------------------

CAP runtimes provide out-of-the-box support for advanced search of a given text in all textual elements of an entity including nested entities along composition hierarchies.

A typical search request looks like that:

```http
GET .../Books?$search=Heights
```

That would basically search for occurrences of "Heights" in all text fields of Books, that is, in title and descr using database-specific contains operations (for example, using like '%Heights%' in standard SQL).

------------------------
### The @cds.search Annotation

By default search is limited to the elements of type String of an entity that aren't calculated or virtual. Yet, sometimes you may want to deviate from this default and specify a different set of searchable elements, or to extend the search to associated entities. Use the @cds.search annotation to do so. The general usage is:

```cds
@cds.search: {
    element1,         // included
    element2 : true,  // included
    element3 : false, // excluded
    assoc1,           // extend to searchable elements in target entity
    assoc2.elementA   // extend to a specific element in target entity
}
entity E { }
```

----

Override the fuzziness for elements, using the @Search.fuzzinessThreshold annotation:

```cds
entity Books {
   @Search.fuzzinessThreshold: 0.7
   title : String;
}
```

The relevance of a search match depends on the weight of the element causing the match. By default, all searchable elements have equal weight. To adjust the weight of an element, use the @Search.ranking annotation. Allowed values are HIGH, MEDIUM (default), and LOW:

```cds
entity Books {
   @Search.ranking: HIGH
   title         : String;

   @Search.ranking: LOW
   publisherName : String;
}
```

Wildcards in search terms

When using wildcards in search terms, an exact pattern search is performed. Supported wildcards are '*' matching zero or more characters and '?' matching a single character. You can escape wildcards using '\'.

----

Reliable Pagination -> Its like cursor based pagination

>   Note: This feature is available only for OData V4 endpoints.

Using a numeric skip token based on the values of $skip and $top can result in duplicate or missing rows if the entity set is modified between the calls. Reliable Pagination avoids this inconsistency by generating a skip token based on the values of the last row of a page.

The reliable pagination is available with following limitations:

    Results of functions or arithmetic expressions can't be used in the $orderby option (explicit ordering).
    The elements used in the $orderby of the request must be of simple type.
    All elements used in $orderby must also be included in the $select option, if it's set.
    Complex concatenations of result sets aren't supported.

Warning

Don't use reliable pagination if an entity set is sorted by elements that contain sensitive information, the skip token could reveal the values of these elements.

The feature can be enabled with the following configuration options set to true:

    Java: cds.query.limit.reliablePaging.enabled
    Node.js: cds.query.limit.reliablePaging


----











