const { z } = require('zod');
const signupSchema = z
  .object({
    name: z
      .string({ required_error: 'The name field is required.' })
      .trim()
      .min(1, 'The name field cannot be empty.')
      .max(100, 'The name may not be greater than 100 characters.'),

    email: z
      .string({ required_error: 'The email field is required.' })
      .trim()
      .toLowerCase()
      .email('The email format is invalid.'),

    password: z
      .string({ required_error: 'The password field is required.' })
      .min(8, 'The password must be at least 8 characters.')
      .max(128, 'The password is too long.'),

    confirm_password: z
      .string({ required_error: 'The confirm_password field is required.' }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password confirmation does not match.',
    path: ['confirm_password'],
  });


const signinSchema = z.object({
  email: z
    .string({ required_error: 'The email field is required.' })
    .trim()
    .toLowerCase()
    .email('The email format is invalid.'),

  password: z
    .string({ required_error: 'The password field is required.' })
    .min(1, 'The password field cannot be empty.'),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'The email field is required.' })
    .trim()
    .toLowerCase()
    .email('The email format is invalid.'),
});


const resetPasswordSchema = z
  .object({
    token: z
      .string({ required_error: 'The reset token is required.' })
      .min(1, 'The reset token cannot be empty.'),

    new_password: z
      .string({ required_error: 'The new_password field is required.' })
      .min(8, 'The password must be at least 8 characters.')
      .max(128, 'The password is too long.'),

    confirm_new_password: z
      .string({ required_error: 'The confirm_new_password field is required.' }),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'Password confirmation does not match.',
    path: ['confirm_new_password'],
  });

module.exports = {
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};