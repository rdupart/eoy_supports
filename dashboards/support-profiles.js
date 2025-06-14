// Support Profiles JavaScript
// This script handles the loading and visualization of student support data

let studentSupportData = [];
let schoolsList = [];

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load initial data
  loadStudentSupportData();
});

// Load Student Support Data
function loadStudentSupportData() {
  // Get the selected year
  const yearSelect = document.getElementById('yearSelect');
  const selectedYear = yearSelect ? yearSelect.value : '2023_2024';
  
  // Show loading indicators
  document.querySelectorAll('.chart').forEach(chart => {
    chart.innerHTML = '<div class="loading">Loading data...</div>';
  });
  
  // Disable controls while loading
  document.querySelectorAll('select').forEach(select => select.disabled = true);
  
  // Format year for file naming
  const formattedYear = selectedYear.replace('-', '_');
  
  // Define the CSV URL
  const csvUrl = `../student_data/CIS_EOY_${formattedYear} - Student Data.csv`;
  
  console.log(`Loading student support data from: ${csvUrl}`);
  
  // Use PapaParse to load the CSV
  Papa.parse(csvUrl, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      if (results.errors.length > 0 && 
          results.errors[0].code !== 'UndetectableDelimiter' &&
          results.data.length === 0) {
        console.error('Error parsing CSV:', results.errors);
        studentSupportData = [];
      } else {
        console.log(`Loaded ${results.data.length} rows of student support data`);
        studentSupportData = results.data;
      }
      
      // Enable controls
      document.querySelectorAll('select').forEach(select => select.disabled = false);
      
      // Populate school dropdown
      populateSchoolDropdown();
      
      // Update charts with the loaded data
      updateCharts();
    },
    error: function(error) {
      console.error('Error loading CSV:', error);
      studentSupportData = [];
      
      // Enable controls
      document.querySelectorAll('select').forEach(select => select.disabled = false);
      
      // Populate school dropdown
      populateSchoolDropdown();
      
      // Update charts with empty data
      updateCharts();
    }
  });
}

// Populate school dropdown
function populateSchoolDropdown() {
  const schoolSelect = document.getElementById('schoolSelect');
  if (!schoolSelect) return;
  
  // Extract unique schools from the data
  schoolsList = [];
  studentSupportData.forEach(row => {
    // Check different possible column names for school
    const school = row['School'] || row['School Name'] || row['SchoolName'] || row['school'];
    if (school && !schoolsList.includes(school)) {
      schoolsList.push(school);
    }
  });
  
  // Sort schools alphabetically
  schoolsList.sort();
  
  // Clear existing options
  schoolSelect.innerHTML = '';
  
  // Add "All Schools" option
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Schools';
  schoolSelect.appendChild(allOption);
  
  // Add school options
  schoolsList.forEach(school => {
    const option = document.createElement('option');
    option.value = school;
    option.textContent = school;
    schoolSelect.appendChild(option);
  });
  
  console.log(`Populated school dropdown with ${schoolsList.length} schools`);
}

