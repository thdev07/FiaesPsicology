// Middleware de controle de acesso por role (Admin, Psicologo, Paciente)
export function authorize(...roles) {
  return (req, res, next) => {
    const userRole = req.user?.user_metadata?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}
