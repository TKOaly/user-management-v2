import Joi from 'joi'

export default Joi.object({
  username: Joi
    .string()
    .required(),
  firstName: Joi
    .string()
    .required(),
  lastName: Joi
    .string()
    .required(),
  email: Joi
    .string()
    .email({ tlds: { allow: false } })
    .required(),
  screenName: Joi
    .string()
    .required(),
  residence: Joi
    .string()
    .required(),
  phone: Joi
    .string()
    .required(),
  password1: Joi
    .string()
    .required(),
  password2: Joi.ref('password1'),
  isHYYMember: Joi
    .boolean()
    .required(),
  isHyStaff: Joi
    .boolean()
    .required(),
  isHyStudent: Joi
    .boolean()
    .required(),
  isTKTL: Joi
    .boolean()
    .required()
})
