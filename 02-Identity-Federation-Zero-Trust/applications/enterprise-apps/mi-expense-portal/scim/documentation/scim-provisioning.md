# SCIM 2.0 Provisioning & Identity Lifecycle

## Overview

The MI Expense Portal implements a custom **SCIM 2.0 provisioning API** that integrates with **Microsoft Entra ID** to automate the identity lifecycle of users and groups in an external enterprise application.

The implementation demonstrates how an Identity Provider (Microsoft Entra ID) can provision, update, and deprovision identities in a third-party application using the **System for Cross-domain Identity Management (SCIM) 2.0** standard.

The implementation was intentionally built from the ground up rather than using a pre-built gallery connector.

### Capabilities Implemented

* SCIM 2.0 User provisioning
* SCIM User lookup
* SCIM User filtering
* SCIM identity matching
* SCIM PATCH updates
* User deprovisioning
* User reprovisioning
* Group provisioning
* Group membership management
* Bearer-token authentication
* SCIM ServiceProviderConfig
* Microsoft Entra Provision on Demand
* Joiner-Mover-Leaver lifecycle testing
* HTTPS exposure through Cloudflare Tunnel
* End-to-end provisioning validation
* Error handling and troubleshooting

---

# Architecture

```text
                     Microsoft Entra ID
                           │
                           │ SCIM 2.0
                           │ HTTPS
                           ▼
                Cloudflare Quick Tunnel
                           │
                           ▼
                  MI Expense Portal
                   Node.js / Express
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       SCIM Authentication          SCIM REST API
        Bearer Token               Users / Groups
             │                           │
             └─────────────┬─────────────┘
                           ▼
                    SCIM Data Store
                     (Lab / In-Memory)
```

Microsoft Entra acts as the **SCIM client** and the MI Expense Portal acts as the **SCIM service provider / target application**.

The integration follows the standard SCIM lifecycle model:

```text
Joiner  →  Create target identity
Mover   →  Match existing identity + update attributes
Leaver  →  Deprovision target identity
```

---

# Technology Stack

| Component             | Technology                          |
| --------------------- | ----------------------------------- |
| Identity Provider     | Microsoft Entra ID                  |
| Provisioning Protocol | SCIM 2.0                            |
| Application           | MI Expense Portal                   |
| Backend               | Node.js                             |
| Framework             | Express.js                          |
| Authentication        | Bearer Token                        |
| Public HTTPS          | Cloudflare Quick Tunnel             |
| Testing               | PowerShell / Invoke-RestMethod      |
| Lifecycle Testing     | Microsoft Entra Provision on Demand |
| Target Store          | In-memory JavaScript store          |

---

# Implementation Structure

The SCIM implementation is organized into dedicated modules:

```text
mi-expense-portal/
│
├── middleware/
│   └── scimAuth.js
│
├── scim/
│   ├── users.js
│   ├── groups.js
│   ├── store.js
│   └── serviceProviderConfig.js
│
├── .env
├── .gitignore
└── app.js
```

### Responsibilities

**`middleware/scimAuth.js`**

Handles authentication for SCIM requests.

**`scim/users.js`**

Implements SCIM User creation, retrieval, filtering, and PATCH operations.

**`scim/groups.js`**

Implements SCIM Group creation, retrieval, and membership management.

**`scim/store.js`**

Provides the target application's identity store.

**`scim/serviceProviderConfig.js`**

Advertises the SCIM capabilities supported by the application.

**`app.js`**

Registers the SCIM routes and authentication middleware.

---

# SCIM Base Endpoint

The SCIM API is exposed under:

```text
/scim/v2
```

Available resources include:

```text
/scim/v2/Users
/scim/v2/Groups
/scim/v2/ServiceProviderConfig
```

During development, the local API runs on:

```text
http://localhost:3000
```

Cloudflare Quick Tunnel provides temporary HTTPS access for Microsoft Entra:

```text
https://<temporary-tunnel>/scim/v2
```

The Quick Tunnel URL changes when the tunnel is restarted.

For production, the application should use a stable HTTPS endpoint and persistent DNS.

---

# SCIM Authentication

All SCIM endpoints are protected using a bearer token.

The secret is stored in `.env`:

```text
SCIM_BEARER_TOKEN=<secret>
```

The `.env` file is excluded from source control.

Requests must contain:

