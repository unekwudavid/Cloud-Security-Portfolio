# Enterprise Application Governance

## 1. Application Ownership

### Application

**MI Expense Portal**

### Objective

Establish formal ownership of the MI Expense Portal Enterprise Application in Microsoft Entra ID.

### Implementation

The application was assigned a dedicated enterprise application owner using Microsoft Graph PowerShell.

The owner is responsible for organization-specific administration of the Enterprise Application, including configuration areas such as:

- Single sign-on
- Provisioning
- User and group assignments
- Application configuration

### Owner

**David Adama**

### Governance Principle

Enterprise application ownership provides a defined accountability boundary for application administration rather than relying exclusively on tenant-wide administrative roles.

### Verification

Ownership was verified through:

1. Microsoft Graph PowerShell
2. Microsoft Entra admin center

### Evidence

`MI-Expense-Portal-Owner-Assignment.png`

### Security Consideration

Application ownership is scoped to the Enterprise Application rather than granting unrestricted tenant-wide application administration.

A second owner should be assigned where appropriate to reduce the risk of an ownerless application.

## 2. Controlled Application Assignment

### Objective

Require explicit assignment before users can access the MI Expense Portal Enterprise Application.

### Configuration

The Enterprise Application was configured with:

**Assignment required = Yes**

This establishes an explicit entitlement boundary around the application.

### Governance Model

Application access is controlled through dedicated Microsoft Entra security groups:

| Group | Application Role |
|---|---|
| SG-MI-Employees | Employee |
| SG-MI-Managers | Manager |
| SG-MI-Finance | Finance |
| SG-MI-Admins | Admin |

This creates a separation between:

1. Application entitlement
2. Application authorization

### Entitlement

The user must be assigned to the Enterprise Application through an appropriate user/group assignment.

### Authorization

After authentication, the application evaluates the OIDC application-role claim to determine what functionality the user can access.

### Validation

Assigned user:

- Employee endpoint → HTTP 200
- Manager endpoint → HTTP 403

Unassigned user:

- Application access → denied

### Security Principle

Explicit application assignment provides a controlled entitlement boundary and prevents unrestricted application access.

### Evidence

- `MI-Expense-Portal-Assignment-Required.png`
- `MI-Expense-Portal-Governance-Groups.png`
- `MI-Expense-Portal-Unassigned-User-Denied.png`

## 3. Application Permissions and Consent Governance

### Objective

Review the permissions requested and granted to the MI Expense Portal and verify that application access follows the principle of least privilege.

### Permission Model

The application uses OpenID Connect authentication and requests the following delegated scopes during authentication:

- `openid`
- `profile`
- `email`
- `User.Read`

`User.Read` is used to access basic information about the currently authenticated user.

### Application Permissions

The MI Expense Portal does not require broad Microsoft Graph application permissions for its interactive authorization model.

This avoids granting unnecessary background access to organizational resources.

### Consent Governance

The Enterprise Application's Permissions blade was reviewed to identify permissions granted through:

- Administrator consent
- User consent

The App Registration's API permissions configuration was also reviewed to compare requested permissions with granted permissions.

### Governance Principle

Permissions should be granted based on demonstrated application requirements rather than convenience.

Particular attention should be given to application permissions because they can operate without a signed-in user and therefore have a potentially broader security impact.

### Verification

Permissions were reviewed in:

1. Microsoft Entra Enterprise Applications
2. Microsoft Entra App Registrations
3. Microsoft Graph PowerShell

### Evidence

- `MI-Expense-Portal-API-Permissions.png`
- `MI-Expense-Portal-Granted-Permissions.png`

### Legacy Finance Group Reconciliation — Daniel Brooks

**Objective:** Migrate Finance access from a legacy security group to the standardized `SG-MI-Finance` group while preserving the user's authorized access.

**Implementation:**

