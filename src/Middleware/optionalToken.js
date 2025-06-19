import jwt from 'jsonwebtoken';

export const optionalToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;
    } catch (err) {
      console.warn('Invalid token:', err.message);
      // Optionally: return res.status(403).json({ message: 'Invalid token' });
    }
  }

  next();
};