```http
Authorization: Bearer <token>
```

The authentication middleware validates:

1. Authorization header exists.
2. Authentication scheme is `Bearer`.
3. Token exists.
4. Server-side token is configured.
5. Supplied token matches the configured token.
6. Token comparison is performed using `crypto.timingSafeEqual()`.

Invalid authentication returns:

```http
401 Unauthorized
```

Example:

```json
{
  "schemas": [
    "urn:ietf:params:scim:api:messages:2.0:Error"
  ],
  "detail": "Invalid bearer token.",
  "status": "401"
}
```

The bearer token is suitable for this development/lab implementation. A production implementation should use stronger credential management and OAuth-based authentication where supported.

---

# SCIM User API

The application implements the following User operations:

| Method | Endpoint                    | Purpose                |
| ------ | --------------------------- | ---------------------- |
| POST   | `/scim/v2/Users`            | Create user            |
| GET    | `/scim/v2/Users`            | List users             |
| GET    | `/scim/v2/Users?filter=...` | Find matching users    |
| GET    | `/scim/v2/Users/{id}`       | Retrieve specific user |
| PATCH  | `/scim/v2/Users/{id}`       | Update existing user   |

---

# User Provisioning — Joiner

When a new user is assigned to the enterprise application and falls within the provisioning scope, Microsoft Entra sends a SCIM create request.

```http
POST /scim/v2/Users
```

The API validates the required `userName` attribute.

Duplicate users are rejected:

```http
409 Conflict
```

Successful creation returns:

```http
201 Created
```

A target-side SCIM ID is generated using:

```javascript
crypto.randomUUID()
```

The target resource contains:

```text
id
externalId
userName
displayName
active
name
title
emails
phoneNumbers
addresses
preferredLanguage
enterpriseExtension
meta
schemas
```

---

# SCIM User Schema

The implementation supports the SCIM Core User schema:

```text
urn:ietf:params:scim:schemas:core:2.0:User
```

and Enterprise User extension:

```text
urn:ietf:params:scim:schemas:extension:enterprise:2.0:User
```

Enterprise attributes include:

```text
employeeNumber
department
manager
```

Example target resource:

```json
{
  "id": "a6ca3b83-2236-486d-bee1-dd7c9b0504da",
  "externalId": "isabella.martinez",
  "userName": "isabella.martinez@daveshub.onmicrosoft.com",
  "displayName": "Isabella Martinez",
  "active": true,
  "title": "IAM Engineer",
  "enterpriseExtension": {
    "employeeNumber": "MI-0011",
    "department": "Engineering",
    "manager": null
  }
}
```

---

# Microsoft Entra Attribute Mapping

The application receives identity information from Microsoft Entra through SCIM attribute mappings.

| Entra Source               | SCIM Target                               |
| -------------------------- | ----------------------------------------- |
| `userPrincipalName`        | `userName`                                |
| `mailNickname`             | `externalId`                              |
| `displayName`              | `displayName`                             |
| `givenName`                | `name.givenName`                          |
| `surname`                  | `name.familyName`                         |
| `Join(givenName, surname)` | `name.formatted`                          |
| `jobTitle`                 | `title`                                   |
| `employeeId`               | `enterpriseExtension.employeeNumber`      |
| `department`               | `enterpriseExtension.department`          |
| `manager`                  | `enterpriseExtension.manager`             |
| `mail`                     | `emails[type eq "work"].value`            |
| `mobile`                   | `phoneNumbers[type eq "mobile"].value`    |
| `telephoneNumber`          | `phoneNumbers[type eq "work"].value`      |
| `country`                  | `addresses[type eq "work"].country`       |
| `state`                    | `addresses[type eq "work"].region`        |
| `city`                     | `addresses[type eq "work"].locality`      |
| `postalCode`               | `addresses[type eq "work"].postalCode`    |
| `streetAddress`            | `addresses[type eq "work"].streetAddress` |
| `preferredLanguage`        | `preferredLanguage`                       |
| `IsSoftDeleted`            | `active`                                  |

This allows changes made to an employee in Entra to propagate to the external application.

---

# SCIM Filtering & Identity Matching

Filtering became one of the most important parts of the implementation.

Microsoft Entra must be able to determine whether a target identity already exists before deciding whether to create or update it.

The API therefore supports:

```text
userName eq "value"
```

