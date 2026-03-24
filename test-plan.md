# NASA Image & Video Library - Test Plan

**Project:** NASA Image & Video Library UI + API Testing
**Scope:** Playwright automation covering UI, API, and integrated testing
**Test Environment:** macOS/Windows/Linux with Chromium/Firefox/WebKit
**Duration:** 4-6 hours development, ~3-5 minutes execution

---

## Executive Summary

This test plan outlines comprehensive testing of NASA's Image and Video Library across three dimensions:
1. **UI Automation (Task A):** Search, navigation, and result validation
2. **API Testing (Task B):** REST API endpoint validation
3. **Integration Testing (Task C):** API-to-UI consistency verification

The test suite uses Playwright with TypeScript, Page Object Model architecture, and best practices for maintainability and scalability.

---

## Test Scope

### In Scope ✓
- Searching the NASA library (Web UI)
- Filtering results by media type (if available)
- Navigating to and viewing result details
- Validating title and preview images
- NASA Images REST API search endpoint
- Fetching asset details by NASA ID
- Downloading URL availability
- API-UI result consistency
- Negative test cases (empty/invalid queries)
- Screenshot capture on failure
- Trace retention for debugging

### Out of Scope ✗
- Authentication/Login testing (NASA library is public)
- Complete image download validation
- Performance/load testing
- Cross-browser visual regression
- Mobile responsive testing (desktop only)
- Accessibility compliance (WCAG)
- User comments/ratings features
- Social media integration
- Advanced filtering (date ranges, collections)
- Video playback testing

### Documented Exclusions
- **Why no mobile testing:** Assessment focuses on desktop automation; mobile would double test scope
- **Why no advanced filters:** Core requirement is media type filter; others are secondary UX
- **Why no performance tests:** Assessment prioritizes functional correctness over metrics
- **Why no accessibility:** Not explicitly required; would add 2+ hours to timeline

---

## Test Strategy

### Approach
1. **Separation of Concerns:** UI, API, and integration tests kept separate
2. **Page Object Model:** Abstracts page structure from test logic
3. **Stable Selectors:** Preference for `getByRole()`, `getByLabel()`, etc.
4. **Automatic Waits:** Leveraging Playwright's built-in waits
5. **No Fixed Sleeps:** Only `waitForLoadState()` and explicit assertions
6. **Parallel Execution:** Tests fully independent, safe for parallel runs
7. **Failure Documentation:** Screenshots and traces on every failure

### Search Term Strategy
- **Term:** "moon" (consistent across all tests)
- **Rationale:** Large result set, multiple media types, reliable results
- **Consistency:** Same term used in Task A (UI), Task B (API), Task C (integration)

### Assumptions
1. NASA library is publicly accessible without authentication
2. NASA API is stable and available (no maintenance windows during testing)
3. Search for "moon" returns consistent results across runs
4. UI selectors remain stable (minor layout changes acceptable)
5. Download URLs are stable between API and UI

---

## Test Cases

### Task A: UI Tests (7 test cases)

| ID | Test Name | Steps | Expected Result | Tags |
|---|-----------|-------|-----------------|------|
| A1 | Navigate to home | Load NASA library homepage | Page loads, contains NASA branding | @ui |
| A2 | Search functionality | Search for "moon" | Results page displays with results list | @ui |
| A3 | Filter by media type | Search "moon" + filter to "image" | Results filtered (or filter unavailable - documented) | @ui |
| A4 | Minimum results | Search "moon" | At least 5 results visible on page | @ui |
| A5 | Open result details | Click first search result | Details page loads with unique URL | @ui |
| A6 | Title visibility | Navigate to details page | Title element visible and contains text | @ui |
| A7 | Preview image loads | Navigate to details page | Main image element visible with src attribute | @ui |
| A8 | NASA ID capture | Navigate to details page | NASA ID extracted from URL or data attribute (or documented as unavailable) | @ui |

**Files:** `tests/task-a-ui.spec.ts`

### Task B: API Tests (7 test cases)

