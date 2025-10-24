// ========================================
// OneDrive Excel Data Loader
// ========================================

let rateCardData = [];
let lastUpdateTime = null;
let refreshTimer = null;

// ========================================
// Load Data from OneDrive Excel
// ========================================

async function loadDataFromOneDrive() {
    try {
        console.log('Loading data from OneDrive Excel...');
        
        const fileId = ONEDRIVE_CONFIG.FILE_ID;
        const worksheetName = ONEDRIVE_CONFIG.WORKSHEET_NAME;
        
        // OneDrive public file - Excel data as JSON
        // Format: https://onedrive.live.com/download?resid=FILE_ID&authkey=AUTH_KEY&em=2
        
        // Build public embed URL for Excel
        const embedUrl = `https://onedrive.live.com/download?resid=${fileId}&em=2`;
        
        console.log('Attempting to fetch from OneDrive...');
        
        // Try direct fetch first
        try {
            const response = await fetch(embedUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json, text/plain, */*'
                }
            });
            
            if (response.ok) {
                // If direct fetch works, parse the data
                const data = await parseExcelResponse(response);
                if (data && data.length > 0) {
                    rateCardData = data;
                    lastUpdateTime = new Date();
                    console.log(`✓ Data loaded! ${rateCardData.length} roles found.`);
                    updateLastUpdateDisplay();
                    
                    if (typeof onDataLoaded === 'function') {
                        onDataLoaded();
                    }
                    return true;
                }
            }
        } catch (directError) {
            console.log('Direct fetch failed, trying alternative method...');
        }
        
        // Alternative: Use OneDrive embed viewer API
        await loadViaEmbedAPI(fileId, worksheetName);
        return true;
        
    } catch (error) {
        console.error('OneDrive loading failed:', error);
        return useFallbackData();
    }
}

// ========================================
// Load via OneDrive Embed API
// ========================================

async function loadViaEmbedAPI(fileId, worksheetName) {
    try {
        // OneDrive provides a JSON endpoint for public Excel files
        // Format: https://onedrive.live.com/embed?resid=FILE_ID&em=2&wdAllowInteractivity=False&Item='SHEET'!A1:D100
        
        const embedApiUrl = `https://onedrive.live.com/embed?resid=${fileId}&em=2&wdAllowInteractivity=False&AllowTyping=False`;
        
        console.log('Trying embed API method...');
        
        // This approach uses iframe embedding
        // We'll need to parse the data from the embedded view
        
        // For now, let's use a simpler approach: CSV export
        await loadViaCSVExport(fileId);
        
    } catch (error) {
        console.error('Embed API failed:', error);
        throw error;
    }
}

// ========================================
// Load via CSV Export
// ========================================

async function loadViaCSVExport(fileId) {
    try {
        // OneDrive allows downloading Excel as CSV via special URL
        const csvUrl = `https://onedrive.live.com/download?resid=${fileId}&em=2`;
        
        console.log('Attempting CSV export method...');
        
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        rateCardData = parseCSVData(csvText);
        
        if (rateCardData.length > 0) {
            lastUpdateTime = new Date();
            console.log(`✓ Data loaded via CSV! ${rateCardData.length} roles found.`);
            updateLastUpdateDisplay();
            
            if (typeof onDataLoaded === 'function') {
                onDataLoaded();
            }
            return true;
        } else {
            throw new Error('No data found in CSV');
        }
        
    } catch (error) {
        console.error('CSV export failed:', error);
        throw error;
    }
}

// ========================================
// Parse CSV Data
// ========================================

function parseCSVData(csvText) {
    try {
        const lines = csvText.trim().split('\n');
        
        if (lines.length < 2) {
            throw new Error('CSV has no data rows');
        }
        
        // Skip header row
        const dataRows = lines.slice(1);
        
        return dataRows.map(line => {
            // Simple CSV parsing (handles basic cases)
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            
            return {
                role: values[0] || '',
                onshore: {
                    cost: parseFloat(values[1]) || 0
                },
                offshore: {
                    cost: parseFloat(values[2]) || 0
                },
                nearshore: {
                    cost: parseFloat(values[3]) || 0
                }
            };
        }).filter(item => item.role); // Remove empty rows
        
    } catch (error) {
        console.error('CSV parsing error:', error);
        return [];
    }
}

// ========================================
// Parse Excel Response
// ========================================

async function parseExcelResponse(response) {
    try {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('json')) {
            const json = await response.json();
            return parseJSONData(json);
        } else if (contentType && contentType.includes('text')) {
            const text = await response.text();
            return parseCSVData(text);
        } else {
            // Binary Excel file - would need xlsx library
            console.warn('Binary Excel file requires xlsx.js library');
            throw new Error('Cannot parse binary Excel without library');
        }
    } catch (error) {
        console.error('Parse error:', error);
        return [];
    }
}

// ========================================
// Parse JSON Data
// ========================================

function parseJSONData(data) {
    try {
        // If data is already in correct format
        if (Array.isArray(data)) {
            return data.map(item => ({
                role: item.role || item.Role || '',
                onshore: {
                    cost: parseFloat(item.onshore?.cost || item['Onshore Cost/hr'] || 0)
                },
                offshore: {
                    cost: parseFloat(item.offshore?.cost || item['Offshore Cost/hr'] || 0)
                },
                nearshore: {
                    cost: parseFloat(item.nearshore?.cost || item['Nearshore Cost/hr'] || 0)
                }
            })).filter(item => item.role);
        }
        
        return [];
    } catch (error) {
        console.error('JSON parsing error:', error);
        return [];
    }
}

// ========================================
// Fallback to Backup Data
// ========================================

function useFallbackData() {
    if (typeof rateCardDataBackup !== 'undefined' && rateCardDataBackup.length > 0) {
        console.log('✓ Using backup data from rateCardData.js');
        rateCardData = rateCardDataBackup;
        lastUpdateTime = new Date();
        updateLastUpdateDisplay();
        
        if (typeof onDataLoaded === 'function') {
            onDataLoaded();
        }
        return true;
    }
    
    console.error('No backup data available!');
    alert('Could not load data from OneDrive. Please check your configuration in onedriveConfig.js');
    return false;
}

// ========================================
// Auto-Refresh
// ========================================

function startAutoRefresh() {
    if (!ONEDRIVE_CONFIG.AUTO_REFRESH) {
        console.log('Auto-refresh is disabled');
        return;
    }
    
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    
    refreshTimer = setInterval(() => {
        console.log('Auto-refreshing data from OneDrive...');
        loadDataFromOneDrive();
    }, ONEDRIVE_CONFIG.REFRESH_INTERVAL);
    
    console.log(`✓ Auto-refresh enabled: Updates every ${ONEDRIVE_CONFIG.REFRESH_INTERVAL / 1000} seconds`);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
        console.log('Auto-refresh stopped');
    }
}

// ========================================
// Manual Refresh
// ========================================

window.refreshData = async function() {
    const btn = document.getElementById('refreshBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Refreshing...';
    }
    
    console.log('Manual refresh triggered');
    await loadDataFromOneDrive();
    
    if (btn) {
        btn.disabled = false;
        btn.textContent = '🔄 Refresh Data';
    }
    
    // Reload roles dropdown
    if (typeof populateRoles === 'function') {
        populateRoles();
    }
};

// ========================================
// Update Last Update Display
// ========================================

function updateLastUpdateDisplay() {
    const display = document.getElementById('lastUpdate');
    if (display && lastUpdateTime) {
        display.textContent = `Last updated: ${lastUpdateTime.toLocaleTimeString()} (from OneDrive)`;
    }
}

// ========================================
// Initialize on Page Load
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('=================================');
    console.log('OneDrive Excel Integration');
    console.log('=================================');
    
    // Load data initially
    const success = await loadDataFromOneDrive();
    
    if (success && ONEDRIVE_CONFIG.AUTO_REFRESH) {
        // Start auto-refresh
        startAutoRefresh();
    }
    
    console.log('Initialization complete');
});

// ========================================
// Cleanup on Page Unload
// ========================================

window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
});
