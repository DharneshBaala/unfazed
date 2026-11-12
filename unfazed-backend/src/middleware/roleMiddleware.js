const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    // 1. Check whether user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Check whether user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    // 3. Allow access
    next();
  };
};

export default authorizeRoles;
