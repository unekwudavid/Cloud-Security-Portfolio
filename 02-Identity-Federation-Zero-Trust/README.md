# Project 2 - Identity Federation & Zero Trust Platform

![Project 2 hero banner](./preview/project2-hero-preview.svg)

An enterprise identity and application-security project demonstrating how workforce identities in Microsoft Entra ID securely access internal and SaaS applications through federation, modern authentication, provisioning, and Zero Trust controls.

The project extends the identity lifecycle foundation established in Project 1 into the application and authentication layer. It is based on a fictional Mustard Innovations environment and focuses on secure application integration, least privilege, continuous verification, and auditable identity operations.

## 1. Executive Summary

Project 2 implements an enterprise identity federation and Zero Trust platform for Mustard Innovations, with Microsoft Entra ID at the center of access decisions. The solution combines SAML federation, OAuth/OIDC authentication, SCIM provisioning, application RBAC, access governance, and device-aware security controls to demonstrate how modern identity security is designed and operated in practice.

This project is built around the MI Expense Portal and shows how user identity, application assignment, application roles, and device trust work together to enforce least privilege, explicit authorization, and auditable access decisions.

## 2. Project Status

| Area | Status | Notes |
| --- | --- | --- |
| SAML federation | Implemented | Microsoft Entra ID as IdP with SAML assertion validation and role-based authorization |
| OAuth / OIDC | Implemented | Modern app authentication and delegated authorization patterns |
| SCIM provisioning | Implemented | Automated user and group lifecycle provisioning |
| RBAC | Implemented | App roles enforced at the application layer |
| Governance | Implemented | Group-based entitlement model and access reviews |
| PIM | Documented | Privileged access governance model captured in docs |
| Zero Trust / device trust | Design + assessment documented | Device compliance and MDM controls are modeled and documented but constrained by licensing and management status |
| Infrastructure automation | Implemented | Terraform and configuration automation included |

## 3. What I Actually Built

### MI Expense Portal

The primary application in this project is the MI Expense Portal, which demonstrates:

- Microsoft Entra ID as the identity provider
- SAML 2.0 federation for enterprise access
- Application roles for Employee, Manager, Finance, and Admin
- RBAC enforcement at the application layer
- Group-based governance and explicit assignment controls
- Zero Trust alignment through device and access controls

### Core business flow

1. User authenticates to Microsoft Entra ID
2. Application receives identity context and claims
3. Assignment and app role determine entitlement
4. Authorization middleware enforces access boundaries
5. Access is reviewed, monitored, and governed over time

## 4. Architecture

![Project 2 high-level architecture](./diagrams/architecture/project-2-high-level.png)

## 5. Core Capabilities

### OIDC
- Modern authentication with delegated authorization
- Claims-based access decisions
- Secure app integration patterns

![OAuth/OIDC authentication flow](./diagrams/architecture/oauth-oidc-authentication-flow.png)

### SAML
- Enterprise federation for web applications
- Assertion validation and session creation
- Authorization based on app role claims

![SAML implementation architecture](./diagrams/architecture/SAML%20Implementation.png)

### SCIM
- Automated lifecycle provisioning for users and groups
- Reduced manual access administration
- Joiner, mover, and leaver alignment

![SCIM provisioning architecture](./diagrams/architecture/SCIM.png)

### RBAC
- Explicit app assignments
- Role-based authorization at the application layer
- Fail-closed enforcement when claims are missing or invalid

![Application RBAC model](./diagrams/architecture/project-2-high-level.png)

### Governance
- Group-based entitlement model
- Access reviews and remediation
- Application ownership and accountability

![Group-based access governance](./diagrams/architecture/group-based-access-governance.mmd.png)

### PIM
- Privileged access governance documentation
- Least-privilege admin controls

![PIM implementation](./diagrams/architecture/PIM%20Implementation.png)

### Zero Trust
- MFA and risk-aware authentication
- Device compliance and MDM considerations
- Conditional Access alignment and exception governance

![Zero Trust device governance model](./diagrams/architecture/zero-trust/Zero%20trust%20device%20governance%20model.png)

## 6. Security Decisions

The project emphasizes the following design principles:

- **Least privilege:** Access is granted only through explicit entitlement and authorization paths
- **Fail closed:** Missing or unrecognized role claims do not grant access
- **Strong authentication:** MFA and identity risk controls are part of the model
- **Explicit assignments:** Application access is controlled rather than implicitly granted
- **Governed exceptions:** Device exceptions and access exceptions are documented, reviewed, and controlled
- **Auditability:** Identity changes, access decisions, and reviews are designed to be explainable and traceable

## 7. Validation & Evidence

The implementation includes validation for both authentication and authorization:

- Entra app registration and configuration evidence
- SAML assertion and role claim validation
- Successful authentication and denied access responses
- RBAC endpoint validation showing `200` and `403` behavior
- Governance and access review evidence
- Device trust and conditional access assessment artifacts

Example evidence:

![SAML app registration overview](./screenshots/SAML/05-entra-idp-entra-setup.png)

![SAML role claim validation](./screenshots/SAML/07-attribute@claims.png)

![Successful SAML authentication](./screenshots/SAML/08-SAML-authentication-success.png)

![SAML unauthorized access response](./screenshots/SAML/06-manager-403.png)

![SCIM provisioning evidence](./diagrams/architecture/SCIM.png)

## 8. Repository Structure

```text
02-Identity-Federation-Zero-Trust/
├── applications/       Application registrations, enterprise apps, and service principals
├── automation/         PowerShell, configuration, logs, reports, and Terraform automation
├── ci-cd/               CI/CD workflows and GitHub Actions
├── diagrams/            Architecture diagrams and exports
├── documentation/       Requirements, implementation, authentication, and security docs
├── federation/         Identity providers and SAML/OAuth/OIDC federation material
├── infrastructure/      Terraform infrastructure definitions
├── monitoring/          Audit, sign-in, provisioning logs, and detections
├── provisioning/        SCIM provisioning configuration and documentation
├── screenshots/         Implementation and validation evidence
└── security/            Conditional Access and related security controls
```

## 9. Detailed Documentation

This README is intentionally kept to a concise portfolio format. The deeper implementation detail, troubleshooting, and validation notes remain in the dedicated documentation files.

### Architecture and technical references

- [Project Charter](./documentation/Project-Charter.md)
- [Business Requirements](./documentation/Business-Requirements.md)
- [Application Identity Foundation](./documentation/implementation/01-Application-Identity-Foundation.md)
- [OAuth/OIDC Implementation](./documentation/authentication/OAuth/oauth-oidc-implementation.md)
- [SAML Implementation](./documentation/authentication/SAML/01-SAML-Implementation.md)
- [Application RBAC](./documentation/authentication/SAML/02-Application-RBAC.md)
- [Access Reviews](./documentation/security/Access-Review.md)
- [Conditional Access Design](./documentation/security/Conditional-Access-Design.md)
- [Enterprise Application Governance](./documentation/identity%20governance/enterprise-application-governance.md)
- [Privileged Identity Management](./documentation/security/Privileged-Identity-Management(PIM).md)

### Supporting architecture views

![OAuth/OIDC authentication flow](./diagrams/architecture/oauth-oidc-authentication-flow.png)

![Group-based access governance](./diagrams/architecture/group-based-access-governance.mmd.png)

## 10. Project Outcome

This project demonstrates an end-to-end identity federation and Zero Trust capability: Microsoft Entra ID authenticates the workforce identity, the application validates the federation response, application roles determine authorization, and governance and device-aware controls add additional protection around access. The result is a well-governed, least-privilege application integration model that can be extended to additional enterprise and SaaS applications.
