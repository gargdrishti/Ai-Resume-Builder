import jwt from 'jsonwebtoken'

const protect = async (req, res, next) => {
    let token = req.headers.authorization;
    if(!token){
        return res.status(401).json({ message: 'Unauthorized' })
    }
    
    // Support Bearer token format if present
    if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export default protect;