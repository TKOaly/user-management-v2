// Copied straight from old user management
export const userModif = ['screenName', 'email', 'residence',
  'phone', 'isHYYMember', 'isHyStudent', 'isHyStaff', 'isTKTL', 'groups',
  'password']
/** Jäsenvirkailijan muokkausoikeudet */
export const jvModif = ['screenName', 'email', 'residence',
  'phone', 'name', 'username',
  'isHYYMember', 'isHyStudent', 'isHyStaff', 'isTKTL', 'membership',
  'add_payment', 'password'];
/** Ylläpitäjän muokkausoikeudet */
export const adminModif = ['screenName', 'email', 'residence',
  'phone', 'name', 'username',
  'isHYYMember', 'isHyStudent', 'isHyStaff', 'isTKTL', 'membership',
  'role', 'created', 'password', 'groups',
  'password', 'add_payment']