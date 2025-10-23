// ========================================
// Global State
// ========================================

let positions = [];
let positionIdCounter = 0;

// ========================================
// Initialize Application
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const roleSelect = document.getElementById('role');
    
    // Populate roles
    rateCardData.forEach(role => {
        const option = document.createElement('option');
        option.value = role.role;
        option.textContent = role.role;
        roleSelect.appendChild(option);
    });
    
    // Add event listeners
    document.getElementById('positionForm').addEventListener('submit', handleAddPosition);
    document.getElementById('clearAllBtn').addEventListener('click', handleClearAll);
}

// ========================================
// Handle Add Position
// ========================================

function handleAddPosition(e) {
    e.preventDefault();
    
    console.log('Add position clicked');
    
    // Get form values
    const role = document.getElementById('role').value;
    const location = document.getElementById('location').value;
    const hours = parseFloat(document.getElementById('hours').value);
    const desiredMargin = parseFloat(document.getElementById('desiredMargin').value) / 100;
    
    console.log('Form values:', { role, location, hours, desiredMargin });
    
    // Validate
    if (!role || !location || !hours || isNaN(desiredMargin)) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Get role data
    const roleData = rateCardData.find(r => r.role === role);
    
    console.log('Role data:', roleData);
    
    if (!roleData) {
        alert('Role data not found');
        return;
    }
    
    // Calculate position data
    const cost = roleData[location].cost;
    const clientRate = cost > 0 ? cost / (1 - desiredMargin) : 0;
    const totalCost = hours * clientRate;
    
    console.log('Calculated:', { cost, clientRate, totalCost });
    
    // Create position object
    const position = {
        id: ++positionIdCounter,
        role,
        location,
        hours,
        desiredMargin,
        cost,
        clientRate,
        totalCost,
        roleData
    };
    
    // Add to positions array
    positions.push(position);
    
    console.log('Total positions:', positions.length);
    
    // Update UI
    renderPositions();
    updateSummary();
    
    // Reset form
    document.getElementById('positionForm').reset();
    
    // Show results, hide placeholder
    document.getElementById('resultsPlaceholder').style.display = 'none';
    document.getElementById('positionsPanel').style.display = 'block';
    document.getElementById('summaryPanel').style.display = 'block';
    
    console.log('Position added successfully');
}

// ========================================
// Render Positions
// ========================================

function renderPositions() {
    const positionsList = document.getElementById('positionsList');
    const positionCount = document.getElementById('positionCount');
    
    // Update count
    positionCount.textContent = `${positions.length} position${positions.length !== 1 ? 's' : ''}`;
    
    // Clear list
    positionsList.innerHTML = '';
    
    // Render each position
    positions.forEach(position => {
        const card = createPositionCard(position);
        positionsList.appendChild(card);
    });
}

// ========================================
// Create Position Card
// ========================================

function createPositionCard(position) {
    const card = document.createElement('div');
    card.className = 'position-card';
    card.innerHTML = `
        <div class="position-header">
            <div>
                <div class="position-title">${position.role}</div>
                <span class="position-location ${position.location}">${position.location}</span>
            </div>
            <button class="position-delete" onclick="deletePosition(${position.id})" title="Delete">✕</button>
        </div>
        <div class="position-metrics">
            <div class="position-metric">
                <span class="position-metric-label">Hours</span>
                <span class="position-metric-value">${position.hours}</span>
            </div>
            <div class="position-metric">
                <span class="position-metric-label">Desired Margin</span>
                <span class="position-metric-value">${formatPercentage(position.desiredMargin)}</span>
            </div>
            <div class="position-metric">
                <span class="position-metric-label">My Cost/hr</span>
                <span class="position-metric-value">${formatCurrency(position.cost)}</span>
            </div>
            <div class="position-metric">
                <span class="position-metric-label">Client Rate/hr</span>
                <span class="position-metric-value">${formatCurrency(position.clientRate)}</span>
            </div>
            <div class="position-metric" style="grid-column: span 2;">
                <span class="position-metric-label">Total Cost to Client</span>
                <span class="position-metric-value" style="font-size: 1.25rem; color: var(--primary-blue);">${formatCurrency(position.totalCost)}</span>
            </div>
        </div>
    `;
    return card;
}

// ========================================
// Delete Position
// ========================================

window.deletePosition = function(id) {
    positions = positions.filter(p => p.id !== id);
    
    if (positions.length === 0) {
        // Show placeholder if no positions
        document.getElementById('positionsPanel').style.display = 'none';
        document.getElementById('summaryPanel').style.display = 'none';
        document.getElementById('resultsPlaceholder').style.display = 'block';
    } else {
        renderPositions();
        updateSummary();
    }
}

// ========================================
// Clear All Positions
// ========================================

function handleClearAll() {
    if (positions.length === 0) return;
    
    if (confirm('Are you sure you want to clear all positions?')) {
        positions = [];
        document.getElementById('positionsPanel').style.display = 'none';
        document.getElementById('summaryPanel').style.display = 'none';
        document.getElementById('resultsPlaceholder').style.display = 'block';
    }
}

// ========================================
// Update Summary
// ========================================

function updateSummary() {
    if (positions.length === 0) return;
    
    // Calculate totals
    const totalPositions = positions.length;
    const totalHours = positions.reduce((sum, p) => sum + p.hours, 0);
    const avgClientRate = positions.reduce((sum, p) => sum + p.clientRate, 0) / totalPositions;
    const totalSelected = positions.reduce((sum, p) => sum + p.totalCost, 0);
    
    // Calculate "what if" scenarios
    let totalOnshore = 0;
    let totalOffshore = 0;
    let totalNearshore = 0;
    
    positions.forEach(p => {
        const onshoreRate = p.roleData.onshore.cost / (1 - p.desiredMargin);
        const offshoreRate = p.roleData.offshore.cost / (1 - p.desiredMargin);
        const nearshoreRate = p.roleData.nearshore.cost / (1 - p.desiredMargin);
        
        totalOnshore += p.hours * onshoreRate;
        totalOffshore += p.hours * offshoreRate;
        totalNearshore += p.hours * nearshoreRate;
    });
    
    // Update UI
    document.getElementById('summaryPositions').textContent = totalPositions;
    document.getElementById('summaryHours').textContent = totalHours;
    document.getElementById('summaryAvgRate').textContent = formatCurrency(avgClientRate);
    document.getElementById('summaryOnshore').textContent = formatCurrency(totalOnshore);
    document.getElementById('summaryOffshore').textContent = formatCurrency(totalOffshore);
    document.getElementById('summaryNearshore').textContent = formatCurrency(totalNearshore);
    document.getElementById('summarySelected').textContent = formatCurrency(totalSelected);
}

// ========================================
// Utility Functions
// ========================================

function formatCurrency(value) {
    if (isNaN(value) || value === 0) return '$0.00';
    return `$${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function formatPercentage(value) {
    if (isNaN(value)) return '0%';
    return `${(value * 100).toFixed(1)}%`;
}
