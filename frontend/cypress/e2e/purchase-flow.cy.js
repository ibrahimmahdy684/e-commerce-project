/// <reference types="cypress" />

describe("E2E Happy Path - Purchase Flow", () => {
  const productId = "69428ef0dc40005a5441fe16"; // real product id
  const productName = "PC"; // real product name

  it("User can login, view product, add to cart, checkout, and place order", () => {
    // Visit login page
cy.visit("/login");

// Fill in credentials
cy.get('input[name="email"]').type("buyer@test.com", { delay: 50 });
cy.get('input[name="password"]').type("123456789", { delay: 50 });

// Click submit button
cy.get('button[type="submit"]').click();

// Wait for redirect
cy.url({ timeout: 10000 }).should("include", "/storefront");

    // 2️⃣ Navigate to product page
    cy.visit(`/product/${productId}`);

    // Product should be visible
    cy.contains(productName, { timeout: 10000 }).should("be.visible");

    // 3️⃣ Add 2 items to cart
    cy.get('input[type="number"]').clear().type("2");
    cy.contains("Add to Cart").click();

    // Cart page
    cy.url({ timeout: 5000 }).should("include", "/cart");

    // Checkout
    cy.contains("Proceed to Checkout").click();
    cy.url({ timeout: 5000 }).should("include", "/checkout");

    // Select cash payment
    cy.get('select').select("cash");

    // Place order
    cy.contains("Place Order").click();

    // Verify order success
    cy.contains("Order placed successfully", { timeout: 10000 }).should("be.visible");

 // After placing order and navigating to /orders
cy.url({ timeout: 10000 }).should("include", "/orders");



// Optional cleanup to prevent post-test errors
cy.window().then((win) => {
  win.localStorage.clear();
});

// Small wait to let frontend settle
cy.wait(300);

  });
});
