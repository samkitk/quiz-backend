var AuthenticationClient = require("auth0").AuthenticationClient;
var ManagementClient = require("auth0").ManagementClient;

export const auth0_client = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

export const auth0_management_client = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: process.env.AUTH0_MANAGEMENT_SCOPES,
  audience: process.env.AUTH0_AUDIENCE_URL,
  tokenProvider: {
    enableCache: true,
    cacheTTLInSeconds: 10,
  },
});
