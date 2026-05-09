

const { ZodError } = require('zod');

/**
 * Validate request body terhadap Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {

      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {

        const errors = {};
        for (const issue of err.issues) {
          const field = issue.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(issue.message);
        }
        return res.status(400).json({ msg: errors });
      }
      next(err);
    }
  };
}


function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = {};
        for (const issue of err.issues) {
          const field = issue.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(issue.message);
        }
        return res.status(400).json({ msg: errors });
      }
      next(err);
    }
  };
}


function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = {};
        for (const issue of err.issues) {
          const field = issue.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(issue.message);
        }
        return res.status(400).json({ msg: errors });
      }
      next(err);
    }
  };
}

module.exports = { validateBody, validateQuery, validateParams };