| ID | Test Name | Endpoint | Expected Result | Tags |
|---|-----------|----------|-----------------|------|
| B1 | Search HTTP 200 | GET /search?q=moon&media_type=image&page=1 | HTTP 200 response | @api |
| B2 | Results structure | GET /search?q=moon | collection.items[] contains at least 1 item | @api |
| B3 | Extract result data | GET /search?q=moon | First item has title and nasa_id in data[0] | @api |
| B4 | Fetch asset details | GET /asset/{nasa_id} | HTTP 200, valid asset response | @api |
| B5 | Download URLs | GET /asset/{nasa_id} | collection.items[] has href property with URLs | @api |
| B6 | Empty query handling | GET /search?q= | HTTP 200, empty or 0 results (graceful degradation) | @api |
| B7 | Invalid query | GET /search?q=xyzabc123notarealterm999 | HTTP 200, 0 results | @api |

**Files:** `tests/task-b-api.spec.ts`

### Task C: Integrated Tests (3 test cases)

| ID | Test Name | Steps | Expected Result | Tags |
|---|-----------|-------|-----------------|------|
| C1 | API-to-UI Match | 1. Search API for "moon"<br>2. Get first result title & nasa_id<br>3. Search UI for "moon"<br>4. Open first result<br>5. Compare title & ID | Titles match (normalized), NASA IDs match (if exposed) | @integrated |
| C2 | Result counts | 1. Count API results<br>2. Count UI visible results | Both have results, in reasonable range (API count ≥ UI visible count) | @integrated |
| C3 | Title in results | 1. Get API first result title<br>2. Search UI<br>3. Find title in UI results | API title appears in UI results list | @integrated |

**Files:** `tests/task-c-integrated.spec.ts`

**Total Test Cases:** 18

---

## Test Data

### Search Term
- **Value:** "moon"
- **Expected Results:** 500+ items in API, 20+ per page in UI
- **Media Types:** Images, videos, various collections
- **Consistency:** Same term across all three task categories

### Negative Test Data
- **Empty Query:** "" (empty string)
- **Nonsense Query:** "xyzabc123notarealterm999!!!"
- **Expected:** Graceful handling, 0 results, HTTP 200

---

## Execution Plan

### Environment Setup
1. Install Node.js 18+
2. Run `npm install` to install dependencies
3. Run `npx playwright install` to download browsers
4. Verify connectivity to `https://images.nasa.gov` and `https://images-api.nasa.gov`

### Test Execution Sequence
1. **Unit Phase:** Run all API tests (Task B) - 2-3 minutes
2. **UI Phase:** Run all UI tests (Task A) - 5-7 minutes
3. **Integration Phase:** Run integrated tests (Task C) - 3-5 minutes
4. **Parallel Mode:** Run all tests with `npx playwright test` - 3-5 minutes total

### Success Criteria
- All 18 tests pass
- No timeouts or flaky failures
- Screenshots captured on any failure
- HTML report generated successfully
- Execution time < 6 minutes for full suite

---

## Flaky Test Mitigation

### 1. Image Loading Delays
**Problem:** Preview images may load slowly
**Mitigation:**
- Use `waitForLoadState('networkidle')` after navigation
- Check image src attribute (avoid checking rendered pixels)
- Allow retry on timeout in config

### 2. Dynamic CSS Classes
**Problem:** UI may use generated class names
**Mitigation:**
- Prefer semantic selectors (`getByRole()`, `getByLabel()`)
- Use flexible CSS patterns: `[class*="preview"]`
- Test multiple selector patterns

### 3. API Rate Limiting
**Problem:** Rapid API calls may be throttled
**Mitigation:**
- Tests run in parallel (isolated contexts)
- No shared state between tests
- Sequential within each test (natural pacing)

### 4. Search Result Pagination
**Problem:** Results may be paginated, counts vary
**Mitigation:**
- Assert minimum 5 results (not exact count)
- Integrated test allows result count difference margin
- First page results should be stable

