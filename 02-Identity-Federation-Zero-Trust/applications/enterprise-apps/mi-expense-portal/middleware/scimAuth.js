const crypto = require("crypto");

function scimAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    // Reject requests without an Authorization header
    if (!authHeader) {
        return res.status(401).json({
            schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
            detail: "Missing Authorization header.",
            status: "401"
        });
    }

    // Validate Bearer scheme
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
            detail: "Invalid Authorization header.",
            status: "401"
        });
    }

    const expectedToken = process.env.SCIM_BEARER_TOKEN;

    // Fail closed if the server has no configured token
    if (!expectedToken) {
        console.error("SCIM_BEARER_TOKEN is not configured.");
        return res.status(500).json({
            schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
            detail: "SCIM authentication is not configured.",
            status: "500"
        });
    }

    // Constant-time comparison
    const providedBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expectedToken);

    if (
        providedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
        return res.status(401).json({
            schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
            detail: "Invalid bearer token.",
            status: "401"
        });
    }

    next();
}

module.exports = scimAuth;