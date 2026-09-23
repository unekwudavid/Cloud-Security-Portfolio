# Group-Based Access Governance: Modernizing Access Control for a Real-World Application

## Executive Summary

This project demonstrates a practical identity and access management modernization effort: moving application access from individual user assignments to a centralized, group-based governance model in Microsoft Entra ID.

The scenario was built around the fictional MI Expense Portal, where users originally received access through direct application-role assignments. That model worked for a small number of users, but it created operational risk, poor scalability, and weaker governance.

The goal was to prove that access can be managed more securely and efficiently by using security groups as the control layer:

- users are assigned to groups
- groups are mapped to application roles
- role claims are consumed by the application during authentication
- access is enforced consistently through least-privilege authorization
- access can be removed quickly and confidently by removing group membership

This approach is important because it reflects how modern organizations manage access at scale: centralized policy, consistent enforcement, and operational control.

---

## Why This Matters

Organizations often start with direct assignments because they are simple to configure. However, as teams grow, this model becomes difficult to manage.

Problems with direct assignment models include:

- inconsistent entitlement reviews
- slower onboarding and offboarding
- manual role cleanup when users change jobs
- increased risk of orphaned access
- difficult audit and governance reporting

The stronger pattern is to separate identity membership from application access. In this approach, a user gains access through a security group that is tied to a business function or role, and that group is mapped to the correct application permission.

---

## Business Outcome

The project shows how to move from:

User → Direct App Role

To:

User → Security Group → App Role → OIDC Role Claim → Application Authorization

This creates a cleaner and more governable access model. It is easier to review, easier to audit, and easier to revoke when employment or responsibilities change.

This is exactly the kind of IAM improvement hiring managers and recruiters want to see: a candidate who understands both security fundamentals and real-world operational governance.

---

## The Solution in Plain English

The MI Expense Portal exposes four application roles:

| Application Role | Purpose |
| --- | --- |
| Employee | Standard user access |
| Manager | Manager-level capabilities |
| Finance | Finance-specific access |
| Admin | Full administrative access |

Rather than assigning each user directly to those roles, this implementation created governance groups and mapped them to the application roles.

The resulting model was:

- SG-MI-Employees → Employee
- SG-MI-Managers → Manager
- SG-MI-Finance → Finance
- SG-MI-Admins → Admin

This means access is controlled through a business-aligned membership model rather than ad hoc, individual assignments.

---

## The Implementation Story

### 1. Establishing the Governance Model

Four Microsoft Entra security groups were created to represent access groups for the application.

| Group | Business Purpose | Mapped Role |
| --- | --- | --- |
| SG-MI-Admins | Administrative access | Admin |
| SG-MI-Finance | Finance workflows | Finance |
| SG-MI-Managers | Manager operations | Manager |
| SG-MI-Employees | Standard user access | Employee |

These groups were then mapped to the MI Expense Portal Enterprise Application so the application could receive role claims during user authentication.

### 2. Choosing a Test User

A sample user, Amelia Hall, was used to demonstrate the migration from direct assignment to group-based access.

The purpose was to validate a realistic access lifecycle:

- user had direct access initially
- group membership was added
- group-based access was confirmed
- direct access was removed
- access revocation was validated after a fresh sign-in

### 3. Migration from Direct Access to Group Access

Amelia was added to SG-MI-Employees. At that stage, she temporarily had both entitlement paths:

```text
Amelia Hall
  ├── Direct Employee App Role
  └── SG-MI-Employees → Employee Role
```

This transitional state was intentional. It allowed the team to verify the new governance model without creating an access gap.

Once the group-based entitlement was confirmed, the old direct assignment was removed. This completed the migration from a direct-access model to a group-governed model.

---

## What Was Demonstrated

This project validated a number of important IAM principles:

- centralized access governance
- role assignment through group membership
- least-privilege enforcement
- access revocation at scale
- validation with fresh authentication after change
- business-aligned authorization model

The application was configured to enforce authorization using the OIDC roles claim received after sign-in. That means the application did not trust a custom workaround; it relied on the identity platform's defined role data.

---

## Access Validation Results

