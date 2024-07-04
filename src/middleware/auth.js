function auth(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/");
    }
    const userRole = req.session.user.role;
    if (userRole == 'Admin') {
        return next();
    }
    if (userRole == 'User') {
        if (req.originalUrl.startsWith('/chat') ||
            req.originalUrl.startsWith('/products') ||
            req.originalUrl.startsWith('/carts')) {
            return next();
        } else {
            return res.status(403).send("Not authorized.");
        }
    }
    if (userRole == 'Premium') {
        if (req.originalUrl.startsWith('/chat') ||
            req.originalUrl.startsWith('/products') ||
            req.originalUrl.startsWith('/carts') ||
            req.originalUrl.startsWith('/realTimeProducts')) {
            return next();
        } else {
            return res.status(403).send("Not authorized.");
        }
    }

    return res.status(403).send("Not authorized.");
}


module.exports = auth;
