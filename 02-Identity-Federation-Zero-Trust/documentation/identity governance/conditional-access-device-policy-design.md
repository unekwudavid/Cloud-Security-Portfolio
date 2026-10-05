# Conditional Access Device Policy Design — MI Expense Portal

## 1. Objective

Design a device-compliance Conditional Access policy for the MI Expense Portal as part of the Mustard Innovations Zero Trust architecture.

The policy is intended to ensure that access to the application considers device security posture in addition to user authentication, application assignment, and application-level authorization.

## 2. Proposed Policy

| Setting              | Proposed configuration                   |
| -------------------- | ---------------------------------------- |
| Policy name          | CA-MI-Require-Compliant-Device-Pilot     |
| Scope                | Dedicated pilot group                    |
| Target resource      | MI Expense Portal                        |
| Device platforms     | All platforms initially                  |
| Grant control        | Require device to be marked as compliant |
| Initial policy state | Report-only                              |
| Enforcement          | Deferred pending validation and approval |

## 3. Prerequisites

* Microsoft Entra ID P1 or P2 licensing.
* Appropriate Intune licensing and device-management capability.
* An Intune compliance policy defining the required device baseline.
* At least one enrolled and compliant test device.
* A dedicated pilot group.
* Emergency access arrangements reviewed before enforcement.

## 4. Expected Security Behaviour

The policy is designed to restrict access when a device does not provide the required compliance signal.

A compliant device does not independently grant access. The user must also satisfy the application's assignment, authentication, and authorization requirements.

## 5. Validation Matrix

| Test ID | Scenario                                        | Expected result                                    |
| ------- | ----------------------------------------------- | -------------------------------------------------- |
| TC-01   | Compliant device and authorised user            | Access granted                                     |
| TC-02   | Registered but unmanaged device                 | Access denied                                      |
| TC-03   | Managed but noncompliant device                 | Access denied                                      |
| TC-04   | Unknown or unregistered device                  | Access denied                                      |
| TC-05   | Compliant device, unassigned user               | Access denied                                      |
| TC-06   | Compliant device, insufficient application role | Access denied                                      |
| TC-07   | Compliant device, authorised user               | Access granted                                     |
| TC-08   | Report-only policy evaluation                   | Result recorded without enforcement by this policy |

## 6. Deployment Safety

The policy must remain in report-only mode during initial validation.

Before enforcement:

1. Confirm licensing.
2. Confirm the compliance policy is configured.
3. Confirm a compliant test device is available.
4. Review report-only sign-in results.
5. Verify that the pilot group and application scope are correct.
6. Confirm emergency access arrangements.
7. Obtain approval before enabling enforcement.

## 7. Current Limitations

The Entra ID P2 trial has expired, and the tenant currently contains one unmanaged, Entra-registered device.

Live device-compliance enforcement has therefore not been implemented or validated.

The policy described here is a proposed design, not an operational control.

## 8. Evidence

* Existing Conditional Access policy inventory.
* Device inventory assessment.
* Future policy configuration screenshot.
* Future report-only sign-in results.
* Future compliant and noncompliant device test evidence.

## 9. Conclusion

The proposed policy extends the MI Expense Portal's existing identity and application authorization controls with device-based access requirements.

Implementation will proceed after licensing, endpoint-management readiness, and pilot validation have been confirmed.
