# 🧪 Cypress E2E Test Analysis - Purchase Flow

## 📊 Test Overview

**Test File:** `frontend/cypress/e2e/purchase-flow.cy.js`  
**Test Suite:** E2E Happy Path - Purchase Flow  
**Purpose:** Validate the complete user journey from login to order placement

---

## 🔍 Test Breakdown

### **Test Scenario**
The test validates that a user can successfully:
1. ✅ Login to the application
2. ✅ View a product detail page
3. ✅ Add items to cart
4. ✅ Proceed to checkout
5. ✅ Select payment method
6. ✅ Place an order
7. ✅ Verify order confirmation

### **Test Data**
```javascript
Product ID: "69428ef0dc40005a5441fe16"
Product Name: "PC"
User Email: "buyer@test.com"
User Password: "123456789"
Quantity: 2
Payment Method: Cash
```

---

## 🛠️ Test Implementation Details

### **1. Authentication (Before Hook)**
```javascript
before(() => {
  cy.login("buyer@test.com", "123456789");
});
```
- Uses custom `login` command defined in `cypress/support/commands.js`
- Makes API request to `/api/auth/login`
- Stores authentication token in localStorage
- Runs once before all tests in the suite

### **2. Product Viewing**
```javascript
cy.visit(`/product/${productId}`);
cy.contains(productName, { timeout: 10000 }).should("be.visible");
```
- Navigates to product detail page
- Waits up to 10 seconds for product name to appear
- Validates product is visible

### **3. Add to Cart**
```javascript
cy.get('input[type="number"]').clear().type("2");
cy.contains("Add to Cart").click();
cy.url().should("include", "/cart");
```
- Clears quantity input
- Sets quantity to 2
- Clicks "Add to Cart" button
- Verifies redirect to cart page

### **4. Checkout Process**
```javascript
cy.contains("Proceed to Checkout").click();
cy.url().should("include", "/checkout");
cy.get('select').select("cash");
```
- Clicks "Proceed to Checkout" button
- Verifies redirect to checkout page
- Selects "cash" payment method from dropdown

### **5. Order Placement**
```javascript
cy.contains("Place Order").click();
cy.contains("Order placed successfully", { timeout: 10000 });
cy.url().should("include", "/orders");
cy.contains(productName).should("exist");
```
- Clicks "Place Order" button
- Waits for success message (up to 10 seconds)
- Verifies redirect to orders page
- Confirms product appears in orders list

---

## ⚙️ Configuration

### **Cypress Config** (`cypress.config.js`)
```javascript
{
  e2e: {
    baseUrl: "http://localhost:5173",  // Frontend (Vite dev server)
    env: {
      apiUrl: "http://localhost:5000"  // Backend API
    }
  }
}
```

### **Custom Commands** (`cypress/support/commands.js`)
```javascript
Cypress.Commands.add("login", (email, password) => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/api/auth/login`,
    body: { email, password }
  }).then((res) => {
    expect(res.status).to.eq(200);
    window.localStorage.setItem("token", res.body.token);
  });
});
```

---

## ✅ Improvements Made

### **1. Removed Duplicate Login Command**
- **Issue:** Login command was defined in both test file and commands.js
- **Fix:** Removed duplicate from test file to avoid conflicts
- **Benefit:** Centralized command management, easier maintenance

### **2. Added Cypress Scripts to package.json**
```json
"scripts": {
  "cypress:open": "cypress open",  // Interactive mode
  "cypress:run": "cypress run"     // Headless mode
}
```

---

## 🎯 Test Execution

### **Interactive Mode (Recommended for Development)**
```bash
cd frontend
npm run cypress:open
```
- Opens Cypress Test Runner UI
- Select E2E Testing
- Choose your browser
- Click on `purchase-flow.cy.js` to run

### **Headless Mode (CI/CD)**
```bash
cd frontend
npm run cypress:run
```
- Runs all tests in headless mode
- Generates screenshots on failure
- Generates videos of test runs
- Suitable for automated pipelines

---

## 🚨 Prerequisites

Before running tests, ensure:

1. **Backend is running** on `http://localhost:5000`
   ```bash
   cd Backend
   npm start
   ```

2. **Frontend is running** on `http://localhost:5173`
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test user exists** in database
   - Email: `buyer@test.com`
   - Password: `123456789`

