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
    roleSelect.addEventListener('change', handleRoleChange);
    document.getElementById('calculatorForm').addEventListener('submit', handleCalculate);
    document.getElementById('clearBtn').addEventListener('click', handleClear);
}

// ========================================
// Handle Role Selection
// ========================================

function handleRoleChange(e) {
    const selectedRole = e.target.value;
    
    if (!selectedRole) {
        document.getElementById('clientRate').value = '';
        return;
    }
    
    const roleData = rateCardData.find(r => r.role === selectedRole);
    
    if (roleData) {
        document.getElementById('clientRate').value = `$${roleData.clientRate.toFixed(2)}`;
    }
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
    const targetMargin = parseFloat(document.getElementById('targetMargin').value) / 100;
    
    // Validate
    if (!role || !location || !hours || isNaN(targetMargin)) {
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
    const results = calculateMargins(roleData, location, hours, targetMargin);
    
    // Display results
    displayResults(results);
}

// ========================================
// Calculate Margins
// ========================================

function calculateMargins(roleData, selectedLocation, hours, targetMargin) {
    const clientRate = roleData.clientRate;
    
    // Get costs for all locations
    const costs = {
        onshore: roleData.onshore.cost,
        offshore: roleData.offshore.cost,
        nearshore: roleData.nearshore.cost
    };
    
    // Calculate margins for all locations
    const margins = {
        onshore: (clientRate - costs.onshore) / clientRate,
        offshore: (clientRate - costs.offshore) / clientRate,
        nearshore: (clientRate - costs.nearshore) / clientRate
    };
    
    // Get selected location data
    const selectedCost = costs[selectedLocation];
    const selectedMargin = margins[selectedLocation];
    const totalCost = hours * selectedCost;
    
    // Determine which locations meet target
    const meetTarget = {
        onshore: margins.onshore >= targetMargin && costs.onshore > 0,
        offshore: margins.offshore >= targetMargin && costs.offshore > 0,
        nearshore: margins.nearshore >= targetMargin && costs.nearshore > 0
    };
    
    // Generate recommendation
    const recommendation = generateRecommendation(meetTarget, margins, targetMargin);
    
    return {
        clientRate,
        selectedLocation,
        selectedCost,
        selectedMargin,
        totalCost,
        hours,
        targetMargin,
        costs,
        margins,
        meetTarget,
        recommendation
    };
}

// ========================================
// Generate Recommendation
// ========================================

function generateRecommendation(meetTarget, margins, targetMargin) {
    const meetingLocations = [];
    
    if (meetTarget.onshore) meetingLocations.push('Onshore');
    if (meetTarget.offshore) meetingLocations.push('Offshore');
    if (meetTarget.nearshore) meetingLocations.push('Nearshore');
    
    if (meetingLocations.length === 0) {
        return `None of the locations meet your ${(targetMargin * 100).toFixed(0)}% target margin. Consider adjusting your target or client rate.`;
    }
    
    if (meetingLocations.length === 3) {
        // Find the best option (highest margin)
        let best = 'Onshore';
        let bestMargin = margins.onshore;
        
        if (margins.offshore > bestMargin) {
            best = 'Offshore';
            bestMargin = margins.offshore;
        }
        if (margins.nearshore > bestMargin) {
            best = 'Nearshore';
            bestMargin = margins.nearshore;
        }
        
        return `All locations meet your target! ${best} offers the highest margin at ${(bestMargin * 100).toFixed(1)}%.`;
    }
    
    if (meetingLocations.length === 1) {
        const location = meetingLocations[0].toLowerCase();
        return `${meetingLocations[0]} is the only location that meets your ${(targetMargin * 100).toFixed(0)}% target margin with ${(margins[location] * 100).toFixed(1)}%.`;
    }
    
    // Multiple locations meet target
    return `${meetingLocations.join(' and ')} meet your ${(targetMargin * 100).toFixed(0)}% target margin. Choose based on your other requirements.`;
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
    document.getElementById('resultClientRate').textContent = `$${results.clientRate.toFixed(2)}`;
    document.getElementById('resultCost').textContent = `$${results.selectedCost.toFixed(2)}`;
    
    const marginElement = document.getElementById('resultMargin');
    marginElement.textContent = `${(results.selectedMargin * 100).toFixed(1)}%`;
    
    // Color code margin
    if (results.selectedMargin >= results.targetMargin) {
        marginElement.classList.remove('below-target');
        marginElement.classList.add('text-success');
    } else {
        marginElement.classList.remove('text-success');
        marginElement.classList.add('below-target');
    }
    
    document.getElementById('resultTotalCost').textContent = `$${results.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Update comparison cards
    updateComparisonCard('onshore', results);
    updateComparisonCard('offshore', results);
    updateComparisonCard('nearshore', results);
    
    // Update recommendation
    document.getElementById('recommendationText').textContent = results.recommendation;
    
    // Scroll to results on mobile
    if (window.innerWidth < 992) {
        document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ========================================
// Update Comparison Card
// ========================================

function updateComparisonCard(location, results) {
    const cost = results.costs[location];
    const margin = results.margins[location];
    const meetsTarget = results.meetTarget[location];
    
    // Update cost
    document.getElementById(`${location}Cost`).textContent = cost > 0 ? `$${cost.toFixed(2)}/hr` : 'N/A';
    
    // Update margin
    const marginElement = document.getElementById(`${location}Margin`);
    if (cost > 0) {
        marginElement.textContent = `${(margin * 100).toFixed(1)}% margin`;
    } else {
        marginElement.textContent = 'N/A';
    }
    
    // Update status
    const statusElement = document.getElementById(`${location}Status`);
    const cardElement = document.getElementById(`${location}Card`);
    
    if (cost === 0) {
        statusElement.textContent = '—';
        statusElement.className = 'card-status';
        cardElement.classList.remove('meets-target');
    } else if (meetsTarget) {
        statusElement.textContent = '✓ Meets Target';
        statusElement.className = 'card-status meets';
        cardElement.classList.add('meets-target');
    } else {
        statusElement.textContent = '✗ Below Target';
        statusElement.className = 'card-status below';
        cardElement.classList.remove('meets-target');
    }
}

// ========================================
// Handle Clear
// ========================================

function handleClear() {
    // Reset form
    document.getElementById('calculatorForm').reset();
    document.getElementById('clientRate').value = '';
    
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
    return `$${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function formatPercentage(value) {
    return `${(value * 100).toFixed(1)}%`;
}
