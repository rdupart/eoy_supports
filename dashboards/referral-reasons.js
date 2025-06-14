// Referral Reasons Dashboard JavaScript
// This script handles loading and visualization of referral data

// Global variables
let referralData = [];
let tierSupportData = [];
let schoolsList = [];
let selectedYear = "2023_2024";
let selectedSchool = "all";
let selectedChartType = "pie";

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Show loading indicators
  document.querySelectorAll('.loading').forEach(el => {
    el.style.display = 'block';
  });
  
  // Load referral data
  loadReferralData();
});

// Event handler for year selection change
function onYearChange() {
  // Get selected year
  selectedYear = document.getElementById('yearSelect').value;
  
  // Show loading indicators
  document.querySelectorAll('.loading').forEach(el => {
    el.style.display = 'block';
  });
  
  // Disable controls while loading
  document.querySelectorAll('select').forEach(select => {
    select.disabled = true;
  });
  
  // Load data from CSV
  loadReferralData();
  loadTierSupportData();
}

// Load referral data from CSV
function loadReferralData() {
  // Get selected year
  const yearSelect = document.getElementById('yearSelect');
  selectedYear = yearSelect ? yearSelect.value : '2023_2024';
  
  // Disable controls while loading
  document.querySelectorAll('select').forEach(select => select.disabled = true);
  
  // Format year for file naming
  const formattedYear = selectedYear.replace('-', '_');
  
  // Define CSV URLs for different years
  const csvUrls = {
    "2023_2024": "../student_data/CIS_EOY_2023_2024 - Student Data.csv",
    "2022_2023": "../student_data/CIS_EOY_2022_2023 - Student Data.csv",
    "2021_2022": "../student_data/CIS_EOY_2021_2022 - Student Data.csv",
    "2020_2021": "../student_data/CIS_EOY_2020_2021 - Student Data.csv",
    "2019_2020": "../student_data/CIS_EOY_2019_2020 - Student Data.csv"
  };

  // Define CSV URL
  const csvUrl = csvUrls[selectedYear] || '../student_data/CIS_EOY_2023_2024 - Student Data.csv';
  
  console.log(`Loading referral data from: ${csvUrl}`);
  
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
        referralData = [];
      } else {
        console.log(`Loaded ${results.data.length} rows of referral data`);
        referralData = results.data;
      }
      
      // Enable controls
      document.querySelectorAll('select').forEach(select => select.disabled = false);
      
      // Populate school dropdown
      populateSchoolDropdown();
      
      // Update charts with loaded data
      updateReferralCharts();
    },
    error: function(error) {
      console.error('Error loading CSV:', error);
      referralData = [];
      
      // Enable controls
      document.querySelectorAll('select').forEach(select => select.disabled = false);
      
      // Populate school dropdown
      populateSchoolDropdown();
      
      // Update charts
      updateReferralCharts();
    }
  });
}

// Load tier support data from CSV
function loadTierSupportData() {
  // Tier support CSV URLs
  const tierCsvUrls = {
    "2023_2024": "../student_data/CIS_EOY_2023_2024 - Student Data.csv",
    "2022_2023": "../student_data/CIS_EOY_2022_2023 - Student Data.csv",
    "2021_2022": "../student_data/CIS_EOY_2021_2022 - Student Data.csv",
    "2020_2021": "../student_data/CIS_EOY_2020_2021 - Student Data.csv",
    "2019_2020": "../student_data/CIS_EOY_2019_2020 - Student Data.csv"
  };

  // Define CSV URL
  const csvUrl = tierCsvUrls[selectedYear] || '../student_data/CIS_EOY_2023_2024 - Student Data.csv';
  
  console.log(`Loading tier support data from: ${csvUrl}`);
  
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
        tierSupportData = [];
      } else {
        console.log(`Loaded ${results.data.length} rows of tier support data`);
        tierSupportData = results.data;
      }
      
      // Update tier support charts
      updateTierSupportCharts();
    },
    error: function(error) {
      console.error('Error loading CSV:', error);
      tierSupportData = [];
      
      // Update tier support charts
      updateTierSupportCharts();
    }
  });
}

