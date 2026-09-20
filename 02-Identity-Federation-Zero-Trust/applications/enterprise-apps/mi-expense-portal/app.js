require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const axios = require("axios");
// const scimServiceProviderConfigRoutes =
//     require("./scim/serviceProviderConfig");

//authentication routes
const authRoutes = require("./routes/auth");
//graph routes
const graphRoutes = require("./routes/graph");
//authorization routes
const authorizationRoutes = require("./routes/authorization");
//saml federation routes
const samlRoutes = require("./routes/saml");
//scim routes
const scimUsersRoutes = require("./scim/users");
//scim groups routes
const scimGroupsRoutes = require("./scim/groups");
//scim auhentication routes
const scimAuth = require("./middleware/scimAuth");
//scim service provider config routes
const scimServiceProviderConfigRoutes =
    require("./scim/serviceProviderConfig");

const app = express();

const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json({
    type: ["application/json", "application/scim+json"]
}));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());


/*
 * Authentication routes
 */
app.use("/auth", authRoutes);
/*
*SAML federation routes
*/
app.use("/auth/saml", samlRoutes);

app.use("/graph", graphRoutes);
app.use("/authorization", authorizationRoutes);

//mounted secured SCIM endpoints
app.use("/scim/v2", scimAuth);
app.use("/scim/v2", scimUsersRoutes);
app.use("/scim/v2", scimGroupsRoutes);
app.use("/scim/v2", scimServiceProviderConfigRoutes);

/*
 * Home page
 */
app.get("/", async (req, res) => {

    if (!req.session.account) {

        return res.send(`
            <html>
                <head>
                    <title>MI Expense Portal</title>
                </head>

                <body>

                    <h1>MI Expense Portal</h1>

                    <p>
                        Microsoft Entra ID Authentication Lab
                    </p>

                    <a href="/auth/login">
                        Sign in with Microsoft Entra ID
                    </a>

                </body>
            </html>
        `);
    }


    const account = req.session.account;

    res.send(`
        <html>

            <head>
                <title>MI Expense Portal</title>
            </head>

            <body>

                <h1>MI Expense Portal</h1>

                <h2>Authenticated</h2>

                <p>
                    <strong>Name:</strong>
                    ${account.name || "N/A"}
                </p>

                <p>
                    <strong>Username:</strong>
                    ${account.username || "N/A"}
                </p>

                <p>
                    <strong>Tenant:</strong>
                    ${process.env.TENANT_ID}
                </p>

                <p>
                    Authentication successful using
                    Microsoft Entra ID.
                </p>

                <a href="/auth/logout">
                    Sign out
                </a>

            </body>

        </html>
    `);
});
    app.listen(PORT, () => {

    console.log(
        `MI Expense Portal running at http://localhost:${PORT}`
    );

});

