# Systems Not Showing Under Agency - Resolution

## Problem
Systems created under an agency were not appearing on the agency detail page, even though they were being created successfully.

**Symptoms:**
- Created: "Ministry of Infrastructure and Transport" agency
- Added systems: "eRALIS" and "TCB Tashel"
- Result: Systems not visible on agency detail page

## Root Cause Analysis

The issue was in the **database relationship**:

1. **Systems table has two fields:**
   - `agency` (TEXT) - stores agency name
   - `agency_id` (INTEGER) - should store agency ID (FOREIGN KEY)

2. **Problem:** When systems were created via the form, the backend was only storing the agency **name** but not the agency **ID**

3. **Result:** 
   - Systems had: `agency = "Ministry of Infrastructure and Transport"`, `agency_id = NULL`
   - The detail page query filters by: `WHERE agency_id = ?`
   - This returned NO systems because `agency_id` was NULL/empty

## Solution Implemented

### 1. Backend API Fix (`Backend/src/api/systems.js`)

**Create System Endpoint:**
- Now looks up the agency ID by name
- Inserts BOTH `agency` (name) AND `agency_id` (ID) into the database
- Returns error if agency not found

**Update System Endpoint:**
- When agency is updated, looks up the new agency ID
- Updates both `agency` and `agency_id` fields

### 2. Database Migration

Created and ran `migrate-agency-ids.js` to fix existing systems:
- Found 3 systems with NULL `agency_id`
- Successfully updated 2 systems:
  - eRALIS: Set `agency_id = 21`
  - TCB Tashel: Set `agency_id = 21`
- 1 failed: System with agency = "Other" (agency doesn't exist)

## Verification Results ✅

### Ministry of Infrastructure and Transport (ID: 21)
**Before Fix:**
```
Systems count: 0
Systems returned: 0
```

**After Fix:**
```
Systems count: 2
Systems up: 2
Systems down: 0
Systems:
  - eRALIS (ID: 37, agency_id: 21)
  - TCB Tashel (ID: 38, agency_id: 21)
```

### New Test Agency (Created after fix)
**Created:** TestAgency_1765442487 (ID: 22)
**Systems Added:** Test System 1, Test System 2
**Result:** Both systems show with correct agency_id = 22 ✅

## Files Modified

1. **`Backend/src/api/systems.js`**
   - Lines 66-105: Updated createSystem to lookup agency_id
   - Lines 178-193: Updated updateSystem to handle agency_id

2. **`Backend/database/migrate-agency-ids.js`** (New)
   - Migration script to fix existing systems
   - Updates agency_id for systems where it was NULL

## How It Works Now

1. **Creating a System:**
   ```
   Form sends: agency = "Ministry of Infrastructure and Transport"
   Backend:
   - Looks up: SELECT id FROM agencies WHERE name = ?
   - Stores: agency = "...", agency_id = 21
   ```

2. **Displaying Systems on Agency Page:**
   ```
   Query: SELECT * FROM systems WHERE agency_id = 21
   Returns: eRALIS, TCB Tashel (and any others)
   ```

## Browser Testing

To verify systems now appear on the agency detail page:

1. Open: `http://localhost:9090/HTML/admin-systems.html`
2. Create a new agency (e.g., "Test Department")
3. Scroll down and create 2-3 systems, selecting the new agency
4. Click on the agency in the dashboard or navigate to: `http://localhost:9090/HTML/agency.html?agency_id=XX`
5. ✅ Systems should now appear in the table!

## Result

✅ Systems are now correctly linked to agencies via `agency_id`
✅ All newly created systems will have proper agency relationships
✅ Agency detail pages will display systems correctly
✅ The "Ministry of Infrastructure and Transport" now shows eRALIS and TCB Tashel
