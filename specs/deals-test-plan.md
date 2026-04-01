# Deals Feature — Test Plan
**Application:** HubSpot CRM (https://app-eu1.hubspot.com)  
**Module:** Deals  
**Date:** 2026-04-01  
**Status:** Ready for Implementation  

---

## Assumptions

- User is authenticated into the HubSpot portal (portalId: 148143933).
- Each test creates its own test data and cleans up after itself.
- Tests are independent and can run in any order.
- Irrelevant popups (e.g. "Remember this device?", passkey promo) are dismissed as part of setup.
- "Sales Pipeline" is the default pipeline with stages:  
  `Appointment Scheduled → Qualified To Buy → Presentation Scheduled → Decision Maker Bought-In → Contract Sent → Closed Won / Closed Lost`

---

## Test Data Strategy

- Deal names are unique per test, e.g. `Test Deal <timestamp>` using `Date.now()`.
- After each destructive test, verify deletion via the list view or API.
- Avoid relying on pre-existing data — create what you need.

---

## 1. Create Deal

### TC-01 — Create a deal with required fields only

**Starting state:** Deals list view (`/contacts/{portalId}/objects/0-3/views/all/list`)

**Steps:**
1. Click **Add deals** button.
2. Click **Create new** from the dropdown.
3. Verify the **Create Deal** modal opens.
4. Enter a unique deal name in the **Deal name** field (e.g. `Test Deal <timestamp>`).
5. Verify **Pipeline** defaults to `Sales Pipeline`.
6. Verify **Deal stage** defaults to `Appointment Scheduled`.
7. Leave all optional fields (Amount, Close date, Deal owner, Deal type, Priority) blank.
8. Click **Create**.

**Expected result:**
- Modal closes.
- The new deal appears in the Deals list with the entered name.
- Deal stage shows `Appointment Scheduled`.

---

### TC-02 — Create a deal with all fields filled

**Starting state:** Deals list view

**Steps:**
1. Click **Add deals** → **Create new**.
2. Enter a unique deal name.
3. Verify **Pipeline** shows `Sales Pipeline`; leave it as default.
4. Select **Deal stage**: `Contract Sent`.
5. Enter **Amount**: `15000`.
6. Enter **Close date**: a future date (e.g. next month).
7. Select **Deal type**: `New Business`.
8. Select **Priority**: `High`.
9. Click **Create**.

**Expected result:**
- Modal closes.
- Deal appears in the list with correct name, stage `Contract Sent`, and amount `15,000`.

---

### TC-03 — Create a deal using "Create and add another"

**Starting state:** Deals list view

**Steps:**
1. Click **Add deals** → **Create new**.
2. Enter a unique deal name (e.g. `Batch Deal 1 <timestamp>`).
3. Click **Create and add another**.
4. Verify the modal remains open and fields are cleared.
5. Enter a second unique deal name (e.g. `Batch Deal 2 <timestamp>`).
6. Click **Create**.

**Expected result:**
- Both deals appear in the Deals list.
- The first deal was created before the second.

---

### TC-04 — Attempt to create a deal without a deal name (validation)

**Starting state:** Deals list view

**Steps:**
1. Click **Add deals** → **Create new**.
2. Leave the **Deal name** field empty.
3. Verify the **Create** button is disabled.
4. Try to submit anyway (press Enter in the form).

**Expected result:**
- The **Create** button remains disabled while deal name is empty.
- The modal does not close; no deal is created.

---

### TC-05 — Cancel deal creation

**Starting state:** Deals list view

**Steps:**
1. Note the current total deal count shown on the "All deals" tab.
2. Click **Add deals** → **Create new**.
3. Enter a deal name.
4. Click **Cancel**.

**Expected result:**
- Modal closes.
- Total deal count on the "All deals" tab is unchanged.
- No new deal with the entered name appears in the list.

---

### TC-06 — Cancel deal creation by closing the modal (X button)

**Starting state:** Deals list view

**Steps:**
1. Click **Add deals** → **Create new**.
2. Enter a deal name.
3. Click the **Close (×)** button in the modal header.

**Expected result:**
- Modal closes.
- No new deal is created.

---

### TC-07 — Create a deal and associate it with a Contact

**Starting state:** Deals list view (at least one existing Contact in the portal)

**Steps:**
1. Click **Add deals** → **Create new**.
2. Enter a unique deal name.
3. In the **Associate Deal with** section, click **Contact Search**.
4. Type part of an existing contact's name.
5. Select the contact from the suggestion list.
6. Click **Create**.

**Expected result:**
- Deal is created successfully.
- Opening the deal detail page shows the associated contact in the **Contacts** section on the right sidebar.

---

### TC-08 — Create a deal and associate it with a Company

**Starting state:** Deals list view (at least one existing Company in the portal)

**Steps:**
1. Click **Add deals** → **Create new**.
2. Enter a unique deal name.
3. In the **Associate Deal with** section, click **Company Search**.
4. Type part of an existing company's name.
5. Select it from the suggestion list.
6. Click **Create**.

**Expected result:**
- Deal is created successfully.
- Opening the deal detail page shows the associated company in the **Companies** section on the right sidebar.

---

## 2. Edit Deal (Detail Page)

### TC-09 — Edit deal name via the Edit button on detail page

**Starting state:** Deal detail page of a previously created test deal

**Steps:**
1. Navigate to the deal detail page.
2. Click the **Edit** button next to the deal name.
3. Clear the deal name field and enter a new unique name.
4. Save the changes (click **Save** or press Enter).

**Expected result:**
- The deal detail page heading reflects the new name.
- Navigating back to the Deals list shows the updated name.

---

### TC-10 — Change deal stage from the detail page

**Starting state:** Deal detail page (deal in `Appointment Scheduled` stage)

**Steps:**
1. Locate the **Deal Stage** button showing `Appointment Scheduled`.
2. Click it to open the stage dropdown.
3. Select `Qualified To Buy`.

**Expected result:**
- The Deal Stage button updates immediately to `Qualified To Buy`.
- The change is reflected in the activity feed (Deal Activity entry logged).

---

### TC-11 — Change deal stage to Closed Won

**Starting state:** Deal detail page

**Steps:**
1. Click the **Deal Stage** button.
2. Select `Closed Won` from the dropdown.

**Expected result:**
- Deal stage updates to `Closed Won`.
- Activity feed records the stage transition.

---

### TC-12 — Change deal stage to Closed Lost

**Starting state:** Deal detail page

**Steps:**
1. Click the **Deal Stage** button.
2. Select `Closed Lost` from the dropdown.

**Expected result:**
- Deal stage updates to `Closed Lost`.
- Activity feed records the stage transition.

---

### TC-13 — Edit deal amount inline (from list view)

**Starting state:** Deals list view

**Steps:**
1. Locate a test deal in the list.
2. Click the **Amount** cell (shows `--`).
3. Enter the value `5000`.
4. Confirm the edit (press Enter or click outside).

**Expected result:**
- The Amount cell in the list updates to the entered value.
- On the deal detail page, the Amount reflects `5,000`.

---

### TC-14 — Edit deal close date inline (from list view)

**Starting state:** Deals list view

**Steps:**
1. Locate a test deal in the list.
2. Click the **Close Date** cell.
3. Enter or select a future date.
4. Confirm the edit.

**Expected result:**
- The Close Date cell updates to the entered date.
- The deal detail page reflects the same date.

---

### TC-15 — Edit deal stage inline (from list view)

**Starting state:** Deals list view

**Steps:**
1. Locate a test deal in the list.
2. Click the **Deal Stage** cell (e.g. `Appointment Scheduled (Sales Pipeline)`).
3. Select a different stage from the dropdown (e.g. `Presentation Scheduled`).

**Expected result:**
- The Deal Stage cell updates immediately to the new stage.

---

## 3. Delete Deal

### TC-16 — Delete a deal from the deal detail page (Actions menu)

**Starting state:** Deal detail page of a test deal

**Steps:**
1. Click the **Actions** button in the deal header.
2. Click **Delete** from the dropdown.
3. Confirm the deletion in the confirmation dialog.

**Expected result:**
- User is redirected to the Deals list (or a confirmation screen).
- The deleted deal no longer appears in the Deals list.

---

### TC-17 — Delete a deal from the list view (single row selection)

**Starting state:** Deals list view

**Steps:**
1. Select the checkbox for a single test deal row.
2. Verify the bulk action toolbar appears with "1 deal selected".
3. Click **Delete** in the bulk action toolbar.
4. Confirm the deletion in the confirmation dialog.

**Expected result:**
- The deal is removed from the list.
- Deal count on the "All deals" tab decreases by 1.

---

### TC-18 — Delete multiple deals from the list view (bulk delete)

**Starting state:** Deals list view (at least 2 test deals exist)

**Steps:**
1. Select the checkboxes for 2 different test deals.
2. Verify the bulk action toolbar shows "2 deals selected".
3. Click **Delete** in the bulk action toolbar.
4. Confirm the deletion.

**Expected result:**
- Both deals are removed from the list.
- Deal count decreases by 2.

---

### TC-19 — Cancel deal deletion (confirmation dialog dismiss)

**Starting state:** Deal detail page of a test deal

**Steps:**
1. Click **Actions** → **Delete**.
2. When the confirmation dialog appears, click **Cancel** (or dismiss the dialog).

**Expected result:**
- The dialog closes.
- The deal still exists on the detail page and in the Deals list.

---

## 4. Clone Deal

### TC-20 — Clone a deal from the detail page

**Starting state:** Deal detail page of a test deal with several fields filled (name, stage, amount, close date)

**Steps:**
1. Click **Actions** → **Clone**.
2. Observe the cloned deal form or confirm the clone action.
3. Note the name of the cloned deal.

**Expected result:**
- A new deal is created with the same properties as the original (or a "Copy of..." name variation).
- The cloned deal appears in the Deals list.
- The original deal is untouched.

---

## 5. Deals List View — Filtering & Search

### TC-21 — Search for a deal by name in list view

**Starting state:** Deals list view

**Steps:**
1. Create a uniquely named test deal (e.g. `SearchTarget <timestamp>`).
2. In the **Search** field at the top of the list, type the exact deal name.
3. Wait for the list to filter.

**Expected result:**
- Only the matching deal is displayed in the list.
- Non-matching deals are hidden.

---

### TC-22 — Search returns no results for non-existent deal name

**Starting state:** Deals list view

**Steps:**
1. In the **Search** field, type a name that does not match any deal (e.g. `ZZZZ_NONEXISTENT_DEAL_XYZ`).
2. Wait for the list to update.

**Expected result:**
- The list displays no deals or shows a "no results" message.

---

### TC-23 — Filter deals by Deal owner (quick filter)

**Starting state:** Deals list view

**Steps:**
1. Click the **Deal owner** quick filter button.
2. Select a specific owner (e.g. `Ihor Hanets`).
3. Apply the filter.

**Expected result:**
- Only deals owned by the selected user are displayed.
- The filter is shown as active in the filter bar.

---

### TC-24 — Filter deals by Close date (quick filter)

**Starting state:** Deals list view

**Steps:**
1. Click the **Close date** quick filter button.
2. Select a date range (e.g. "This month").
3. Apply the filter.

**Expected result:**
- Only deals with a close date within the selected range are displayed.

---

### TC-25 — Clear applied filters

**Starting state:** Deals list view with at least one filter applied

**Steps:**
1. Apply the Deal owner filter (TC-23).
2. Remove the filter by clicking the ✕ on the filter chip or clicking "Clear all" in the filter bar.

**Expected result:**
- The filter is removed.
- The full deals list is restored.

---

### TC-26 — Filter by Pipeline

**Starting state:** Deals list view

**Steps:**
1. Click the **All Pipelines** dropdown button in the toolbar.
2. Select `Sales Pipeline`.

**Expected result:**
- Only deals belonging to the Sales Pipeline are displayed.
- The pipeline selector shows `Sales Pipeline` as selected.

---

## 6. Deals List View — Sorting

### TC-27 — Sort deals by Deal Name (A → Z)

**Starting state:** Deals list view

**Steps:**
1. Click the **Sort** button in the toolbar.
2. Verify the current sort shows `Deal Name A → Z`.

**Expected result:**
- List is already sorted alphabetically ascending (A → Z) by deal name.

---

### TC-28 — Sort deals by Deal Name (Z → A)

**Starting state:** Deals list view

**Steps:**
1. Click the **Sort** button.
2. Select **Z → A** sorting for Deal Name.

**Expected result:**
- The deals list re-orders with the alphabetically last deal name appearing first.

---

### TC-29 — Sort by column header click (Deal Name)

**Starting state:** Deals list view

**Steps:**
1. Click the **Deal Name** column header (which currently shows "Ascending sort").
2. Observe the sort direction toggle.

**Expected result:**
- Sort changes to Descending (Z → A).
- Deals reorder accordingly.

---

## 7. Deals Board View

### TC-30 — Switch to Board view from List view

**Starting state:** Deals list view

**Steps:**
1. Click the **Table view** button in the toolbar.
2. Select **Board view** from the dropdown.

**Expected result:**
- The URL changes to `/views/all/board`.
- Deals are displayed as cards organized in columns by stage.
- All 7 pipeline stages are visible as columns: Appointment Scheduled, Qualified To Buy, Presentation Scheduled, Decision Maker Bought-In, Contract Sent, Closed Won, Closed Lost.

---

### TC-31 — Switch back to Table (List) view from Board view

**Starting state:** Deals board view

**Steps:**
1. Click the **Board view** button in the toolbar.
2. Select **Table view**.

**Expected result:**
- URL changes back to `/views/all/list`.
- Deals are displayed in a table format with columns.

---

### TC-32 — Verify deal card displays correct information on Board view

**Starting state:** Deals board view. A test deal exists with: name, close date, deal owner, create date set.

**Steps:**
1. Locate the test deal card in the relevant column.
2. Inspect the card for: deal name, create date, close date, deal owner.

**Expected result:**
- Deal card shows the correct deal name, create date, close date, and deal owner.
- The card is in the correct stage column.

---

### TC-33 — Create a deal from Board view

**Starting state:** Deals board view

**Steps:**
1. Click **Add deals** → **Create new**.
2. Enter a unique deal name and set Deal Stage to `Qualified To Buy`.
3. Click **Create**.

**Expected result:**
- The modal closes.
- A new deal card appears in the **Qualified To Buy** column.

---

### TC-34 — Navigate to deal detail from Board view card

**Starting state:** Deals board view

**Steps:**
1. Locate any deal card.
2. Click the deal name link on the card.

**Expected result:**
- Browser navigates to the deal detail page for that deal.
- Page title matches the deal name.

---

## 8. Deal Detail Page — Activities

### TC-35 — Add a note to a deal

**Starting state:** Deal detail page

**Steps:**
1. Click **Create a note** in the activity actions bar.
2. Enter note text (e.g. `Test note <timestamp>`).
3. Save/submit the note.

**Expected result:**
- The note appears in the activity feed under "Notes".
- Clicking on "Notes" tab in the activity section shows the note.

---

### TC-36 — Create a task linked to a deal

**Starting state:** Deal detail page

**Steps:**
1. Click **Create a task** in the activity actions bar.
2. Enter a task title (e.g. `Follow up <timestamp>`).
3. Set a due date.
4. Save the task.

**Expected result:**
- The task appears in the activity timeline.
- Clicking "Tasks" tab shows the new task.

---

### TC-37 — Filter activity feed by type (Notes)

**Starting state:** Deal detail page with at least one note logged

**Steps:**
1. Click the **Notes** tab in the activity section.

**Expected result:**
- Only notes are displayed in the feed.
- Other activity types (emails, calls, tasks) are hidden.

---

## 9. Deal Detail Page — Associations

### TC-38 — Add a contact association from the deal detail page

**Starting state:** Deal detail page (at least one Contact exists in the portal)

**Steps:**
1. Scroll to the **Contacts (0)** section in the right sidebar.
2. Click **Add**.
3. Search for an existing contact by name.
4. Select the contact.

**Expected result:**
- The Contacts section shows `Contacts (1)` and lists the associated contact.

---

### TC-39 — Add a company association from the deal detail page

**Starting state:** Deal detail page (at least one Company exists in the portal)

**Steps:**
1. Scroll to the **Companies (0)** section in the right sidebar.
2. Click **Add**.
3. Search for and select an existing company.

**Expected result:**
- The Companies section shows `Companies (1)` with the associated company.

---

## 10. Deal Views — Tab Management

### TC-40 — Switch between deal views tabs (All deals / My deals)

**Starting state:** Deals list view on the "All deals" tab

**Steps:**
1. Click the **My deals** tab.

**Expected result:**
- The list filters to show only deals owned by the current user.
- The "My deals" tab is active.

---

### TC-41 — Verify deal count badge on "All deals" tab

**Starting state:** Deals list view

**Steps:**
1. Note the number shown in the "All deals" badge (e.g. `342`).
2. Create a new deal.
3. Navigate back to the Deals list view.

**Expected result:**
- The badge count on the "All deals" tab increases by 1.

---

## 11. Bulk Actions (List View)

### TC-42 — Select all deals and verify bulk action toolbar

**Starting state:** Deals list view

**Steps:**
1. Click the **Select all records** checkbox in the table header.

**Expected result:**
- All visible deals in the current page are selected.
- Bulk action toolbar appears showing "N deals selected".
- Action buttons visible: Assign, Fill smart properties, Edit, Delete, More.

---

### TC-43 — Deselect rows clears bulk action toolbar

**Starting state:** Deals list view with one deal selected (bulk action toolbar visible)

**Steps:**
1. Uncheck the selected deal's checkbox.

**Expected result:**
- Bulk action toolbar disappears.
- The previously selected checkbox is unchecked.

---

## 12. Column Management (List View)

### TC-44 — Open "Edit columns" dialog

**Starting state:** Deals list view

**Steps:**
1. Click the **Edit columns** button in the toolbar.

**Expected result:**
- A dialog titled "Choose which columns you see" opens.
- Available column categories are shown: Associations, Deal activity, Deal revenue, Deal information, HubSpot Metrics, Analytics history.
- Currently selected columns (6) are listed.

---

### TC-45 — Add a column and verify it appears in the table

**Starting state:** Deals list view — Edit columns dialog open

**Steps:**
1. Click **Edit columns**.
2. Find a property not currently shown (e.g. `Deal Type` under Deal information).
3. Toggle it ON (add to selected columns).
4. Click **Apply** or **Save**.

**Expected result:**
- The dialog closes.
- A new Deal Type column appears in the table header.

---

## Edge Cases

### TC-46 — Deal name with special characters

**Starting state:** Deals list view

**Steps:**
1. Open the **Create Deal** modal.
2. Enter a deal name containing special characters: `Test Deal <>&"'`.
3. Click **Create**.

**Expected result:**
- Deal is created without errors.
- The deal name is displayed correctly (characters are not escaped/broken).

---

### TC-47 — Deal name with very long text (boundary test)

**Starting state:** Deals list view

**Steps:**
1. Open the **Create Deal** modal.
2. Enter a deal name of 255 characters.
3. Click **Create**.

**Expected result:**
- If within field limit: deal is created successfully.
- If limit exceeded: an appropriate validation message is shown.

---

### TC-48 — Amount field accepts only numeric values

**Starting state:** Deals list view — Create Deal modal open

**Steps:**
1. In the **Amount** field, type alphabetical text (e.g. `abc`).
2. Attempt to click **Create**.

**Expected result:**
- Amount field rejects non-numeric input, OR
- A validation error is shown, preventing deal creation.

---

### TC-49 — Amount field with decimal value

**Starting state:** Create Deal modal

**Steps:**
1. Enter a decimal amount: `9999.99`.
2. Click **Create**.

**Expected result:**
- Deal is created. Amount is stored and displayed as `9,999.99`.

---

### TC-50 — Deal with no close date set shows "—" in list

**Starting state:** Deals list view

**Steps:**
1. Create a deal with all required fields but leave **Close date** blank.
2. Confirm creation.
3. Find the deal in the list.

**Expected result:**
- The **Close Date** column for the new deal shows `--` (not an error).

---
