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

Kinds of Actions

The differentiation between Actions and Functions as well as bound and unbound stems from the OData specifications, and in essence is as follows:

    Actions modify data in the server
    Functions retrieve data
    Unbound actions/functions are like plain unbound functions in JavaScript.
    Bound actions/functions always receive the bound entity's primary key as implicit first argument, similar to this pointers in Java or JavaScript. The exception are bound actions to collections, which are bound against the collection and not a specific instance of the entity. An example use case are custom create actions for the SAP Fiori elements UI.

----



Importing APIs

On the consumer side, like @capire/xtravels in our sample scenario, we import packaged APIs from CAP and non-CAP sources using npm add and cds import respectively.
Packaged APIs

Import packaged APIs provided by CAP service providers like that:

npm add @capire/xflights-data

This makes the exported models with all accompanying artifacts available in the target project's node_modules folder. In addition, it adds a respective package dependency to the consuming application's package.json like this:
xtravels/package.json

{...
  "dependencies": { ...
    "@capire/xflights-data": "0.1.12"
  }
}

This allows us to update imported APIs later on using standard commands like npm update.
OData APIs

You can also cds import APIs from other sources, such as OData APIs for customer data from SAP S/4 HANA systems:

    Get an OData EDMX source, e.g., from SAP Business Accelerator Hub:

    Import that to the current project:

```sh
cds import ~/Downloads/API_BUSINESS_PARTNER.edmx
```

This copies the specified .edmx file into the srv/external/ subfolder of your project, and generates a .csn file with the same basename next to it:

```sh
srv/external
├── API_BUSINESS_PARTNER.csn
└── API_BUSINESS_PARTNER.edmx
```

>   Add option --as cds to generate a human-readable .cds file instead of .csn.

Import from other APIs

You can use cds import in the same way as for OData to import SAP data products, OpenAPI definitions, AsyncAPI definitions, or from ABAP RFC. For example:

```sh
cds import --data-product ...
cds import --odata ...
cds import --openapi ...
cds import --asyncapi ...
cds import --rfc ...
```

----

## Emitters and Receivers

In contrast to the previous code sample, emitters and receivers of events are decoupled, in different services and processes. And as all active things in CAP are services, so are usually emitters and receivers of events. Typical patterns look like that:

```js
class Emitter extends cds.Service { async someMethod() {
  // inform unknown receivers about something happened
  await this.emit ('some event', { some:'payload' })
}}
```

```js
class Receiver extends cds.Service { async init() {
  // connect to and register for events from Emitter
  const Emitter = await cds.connect.to('Emitter')
  Emitter.on ('some event', msg => {...})
}}
```

----

### 1. Use file-based-messaging in Development

For quick tests during development, CAP provides a simple file-based messaging service implementation. Configure that as follows for the [development] profile:

```json
"cds": {
  "requires": {
    "messaging": {
      "[development]": { "kind": "file-based-messaging" }
    },
  }
}
```


----

## Connect to the Messaging Service

Instead of connecting to an emitter service, connect to the messaging service:

```js
const messaging = await cds.connect.to('messaging')
```

Emit Events to Messaging Service

Instead of emitter services emitting to themselves, emit to the messaging service:

```js
await messaging.emit ('ReviewsService.reviewed', { ... })
```

Receive Events from Messaging Service

Instead of registering event handlers with a concrete emitter service, register handlers on the messaging service:

```js
messaging.on ('ReviewsService.reviewed', msg => console.log(msg))
```


Declared Events and @topic Names

When declaring events in CDS models, be aware that the fully qualified name of the event is used as topic names when emitting to message brokers. Based on the following model, the resulting topic name is my.namespace.SomeEventEmitter.SomeEvent.

```cds
namespace my.namespace;
service SomeEventEmitter {
  event SomeEvent { ... }
}
```

If you want to manually define the topic, you can use the @topic annotation:

```cds
//...
@topic: 'some.very.different.topic-name'
event SomeEvent { ... }
```

### Conceptual vs. Low-Level Messaging

When looking at the previous code samples, you see that in contrast to conceptual messaging you need to provide fully qualified event names now. This is just one of the advantages you lose. Have a look at the following list of advantages you have using conceptual messaging and lose with low-level messaging.

- Service-local event names (as already mentioned)
- Event declarations (as they go with individual services)
- Generated typed API classes for declared events
- Run in-process without any messaging service

Always prefer conceptual-level API over low-level API variants.

Besides the things listed above, this allows you to flexibly change topologies, such as starting with co-located services in a single process, and moving single services out to separate micro services later on.

----

## Exists Predicate

In many cases, the authorization of an entity needs to be derived from entities reachable via association path. See domain-driven authorization for more details. You can leverage the exists predicate in where conditions to define filters that directly apply to associated entities defined by an association path:

```cds
service ProjectService @(requires: 'authenticated-user') {
  entity Projects @(restrict: [
     { grant: ['READ', 'WRITE'],
       where: (exists members[userId = $user and role = 'Editor']) } ]) {
    members: Association to many Members; /*...*/
  }
  @readonly entity Members {
    key userId  : User;
    key role: String enum { Viewer; Editor; }; /*...*/
  }
}
```















