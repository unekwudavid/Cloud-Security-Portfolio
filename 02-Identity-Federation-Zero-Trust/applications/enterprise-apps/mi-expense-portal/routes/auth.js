const express = require("express");
const msal = require("@azure/msal-node");

const router = express.Router();

const { msalConfig, REDIRECT_URI } = require("../authConfig");

const msalClient = new msal.ConfidentialClientApplication(msalConfig);

// Start OAuth 2.0 Authorization Code Flow
router.get("/login", async (req, res) => {
   
    const authCodeUrlParameters = {
        scopes: ["openid", "profile", "email", "User.Read"],
        redirectUri: REDIRECT_URI
    };

    try {
        const response = await msalClient.getAuthCodeUrl(
            authCodeUrlParameters
        );

        res.redirect(response);
    } catch (error) {
        console.error("Login initialization failed:", error);
        res.status(500).send("Unable to initialize authentication.");
    }
});

// OAuth callback
router.get("/callback", async (req, res) => {
     console.log("=== AUTH CALLBACK HIT ===");
     console.log("Query parameters:", req.query);

    const tokenRequest = {
        code: req.query.code,
        scopes: ["openid", "profile", "email", "User.Read"],
        redirectUri: REDIRECT_URI
    };

    try {
        const response = await msalClient.acquireTokenByCode(
            tokenRequest
        );
       
     // 
        req.session.account = response.account;
        req.session.accessToken = response.accessToken;
        req.session.idTokenClaims = response.idTokenClaims;

        console.log("Authenticated user:");
        console.log(response.account);

        console.log("Application roles:");
        console.log(response.idTokenClaims?.roles);

        req.session.save((err) => {
    if (err) {
        console.error("Session save failed:", err);
        return res.status(500).send("Authentication session could not be saved.");
    }

    console.log("Authentication session saved successfully.");

    res.redirect("/");
});    
    } catch (error) {
        console.error("Token acquisition failed:", error);
        res.status(500).send("Authentication failed.");
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;