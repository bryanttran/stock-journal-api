const jwt = require("jsonwebtoken");
export function signAccessJWT(accessToken) {
    return jwt.sign(accessToken, process.env.accessTokenHash);
}

export function signRefreshJWT(refreshToken) {
    return jwt.sign(refreshToken, process.env.refreshTokenHash);
}

export function decodeAccessJWT(accessToken) {
    return jwt.decode(accessToken, process.env.accessTokenHash);
}

export function decodeRefreshJWT(refreshToken) {
    return jwt.decode(refreshToken, process.env.refreshTokenHash);
}
