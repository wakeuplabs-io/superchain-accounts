## Ticket / Issue Tracking
<!-- Provide the ticket or issue number that this PR is addressing. -->
[{:code}](https://wakeuplabs.atlassian.net/browse/{:code})

## 📝 Description

## 🔍 Testing Plan

### 🎯 Goal
Briefly describe what is being tested.  
_Example: Ensure that users can log in using Google from the login modal._

---

### 📋 Test Cases / Scenarios

1. ✅ **Case 1: Happy path**
   - Action: User clicks on "Login with Google"
   - Expected Result: Google login window opens, user is redirected to dashboard upon success

2. 🧪 **Case 2: Cancel login**
   - Action: User closes the popup window
   - Expected Result: Friendly error message is displayed

3. ❌ **Case 3: Provider error**
   - Action: Google returns an authentication error
   - Expected Result: Error message "Login failed" is shown

---

### ⚙️ Test Methods
- [ ] Manual testing
- [ ] Unit test (`/tests/feature/login.test.ts`)
- [ ] E2E test (`cypress/e2e/login.cy.js`)

---

### 📸 Evidence (if applicable)
- Screenshots / GIFs
- Relevant logs
- Loom or video walkthroughs

---

### 🧩 Other Notes
- Feature Flag: `auth:googleLogin` ✅ enabled
- Test Data: use `testuser@example.com / password123`