/**
 * Calculate points discount
 * 100 points = 1 pound discount
 */
const calculatePointsDiscount = (pointsToUse) => {
  return pointsToUse / 100;
};

/**
 * Calculate points earned from purchase
 * 1 pound spent = 1 point earned
 */
const calculatePointsEarned = (finalAmount) => {
  return Math.floor(finalAmount);
};

/**
 * Validate points usage
 */
const validatePointsUsage = (pointsToUse, availablePoints, cartTotal) => {
  if (pointsToUse < 0) {
    throw new Error('Points cannot be negative');
  }

  if (pointsToUse > availablePoints) {
    throw new Error('Insufficient points balance');
  }

  const maxPointsAllowed = cartTotal * 100; // Can't use more points than cart value
  if (pointsToUse > maxPointsAllowed) {
    throw new Error(`Cannot use more than ${maxPointsAllowed} points for this purchase`);
  }

  return true;
};

/**
 * Calculate final order amount with points discount
 */
const calculateOrderTotal = (cartTotal, pointsToUse = 0) => {
  const discount = calculatePointsDiscount(pointsToUse);
  const finalAmount = Math.max(0, cartTotal - discount);

  return {
    cartTotal,
    pointsUsed: pointsToUse,
    discount,
    finalAmount,
    pointsEarned: calculatePointsEarned(finalAmount)
  };
};

module.exports = {
  calculatePointsDiscount,
  calculatePointsEarned,
  validatePointsUsage,
  calculateOrderTotal
};
