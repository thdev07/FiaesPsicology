// Middleware de controle de acesso por role (Admin, Psicologo, Paciente)
export function authorize(...roles) {
  return (req, res, next) => {
    const userRole =
      req.user?.user_metadata?.role ??
      req.user?.app_metadata?.role;
    console.log('[RBAC] user_metadata:', req.user?.user_metadata, '| app_metadata:', req.user?.app_metadata, '| role detectado:', userRole);
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: `Acesso negado. Role detectada: "${userRole}", requerida: "${roles.join(' ou ')}"` });
    }
    next();
  };
}