4. **Test product exists** in database
   - Product ID: `69428ef0dc40005a5441fe16`
   - Product Name: `PC`

---

## 📈 Test Coverage

### **Covered Scenarios**
✅ User authentication  
✅ Product page navigation  
✅ Cart functionality  
✅ Checkout flow  
✅ Payment method selection  
✅ Order placement  
✅ Order confirmation  
✅ URL routing validation  

### **Not Covered (Potential Additions)**
❌ Invalid login credentials  
❌ Empty cart checkout  
❌ Out of stock products  
❌ Different payment methods (card, etc.)  
❌ Order cancellation  
❌ Multiple products in cart  
❌ Quantity validation (max/min)  
❌ Guest checkout  

---

## 🐛 Potential Issues & Recommendations

### **1. Hardcoded Product ID**
**Issue:** Test depends on specific product existing in database  
**Risk:** Test fails if product is deleted or database is reset  
**Recommendation:**
```javascript
// Create test data programmatically
before(() => {
  cy.request('POST', `${Cypress.env('apiUrl')}/api/products`, {
    name: 'Test Product',
    price: 100,
    stock: 10
  }).then((res) => {
    productId = res.body._id;
  });
});

after(() => {
  // Clean up test data
  cy.request('DELETE', `${Cypress.env('apiUrl')}/api/products/${productId}`);
});
```

### **2. Hardcoded Test User**
**Issue:** Test depends on specific user existing  
**Risk:** Test fails if user doesn't exist or credentials change  
**Recommendation:**
- Create test user via API before tests
- Use environment variables for credentials
- Clean up after tests

### **3. Generic Selectors**
**Issue:** Using `cy.get('select')` and `cy.contains()` can be fragile  
**Risk:** Breaks if UI changes or multiple elements match  
**Recommendation:**
```javascript
// Add data-testid attributes to elements
cy.get('[data-testid="payment-method-select"]').select('cash');
cy.get('[data-testid="place-order-button"]').click();
```

### **4. No Error Handling**
**Issue:** Test doesn't verify error states  
**Recommendation:** Add negative test cases

### **5. Single Test Case**
**Issue:** All steps in one test - harder to debug failures  
**Recommendation:** Split into multiple test cases:
```javascript
it('should login successfully', () => { ... });
it('should view product details', () => { ... });
it('should add product to cart', () => { ... });
it('should complete checkout', () => { ... });
```

---

## 📊 Test Results Location

- **Screenshots:** `frontend/cypress/screenshots/`
- **Videos:** `frontend/cypress/videos/`
- **Reports:** Console output (can add reporters like Mochawesome)

---

## 🔧 Advanced Configuration Options

### **Add Test Retries**
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    retries: {
      runMode: 2,      // Retry failed tests 2 times in headless mode
      openMode: 0      // Don't retry in interactive mode
    }
  }
});
```

### **Add Video Recording Control**
```javascript
module.exports = defineConfig({
  e2e: {
    video: true,              // Record videos
    videoCompression: 32,     // Compression level
    screenshotOnRunFailure: true
  }
});
```

### **Add Custom Timeouts**
```javascript
module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout: 10000,  // 10 seconds
    pageLoadTimeout: 30000         // 30 seconds
  }
});
```

---

## 🎓 Best Practices Applied

✅ **Custom Commands:** Reusable `login` command  
✅ **Page Object Pattern:** Could be improved with page objects  
✅ **Explicit Waits:** Using `{ timeout: 10000 }` where needed  
✅ **Assertions:** Verifying URLs and element visibility  
✅ **Before Hooks:** Setup authentication once  
✅ **Clear Test Data:** Defined constants for product ID and name  

---

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API Reference](https://docs.cypress.io/api/table-of-contents)
- [Writing Your First E2E Test](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test)

---

## 🚀 Next Steps

1. **Run the test** using `npm run cypress:open`
2. **Review test results** and screenshots
3. **Add more test cases** for edge cases
4. **Implement data-testid attributes** in frontend components
5. **Set up CI/CD integration** for automated testing
6. **Add test data management** (fixtures or API setup)
7. **Create additional test suites** for other flows

---

**Last Updated:** December 17, 2025  
**Cypress Version:** 15.8.0  
**Test Status:** ✅ Ready to Run
