// Charts functionality for CISEPA Dashboard

// Global variables
let supportData = [];
let activityData = [];
let activeStudentSupportTab = null;
let activeTierSupportTab = null;
let chartsInitialized = {
  tier2: false,
  tier3: false,
  combined: false,
  support: false,
  activity: false,
  yearly: false,
  combinedBar: false
};

// CSV URLs for different years
const csvUrls = {
  "2023_2024": 'student_data/CIS_EOY_2023_2024 - Student Data.csv',
  "2022_2023": 'student_data/CIS_EOY_2022_2023 - Student Data.csv',
  "2021_2022": 'student_data/CIS_EOY_2021_2022 - Student Data.csv',
  "2020_2021": 'student_data/CIS_EOY_2020_2021 - Student Data.csv',
  "2019_2020": 'student_data/CIS_EOY_2019_2020 - Student Data.csv',
  "2018_2019": 'student_data/CIS_EOY_2018_2019 - Student Data.csv',
  "2017_2018": 'student_data/CIS_EOY_2017_2018 - Student Data.csv',
  "2016_2017": 'student_data/CIS_EOY_2016_2017 - Student Data.csv',
  "2015_2016": 'student_data/CIS_EOY_2015_2016 - Student Data.csv'
};

// Common chart colors
const chartColors = ['#0057B8', '#E31B23', '#FFC72C', '#00A9E0', '#78BE20', '#6E2585', '#F7941E'];

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Setup tab navigation
  setupTabNavigation();
  
  // Load initial datasets
  loadStudentSupportData();
  loadTierSupportData();
});

// Setup tab navigation functionality
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Get the parent tab container
      const tabContainer = tab.closest('.tab-container');
      const tabId = tab.getAttribute('data-tab');
      
      // Hide all tab contents in this container
      tabContainer.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      
      // Remove active class from all tabs in this container
      tabContainer.querySelectorAll('.tab-button').forEach(t => {
        t.classList.remove('active');
      });
      
      // Show the selected tab content
      const contentElement = document.getElementById(tabId);
      if (contentElement) {
        contentElement.style.display = 'block';
      }
      
      // Add active class to the clicked tab
      tab.classList.add('active');
      
      // Update which tab is active
      if (tabContainer.closest('#student-support-section')) {
        activeStudentSupportTab = tabId;
        updateCharts();
      } else if (tabContainer.closest('#tier-support-section')) {
        activeTierSupportTab = tabId;
        updateActivityCharts();
      }
    });
  });
  
  // Set default active tabs
  const studentSupportTabs = document.querySelector('#student-support-section .tab-button');
  const tierSupportTabs = document.querySelector('#tier-support-section .tab-button');
  
  if (studentSupportTabs) {
    studentSupportTabs.click();
  }
  
  if (tierSupportTabs) {
    tierSupportTabs.click();
  }
}

// Load Student Support Dashboard data
function loadStudentSupportData() {
  // Reset chart initialization status
  chartsInitialized.tier2 = false;
  chartsInitialized.tier3 = false;
  chartsInitialized.combined = false;
  
  // Show loading indicators
  document.getElementById('tier2-chart').innerHTML = '<div class="loading">Loading data...</div>';
  document.getElementById('tier3-chart').innerHTML = '<div class="loading">Loading data...</div>';
  document.getElementById('combined-chart').innerHTML = '<div class="loading">Loading data...</div>';
  
  // Disable controls while loading
  document.querySelectorAll('#student-support-section select').forEach(select => select.disabled = true);
  
  // Use DataLoader to load the CSV data
  DataLoader.loadCSVData('student_support', function(data) {
    // Store the data globally
    window.studentSupportData = data;
    
    // Populate the school dropdown
    populateSchoolDropdown();
    
    // Enable controls after loading
    document.querySelectorAll('#student-support-section select').forEach(select => select.disabled = false);
    
    // Update the charts with the initial data - only for active tab
    updateCharts();
  });
}

