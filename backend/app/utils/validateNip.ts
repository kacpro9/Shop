export const validateNip = (value: string): boolean => {
  if (!value) return false;

  //remove spaces and hyphens
  const nip = value.replace(/[\s-]/g, "");

  //must be 10 digits
  if (!/^\d{10}$/.test(nip)) return false;

  const digits = nip.split("").map(Number);

  //weights for nip
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];

  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);

  const check = sum % 11;

  // if check is 10, nip is invalid
  if (check === 10) return false;

  return check === digits[9];
};
