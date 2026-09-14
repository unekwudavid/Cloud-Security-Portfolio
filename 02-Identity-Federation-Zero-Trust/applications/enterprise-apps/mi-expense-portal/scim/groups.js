const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const groups = [];

/*
 * Create SCIM Group
 *
 * Represents a group provisioned from the
 * identity provider into the external application.
 */
router.post("/Groups", (req, res) => {

    const scimGroup = req.body;

    /*
     * Validate required displayName
     */
    if (!scimGroup.displayName) {

        return res.status(400).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "displayName is required.",
            status: "400"
        });
    }

    /*
     * Prevent duplicate groups
     */
    const existingGroup = groups.find(
        group =>
            group.displayName.toLowerCase() ===
            scimGroup.displayName.toLowerCase()
    );

    if (existingGroup) {

        return res.status(409).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "Group already exists.",
            status: "409"
        });
    }

    /*
     * Create SCIM group resource
     */
    const group = {

        id: crypto.randomUUID(),

        externalId:
            scimGroup.externalId || null,

        displayName:
            scimGroup.displayName,

        members:
            scimGroup.members || [],

        meta: {

            resourceType: "Group",

            created:
                new Date().toISOString(),

            lastModified:
                new Date().toISOString()
        },

        schemas: [
            "urn:ietf:params:scim:schemas:core:2.0:Group"
        ]
    };

    groups.push(group);

    return res.status(201).json(group);
});

/*
 * Get all SCIM Groups
 */
router.get("/Groups", (req, res) => {

    return res.status(200).json({

        schemas: [
            "urn:ietf:params:scim:api:messages:2.0:ListResponse"
        ],

        totalResults: groups.length,

        Resources: groups
    });
});

/*
 * Get a single SCIM Group
 */
router.get("/Groups/:id", (req, res) => {

    const group = groups.find(
        group => group.id === req.params.id
    );

    if (!group) {

        return res.status(404).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "Group not found.",
            status: "404"
        });
    }

    return res.status(200).json(group);
});

/*
 * Update SCIM Group
 */
router.patch("/Groups/:id", (req, res) => {

    const group = groups.find(
        group => group.id === req.params.id
    );

    if (!group) {

        return res.status(404).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "Group not found.",
            status: "404"
        });
    }

    const patchRequest = req.body;

    if (
        !patchRequest.Operations ||
        !Array.isArray(patchRequest.Operations)
    ) {

        return res.status(400).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "SCIM PATCH Operations are required.",
            status: "400"
        });
    }

   for (const operation of patchRequest.Operations) {

    const op = operation.op?.toLowerCase();

    if (op !== "replace" &&
        op !== "add" &&
        op !== "remove") {

        continue;
    }

  /*
 * Remove individual group member
 */
if (
    op === "remove" &&
    operation.path
) {

    const path = String(operation.path).trim();

    console.log("SCIM Remove Path:", path);

    const match = path.match(
        /^members\s*\[\s*value\s+eq\s+"([^"]+)"\s*\]$/i
    );

    if (match) {

        const memberId = match[1];

        console.log(
            "SCIM Remove Member ID:",
            memberId
        );

        group.members = group.members.filter(
            member => member.value !== memberId
        );

        console.log(
            "SCIM Members After Remove:",
            group.members
        );
    }

    continue;
}
    /*
     * Replace entire membership list
     */
    if (operation.path === "members" &&
        op === "replace") {

        group.members = operation.value || [];

        continue;
    }

    /*
     * Add individual group member
     */
    if (operation.path === "members" &&
        op === "add") {

        const newMembers = Array.isArray(operation.value)
            ? operation.value
            : [operation.value];

        for (const member of newMembers) {

            const alreadyMember = group.members.some(
                existingMember =>
                    existingMember.value === member.value
            );

            if (!alreadyMember) {

                group.members.push(member);
            }
        }

        continue;
    }

    /*
     * Update display name
     */
    if (operation.path === "displayName") {

        group.displayName = operation.value;

        continue;
    }

    /*
     * Handle object-style updates
     */
    if (
        !operation.path &&
        operation.value &&
        typeof operation.value === "object"
    ) {

        Object.assign(
            group,
            operation.value
        );
    }
}

    group.meta.lastModified =
        new Date().toISOString();

    return res.status(200).json(group);
});

module.exports = router;





//d3ae3128-01da-4ebd-9f42-0169b5fa259c
//c7f85f45-e047-4006-9aad-d8dc98ec17e3