### 5. Content Updates
**Problem:** NASA library content may change daily
**Mitigation:**
- Search for popular term ("moon") - always has results
- Title matching is normalized (handles whitespace/punctuation)
- NASA IDs are stable (don't rely on content)

---

## Coverage Summary

| Category | Coverage | Notes |
|----------|----------|-------|
| **Happy Path** | 100% | Search, navigate, view details all tested |
| **Error Handling** | 60% | Empty/invalid queries tested; network errors not covered |
| **Data Validation** | 100% | Title, NASA ID, URLs, structure all validated |
| **Cross-browser** | 100% | Config supports Chromium, Firefox, WebKit |
| **Parallel Safety** | 100% | No shared state, independent test contexts |

---

## What We Didn't Cover & Why

### 1. Advanced Filtering (Estimated 1.5 hours)
- Collections, date range, location filters
- **Why not:** Assessment specifies "media type" as example; additional filters are secondary
- **Impact:** Core search functionality fully tested

### 2. Video Playback (Estimated 1 hour)
- Video element initialization and controls
- **Why not:** Assessment focuses on media "results validation", not playback
- **Impact:** Can validate video result presence; playback is browser's responsibility

### 3. Pagination (Estimated 1 hour)
- "Load more" or next page functionality
- **Why not:** First page results sufficient for "at least 5 results" requirement
- **Impact:** Tests assert minimum 5 visible (not pages)

### 4. Login/Authentication (0 hours - not needed)
- NASA library is public
- **Why not:** No credentials required
- **Impact:** N/A

### 5. Complete Download Validation (Estimated 1 hour)
- Actually downloading files and checking content
- **Why not:** Assessment requires "URL validation", not file download
- **Impact:** Tests validate URLs exist and are accessible (HTTP 200)

### 6. Performance Metrics (Estimated 0.5 hours)
- Page load times, API response times
- **Why not:** Assessment focuses on functional correctness
- **Impact:** Tests run but don't assert on timing

### 7. Accessibility (WCAG 2.1 AA) (Estimated 2 hours)
- Screen reader compatibility, keyboard navigation
- **Why not:** Not explicitly in requirements
- **Impact:** Tests use semantic selectors (accessibility-friendly by default)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| NASA API downtime | Low | High | Use `test.skip()` if API unavailable during run |
| UI selector changes | Medium | Medium | Use flexible selectors, maintain POM regularly |
| Flaky image loads | Medium | Low | Retry on timeout, `waitForLoadState()` |
| Rate limiting | Low | Medium | Parallel test execution (not sequential) |
| Network timeouts | Low | Medium | Increase action timeout in config if needed |

---

## Maintenance & Future Enhancements

### Short Term (If Needed)
- Add more search terms for comprehensive coverage
- Implement visual regression testing
- Add authentication if NASA adds login

### Medium Term
- Expand to advanced filters (collections, dates)
- Add performance benchmarking
- Increase browser/device coverage

### Long Term
- Integrate with CI/CD pipeline
- Build comprehensive test dashboard
- Add test result history tracking

---

## Compliance & Standards

- **Framework:** Playwright 1.40+
- **Language:** TypeScript 5.3+
- **Test Format:** Playwright Test (not Jest/Mocha)
- **Best Practices:**
  - Page Object Model pattern
  - Explicit assertions over implicit waits
  - No hardcoded timeouts
  - Parallel-safe design
  - Fail-fast with clear error messages

---

## Sign-Off

**Prepared By:** Assessment Response
**Date:** March 21, 2026
**Scope:** 18 automated tests across 3 test files
**Estimated Execution Time:** 3-5 minutes
**Success Rate Target:** 100% (all tests pass)

---

## Appendix: Test Execution Examples

### Run All Tests
```bash
npm test
```

### Run Only UI Tests
```bash
npm run test:ui
```

### Run Only API Tests
```bash
npm run test:api
```

### Run Only Integrated Tests
```bash
npm run test:integrated
```

### View Report
```bash
npm run report
```

### Debug Single Test
```bash
npx playwright test --grep "should search for moon" --debug
```

---

**End of Test Plan**
