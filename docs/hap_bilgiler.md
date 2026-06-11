```
entity Foo { //...
  managed   : Timestamp @cds.on.insert: $now;
  defaulted : Timestamp default $now;
}
```

While both behave identical for database-level INSERTs, they differ for CREATE requests on higher-level service providers: Values for managed in the request payload will be ignored, while provided values for default will be written to the database.



