const jwt = require("jsonwebtoken");



function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
      return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, process.env.TOKEN_SECRET);
        req.phone_number = data.phone_number;
        return next();
    } catch {
        return res.sendStatus(403);
    }
};


module.exports = {
    generateAccessToken,
    authorization
}