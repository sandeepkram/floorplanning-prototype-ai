import { Request, Response, NextFunction } from 'express';

// Allow healthcheck, base route, and Swagger docs to work without tenant ID
const exemptPaths = ['/', '/health', '/api-docs', '/swagger-ui', '/favicon.ico'];

export function requireTenantHeader(req: Request, res: Response, next: NextFunction) {
  // If the request path starts with any exempt path, skip tenant header validation
  if (exemptPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const tenantId = req.header('x-tenant-id');
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing required header: x-tenant-id' });
  }

  res.locals.tenantId = tenantId;
  next();
}
