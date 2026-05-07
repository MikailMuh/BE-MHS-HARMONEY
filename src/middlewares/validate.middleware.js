/**
 * Validation Middleware - powered by Zod.
 *
 * Cara pake:
 *   router.post('/signup', validate(signupSchema), controller.signUp);
 *
 * Kalo input valid → req.body di-replace dengan parsed data (auto type coercion)
 * Kalo input invalid → bales 400 dengan error detail per field
 */

const { ZodError } = require('zod');

/**
 * Validate request body terhadap Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {
      // parse() throw kalo invalid, return data clean kalo valid
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Format error per-field biar gampang dibaca client
        // Output: { msg: { email: ["..."], password: ["..."] } }
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

/**
 * Validate query string (req.query).
 */
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

/**
 * Validate URL params (req.params).
 */
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