# Device Governance — Exception Test Matrix

| Test ID | Scenario | Expected Decision | Validation Status |
|---|---|---|---|
| DEV-EX-001 | Managed + compliant device | Allow | Design |
| DEV-EX-002 | Registered but unmanaged device | Restrict | Design |
| DEV-EX-003 | Managed but non-compliant device | Deny | Design |
| DEV-EX-004 | Unknown/unregistered device | Deny | Design |
| DEV-EX-005 | Approved temporary exception | Temporary Allow | Design |
| DEV-EX-006 | Expired exception | Revoke Access | Design |
| DEV-EX-007 | Manually revoked exception | Deny | Design |
| DEV-EX-008 | User outside approved exception scope | Deny | Design |

## Acceptance Criteria

An exception is considered successfully governed when:

1. A clear business justification exists.
2. The affected identity is explicitly identified.
3. The application scope is documented.
4. Compensating controls are documented.
5. An approver is identified.
6. An expiration date exists.
7. The exception can be revoked.
8. Expired exceptions cannot remain permanently active.
9. The exception does not silently bypass the organization's overall Zero Trust model.