and:

```text
externalId eq "value"
```

Example:

```http
GET /scim/v2/Users?filter=userName eq "isabella.martinez@daveshub.onmicrosoft.com"
```

The API returns:

```json
{
  "schemas": [
    "urn:ietf:params:scim:api:messages:2.0:ListResponse"
  ],
  "totalResults": 1,
  "Resources": [
    {
      "id": "a6ca3b83-2236-486d-bee1-dd7c9b0504da",
      "externalId": "isabella.martinez",
      "userName": "isabella.martinez@daveshub.onmicrosoft.com"
    }
  ]
}
```

A nonexistent identity returns:

```json
{
  "schemas": [
    "urn:ietf:params:scim:api:messages:2.0:ListResponse"
  ],
  "totalResults": 0,
  "Resources": []
}
```

### Why this matters

Without filtering, Microsoft Entra cannot reliably perform the target matching operation.

The initial implementation ignored the `filter` parameter and returned all users. This caused the Mover workflow to fail.

The endpoint was subsequently modified to:

1. Read `req.query.filter`.
2. Parse SCIM equality expressions.
3. Identify the matching attribute.
4. Compare the requested value against stored resources.
5. Return only matching resources.
6. Return an empty ListResponse when no resource matches.
7. Reject unsupported filter syntax with a SCIM error.

This was the key fix that allowed the genuine Mover operation to succeed.

---

# Mover Lifecycle

A Mover represents a change to an existing identity.

Examples include:

* Department transfer
* Job title change
* Manager change
* Location change
* Employee ID change
* Other mapped identity attributes

The expected SCIM flow is:

```text
Microsoft Entra
      │
      │ Attribute change
      ▼
Provision on Demand
      │
      ▼
SCIM matching request
      │
      │ GET /Users?filter=...
      ▼
Existing target resource found
      │
      ▼
PATCH /Users/{existing-id}
      │
      ▼
Target resource updated
```

---

# Mover Validation

The test identity was:

```text
isabella.martinez@daveshub.onmicrosoft.com
```

Existing target resource:

```text
SCIM ID:
a6ca3b83-2236-486d-bee1-dd7c9b0504da

externalId:
isabella.martinez

employeeNumber:
MI-0011
```

The source identity was modified.

### Previous values

```text
Department:
Security Engineering

Job Title:
IAM Engineering
```

### New values

```text
Department:
Engineering

Job Title:
IAM Engineer
```

Microsoft Entra Provision on Demand was then executed.

The result was:

```text
Modified attributes (successful)

User 'isabella.martinez@daveshub.onmicrosoft.com'
was updated in customappsso
```

Modified attributes included:

```text
title → IAM Engineer

department → Engineering

employeeNumber → MI-0011
```

This confirms that the target identity was **updated rather than recreated**.

The SCIM target ID remained associated with the existing resource.

This is the critical evidence that the application supports a genuine Mover lifecycle.

---

# SCIM PATCH

Existing target users are updated through:

```http
PATCH /scim/v2/Users/{id}
```

Supported operations include:

```text
replace
add
```

Example:

```json
{
  "schemas": [
    "urn:ietf:params:scim:schemas:core:2.0:PatchOp"
  ],
  "Operations": [
    {
      "op": "Replace",
      "path": "title",
      "value": "IAM Engineer"
    },
    {
      "op": "Replace",
      "path": "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:department",
      "value": "Engineering"
    }
  ]
}
```

The API:

1. Locates the existing target resource.
2. Validates the PATCH request.
3. Parses the SCIM operations.
4. Applies the requested attribute changes.
5. Updates `meta.lastModified`.
6. Returns the updated resource.

Successful PATCH:

```http
200 OK
```

Unknown target:

```http
404 Not Found
```

---

# Leaver / Deprovisioning

The Leaver lifecycle was validated by disabling an Entra identity.

Test identity:

```text
isabella.martinez@daveshub.onmicrosoft.com
```

After the account was disabled, Microsoft Entra Provision on Demand reported:

```text
IsActive = False
Assigned to application = True
IsInProvisioningScope = True
SkipReason = NotEffectivelyEntitled
```

The target SCIM resource was subsequently deprovisioned.

A GET request to:

```http
GET /scim/v2/Users
```

returned:

```json
{
  "totalResults": 0,
  "Resources": []
}
```

