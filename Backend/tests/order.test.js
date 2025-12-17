const { calculateOrderTotal } = require("../utils/helpers");

describe("Order Module", () => {
  it("should calculate order total correctly", () => {
    const result = calculateOrderTotal(100, 500); // 500 points = 5 pounds
    expect(result.finalAmount).toBeCloseTo(95);
    expect(result.pointsEarned).toBeCloseTo(95);
  });
});
