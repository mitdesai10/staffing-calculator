// ========================================
// OneDrive Configuration
// ========================================

const ONEDRIVE_CONFIG = {
    // Your OneDrive file sharing ID
    // Get from: Share → Copy link → Extract ID (see instructions below)
    FILE_ID: 'EfDzq3wXzfJJiokG43-I5SsBO2OM-8NZaQ7cJAk3aPd5VQ',
    
    // The worksheet/tab name in your Excel file
    WORKSHEET_NAME: 'Rate Card Data',
    
    // Auto-refresh interval in milliseconds (60000 = 1 minute)
    REFRESH_INTERVAL: 60000,
    
    // Enable/disable auto-refresh
    AUTO_REFRESH: true
};

// ========================================
// SETUP INSTRUCTIONS
// ========================================
/*

STEP 1: PREPARE YOUR EXCEL FILE
================================

1. Open your Excel file
2. Create/rename a sheet tab to: "Rate Card Data"
3. Set up your columns EXACTLY like this:

   Row 1 (Headers):
   ┌──────────────────────────────┬──────────────────┬───────────────────┬────────────────────┐
   │ A: Role                      │ B: Onshore Cost/hr│ C: Offshore Cost/hr│ D: Nearshore Cost/hr│
   ├──────────────────────────────┼──────────────────┼───────────────────┼────────────────────┤
   │ Salesforce Solution Architect│ 100              │ 34                │ 47                 │
   │ Marketing Cloud Specialist   │ 66               │ 9                 │ 32                 │
   │ Junior Developer             │ 69               │ 11                │ 25                 │
   └──────────────────────────────┴──────────────────┴───────────────────┴────────────────────┘

4. IMPORTANT:
   ✅ First row MUST be headers
   ✅ Column A = Role names (text)
   ✅ Columns B, C, D = Numbers only (no $ signs, no commas)
   ✅ Sheet name MUST be "Rate Card Data"

5. Save your file


STEP 2: UPLOAD TO ONEDRIVE
===========================

1. Go to: onedrive.live.com
2. Sign in with your Microsoft account
3. Click "Upload" → "Files"
4. Select your Excel file
5. Wait for upload to complete
6. Your file is now in OneDrive!


STEP 3: GET SHARING LINK
=========================

1. Right-click your Excel file in OneDrive
2. Click "Share"
3. Click "Anyone with the link can view"
4. Make sure it's set to "View" (not Edit)
5. Click "Copy link"

You'll get a link like one of these:

Example 1: https://1drv.ms/x/s!AqZyN_AbCdEf123xyz
Example 2: https://onedrive.live.com/view.aspx?resid=ABC123!456&authkey=!xyz


STEP 4: EXTRACT FILE ID
========================

From your sharing link, extract the FILE ID:

TYPE 1 - Short link (1drv.ms):
Link: https://1drv.ms/x/s!AqZyN_AbCdEf123xyz
FILE_ID = Everything after /s!
FILE_ID = AqZyN_AbCdEf123xyz

TYPE 2 - Long link (onedrive.live.com):
Link: https://onedrive.live.com/view.aspx?resid=ABC123!456&authkey=!xyz
FILE_ID = The resid value
FILE_ID = ABC123!456

OR use the FULL sharing link as FILE_ID (both work):
FILE_ID = 'https://1drv.ms/x/s!AqZyN_AbCdEf123xyz'


STEP 5: CONFIGURE THIS FILE
============================

Replace YOUR_FILE_ID_HERE with your actual File ID:

If short link:
FILE_ID: 'AqZyN_AbCdEf123xyz',

If resid:
FILE_ID: 'ABC123!456',

Or full link:
FILE_ID: 'https://1drv.ms/x/s!AqZyN_AbCdEf123xyz',


STEP 6: UPLOAD TO GITHUB
=========================

1. Upload these files to your GitHub repository:
   - index.html
   - styles.css
   - script.js
   - rateCardData.js (backup data)
   - onedriveConfig.js (this file - configured)
   - onedriveLoader.js (data loader)

2. Commit changes
3. Wait 2-3 minutes for GitHub Pages to update


STEP 7: TEST IT!
=================

1. Visit your website
2. Open browser console (F12)
3. Look for messages:
   ✓ "Loading data from OneDrive..."
   ✓ "Data loaded! X roles found"
   ✓ "Auto-refresh enabled"

4. Check dropdown - should have your roles
5. Click "Refresh Data" button to test manual refresh
6. Make a change in Excel, save, wait 1 minute, click refresh!


TROUBLESHOOTING
===============

Issue: "Could not load data from OneDrive"
Solutions:
✅ Check FILE_ID is correct (no extra spaces, quotes correct)
✅ Make sure Excel file is shared publicly (Anyone with link can view)
✅ Verify sheet name is exactly "Rate Card Data"
✅ Check console (F12) for detailed error messages
✅ Try using full sharing link as FILE_ID

Issue: "No data found"
Solutions:
✅ Check first row has headers: Role, Onshore Cost/hr, etc.
✅ Make sure you have data in rows 2+
✅ Verify numbers are just numbers (no $ or commas)
✅ Check sheet name matches WORKSHEET_NAME setting

Issue: "Using backup data"
Solutions:
✅ This means OneDrive didn't load, but backup worked
✅ Calculator still works with backup data
✅ Fix OneDrive connection to get live updates

Issue: Changes in Excel not appearing
Solutions:
✅ Save your Excel file in OneDrive
✅ Click "Refresh Data" button on website
✅ Wait for auto-refresh (default: 1 minute)
✅ Hard refresh browser (Ctrl+Shift+R)


ADVANCED SETTINGS
=================

Change refresh interval:
REFRESH_INTERVAL: 120000,  // 2 minutes
REFRESH_INTERVAL: 300000,  // 5 minutes

Disable auto-refresh:
AUTO_REFRESH: false,  // Only manual refresh with button

Change worksheet name:
WORKSHEET_NAME: 'My Rates',  // Must match your Excel tab name


BENEFITS OF ONEDRIVE INTEGRATION
==================================

✅ Keep your Excel file in OneDrive
✅ Edit in Excel Online or desktop Excel
✅ Website updates automatically (every 1 minute)
✅ No manual exports needed
✅ Always up-to-date rates
✅ Team can collaborate on Excel
✅ Version history in OneDrive


WORKFLOW
========

1. Edit Excel in OneDrive (or desktop Excel with sync)
2. Save changes
3. Within 1 minute, website auto-refreshes
4. New rates appear automatically!

OR

1. Edit Excel
2. Click "Refresh Data" button on website
3. Instant update!


SECURITY NOTES
==============

- Excel file is shared as "View only"
- No one can edit via the website
- Only you can edit in OneDrive/Excel
- Website only reads data
- Sharing link can be regenerated if needed


NEED HELP?
==========

1. Check browser console (F12) for error messages
2. Verify your FILE_ID is correct
3. Make sure file is publicly shared
4. Test the sharing link in private browser window
5. Check Excel file format matches requirements

*/

// ========================================
// Export Configuration
// ========================================

// Make config available globally
window.ONEDRIVE_CONFIG = ONEDRIVE_CONFIG;

console.log('OneDrive configuration loaded');
console.log('File ID:', ONEDRIVE_CONFIG.FILE_ID.substring(0, 20) + '...');
console.log('Auto-refresh:', ONEDRIVE_CONFIG.AUTO_REFRESH ? 'Enabled' : 'Disabled');
