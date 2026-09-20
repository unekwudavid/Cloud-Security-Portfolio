const express = require("express");

const router = express.Router();


router.get("/", (req, res) => {
    return res.status(200).json({
        schemas: [
            "urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"
        ],
        documentationUri:
            "https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups",
        patch: {
            supported: true
        },
        bulk: {
            supported: false,
            maxOperations: 0,
            maxPayloadSize: 0
        },
        filter: {
            supported: true,
            maxResults: 200
        },
        changePassword: {
            supported: false
        },
        sort: {
            supported: false
        },
        etag: {
            supported: false
        },
        authenticationSchemes: [
            {
                type: "oauthbearertoken",
                name: "Bearer Token Authentication",
                description: "Authentication using a bearer token.",
                specUri: "https://www.rfc-editor.org/rfc/rfc6750",
                documentationUri:
                    "https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups"
            }
        ]
    });
});

router.get("/ServiceProviderConfig", (req, res) => {
    return res.status(200).json({
        schemas: [
            "urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"
        ],

        documentationUri:
            "https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups",

        patch: {
            supported: true
        },

        bulk: {
            supported: false,
            maxOperations: 0,
            maxPayloadSize: 0
        },

        filter: {
            supported: true,
            maxResults: 200
        },

        changePassword: {
            supported: false
        },

        sort: {
            supported: false
        },

        etag: {
            supported: false
        },

        authenticationSchemes: [
            {
                type: "oauthbearertoken",
                name: "Bearer Token Authentication",
                description:
                    "Authentication using a bearer token.",
                specUri:
                    "https://www.rfc-editor.org/rfc/rfc6750",
                documentationUri:
                    "https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups"
            }
        ]
    });
});

module.exports = router;