export function errorMiddleware(err, req, res, next) {
  console.error(err);

  // CPF ou email duplicado (PostgreSQL unique constraint)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro já existe (CPF ou email duplicado)' });
  }

  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor' });
}
