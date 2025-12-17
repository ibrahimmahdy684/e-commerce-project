describe("E2E Happy Path - Purchase Flow", () => {

  before(() => {
    // Create test user if it doesn't exist
    cy.request({
      method: 'POST',
      url: `${Cypress.env("apiUrl")}/auth/register`,
      body: {
        full_name: 'Test Buyer',
        email: 'buyer@test.com',
        password: '123456789',
        role: 'user'
      },
      failOnStatusCode: false // Don't fail if user already exists
    }).then(() => {
      // Create a test vendor and product
      cy.request({
        method: 'POST',
        url: `${Cypress.env("apiUrl")}/auth/register`,
        body: {
          full_name: 'Test Vendor',
          email: 'vendor@test.com',
          password: '123456789',
          role: 'vendor',
          shop_name: 'Test Shop'
        },
        failOnStatusCode: false
      }).then(() => {
        // Login as vendor to create product
        cy.request({
          method: 'POST',
          url: `${Cypress.env("apiUrl")}/auth/login`,
          body: {
            email: 'vendor@test.com',
            password: '123456789'
          }
        }).then((loginResponse) => {
          const token = loginResponse.body.token;
          
          // Create a category first
          cy.request({
            method: 'POST',
            url: `${Cypress.env("apiUrl")}/categories`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
              name: 'Test Category',
              description: 'Test category for Cypress'
            }
          }).then((categoryResponse) => {
            const categoryId = categoryResponse.body.data._id;
            
            // Create a product
            cy.request({
              method: 'POST',
              url: `${Cypress.env("apiUrl")}/product`,
              headers: { Authorization: `Bearer ${token}` },
              body: {
                name: 'Test Product',
                description: 'Test product for Cypress',
                price: 99.99,
                quantity: 10,
                categoryId: categoryId,
                status: 'approved',
                images: ['test-image.jpg']
              }
            });
          });
        });
      });
    });
  });

  it("login → view products → add to cart → checkout → place order", () => {

    // ---- Login ----
    cy.visit("/login");

    cy.get('input[name="email"]').type("buyer@test.com");
    cy.get('input[name="password"]').type("123456789");
    cy.get('button[type="submit"]').click();

    // Should redirect to storefront after login
    cy.url().should("include", "/storefront");

    // ---- View Products and Add to Cart ----
    // Click "View Details" on the first product
    cy.contains("View Details").first().click();

    // Should be on product detail page
    cy.url().should("include", "/product/");

    // Add to cart
    cy.contains("Add to Cart").click();

    // Should redirect to cart after adding
    cy.url().should("include", "/cart");

    // ---- Cart ----
    // Click "Proceed to Checkout"
    cy.contains("Proceed to Checkout").click();

    // ---- Checkout ----
    cy.url().should("include", "/checkout");

    // Select cash payment method
    cy.get('select').select('cash');

    // Place order
    cy.contains("Place Order").click();

    // ---- Order Success ----
    // Should show success message and redirect to orders
    cy.contains("Order placed successfully", { timeout: 10000 });
    cy.url().should("include", "/orders");
  });
});