This demonstrated that disabling the source identity resulted in removal/deprovisioning of the corresponding target identity.

---

# Reprovisioning

After the Leaver test, the identity was re-enabled in Microsoft Entra.

Microsoft Entra subsequently provisioned the user again.

The target resource was recreated with:

```text
active: true
employeeNumber: MI-0011
userName: isabella.martinez@daveshub.onmicrosoft.com
```

This demonstrated the complete:

```text
Joiner → Mover → Leaver → Reprovision
```

lifecycle.

---

# Group Provisioning

The application also implements SCIM Groups.

Supported operations include:

```http
POST  /scim/v2/Groups
GET   /scim/v2/Groups
GET   /scim/v2/Groups/{id}
PATCH /scim/v2/Groups/{id}
```

Group functionality includes:

* Group creation
* Duplicate detection
* Group retrieval
* Member addition
* Member removal

Group membership is represented using the SCIM `members` collection.

---

# Group Membership Testing

A user was added to a target SCIM group using PATCH.

The resulting group was retrieved using:

```http
GET /scim/v2/Groups/{id}
```

and the user's SCIM resource ID was present in:

```json
"members": [
  {
    "value": "USER_SCIM_ID"
  }
]
```

Membership removal was also tested.

The initial implementation had an issue parsing:

```text
members[value eq "USER_ID"]
```

The membership path handling was corrected.

After the fix, the group returned:

```json
"members": []
```

This confirmed the target state after the operation rather than relying only on the HTTP response.

---

# ServiceProviderConfig

The application exposes:

```http
GET /scim/v2/ServiceProviderConfig
```

The endpoint advertises the capabilities supported by the SCIM service.

Current capabilities include:

```text
PATCH supported: true
Bulk supported: false
Filter supported: true
Change password supported: false
Sort supported: false
ETag supported: false
Bearer authentication supported
```

This allows the provisioning client to determine the capabilities of the SCIM service.

---

# Error Handling

The API implements SCIM-style error responses.

### Missing userName

```http
400 Bad Request
```

### Duplicate user

```http
409 Conflict
```

### User not found

```http
404 Not Found
```

### Missing authentication

```http
401 Unauthorized
```

### Invalid authentication

```http
401 Unauthorized
```

### Unsupported filter

```http
400 Bad Request
```

### Missing SCIM authentication configuration

```http
500 Internal Server Error
```

Errors use the SCIM error schema:

```text
urn:ietf:params:scim:api:messages:2.0:Error
```

---

# Testing & Validation

The implementation was tested at multiple levels.

## Authentication

```text
Valid bearer token      → 200
Invalid bearer token    → 401
Missing bearer token    → 401
```

## User lifecycle

```text
Create user             → 201
Duplicate user          → 409
Get existing user       → 200
Get nonexistent user    → 404
Filter existing user    → 200 / 1 result
Filter nonexistent     → 200 / 0 results
PATCH existing user     → 200
```

## Group lifecycle

```text
Create group            → 201
Duplicate group         → 409
Get group               → 200
Add member              → Successful
Remove member           → Successful
Verify membership       → Successful
```

## Entra lifecycle

```text
Joiner                   → Successful
Mover                    → Successful
Leaver                   → Successful
Reprovisioning           → Successful
```

---

# Troubleshooting Performed

## 1. Windows PowerShell / Graph issue

The broader project initially encountered PowerShell/Microsoft Graph module compatibility issues.

The environment was eventually standardized on:

```text
PowerShell 7.6.3
Microsoft Graph PowerShell
```

with successful Entra authentication.

---

## 2. SCIM authentication issue

The SCIM bearer token was initially unavailable in the PowerShell session, resulting in:

```text
401 Invalid Authorization header
```

The token was reloaded from `.env` without exposing the secret.

Authentication then succeeded.

---

## 3. Cloudflare Tunnel failures

Quick Tunnel URLs changed between sessions.

Observed problems included:

```text
Cloudflare 1033
No such host is known
Connection forcibly closed
```

The issue was isolated to the temporary public tunnel rather than the local SCIM application.

The local API was tested independently before validating the public endpoint.

---

## 4. SCIM filtering issue

The most important SCIM compatibility issue was that `/Users` initially ignored:

```text
?filter=...
```

This prevented reliable target matching for Mover operations.

