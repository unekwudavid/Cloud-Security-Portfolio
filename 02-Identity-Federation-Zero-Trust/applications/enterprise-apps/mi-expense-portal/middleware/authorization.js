function requireRole(requiredRole) {
    return (req, res, next) => {

        // Authentication check
        if (!req.session || !req.session.account) {
            return res.status(401).send("Authentication required.");
        }

        // Read application roles from the Microsoft Entra OIDC ID token
        const roles = req.session.idTokenClaims?.roles || [];

        // Authorization check
        if (!roles.includes(requiredRole)) {
            return res.status(403).send("Forbidden.");
        }

        next();
    };
}

module.exports = {
    requireRole
};