* Identified Daniel Brooks as the member of the legacy `SG-Finance` group.
* Added Daniel to `SG-MI-Finance`.
* Verified that the new group was assigned the Finance application role.
* Removed the legacy `SG-Finance` application-role assignment.
* Confirmed that the new group was the remaining source of Finance entitlement.
* Performed a fresh authentication and tested the Finance authorization endpoint.

**Validation result:**

| Validation                 | Expected                          | Actual     |
| -------------------------- | --------------------------------- | ---------- |
| New group membership       | Daniel belongs to `SG-MI-Finance` | Confirmed  |
| Legacy app-role assignment | Removed                           | Confirmed  |
| Fresh authentication       | Successful                        | Successful |
| Finance authorization      | HTTP 200                          | HTTP 200   |

**Outcome:** Daniel retains Finance access through the standardized group-based entitlement model, with the legacy application-role assignment removed.

**Security significance:** This migration reduces reliance on direct or legacy entitlement paths, improves access governance consistency, and supports centralized access reviews and lifecycle management.

**Status:** Completed.

### MSAL Scope Usage Assessment

A code search of the MI Expense Portal identified two explicit MSAL scope declarations in `routes/auth.js`.

Both request:

* `openid`
* `profile`
* `email`
* `User.Read`

The search did not identify an explicit request for `offline_access` in the application code examined.

The existing delegated consent grant includes `offline_access`, creating a difference between the currently observed scope declarations and the consented scope set.

**Assessment status:** Pending inspection of authentication, session management, and token usage.

No permission or consent changes have been performed.

### Least-Privilege Assessment — MI Expense Portal

**Assessment objective:** Determine whether the application's configured Microsoft Graph permissions and delegated consent grants are appropriate for its implemented functionality.

#### Authentication design

The application uses the OAuth 2.0 Authorization Code Flow through MSAL Node with a confidential client configuration.

The login and callback routes explicitly request:

* `openid`
* `profile`
* `email`
* `User.Read`

#### Microsoft Graph usage

The reviewed Graph route exposes:

`GET /graph/me`

This route calls:

`GET https://graph.microsoft.com/v1.0/me`

The request uses the authenticated user's access token and returns the user's Microsoft Graph profile.

#### Permission assessment

The configured delegated `User.Read` permission aligns with the observed Graph API usage.

No broader Microsoft Graph permission is required by the functionality identified in the reviewed code.

The existing OAuth consent grant has `AllPrincipals` consent and includes:

`openid profile email User.Read offline_access`

The presence of `offline_access` is recorded for further review because it is not explicitly present in the two inspected MSAL scope arrays. Its removal is not recommended without confirming the application's token-cache and refresh-token behaviour.

#### Governance decision

* Retain the configured delegated `User.Read` permission.
* Do not introduce additional Graph permissions without a documented application requirement.
* Retain the existing consent grant pending final token-lifecycle validation.
* Require documented justification and approval for any future permission expansion.
* Reassess application permissions when new Graph functionality is introduced.

**Assessment status:** Least-privilege review completed; final consent decision pending token-lifecycle validation.

**Changes made:** No permission or consent modifications.

### Runtime Validation — Microsoft Graph Least-Privilege Access

**Status:** Completed
**Validation date:** 30/09/2026

The MI Expense Portal was started successfully using `node app.js`. The authenticated `/graph/me` endpoint returned HTTP 200 and successfully retrieved the signed-in user's profile from Microsoft Graph.

This confirms that the application's existing authentication flow, access-token handling, and delegated Microsoft Graph `User.Read` permission work together as expected.

The observed endpoint behavior is consistent with the application's documented use of the Microsoft Graph `/me` resource.

**Validation results:**

* [x] Application starts successfully.
* [x] User authentication completes.
* [x] Access token is available to the authenticated session.
* [x] Microsoft Graph `/me` request succeeds.
* [x] HTTP 200 response received.
* [x] No additional Graph permissions were required for this test.

**Evidence:**

* `MI-Expense-Portal-Graph-Me-HTTP-200.png`

**Security conclusion:** The application has demonstrated successful operation with its existing delegated permission configuration. Permission changes should be based on verified application requirements rather than assumed future needs.
