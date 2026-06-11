Here's the full ERD for FleetNexus, then I'll walk you through the complete learning path.Now the use cases — actions and events the system needs to handle:

**Actions (synchronous, user-initiated)**

- `AssignDriver` — assign a driver to a vehicle for a time window; must validate no overlap, no active critical maintenance on the vehicle
- `UnassignDriver` — end an active assignment early
- `ScheduleMaintenance` — create a maintenance record with severity and scheduled date
- `CompleteMaintenance` — close out a maintenance record, set vehicle status back to available
- `EscalateMaintenance` — upgrade severity from `low/medium` to `critical`
- `AcknowledgeAlert` — mark an alert as seen by a user
- `OnboardTenant` — provision a new tenant (admin-only action)
- `DeactivateVehicle` / `ReactivateVehicle` — fleet manager lifecycle ops
- `RenewLicense` — update driver license expiry

**Events (asynchronous, system-emitted)**

- `VehicleMarkedCritical` → triggers `Alert` creation + blocks assignments
- `MaintenanceCompleted` → emits event downstream (e.g. procurement in S/4HANA)
- `LicenseExpiringSoon` → 30-day warning alert for a driver's license
- `AssignmentConflictDetected` → emitted if a scheduling collision is attempted
- `TenantProvisioned` → post-onboarding event for downstream services (email, billing)
- `AlertAcknowledged` → audit trail entry

---

## Learning path — phase by phase

The goal here is **progressive exposure**: each phase introduces one new CAP concept, building on the last. Don't jump ahead.

---

### Phase 1 — project scaffolding

Use `cds init` to generate the project structure. Understand what each generated folder and file does before writing any code. Pay attention to `package.json` — specifically the `cds` key. This is your runtime configuration.

Goal: be comfortable with `cds watch` and know what a `.cds` file is versus a `.js` handler file.

---

### Phase 2 — data modeling with CDS

Start with only three entities: `Tenant`, `Vehicle`, and `Driver`. Do not model everything at once.

Learn how the `managed` aspect works — notice you get `createdAt`, `createdBy`, `modifiedAt`, `modifiedBy` for free. Understand why this is "declarative over imperative."

Then model the `Tenant` isolation pattern: every entity except `Tenant` itself should have a `tenant_id` field. Don't wire up multi-tenancy automation yet — just understand the data shape.

Introduce associations (`to one`, `to many`) between entities and run `cds compile --to sql` to see what SQL your model generates. This is how you build intuition for what CDS actually does under the hood.

Goal: understand entities, types, aspects, associations, and compositions before touching services.

---

### Phase 3 — service layer basics

Define a `VehicleService` that exposes your `Vehicle` entity. Use `@readonly` and `@insertonly` to practice restricting operations declaratively.

At this point you have a working OData API with zero handler code. Test it with the built-in `cds serve` Fiori preview or with a REST client.

Then add your first custom action: `EscalateMaintenance`. Define it in the `.cds` file as an `action`, then implement the handler in a `.js` file. Understand the difference between a `function` (safe, read-only) and an `action` (mutating) in CDS terms.

Goal: understand the service–handler split. CDS owns the interface definition; your handler owns the business logic.

---

### Phase 4 — events and messaging

Add the `MaintenanceRecord` entity and the `VehicleMarkedCritical` event. Define it as a `event` in CDS.

Implement a `before CREATE` hook on `Assignment` that checks whether the vehicle has any `CRITICAL` maintenance records. If so, reject the request with a meaningful error using `req.error()`. This is your first taste of validation hooks.

Then emit `VehicleMarkedCritical` from your `CompleteMaintenance` action and write a subscriber handler. For local development, the CAP in-memory event mechanism works without SAP Event Mesh — save Mesh integration for phase 7.

Goal: understand `emit`, `on`, `before`, and `after` hooks and when to use each.

---

### Phase 5 — multi-tenancy

This is the core enterprise pattern. Read the CAP multi-tenancy documentation before writing any code.

Enable the `@sap/cds-mtxs` extension. Add `"multiTenant": true` to your `cds` config. Understand what changes: every database operation now runs in a tenant-scoped schema. The `req.tenant` property becomes available in every handler.

Add a `TenantService` with the `SubscribeAction` and `UnsubscribeAction` lifecycle hooks. Practice calling the provisioning endpoint manually. Deploy to BTP with two different subaccounts and verify data isolation — this is the test that makes multi-tenancy real.

Goal: understand tenant isolation at the schema level, and that the `managed` tenant context flows automatically through `req.tenant`.

---

### Phase 6 — Fiori annotations and draft handling

Add `@UI.LineItem`, `@UI.FieldGroup`, and `@UI.Facets` annotations directly inside your CDS service definitions. Run the Fiori Elements preview (`cds watch` + `/fiori.html`) and watch a working UI appear with no frontend code.

Then enable Draft for the `MaintenanceRecord` entity using `annotate with @odata.draft.enabled`. Understand what drafts mean operationally: users can start editing a record without locking it for others, and CAP manages the shadow tables automatically.

Goal: understand that annotations are metadata, not code — and that Fiori Elements reads that metadata to generate UI at runtime.

---

### Phase 7 — RBAC with XSUAA

Add the `xs-security.json` file with scopes: `FleetManager`, `Driver`, `Technician`, `Admin`. Map these to CDS roles using `@requires` annotations on your service and entity definitions.

Connect to a BTP XSUAA service instance. Use `@restrict` with conditions like `$user.tenant = TenantID` to enforce row-level tenant access at the framework level rather than in handler code.

Test with JWT tokens carrying different scopes. Verify that a `Driver` role cannot call `EscalateMaintenance`.

Goal: understand the difference between authentication (who you are) and authorization (what you can do), and that CAP enforces authorization declaratively before your handler code even runs.

---

### Phase 8 — SAP Event Mesh integration

Replace the in-memory event bus from phase 4 with SAP Event Mesh. Bind the Event Mesh service instance to your app in `mta.yaml`.

Configure the `cds.requires.messaging` section in your `package.json`. Verify that `VehicleMarkedCritical` now flows through a real message broker and can be consumed by a separate microservice (e.g. a future `ProcurementService`).

Goal: understand the topology — CAP abstracts the broker, so your handler code doesn't change, only the configuration does.

---

### Phase 9 — observability and structured logging

Implement a `before *` generic hook that logs every incoming request with `tenant`, `user`, `entity`, `action`, and `timestamp`. Write to a structured JSON log (not `console.log`).

Add the `@sap/cds-audit-logging` package and annotate sensitive entities with `@AuditLog.Operation`. Verify that the `AUDIT_LOG` table is being populated automatically for data access and mutation events.

Configure Application Logging Service on BTP and confirm logs appear in the log viewer with correlation IDs.

Goal: understand that cross-cutting concerns (logging, auditing) belong in middleware and annotations — not scattered across individual handlers.

---

### Phase 10 — CI/CD and deployment

Write a `mta.yaml` that describes all modules: the CAP app, the HANA Cloud database, the Event Mesh binding, the XSUAA binding, and the Application Logging binding.

Set up a GitHub Actions pipeline that runs `cds build`, `mbt build`, and `cf deploy` on merge to `main`. Add a `cds lint` step and a unit test step using `@sap/cds/test` utilities.

Practice blue-green deployment in Cloud Foundry so you can deploy without downtime.

Goal: the project should be deployable end-to-end from a single `git push` with no manual steps.

---

Each phase answers one question: *what does CAP give me for free, and where do I write my own logic?* By the time you finish phase 10 you'll have answered that question at every layer of the stack.
