const express = require("express");
const crypto = require("crypto");

const {
    createUser,
    getUsers,
    getUserById,
    getUserByUserName,
    updateUser
} = require("./store");

const router = express.Router();

/*
 * SCIM 2.0 User Creation
 *
 * Creates a user in the external application's
 * identity store.
 */
router.post("/Users", (req, res) => {

    const scimUser = req.body || {};

    /*
     * Validate required SCIM attributes
     */
    if (!scimUser.userName) {
        return res.status(400).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "userName is required.",
            status: "400"
        });
    }

    /*
     * Prevent duplicate users
     */
    const existingUser = getUserByUserName(
        scimUser.userName
    );

    if (existingUser) {
        return res.status(409).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "User already exists.",
            status: "409"
        });
    }

    /*
     * Generate a unique SCIM resource ID
     */
   const user = {
    id: crypto.randomUUID(),

    externalId: scimUser.externalId || null,

    userName: scimUser.userName,

    displayName:
        scimUser.displayName ||
        `${scimUser.name?.givenName || ""} ${scimUser.name?.familyName || ""}`.trim(),

    active:
        scimUser.active !== undefined
            ? scimUser.active
            : true,

    name: {
        formatted: scimUser.name?.formatted || null,
        givenName: scimUser.name?.givenName || null,
        familyName: scimUser.name?.familyName || null
    },

    title: scimUser.title || null,

    emails: scimUser.emails || [],

    phoneNumbers: scimUser.phoneNumbers || [],

    addresses: scimUser.addresses || [],

    preferredLanguage:
        scimUser.preferredLanguage || null,

    enterpriseExtension: {
        employeeNumber:
            scimUser[
                "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
            ]?.employeeNumber || null,

        department:
            scimUser[
                "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
            ]?.department || null,

        manager:
            scimUser[
                "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
            ]?.manager || null
    },

    meta: {
        resourceType: "User",
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    },

    schemas: [
        "urn:ietf:params:scim:schemas:core:2.0:User",
        "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
    ]
};
    /*
     * Store the application identity
     */
    createUser(user);

    console.log("SCIM user created:", {
        id: user.id,
        userName: user.userName,
        active: user.active
    });

    /*
     * Return the newly-created SCIM resource
     */
    return res.status(201).json(user);
});

/*
 * SCIM 2.0 - List Users
 *
 * Returns all users provisioned into the application.
 */
router.get("/Users", (req, res) => {

    const users = getUsers();

    return res.status(200).json({
        schemas: [
            "urn:ietf:params:scim:api:messages:2.0:ListResponse"
        ],
        totalResults: users.length,
        Resources: users
    });
});


/*
 * SCIM 2.0 - Get User
 *
 * Returns a single user by SCIM resource ID.
 */
router.get("/Users/:id", (req, res) => {

    const user = getUserById(req.params.id);

    if (!user) {
        return res.status(404).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "User not found.",
            status: "404"
        });
    }

    return res.status(200).json(user);
});

/*
 * SCIM 2.0 - Update User
 *
 * Applies SCIM PATCH operations to an existing user.
 */
router.patch("/Users/:id", (req, res) => {

    const user = getUserById(req.params.id);

    /*
     * Return 404 when the SCIM resource does not exist.
     */
    if (!user) {
        return res.status(404).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "User not found.",
            status: "404"
        });
    }

    const patchRequest = req.body;

    /*
     * Validate the SCIM PATCH request.
     */
    if (!patchRequest.Operations ||
        !Array.isArray(patchRequest.Operations)) {

        return res.status(400).json({
            schemas: [
                "urn:ietf:params:scim:api:messages:2.0:Error"
            ],
            detail: "SCIM PATCH Operations are required.",
            status: "400"
        });
    }

    /*
     * Build the updates from the SCIM operations.
     */
    const updates = {};

    for (const operation of patchRequest.Operations) {

        const op = operation.op?.toLowerCase();

        if (op !== "replace" && op !== "add") {
            continue;
        }

        /*
         * Attribute supplied directly:
         *
         * {
         *   op: "Replace",
         *   path: "displayName",
         *   value: "Jane Smith"
         * }
         */
        if (operation.path) {

            updates[operation.path] = operation.value;

            continue;
        }

        /*
         * Attribute supplied inside value:
         *
         * {
         *   op: "Replace",
         *   value: {
         *       displayName: "Jane Smith"
         *   }
         * }
         */
        if (
            operation.value &&
            typeof operation.value === "object" &&
            !Array.isArray(operation.value)
        ) {

            Object.assign(
                updates,
                operation.value
            );
        }
    }

    /*
     * Apply the changes.
     */
    const updatedUser = updateUser(
        req.params.id,
        {
            ...updates,
            meta: {
                ...user.meta,
                lastModified: new Date().toISOString()
            }
        }
    );

    return res.status(200).json(updatedUser);
});

module.exports = router;

