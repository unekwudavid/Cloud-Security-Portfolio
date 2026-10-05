# Intune Device Compliance Baseline — Mustard Innovations

## 1. Purpose

This document defines the proposed endpoint compliance requirements for the Mustard Innovations Zero Trust architecture.

The baseline will provide a consistent method for evaluating device security posture before a device is considered eligible for access to protected corporate applications.

## 2. Scope

Initial scope:

* Windows pilot devices
* MI Expense Portal access
* Devices enrolled in the approved endpoint-management platform

Additional operating systems may be incorporated after the initial pilot has been validated.

## 3. Proposed Compliance Requirements

| Control           | Requirement                     | Security objective                       |
| ----------------- | ------------------------------- | ---------------------------------------- |
| Encryption        | System drive encryption enabled | Protect data at rest                     |
| Secure Boot       | Enabled on supported devices    | Protect the boot process                 |
| Antivirus         | Active and healthy              | Reduce malware exposure                  |
| Firewall          | Enabled                         | Reduce unauthorised network access       |
| Operating system  | Supported version               | Reduce exposure to known vulnerabilities |
| Device management | Enrolled and reporting          | Establish central compliance visibility  |

## 4. Compliance States

### Compliant

The device satisfies all applicable requirements and reports a healthy compliance state.

### Noncompliant

The device fails one or more applicable requirements.

### Unknown or Not Evaluated

The device has not completed evaluation or is not reporting a reliable compliance state.

An unknown state must not be treated as proof of compliance.

## 5. Remediation Approach

When a device becomes noncompliant:

1. Identify the failed requirement.
2. Notify the device owner or support team.
3. Investigate the cause.
4. Apply the required remediation.
5. Re-evaluate the device.
6. Confirm compliance before restoring access where Conditional Access enforcement applies.

## 6. Integration with Conditional Access

The proposed Conditional Access policy will require a compliant-device signal for access to the MI Expense Portal.

The device compliance requirement is an additional access condition and does not replace:

* User authentication
* MFA requirements
* Enterprise application assignment
* Group-based application entitlements
* Application-level role authorization

## 7. Current Implementation Constraints

The Entra ID P2 trial has expired, and the tenant currently contains one unmanaged, Entra-registered device.

The availability of the required endpoint-management licensing and capabilities must be confirmed before creating or enforcing a live compliance policy.

No device has been marked compliant as part of this design phase.

## 8. Validation Plan

When the necessary capabilities are available, validate:

1. A fully compliant managed device.
2. A managed device with encryption disabled.
3. A managed device with firewall protection disabled.
4. A device failing the antivirus requirement.
5. A device running an unsupported operating system.
6. A device that stops reporting compliance.
7. Access decisions for compliant and noncompliant devices.
8. Preservation of existing application-role authorization boundaries.

## 9. Security Conclusion

The proposed compliance baseline establishes the device-security requirements needed to support device-aware access governance.

Live enforcement will be implemented only after licensing, device enrollment, compliance reporting, and Conditional Access policy behaviour have been validated.

## 10. Evidence

* Device inventory assessment
* Compliance policy configuration
* Device compliance status
* Remediation test results
* Conditional Access sign-in evaluation
* Successful and denied application access tests
