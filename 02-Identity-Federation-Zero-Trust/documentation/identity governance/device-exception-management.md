# Device Exception Management

## Purpose

This document defines the governance process for handling users who cannot satisfy the organization's device trust requirements when accessing protected applications.

The goal is to prevent unmanaged or non-compliant devices from becoming permanent exceptions to the Zero Trust access model.

---

## Device Trust States

| Device State | Default Decision | Reason |
|---|---|---|
| Managed + Compliant | Allow | Device satisfies organizational security requirements |
| Registered + Unmanaged | Restrict | Device identity exists but organizational controls are not established |
| Managed + Non-Compliant | Deny | Device fails one or more required security controls |
| Unknown / Unregistered | Deny | Device cannot be sufficiently trusted |
| Approved Exception | Temporary Allow | Business-approved exception with compensating controls |

---

## Exception Principles

Exceptions must be:

- Explicitly approved
- Business justified
- Time limited
- Assigned to a specific user or group
- Scoped to a specific application where possible
- Documented
- Reviewed before expiration
- Revoked when no longer required

An exception must not permanently bypass the organization's device trust requirements.

---

## Required Exception Information

Every exception should contain:

- Requestor
- Affected user
- Application
- Device identifier
- Business justification
- Security risk
- Compensating controls
- Approver
- Start date
- Expiration date
- Review date
- Status
- Revocation date
- Revocation reason

---

## Example Exception

### Scenario

An employee needs temporary access to MI Expense Portal from a device that is not yet compliant.

### Decision

Temporary access may be approved only if the business requirement is legitimate and compensating controls are available.

### Compensating Controls

Possible controls include:

- MFA
- Strong authentication
- Restricted application scope
- Short exception duration
- Increased monitoring
- Manual approval
- Immediate revocation after the business requirement ends

---

## Exception Lifecycle

Request
↓
Security Review
↓
Business Approval
↓
Compensating Controls
↓
Temporary Access
↓
Monitoring
↓
Expiration Review
↓
Renew / Revoke
↓
Exception Closed

---

## Security Principle

The exception process must preserve the Zero Trust principle:

"Never trust, always verify."

An exception represents controlled risk acceptance, not permanent removal of security controls.

---

## Current MI Environment

Current validation is limited because:

- Entra ID P2 trial has expired.
- Risk-based Conditional Access policies cannot currently be validated through live enforcement.
- The available test device is Entra registered but unmanaged.
- Intune compliance enforcement has not been deployed.

Therefore, the current implementation validates the governance model and decision logic rather than claiming production enforcement.

---

## Future Enforcement

When appropriate licensing and device-management capabilities are available, the following controls can be implemented:

- Microsoft Intune enrollment
- Device compliance policies
- Conditional Access requiring compliant devices
- Conditional Access exclusion for approved emergency accounts
- Temporary exception groups
- Access review of exception membership
- Exception expiration and removal
- Sign-in monitoring

---

## Validation Matrix

| Scenario | Expected Result | Current Validation |
|---|---|---|
| Compliant managed device | Allow | Design |
| Registered unmanaged device | Restrict | Design |
| Non-compliant managed device | Deny | Design |
| Unknown device | Deny | Design |
| Approved temporary exception | Temporary Allow | Design |
| Expired exception | Revoke | Design |
| Revoked exception | Deny | Design |
