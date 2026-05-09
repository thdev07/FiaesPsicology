export function errorMiddleware(err, req, res, next) {
  console.error(err);

  // CPF ou email duplicado
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro já existe (CPF ou email duplicado)' });
  }

  // Violação de chave estrangeira — registro em uso por outro dado
  if (err.code === '23503') {
    return res.status(409).json({ error: 'Não é possível remover: este registro está vinculado a outros dados do sistema.' });
  }

  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor' });
}