### Employee Access

Validation was performed against the Employee endpoint.

Expected outcome:

- HTTP 200

Observed result:

```json
{
  "message": "Employee access granted",
  "user": "amelia.hall@daveshub.onmicrosoft.com"
}
```

This confirmed that Amelia's group-based entitlement was working as intended.

### Least-Privilege Enforcement

The Manager endpoint was tested next.

Expected outcome:

- HTTP 403 Forbidden

This validated an important security principle: being granted Employee access does not imply Manager access. The application continued to enforce proper boundaries.

### Access Revocation

The user was removed from the employee governance group and then re-authenticated using a fresh session.

Expected outcome:

- HTTP 403 Forbidden for the Employee endpoint

This was the key proof that access revocation worked through group membership. It demonstrated that access could be removed centrally and enforced immediately after reauthentication.

---

## Why This Is Valuable to Employers

This project highlights several strengths that are highly relevant in hiring or business review conversations:

- identity governance mindset
- secure access design
- practical IAM operations experience
- understanding of least privilege and access reviews
- experience with Microsoft Entra and application authorization patterns
- ability to validate real-world security behavior, not just configuration

It is not just an exercise in creating groups; it is a demonstration of how IAM professionals manage enterprise access in a secure and scalable way.

---

## Technical Detail, Kept Readable

The core application authorization pattern used was straightforward and realistic:

```js
function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.session || !req.session.account) {
            return res.status(401).send("Authentication required.");
        }

        const roles = req.session.idTokenClaims?.roles || [];

        if (!roles.includes(requiredRole)) {
            return res.status(403).send("Forbidden.");
        }

        next();
    };
}
```

This validates the principle that authorization is granted based on trusted identity claims, not by bypassing the role model.

---

## Security and Operational Lessons Learned

A few valuable lessons emerged during the implementation:

- direct assignment is simple but weak as a long-term governance model
- group-based access is easier to review and revoke
- fresh authentication matters when testing access changes
- troubleshooting can reveal timing issues in session persistence and claim consumption
- secure cleanup is necessary after debug work to avoid exposing sensitive session data

This reflects strong operational discipline and a practical understanding of how IAM systems behave in real enterprise environments.

---

## Evidence Summary

The implementation was validated with supporting evidence, including screenshots showing:

- group membership before revocation
- mapped application role governance
- successful Employee access after migration
- denied Manager access under least privilege
- removal from group
- fresh authentication after revocation
- final access denial after entitlement removal

Evidence set:

```text
Screenshots/
└── group-based-access-governance/
    ├── 01-SG-MI-Employees-Group-Membership-Before-Revocation.png
    ├── 02-SG-MI-Employees-Employee-App-Role-Assignment.png
    ├── 03-Amelia-Employee-Authorization-Granted-200.png
    ├── 04-Amelia-Manager-Authorization-Denied-403.png
    ├── 05-Amelia-Removed-From-SG-MI-Employees.png
    ├── 06-SG-MI-Employees-Membership-Revocation-Verified.png
    ├── 07-Amelia-Fresh-Authentication-After-Revocation.png
    ├── 08-Amelia-Employee-Authorization-Revoked-403.png
    └── 09-MI-Expense-Portal-Group-Based-App-Role-Governance.png
```

---

## Final Outcome

The final state of the solution was a clean, scalable, and governable entitlement model:

```text
Amelia Hall → SG-MI-Employees → Employee App Role → MI Expense Portal
```

This replaced the earlier direct-assignment model and validated a more secure, auditable, and operationally manageable approach to access control.

The result is not just a technical success; it demonstrates the ability to design and operationalize real-world IAM controls that support business security, compliance, and efficient lifecycle management.

---

## Conclusion

This project shows an ability to think beyond basic configuration and focus on the actual business problem: how to manage access securely as organizations grow.

The deliverable speaks directly to modern IAM priorities:

- secure access by default
- centralized governance
- least privilege
- automated lifecycle management
- demonstrable access revocation

For a recruiter or hiring manager, the message is clear: this candidate can design, implement, and validate enterprise identity controls in a way that reduces risk and improves operational maturity.