// Load Tier Support Activities data
function loadTierSupportData() {
  // Reset chart initialization status
  chartsInitialized.support = false;
  chartsInitialized.activity = false;
  chartsInitialized.yearly = false;
  chartsInitialized.combinedBar = false;
  
  // Show loading indicators
  document.getElementById('support-chart').innerHTML = '<div class="loading">Loading data...</div>';
  document.getElementById('activity-report').innerHTML = '<div class="loading">Loading data...</div>';
  document.getElementById('yearly-trend').innerHTML = '<div class="loading">Loading data...</div>';
  document.getElementById('combined-bar-chart').innerHTML = '<div class="loading">Loading data...</div>';
  
  // Disable controls while loading
  document.querySelectorAll('#tier-support-section select').forEach(select => select.disabled = true);
  
  // Use DataLoader to load the CSV data
  DataLoader.loadCSVData('tier_support', function(data) {
    // Store the data globally
    window.tierSupportData = data;
    
    // Populate the dropdowns
    populateTierSupportDropdowns();
    
    // Enable controls after loading
    document.querySelectorAll('#tier-support-section select').forEach(select => select.disabled = false);
    
    // Update the charts with the initial data - only for active tab
    updateActivityCharts();
  });
}

// Populate school dropdown for Student Support Dashboard
function populateSchoolDropdown() {
  // Get unique schools from the data
  const schools = DataLoader.getUniqueValues(window.studentSupportData, 'school');
  
  // Use DataLoader to populate the dropdown
  DataLoader.populateDropdown('schoolSelect', schools, 'All Schools');
}

// Populate school dropdown for Tier Support Activities
function populateTierSupportDropdowns() {
  // Get unique schools and categories from the data
  const schools = DataLoader.getUniqueValues(window.tierSupportData, 'school');
  const categories = DataLoader.getUniqueValues(window.tierSupportData, 'support_category');
  
  // Use DataLoader to populate the dropdowns
  DataLoader.populateDropdown('tierSchoolSelect', schools, 'All Schools');
  DataLoader.populateDropdown('supportCategorySelect', categories, 'All Categories');
}

// Update charts for Student Support Dashboard
function updateCharts() {
  // Only update charts for the active tab
  if (!activeStudentSupportTab) return;
  
  const selectedSchool = document.getElementById('schoolSelect').value;
  const chartType = document.getElementById('chartTypeSelect').value;

  const filteredData = selectedSchool === 'all'
    ? window.studentSupportData
    : window.studentSupportData.filter(item => item['School Name'] === selectedSchool);

  // Count Tier 2 supports
  const tier2Counts = {};
  filteredData.forEach(item => {
    const supportName = item['Tier II Support Type'];
    if (!supportName) return;
    tier2Counts[supportName] = (tier2Counts[supportName] || 0) + (item['Tier II Hours'] || 0);
  });

  // Count Tier 3 supports
  const tier3Counts = {};
  filteredData.forEach(item => {
    const supportName = item['Tier III Support Type'];
    if (!supportName) return;
    tier3Counts[supportName] = (tier3Counts[supportName] || 0) + (item['Tier III Hours'] || 0);
  });

  // Prepare data for Tier 2 chart
  const tier2Names = Object.keys(tier2Counts);
  const tier2Values = Object.values(tier2Counts);

  // Prepare data for Tier 3 chart
  const tier3Names = Object.keys(tier3Counts);
  const tier3Values = Object.values(tier3Counts);
  
  // Only render the chart for the active tab
  if (activeStudentSupportTab === 'tier2-tab' && !chartsInitialized.tier2) {
    // Render Tier 2 chart
    if (chartType === 'pie') {
      Plotly.newPlot('tier2-chart', [{
        labels: tier2Names,
        values: tier2Values,
        type: 'pie',
        textinfo: 'label+value',
        texttemplate: '%{label}: %{value} hrs',
        hole: 0.4,
        marker: {
          colors: chartColors
        }
      }], {
        title: {
          text: 'Tier 2 Support Types',
          font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
        },
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 50, b: 50, l: 30, r: 30 }
      });
    } else {
      Plotly.newPlot('tier2-chart', [{
        x: tier2Names,
        y: tier2Values,
        type: 'bar',
        marker: {
          color: chartColors
        }
      }], {
        title: {
          text: 'Tier 2 Support Types',
          font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
        },
        xaxis: { 
          title: 'Support Type',
          titlefont: { size: 14, color: '#333' }
        },
        yaxis: { 
          title: 'Hours',
          titlefont: { size: 14, color: '#333' }
        },
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 50, b: 50, l: 50, r: 30 }
      });
    }
    chartsInitialized.tier2 = true;
  }
  
  // Only render the chart for the active tab
  if (activeStudentSupportTab === 'tier3-tab' && !chartsInitialized.tier3) {
    // Render Tier 3 chart
    if (chartType === 'pie') {
      Plotly.newPlot('tier3-chart', [{
        labels: tier3Names,
        values: tier3Values,
        type: 'pie',
        textinfo: 'label+value',
        texttemplate: '%{label}: %{value} hrs',
        hole: 0.4,
        marker: {
          colors: chartColors
        }
      }], {
        title: {
          text: 'Tier 3 Support Types',
          font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
        },
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 50, b: 50, l: 30, r: 30 }
      });
    } else {
      Plotly.newPlot('tier3-chart', [{
        x: tier3Names,
        y: tier3Values,
        type: 'bar',
        marker: {
          color: chartColors
        }
      }], {
        title: {
          text: 'Tier 3 Support Types',
          font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
        },
        xaxis: { 
          title: 'Support Type',
          titlefont: { size: 14, color: '#333' }
        },
        yaxis: { 
          title: 'Hours',
          titlefont: { size: 14, color: '#333' }
        },
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 50, b: 50, l: 50, r: 30 }
      });
    }
    chartsInitialized.tier3 = true;
  }
  
  // Only render the chart for the active tab
  if (activeStudentSupportTab === 'combined-tab' && !chartsInitialized.combined) {
    // Combine Tier 2 and Tier 3 data
    const combinedCounts = {};
    tier2Names.forEach((name, i) => {
      combinedCounts[name] = tier2Values[i];
    });
    tier3Names.forEach((name, i) => {
      combinedCounts[name] = (combinedCounts[name] || 0) + tier3Values[i];
    });
    
    const combinedNames = Object.keys(combinedCounts);
    const combinedValues = Object.values(combinedCounts);
    
    // Render combined chart
    if (chartType === 'pie') {
      Plotly.newPlot('combined-chart', [{
        labels: combinedNames,
        values: combinedValues,
        type: 'pie',
        textinfo: 'label+value',
        texttemplate: '%{label}: %{value} hrs',
        hole: 0.4,
        marker: {
          colors: chartColors
        }
      }], {
        title: {
          text: 'Combined Tier 2 and 3 Support Types',
          font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
        },
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 50, b: 50, l: 30, r: 30 }
      });
    } else {
      Plotly.newPlot('combined-chart', [{
        x: combinedNames,
        y: combinedValues,
        type: 'bar',
        marker: {
          color: chartColors
        }
      }], {
        title: {
          text: 'Combined Tier 2 and 3 Support Types',
          font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
        },
        xaxis: { 
          title: 'Support Type',
          titlefont: { size: 14, color: '#333' }
        },
        yaxis: { 
          title: 'Hours',
          titlefont: { size: 14, color: '#333' }
        },
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 50, b: 50, l: 50, r: 30 }
      });
    }
    chartsInitialized.combined = true;
  }
}

