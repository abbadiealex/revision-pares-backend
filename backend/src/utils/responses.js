export function sendSuccess(res, { status = 200, data = null, code = 'OK' } = {}) {
  return res.status(status).json({
    success: true,
    data,
    error: null,
    code
  });
}

export function sendError(res, { status = 500, error = 'Error interno', code = 'INTERNAL_ERROR' } = {}) {
  return res.status(status).json({
    success: false,
    data: null,
    error,
    code
  });
}