// Update charts based on selections
function updateCharts() {
  // Get selected values
  const schoolSelect = document.getElementById('schoolSelect');
  const chartTypeSelect = document.getElementById('chartTypeSelect');
  
  const selectedSchool = schoolSelect ? schoolSelect.value : 'all';
  const chartType = chartTypeSelect ? chartTypeSelect.value : 'pie';
  
  console.log(`Updating charts for school: ${selectedSchool}, chart type: ${chartType}`);
  
  // Filter data by selected school
  let filteredData = studentSupportData;
  if (selectedSchool !== 'all') {
    filteredData = studentSupportData.filter(row => {
      const school = row['School'] || row['School Name'] || row['SchoolName'] || row['school'];
      return school === selectedSchool;
    });
  }
  
  // Process data for Tier 2 chart
  const tier2Data = filteredData.filter(row => {
    const tier = row['Tier'] || row['SupportTier'] || row['Support Tier'] || row['tier'];
    return tier === 2 || tier === '2' || tier === 'Tier 2' || tier === 'Tier II';
  });
  
  // Process data for Tier 3 chart
  const tier3Data = filteredData.filter(row => {
    const tier = row['Tier'] || row['SupportTier'] || row['Support Tier'] || row['tier'];
    return tier === 3 || tier === '3' || tier === 'Tier 3' || tier === 'Tier III';
  });
  
  // Count support types for Tier 2
  const tier2Counts = {};
  tier2Data.forEach(row => {
    const supportType = row['Support Type'] || row['SupportType'] || row['Type'] || row['type'] || 'Unknown';
    tier2Counts[supportType] = (tier2Counts[supportType] || 0) + 1;
  });
  
  // Count support types for Tier 3
  const tier3Counts = {};
  tier3Data.forEach(row => {
    const supportType = row['Support Type'] || row['SupportType'] || row['Type'] || row['type'] || 'Unknown';
    tier3Counts[supportType] = (tier3Counts[supportType] || 0) + 1;
  });
  
  // Combine counts for combined view
  const combinedCounts = {};
  Object.keys(tier2Counts).forEach(key => {
    combinedCounts[key + ' (Tier 2)'] = tier2Counts[key];
  });
  Object.keys(tier3Counts).forEach(key => {
    combinedCounts[key + ' (Tier 3)'] = tier3Counts[key];
  });
  
  // Create or update Tier 2 chart
  createOrUpdateChart('tier2-chart', tier2Counts, `Tier 2 Support - ${selectedSchool === 'all' ? 'All Schools' : selectedSchool}`, chartType);
  
  // Create or update Tier 3 chart
  createOrUpdateChart('tier3-chart', tier3Counts, `Tier 3 Support - ${selectedSchool === 'all' ? 'All Schools' : selectedSchool}`, chartType);
  
  // Create or update Combined chart
  createOrUpdateChart('combined-chart', combinedCounts, `Combined Support - ${selectedSchool === 'all' ? 'All Schools' : selectedSchool}`, chartType);
}

// Create or update a chart
function createOrUpdateChart(elementId, dataCounts, title, chartType) {
  const chartElement = document.getElementById(elementId);
  if (!chartElement) return;
  
  // Clear loading indicator
  chartElement.innerHTML = '';
  
  // Prepare data
  const labels = Object.keys(dataCounts);
  const values = Object.values(dataCounts);
  
  // Define colors
  const colors = [
    '#0057B8', '#E31B23', '#FFC72C', '#00A9E0', 
    '#78BE20', '#6E2585', '#F7941E', '#00B2A9',
    '#FF8200', '#8A8D8F', '#4B2E83', '#EF3340'
  ];
  
  // Create chart data
  let chartData = [];
  
  if (chartType === 'pie') {
    // Pie chart data
    chartData = [{
      labels: labels,
      values: values,
      type: 'pie',
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
      marker: {
        colors: colors.slice(0, labels.length)
      }
    }];
  } else {
    // Bar chart data
    chartData = [{
      x: labels,
      y: values,
      type: 'bar',
      marker: {
        color: colors.slice(0, labels.length)
      }
    }];
  }
  
  // Chart layout
  const layout = {
    title: title,
    height: 400,
    margin: { t: 50, b: 100, l: 50, r: 50 },
    paper_bgcolor: '#fff',
    plot_bgcolor: '#f9f9f9'
  };
  
  // Create the chart
  Plotly.newPlot(elementId, chartData, layout);
}

// Generate mock data for testing
function generateMockData() {
  const mockData = [];
  const schools = ['Washington Elementary', 'Lincoln High School', 'Roosevelt Middle', 'Jefferson Academy', 'Adams Elementary'];
  const supportTypes = ['Academic', 'Attendance', 'Behavior', 'Basic Needs', 'Social/Emotional', 'Family Engagement', 'College/Career'];
  
  // Generate 200 mock records
  for (let i = 0; i < 200; i++) {
    mockData.push({
      'School': schools[Math.floor(Math.random() * schools.length)],
      'Tier': Math.random() > 0.7 ? 3 : 2, // 30% Tier 3, 70% Tier 2
      'Support Type': supportTypes[Math.floor(Math.random() * supportTypes.length)],
      'Count': Math.floor(Math.random() * 50) + 1
    });
  }
  
  console.log('Using mock data for student support profiles');
  return mockData;
}
