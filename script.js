// ========================================
// Initialize Application
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ========================================
// Populate Role Dropdown
// ========================================

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
    document.getElementById('calculatorForm').addEventListener('submit', handleCalculate);
    document.getElementById('clearBtn').addEventListener('click', handleClear);
}

// ========================================
// Handle Calculate
// ========================================

function handleCalculate(e) {
    e.preventDefault();
    
    // Get form values
    const role = document.getElementById('role').value;
    const location = document.getElementById('location').value;
    const hours = parseFloat(document.getElementById('hours').value);
    const desiredMargin = parseFloat(document.getElementById('desiredMargin').value) / 100;
    
    // Validate
    if (!role || !location || !hours || isNaN(desiredMargin)) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Get role data
    const roleData = rateCardData.find(r => r.role === role);
    
    if (!roleData) {
        alert('Role data not found');
        return;
    }
    
    // Calculate results
    const results = calculateClientRates(roleData, location, hours, desiredMargin);
    
    // Display results
    displayResults(results);
}

// ========================================
// Calculate Client Rates (REVERSE LOGIC)
// ========================================

function calculateClientRates(roleData, selectedLocation, hours, desiredMargin) {
    // Get costs for all locations
    const costs = {
        onshore: roleData.onshore.cost,
        offshore: roleData.offshore.cost,
        nearshore: roleData.nearshore.cost
    };
    
    // Calculate required client rates for all locations
    // Formula: Client Rate = Cost / (1 - Desired Margin)
    const clientRates = {
        onshore: costs.onshore > 0 ? costs.onshore / (1 - desiredMargin) : 0,
        offshore: costs.offshore > 0 ? costs.offshore / (1 - desiredMargin) : 0,
        nearshore: costs.nearshore > 0 ? costs.nearshore / (1 - desiredMargin) : 0
    };
    
    // Get selected location data
    const selectedCost = costs[selectedLocation];
    const selectedClientRate = clientRates[selectedLocation];
    const totalCostToClient = hours * selectedClientRate;
    
    // Calculate summary values
    const summary = {
        totalHours: hours,
        avgClientRate: selectedClientRate,
        totalOnshore: hours * clientRates.onshore,
        totalOffshore: hours * clientRates.offshore,
        totalNearshore: hours * clientRates.nearshore,
        totalSelected: totalCostToClient
    };
    
    return {
        selectedLocation,
        selectedCost,
        selectedClientRate,
        totalCostToClient,
        hours,
        desiredMargin,
        costs,
        clientRates,
        summary
    };
}

// ========================================
// Display Results
// ========================================

function displayResults(results) {
    // Hide placeholder, show results
    document.getElementById('resultsPlaceholder').style.display = 'none';
    document.getElementById('resultsPanel').style.display = 'block';
    
    // Update selected location title
    const locationTitle = results.selectedLocation.charAt(0).toUpperCase() + results.selectedLocation.slice(1);
    document.getElementById('selectedLocationTitle').textContent = `Selected: ${locationTitle}`;
    
    // Update selected location card
    document.getElementById('resultMyCost').textContent = formatCurrency(results.selectedCost);
    document.getElementById('resultClientRate').textContent = formatCurrency(results.selectedClientRate);
    document.getElementById('resultMargin').textContent = formatPercentage(results.desiredMargin);
    document.getElementById('resultTotalCost').textContent = formatCurrency(results.totalCostToClient);
    
    // Update comparison cards
    updateComparisonCard('onshore', results.costs.onshore, results.clientRates.onshore);
    updateComparisonCard('offshore', results.costs.offshore, results.clientRates.offshore);
    updateComparisonCard('nearshore', results.costs.nearshore, results.clientRates.nearshore);
    
    // Update summary section
    updateSummary(results.summary);
    
    // Scroll to results on mobile
    if (window.innerWidth < 992) {
        document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ========================================
// Update Comparison Card
// ========================================

function updateComparisonCard(location, cost, clientRate) {
    // Update cost (this is MY cost from rate card)
    document.getElementById(`${location}Cost`).textContent = cost > 0 ? `My Cost: ${formatCurrency(cost)}` : 'N/A';
    
    // Update client rate (what I should charge)
    const clientRateElement = document.getElementById(`${location}ClientRate`);
    if (cost > 0 && clientRate > 0) {
        clientRateElement.textContent = `Charge: ${formatCurrency(clientRate)}/hr`;
        clientRateElement.style.color = 'var(--primary-blue)';
        clientRateElement.style.fontWeight = '700';
    } else {
        clientRateElement.textContent = 'N/A';
    }
}

// ========================================
// Update Summary Section
// ========================================

function updateSummary(summary) {
    document.getElementById('summaryHours').textContent = summary.totalHours;
    document.getElementById('summaryAvgRate').textContent = formatCurrency(summary.avgClientRate);
    document.getElementById('summaryOnshore').textContent = formatCurrency(summary.totalOnshore);
    document.getElementById('summaryOffshore').textContent = formatCurrency(summary.totalOffshore);
    document.getElementById('summaryNearshore').textContent = formatCurrency(summary.totalNearshore);
    document.getElementById('summarySelected').textContent = formatCurrency(summary.totalSelected);
}

// ========================================
// Handle Clear
// ========================================

function handleClear() {
    // Reset form
    document.getElementById('calculatorForm').reset();
    
    // Hide results, show placeholder
    document.getElementById('resultsPanel').style.display = 'none';
    document.getElementById('resultsPlaceholder').style.display = 'block';
    
    // Scroll to top on mobile
    if (window.innerWidth < 992) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
