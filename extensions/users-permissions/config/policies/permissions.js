const _ = require('lodash');

module.exports = async (ctx, next) => {
  if (ctx.state.user) {
    // If the request is already authenticated, proceed to the next middleware
    return next();
  }

  let userId;
  let isAdmin = false;

  // Check for token in the Authorization header or as a query parameter
  if (
    (ctx.request && ctx.request.header && ctx.request.header.authorization) ||
    (ctx.request.query && ctx.request.query.token)
  ) {
    try {
      if (ctx.request.query && ctx.request.query.token) {
        // Handling token passed as a query parameter
        const [tokenEntry] = await strapi.query('token').find({ token: ctx.request.query.token });

        if (!tokenEntry) {
          throw new Error(`Invalid token: This token doesn't exist`);
        } else {
          if (tokenEntry.user && typeof tokenEntry.token === 'string') {
            userId = tokenEntry.user.id;
          }
          isAdmin = false; // Adjust this based on your logic
        }

        // Remove the token from query parameters to avoid leaking it
        delete ctx.request.query.token;
      } else if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
        // Handling token passed in the Authorization header
        const authHeader = ctx.request.header.authorization;

        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7, authHeader.length);

          const decoded = await strapi.plugins['users-permissions'].services.jwt.verify(token);
          userId = decoded.id;
          isAdmin = decoded.isAdmin || false; // Adjust based on your logic
        } else {
          throw new Error('Invalid authorization header format. Expected "Bearer <token>".');
        }
      }

      // Validate if the token provided the required fields
      if (!userId) {
        throw new Error('Invalid token: Token did not contain required fields');
      }

      // Attach the user information to the context state
      ctx.state.user = await strapi.query('user', 'users-permissions').findOne({ id: userId });

      if (!ctx.state.user) {
        throw new Error('Invalid token: User not found');
      }

      ctx.state.user.isAdmin = isAdmin;

      // Proceed to the next middleware
      return next();
    } catch (err) {
      return ctx.forbidden('Invalid token: ' + err.message);
    }
  } else {
    // If no token is provided, return a forbidden response
    return ctx.forbidden('No authorization header or token query parameter provided');
  }
};