// Populate school dropdown
function populateSchoolDropdown() {
  const schoolSelect = document.getElementById('schoolSelect');
  if (!schoolSelect) return;
  
  // Extract unique schools from the data
  schoolsList = [];
  referralData.forEach(row => {
    const school = row['School Name'];
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

// Update all charts based on selected filters
function updateReferralCharts() {
  // Get selected values
  selectedSchool = document.getElementById('schoolSelect').value;
  selectedChartType = document.getElementById('chartTypeSelect').value;
  
  // Filter data by selected school
  let filteredData = referralData;
  if (selectedSchool !== 'all') {
    filteredData = referralData.filter(row => row['School Name'] === selectedSchool);
  }
  
  // Create charts
  createReferralReasonsChart(filteredData, selectedChartType);
  createReferralMonthlyChart(filteredData);
  createReferralTrendsChart(filteredData);
  
  // Update tier support charts when school selection changes
  updateTierSupportCharts();
}

// Update tier support charts based on selected filters
function updateTierSupportCharts() {
  // Filter data by selected school
  let filteredData = tierSupportData;
  if (selectedSchool !== 'all') {
    filteredData = tierSupportData.filter(item => item['School Name'] === selectedSchool);
  }
  
  // Create the tier support charts
  createTierSupportCharts(filteredData, selectedChartType);
}

// Create tier support charts (Tier 2, Tier 3, and Combined)
function createTierSupportCharts(data, chartType) {
  // Process data to get category counts
  const categoryMap = {};
  data.forEach(item => {
    const category = item['Support Category'];
    if (!category) return;
    if (!categoryMap[category]) categoryMap[category] = { tier2: 0, tier3: 0 };
    categoryMap[category].tier2 += item['Tier II Hours'] || 0;
    categoryMap[category].tier3 += item['Tier III Hours'] || 0;
  });
  
  const categories = Object.keys(categoryMap);
  const tier2Supports = categories.map(cat => categoryMap[cat].tier2);
  const tier3Supports = categories.map(cat => categoryMap[cat].tier3);
  const combinedSupports = categories.map((cat, i) => tier2Supports[i] + tier3Supports[i]);
  
  // Tier 2 Chart
  const tier2Data = (chartType === 'pie')
    ? [{
        labels: categories,
        values: tier2Supports,
        type: 'pie',
        textinfo: 'label+value',
        texttemplate: '%{label}: %{value} hrs'
      }]
    : [{
        x: categories,
        y: tier2Supports,
        type: 'bar',
        marker: {
          color: ['#0057B8', '#E31B23', '#FFC72C', '#00A9E0', '#78BE20', '#6E2585', '#F7941E']
        }
      }];
  
  Plotly.newPlot('tier2-chart', tier2Data, {
    title: `Tier II Supports (${chartType === 'pie' ? 'Pie' : 'Bar'} Chart)`,
    height: 400,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    xaxis: { title: 'Category' },
    yaxis: { title: 'Supports' }
  });
  
  // Tier 3 Chart
  const tier3Data = (chartType === 'pie')
    ? [{
        labels: categories,
        values: tier3Supports,
        type: 'pie',
        textinfo: 'label+value',
        texttemplate: '%{label}: %{value} hrs'
      }]
    : [{
        x: categories,
        y: tier3Supports,
        type: 'bar',
        marker: {
          color: ['#0057B8', '#E31B23', '#FFC72C', '#00A9E0', '#78BE20', '#6E2585', '#F7941E']
        }
      }];
  
  Plotly.newPlot('tier3-chart', tier3Data, {
    title: `Tier III Supports (${chartType === 'pie' ? 'Pie' : 'Bar'} Chart)`,
    height: 400,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    xaxis: { title: 'Category' },
    yaxis: { title: 'Supports' }
  });
  
  // Combined Chart
  const combinedData = (chartType === 'pie')
    ? [{
        labels: categories,
        values: combinedSupports,
        type: 'pie',
        textinfo: 'label+value',
        texttemplate: '%{label}: %{value} hrs'
      }]
    : [{
        x: categories,
        y: combinedSupports,
        type: 'bar',
        marker: {
          color: ['#0057B8', '#E31B23', '#FFC72C', '#00A9E0', '#78BE20', '#6E2585', '#F7941E']
        }
      }];
  
  Plotly.newPlot('combined-chart', combinedData, {
    title: `Combined Tier II & III Supports (${chartType === 'pie' ? 'Pie' : 'Bar'} Chart)`,
    height: 400,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    xaxis: { title: 'Category' },
    yaxis: { title: 'Supports' }
  });
}

// Create referral reasons chart
function createReferralReasonsChart(data, chartType) {
  const chartElement = document.getElementById('referral-reasons-chart');
  if (!chartElement) return;
  
  // Clear loading indicator
  chartElement.innerHTML = '';
  
  // Count referral reasons
  const reasonCounts = {};
  data.forEach(row => {
    const reason = row['Referral Reason'] || row['ReferralReason'] || row['Reason'] || row['reason'] || 'Unknown';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });
  
  // Prepare data
  const labels = Object.keys(reasonCounts);
  const values = Object.values(reasonCounts);
  
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
    title: 'Referral Reasons Distribution',
    height: 400,
    margin: { t: 50, b: 100, l: 50, r: 50 },
    paper_bgcolor: '#fff',
    plot_bgcolor: '#f9f9f9'
  };
  
  // Create the chart
  Plotly.newPlot('referral-reasons-chart', chartData, layout);
}

// Create referral by month chart
function createReferralMonthlyChart(data) {
  const chartElement = document.getElementById('referral-monthly-chart');
  if (!chartElement) return;
  
  // Clear loading indicator
  chartElement.innerHTML = '';
  
  // Group data by month and reason
  const monthlyData = {};
  const reasonTypes = new Set();
  
  data.forEach(row => {
    const month = row['Month'] || row['month'] || 0;
    const reason = row['Referral Reason'] || row['ReferralReason'] || row['Reason'] || row['reason'] || 'Unknown';
    
    // Initialize month if not exists
    if (!monthlyData[month]) {
      monthlyData[month] = {};
    }
    
    // Count reasons by month
    monthlyData[month][reason] = (monthlyData[month][reason] || 0) + 1;
    
    // Add to set of reasons
    reasonTypes.add(reason);
  });
  
  // Convert to arrays for Plotly
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const reasons = Array.from(reasonTypes);
  const colors = [
    '#0057B8', '#E31B23', '#FFC72C', '#00A9E0', 
    '#78BE20', '#6E2585', '#F7941E', '#00B2A9',
    '#FF8200', '#8A8D8F', '#4B2E83', '#EF3340'
  ];
  
  // Create traces for each reason
  const traces = [];
  
  reasons.forEach((reason, index) => {
    const monthlyValues = [];
    
    // Get values for each month
    for (let i = 1; i <= 12; i++) {
      const value = monthlyData[i] && monthlyData[i][reason] ? monthlyData[i][reason] : 0;
      monthlyValues.push(value);
    }
    
    traces.push({
      x: monthNames,
      y: monthlyValues,
      name: reason,
      type: 'bar',
      marker: { 
        color: colors[index % colors.length] 
      }
    });
  });
  
  // Chart layout
  const layout = {
    barmode: 'stack',
    title: 'Referral Reasons by Month',
    xaxis: { title: 'Month' },
    yaxis: { title: 'Student Count' },
    height: 400,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    paper_bgcolor: '#fff',
    plot_bgcolor: '#f9f9f9',
    legend: { orientation: 'h', y: -0.2 }
  };
  
  // Create the chart
  Plotly.newPlot('referral-monthly-chart', traces, layout);
}

// Create referral trends chart
function createReferralTrendsChart(data) {
  const chartElement = document.getElementById('referral-trends-chart');
  if (!chartElement) return;
  
  // Clear loading indicator
  chartElement.innerHTML = '';
  
  // Count referrals by month
  const monthlyCounts = Array(12).fill(0);
  
  data.forEach(row => {
    const month = row['Month'] || row['month'] || 0;
    if (month >= 1 && month <= 12) {
      monthlyCounts[month - 1]++;
    }
  });
  
  // Month names for x-axis
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Create line chart
  const chartData = [{
    x: monthNames,
    y: monthlyCounts,
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
  }];
  
  // Chart layout
  const layout = {
    title: 'Referral Trends Over Time',
    xaxis: { title: 'Month' },
    yaxis: { title: 'Total Referrals' },
    height: 400,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    paper_bgcolor: '#fff',
    plot_bgcolor: '#f9f9f9'
  };
  
  // Create the chart
  Plotly.newPlot('referral-trends-chart', chartData, layout);
}

// Generate mock referral data for testing
function generateMockReferralData() {
  const mockData = [];
  const schools = ['Washington Elementary', 'Lincoln High School', 'Roosevelt Middle', 'Jefferson Academy', 'Adams Elementary'];
  const reasons = ['Academic', 'Attendance', 'Behavior', 'Basic Needs', 'Family Support', 'Social/Emotional', 'Other'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Generate 200 mock referrals
  for (let i = 0; i < 200; i++) {
    const school = schools[Math.floor(Math.random() * schools.length)];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const month = months[Math.floor(Math.random() * months.length)];
    
    mockData.push({
      'School Name': school,
      'School': school,
      'Referral Reason': reason,
      'Month': month,
      'Date': `${month} ${Math.floor(Math.random() * 28) + 1}, 2023`
    });
  }
  
  return mockData;
}

// Generate mock tier support data for testing
function generateMockTierSupportData() {
  const mockData = [];
  const schools = ['Washington Elementary', 'Lincoln High School', 'Roosevelt Middle', 'Jefferson Academy', 'Adams Elementary'];
  const categories = ['Academic', 'Attendance', 'Behavior', 'Basic Needs', 'Family Support', 'Social/Emotional', 'Other'];
  
  // Generate 100 mock support records
  for (let i = 0; i < 100; i++) {
    const school = schools[Math.floor(Math.random() * schools.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const tier2Supports = Math.floor(Math.random() * 20) + 1;
    const tier3Supports = Math.floor(Math.random() * 15) + 1;
    
    mockData.push({
      'School Where Support Was Provided': school,
      'Student Support Category': category,
      '# of Tier II Supports': tier2Supports,
      '# of Tier III Supports': tier3Supports
    });
  }
  
  return mockData;
}
