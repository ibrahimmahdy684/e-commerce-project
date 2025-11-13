/**
 * Helper Utilities
 * Reusable calculation and validation functions
 */

/**
 * Calculate points discount (100 points = 1 pound)
 */
const calculatePointsDiscount = (pointsToUse) => {
  return pointsToUse / 100;
};

/**
 * Calculate points earned (1 pound = 1 point)
 */
const calculatePointsEarned = (finalAmount) => {
  return Math.floor(finalAmount);
};

/**
 * Validate points usage - Fail Fast approach
 */
const validatePointsUsage = (pointsToUse, availablePoints, cartTotal) => {
  // Fail fast on negative points
  if (pointsToUse < 0) {
    throw new Error('Points cannot be negative');
  }

  // Fail fast on insufficient points
  if (pointsToUse > availablePoints) {
    throw new Error(`Insufficient points. You have ${availablePoints} points available`);
  }

  // Fail fast on exceeding cart value
  const maxPointsAllowed = cartTotal * 100;
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