// Update charts for Tier Support Activities
function updateActivityCharts() {
  // Only update charts for the active tab
  if (!activeTierSupportTab) return;
  
  const selectedSchool = document.getElementById('activitySchoolSelect').value;
  const chartType = document.getElementById('activityChartTypeSelect').value;
  const selectedSupportCategory = document.getElementById('supportCategorySelect').value;

  const filteredData = selectedSchool === 'all'
    ? window.tierSupportData
    : window.tierSupportData.filter(item => item.school === selectedSchool);

  const supportCounts = {};
  const activityCounts = {};

  filteredData.forEach(item => {
    const supportName = item.support_category;
    const activity = item.activity;
    
    if (!supportName) return;
    
    if (selectedSupportCategory === 'all' || supportName === selectedSupportCategory) {
      supportCounts[supportName] = (supportCounts[supportName] || 0) + item.tier2_count + item.tier3_count;

      if (activity) {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      }
    }
  });

  const supportNames = Object.keys(supportCounts);
  const supportValues = Object.values(supportCounts);
  
  // Support Categories Tab
  if (activeTierSupportTab === 'support-tab') {
    if (!chartsInitialized.support) {
      if (selectedSchool === 'all') {
        // Show "All Schools" report when "All Schools" is selected
        const reportDiv = document.getElementById('support-chart');
        reportDiv.innerHTML = `<h3>All Schools Report:</h3><ul>` +
          supportNames.map((name, i) => `<li>${name}: ${supportValues[i]} hours</li>`).join('') +
          `</ul>`;
      } else {
        // Chart rendering for specific school
        const chartData = chartType === 'pie'
          ? [{ labels: supportNames, values: supportValues, type: 'pie', textinfo: 'label+value' }]
          : [{ x: supportNames, y: supportValues, type: 'bar' }];

        Plotly.newPlot('support-chart', chartData, { 
          title: {
            text: `${selectedSchool} Student Supports`,
            font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
          },
          paper_bgcolor: '#fff',
          plot_bgcolor: '#fff',
          margin: { t: 50, b: 50, l: 50, r: 30 },
          colorway: chartColors
        });
      }
      chartsInitialized.support = true;
    } else {
      // Update existing chart if not "All Schools"
      if (selectedSchool !== 'all') {
        const update = chartType === 'pie' 
          ? {labels: [supportNames], values: [supportValues], type: 'pie'}
          : {x: [supportNames], y: [supportValues], type: 'bar'};
        Plotly.update('support-chart', update);
      } else {
        // Update "All Schools" report
        const reportDiv = document.getElementById('support-chart');
        reportDiv.innerHTML = `<h3>All Schools Report:</h3><ul>` +
          supportNames.map((name, i) => `<li>${name}: ${supportValues[i]} hours</li>`).join('') +
          `</ul>`;
      }
    }
  }
  
  // Activity Report Tab
  if (activeTierSupportTab === 'activity-tab') {
    if (!chartsInitialized.activity && selectedSchool !== 'all') {
      // Pie chart for activities
      const activityNames = Object.keys(activityCounts);
      const activityValues = Object.values(activityCounts);

      const activityPieData = [{
        labels: activityNames,
        values: activityValues,
        type: 'pie',
        textinfo: 'label+value'
      }];

      const activityLayout = {
        title: {
          text: `${selectedSchool} Activity Report`,
          font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
        },
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 50, b: 50, l: 30, r: 30 },
        colorway: chartColors
      };

      Plotly.newPlot('activity-report', activityPieData, activityLayout);
      chartsInitialized.activity = true;
    } else if (chartsInitialized.activity && selectedSchool !== 'all') {
      // Update existing chart
      const activityNames = Object.keys(activityCounts);
      const activityValues = Object.values(activityCounts);
      
      Plotly.update('activity-report', {
        labels: [activityNames],
        values: [activityValues]
      });
    } else if (selectedSchool === 'all') {
      // Show message for "All Schools"
      document.getElementById('activity-report').innerHTML = 
        '<div class="loading">Please select a specific school to view activity report</div>';
    }
  }
  
  // Yearly Trends Tab
  if (activeTierSupportTab === 'yearly-tab') {
    if (!chartsInitialized.yearly) {
      // Yearly trend graph
      const yearlyCounts = {};
      window.tierSupportData.forEach(d => {
        const year = d.school_year;
        if (!year) return;
        yearlyCounts[year] = (yearlyCounts[year] || 0) + 1;
      });

      const years = Object.keys(yearlyCounts).sort();
      const counts = years.map(y => yearlyCounts[y]);

      Plotly.newPlot('yearly-trend', [{
        x: years,
        y: counts,
        type: 'scatter',
        mode: 'lines+markers',
        line: {
          color: '#0057B8',
          width: 3
        },
        marker: {
          color: '#E31B23',
          size: 8
        }
      }], { 
        title: {
          text: 'Supports Over the Years',
          font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
        },
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 50, b: 50, l: 50, r: 30 }
      });
      chartsInitialized.yearly = true;
    }
    // No need to update yearly trend as it doesn't change with selections
  }
  
  // Combined View Tab
  if (activeTierSupportTab === 'combined-tab' && selectedSchool !== 'all') {
    if (!chartsInitialized.combinedBar) {
      // Prepare data for combined bar chart
      const categories = Object.keys(supportCounts);
      const values = Object.values(supportCounts);
      
      // Create stacked bar chart
      Plotly.newPlot('combined-bar-chart', [{
        x: categories,
        y: values,
        type: 'bar',
        marker: {
          color: chartColors
        }
      }], {
        title: {
          text: `${selectedSchool} Combined Support View`,
          font: { size: 18, color: '#0057B8', family: 'Segoe UI, Arial, sans-serif' }
        },
        xaxis: {
          title: 'Support Category'
        },
        yaxis: {
          title: 'Count'
        },
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 50, b: 100, l: 50, r: 30 }
      });
      chartsInitialized.combinedBar = true;
    } else {
      // Update existing chart
      Plotly.update('combined-bar-chart', {
        x: [supportNames],
        y: [supportValues]
      });
    }
  } else if (activeTierSupportTab === 'combined-tab' && selectedSchool === 'all') {
    // Show message for "All Schools"
    document.getElementById('combined-bar-chart').innerHTML = 
      '<div class="loading">Please select a specific school to view combined report</div>';
  }
}
