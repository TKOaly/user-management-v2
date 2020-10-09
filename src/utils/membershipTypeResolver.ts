export const resolveMembershipType = (isTKTL: boolean, isHYY: boolean, isHyStaff: boolean) => 
  isTKTL ? 'full member' : 
  isHYY || isHyStaff ? 'outside member' :
  'supporting member'