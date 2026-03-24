# NASA Image & Video Library & Open Library - Playwright Test Suite

A comprehensive Playwright test suite for NASA Image and Video Library and Open Library covering UI automation, API testing, and integrated cross-validation.

## Installation

### Prerequisites
- Node.js 16+ (LTS recommended)
- npm or yarn

### Steps

1. **Clone or extract the repository**
   ```
   git clone https://github.com/mtufailkhan/PlaywrightAssessmentRepo.git
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Install Playwright browsers** (required for first run)
   ```
   npx playwright install
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run UI Tests Only (Task 1 - A)
```bash
npm run test:ui
```

### Run API Tests Only (Task 1 - B)
```bash
npm run test:api
```

### Run Integrated Tests Only (Task 1 - C)
```bash
npm run test:integrated
```

### Run UI Tests Only (Task 2 - A)
```bash
npm run test:task2ui
```

### Run API Tests Only (Task 2 - B)
```bash
npm run test:task2api
```

### Run Integrated Tests Only (Task 2 - C)
```bash
npm run test:task2integrated
```

### Run Tests with UI Mode (headed)
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### View HTML Report
After tests complete, view the Playwright HTML report:
```bash
npm run report
```
The report opens in your default browser and shows:
- Test status and duration
- Screenshots on failure
- Trace files (videos of test execution)
- Error messages and stack traces

## Debugging Tips

### 1. View Traces
Traces are automatically saved on failure. To inspect:
```bash
npx playwright show-trace trace.zip
```

### 2. Screenshot Inspection
Failed tests automatically capture screenshots in `test-results/`

### 3. Run Single Test
```bash
npx playwright test --grep "should search for moon"
```

### 4. Run in Debug Mode
```bash
npm run test:debug
```

### 5. Increase Timeout for Debugging
Edit `.env`: 
```typescript
PLAYWRIGHT_NAVIGATION_TIMEOUT=60000
PLAYWRIGHT_ACTION_TIMEOUT=60000
PLAYWRIGHT_TEST_TIMEOUT=120000
```

## Selector Strategy

The test suite uses Playwright's recommended selector priority:
1. `getByRole()` - Most stable and semantic
2. `getByLabel()` - Form inputs with labels
3. `getByPlaceholder()` - Input placeholders
4. `getByText()` - Visible text content
5. CSS selectors with flexible patterns - Last resort
6. XPaths - Used where elements were dynamic or multiple occurences, to find exact element.

This approach ensures tests remain stable even when UI structure changes slightly.
