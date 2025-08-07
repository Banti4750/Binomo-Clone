import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]; // Extract only the token part
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    message: 'Failed to authenticate token',
                    error: err.message
                });
            }
            req.user = decoded; // Store user info in request object
            next();
        });
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token format' });
    }
};

export default verifyToken;
