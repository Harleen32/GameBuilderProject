// validate(schema, source='body'|'query'|'params')
module.exports = (schema, source = 'body') => async (req, res, next) => {
  try {
    if (!schema) return next();
    const value = await schema.validateAsync(req[source], { abortEarly: false, allowUnknown: true });
    req[source] = value;
    next();
  } catch (err) {
    err.status = 400;
    err.message = 'Validation error';
    err.details = err.details?.map(d => d.message) || [String(err)];
    next(err);
  }
};