The endpoint was enhanced to support:

```text
userName eq "..."
externalId eq "..."
```

After this change:

```text
Existing user filter → 1 result
Nonexistent user filter → 0 results
```

and the Entra Mover operation succeeded.

---

## 5. Group membership removal

The initial group PATCH implementation did not correctly process:

```text
members[value eq "USER_ID"]
```

The parsing logic was corrected and membership removal was subsequently verified with a GET request.

---

# Security Considerations

The implementation includes several security controls.

### Bearer authentication

All SCIM endpoints require authentication.

### Secret isolation

The bearer token is stored in `.env` and excluded from Git.

### Constant-time comparison

Token comparison uses:

```javascript
crypto.timingSafeEqual()
```

### HTTPS

Microsoft Entra communicates with the SCIM API over HTTPS through Cloudflare Tunnel.

### Fail-closed authentication

Invalid credentials do not reach the SCIM handlers.

### Input validation

Required SCIM attributes and supported operations are validated.

### Explicit unsupported filters

Unsupported filtering syntax returns an error rather than silently returning incorrect resources.

---

# Development Limitations

This implementation is intentionally a portfolio/lab implementation.

## In-memory storage

The target identity store is currently in memory.

Restarting Node.js clears the target resources.

A production implementation should use persistent storage such as:

```text
Azure SQL
PostgreSQL
Cosmos DB
MongoDB
```

## Temporary HTTPS

Cloudflare Quick Tunnel provides temporary public connectivity.

Production deployment should use a stable HTTPS endpoint and DNS.

## Authentication

The current bearer-token model is appropriate for demonstrating SCIM integration.

Production should consider OAuth 2.0 client credentials or other supported enterprise authentication mechanisms.

## Protocol coverage

The implementation focuses on the SCIM capabilities required for the Entra lifecycle demonstration.

Additional SCIM discovery resources such as:

```text
/Schemas
/ResourceTypes
```

can be implemented for broader protocol coverage.

---

# Evidence

The following screenshots should be retained as implementation evidence:

```text
screenshots/scim/
├── 45-isabella-disabled-in-entra.png
├── 46-isabella-scim-deprovisioned.png
├── 50-isabella-mover-source-engineering.png
├── 51-entra-mover-patch-success.png
├── 52-isabella-mover-target-verification.png
├── 53-scim-filter-existing-user.png
├── 54-scim-filter-no-match.png
├── 55-scim-service-provider-config.png
├── 56-scim-authentication-test.png
├── 57-scim-group-membership-add.png
└── 58-scim-group-membership-remove.png
```

### Most important evidence

`51-entra-mover-patch-success.png`

This demonstrates:

```text
Modified attributes (successful)
```

and:

```text
User was updated in customappsso
```

which provides direct evidence that the target identity was updated rather than recreated.

---

# Final SCIM Lifecycle

The completed implementation demonstrates:

```text
                         Microsoft Entra ID
                                │
                                ▼
                       Application Assignment
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
              JOINER                         Existing
                 │                           Identity
                 ▼                             │
          POST /Users                         │
                 │                             │
                 ▼                             ▼
        Target User Created            SCIM Matching
                                              │
                                              ▼
                                    GET /Users?filter=...
                                              │
                                              ▼
                                     Existing User Found
                                              │
                                              ▼
                                      PATCH /Users/{id}
                                              │
                                              ▼
                                           MOVER
                                              │
                                              ▼
                                     Attributes Updated
                                              │
                                              ▼
                                      Source Disabled
                                              │
                                              ▼
                                           LEAVER
                                              │
                                              ▼
                                    Target Deprovisioned
```

## Implementation Result

The MI Expense Portal now demonstrates a working custom SCIM 2.0 integration with Microsoft Entra ID supporting:

* **Joiner provisioning**
* **SCIM identity matching**
* **Mover attribute synchronization**
* **Leaver deprovisioning**
* **Reprovisioning**
* **User filtering**
* **PATCH-based updates**
* **Group provisioning**
* **Group membership management**
* **Bearer-token authentication**
* **SCIM capability discovery**
* **Provision on Demand testing**
* **HTTPS-based external provisioning**
* **End-to-end lifecycle validation**

The implementation demonstrates practical IAM engineering across the identity-provider, provisioning-protocol, API, authentication, lifecycle, and troubleshooting layers.
