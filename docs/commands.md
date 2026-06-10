```cds
await cds.service.bindings

await SELECT.from `Authors {
    ID, title, book.name as book
}`
```


```sh
cds add data
cds add http
cds add handler

cds repl ./
```
