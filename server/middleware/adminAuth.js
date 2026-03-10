export const adminOnly = (req, res, next) => {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    return res.status(500).json({ message: 'ADMIN_API_KEY is not configured on server' });
  }

  const providedKey = req.headers['x-admin-key'];
  if (!providedKey || providedKey !== configuredKey) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};
