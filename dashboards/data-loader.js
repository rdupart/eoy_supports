/**
 * Data Loader Module
 * 
 * This module provides functions to load CSV data from various sources
 * (GitHub, Google Sheets, Excel exports) and prepare it for visualization.
 * 
 * When the data source is updated, the website will automatically reflect
 * those changes when reloaded.
 */

// Configuration for data sources
const DATA_SOURCES = {
  student_support: {
    url: '../student_data/CIS_EOY_2023_2024 - Student Data.csv'
  },
  tier_support: {
    url: '../student_data/CIS_EOY_2023_2024 - Student Data.csv'
  },
  caseload: {
    url: '../school_data/CIS_EOY_2023_2024 - School Data.csv'
  },
  referral: {
    url: '../student_data/CIS_EOY_2023_2024 - Student Data.csv'
  },
  students_by_tier: {
    url: '../student_data/CIS_EOY_2023_2024 - Student Data.csv'
  }
};

/**
 * Load CSV data from a specified source
 * @param {string} source - The data source key from DATA_SOURCES
 * @param {function} callback - Function to call with the parsed data
 */
function loadCSVData(source, callback) {
  // Get selected year if available
  let year = '2023_2024'; // Default to most recent year
  const yearSelect = document.getElementById('yearSelect');
  if (yearSelect && yearSelect.value) {
    year = yearSelect.value;
  }
  
  // Format year for file naming (e.g., 2023-2024 to 2023_2024)
  const formattedYear = year.replace('-', '_');
  
  // Determine URL based on source type
  let url = '';
  
  if (source === 'school') {
    // Use school data
    url = `../school_data/CIS_EOY_${formattedYear} - School Data.csv`;
  } else if (source === 'student') {
    // Use student data
    url = `../student_data/CIS_EOY_${formattedYear} - Student Data.csv`;
  } else if (DATA_SOURCES[source]) {
    // Use configured data source
    url = DATA_SOURCES[source].url;
  } else {
    console.error(`Data source "${source}" not found`);
    callback([]);
    return;
  }
  
  // Show loading indicator
  console.log(`Loading data from ${url}...`);
  
  Papa.parse(url, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      if (results.errors.length > 0 && 
          results.errors[0].code !== 'UndetectableDelimiter' &&
          results.data.length === 0) {
        console.error('Error parsing CSV:', results.errors);
        callback([]);
        return;
      }
      
      // Log the first row to see the column names
      if (results.data.length > 0) {
        console.log('CSV columns:', Object.keys(results.data[0]));
      }
      
      console.log(`Loaded ${results.data.length} rows from ${source}`);
      callback(results.data);
    },
    error: function(error) {
      console.error(`Error loading CSV from ${url}:`, error);
      callback([]);
    }
  });
}

/**
 * Filter data by year
 * @param {Array} data - The full dataset
 * @param {string} year - Year to filter by (e.g., "2023_2024")
 * @returns {Array} - Filtered dataset
 */
function filterByYear(data, year) {
  return data.filter(item => item.school_year === year);
}

/**
 * Filter data by school
 * @param {Array} data - The dataset
 * @param {string} school - School to filter by
 * @returns {Array} - Filtered dataset
 */
function filterBySchool(data, school) {
  if (school === 'all') {
    return data;
  }
  return data.filter(item => item.school === school);
}

/**
 * Get unique values from a dataset column
 * @param {Array} data - The dataset
 * @param {string} column - Column name
 * @returns {Array} - Array of unique values
 */
function getUniqueValues(data, column) {
  const values = data.map(item => item[column]);
  return [...new Set(values)].filter(Boolean).sort();
}

/**
 * Populate a dropdown with options
 * @param {string} selectId - The select element ID
 * @param {Array} options - Array of option values
 * @param {string} defaultOption - Default selected option
 */
function populateDropdown(selectId, options, defaultOption = null) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  // Clear existing options
  select.innerHTML = '';
  
  // Add default "All" option if needed
  if (defaultOption) {
    const defaultOpt = document.createElement('option');
    defaultOpt.value = 'all';
    defaultOpt.textContent = defaultOption;
    select.appendChild(defaultOpt);
  }
  
  // Add options from data
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
}

/**
 * Create a Plotly pie chart
 * @param {string} elementId - Target element ID
 * @param {Array} labels - Labels for the pie segments
 * @param {Array} values - Values for the pie segments
 * @param {string} title - Chart title
 */
function createPieChart(elementId, labels, values, title) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const plotData = [{
    type: 'pie',
    labels: labels,
    values: values,
    textinfo: 'label+percent',
    insidetextorientation: 'radial',
    marker: {
      colors: generateColors(labels.length)
    }
  }];
  
  const layout = {
    title: title,
    height: 400,
    margin: { t: 50, b: 50, l: 50, r: 50 }
  };
  
  Plotly.newPlot(elementId, plotData, layout);
}

/**
 * Create a Plotly bar chart
 * @param {string} elementId - Target element ID
 * @param {Array} labels - Labels for the x-axis
 * @param {Array} values - Values for the y-axis
 * @param {string} title - Chart title
 * @param {string} xAxisTitle - Title for the x-axis
 * @param {string} yAxisTitle - Title for the y-axis
 */
function createBarChart(elementId, labels, values, title, xAxisTitle = '', yAxisTitle = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const plotData = [{
    type: 'bar',
    x: labels,
    y: values,
    marker: {
      color: generateColors(1)[0]
    }
  }];
  
  const layout = {
    title: title,
    height: 400,
    margin: { t: 50, b: 100, l: 50, r: 50 },
    xaxis: {
      title: xAxisTitle,
      tickangle: -45
    },
    yaxis: {
      title: yAxisTitle
    }
  };
  
  Plotly.newPlot(elementId, plotData, layout);
}

/**
 * Create a Plotly line chart
 * @param {string} elementId - Target element ID
 * @param {Array} labels - Labels for the x-axis
 * @param {Array} values - Values for the y-axis
 * @param {string} title - Chart title
 * @param {string} xAxisTitle - Title for the x-axis
 * @param {string} yAxisTitle - Title for the y-axis
 */
function createLineChart(elementId, labels, values, title, xAxisTitle = '', yAxisTitle = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const plotData = [{
    type: 'scatter',
    mode: 'lines+markers',
    x: labels,
    y: values,
    line: {
      color: generateColors(1)[0],
      width: 3
    },
    marker: {
      size: 8
    }
  }];
  
  const layout = {
    title: title,
    height: 400,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    xaxis: {
      title: xAxisTitle
    },
    yaxis: {
      title: yAxisTitle
    }
  };
  
  Plotly.newPlot(elementId, plotData, layout);
}

/**
 * Generate mock data for testing when CSV loading fails
 * @param {string} source - The data source key
 * @returns {Array} - Array of mock data objects
 */
function generateMockData(source) {
  const schools = ['Lincoln Elementary', 'Washington Middle', 'Jefferson High'];
  const tiers = ['Tier I', 'Tier II', 'Tier III'];
  const referralReasons = ['Academic', 'Attendance', 'Behavior', 'Social/Emotional', 'Family Support'];
  const supportCategories = ['Academic', 'Behavior', 'Attendance', 'Social/Emotional', 'Basic Needs'];
  const activities = ['Tutoring', 'Mentoring', 'Counseling', 'Family Outreach', 'Resource Coordination'];
  const years = ['2022_2023', '2023_2024'];
  
  let mockData = [];
  
  switch(source) {
    case 'student_support':
      // Generate student support data
      years.forEach(year => {
        schools.forEach(school => {
          tiers.forEach(tier => {
            supportCategories.forEach(category => {
              mockData.push({
                school_year: year,
                school: school,
                support_tier: tier,
                support_category: category,
                student_count: Math.floor(Math.random() * 50) + 10
              });
            });
          });
        });
      });
      break;
      
    case 'tier_support':
      // Generate tier support activities data
      years.forEach(year => {
        schools.forEach(school => {
          supportCategories.forEach(category => {
            activities.forEach(activity => {
              for (let month = 1; month <= 12; month++) {
                mockData.push({
                  school_year: year,
                  school: school,
                  support_category: category,
                  activity_type: activity,
                  count: Math.floor(Math.random() * 30) + 5,
                  month: month
                });
              }
            });
          });
        });
      });
      break;
      
    case 'caseload':
      // Generate caseload data
      years.forEach(year => {
        schools.forEach(school => {
          for (let month = 1; month <= 12; month++) {
            mockData.push({
              school_year: year,
              school: school,
              month: month,
              student_count: Math.floor(Math.random() * 100) + 50,
              new_students: Math.floor(Math.random() * 20) + 5
            });
          }
        });
      });
      break;
      
    case 'referral':
      // Generate referral reasons data
      years.forEach(year => {
        schools.forEach(school => {
          referralReasons.forEach(reason => {
            for (let month = 1; month <= 12; month++) {
              mockData.push({
                school_year: year,
                school: school,
                referral_reason: reason,
                student_count: Math.floor(Math.random() * 25) + 5,
                month: month
              });
            }
          });
        });
      });
      break;
      
    case 'students_by_tier':
      // Generate students by tier data
      years.forEach(year => {
        schools.forEach(school => {
          tiers.forEach(tier => {
            for (let month = 1; month <= 12; month++) {
              mockData.push({
                school_year: year,
                school: school,
                support_tier: tier,
                student_count: Math.floor(Math.random() * 100) + 20,
                month: month
              });
            }
          });
        });
      });
      break;
      
    default:
      // Generic mock data
      for (let i = 0; i < 50; i++) {
        mockData.push({
          school_year: years[i % years.length],
          school: schools[i % schools.length],
          value: Math.floor(Math.random() * 100)
        });
      }
  }
  
  return mockData;
}

/**
 * Generate an array of colors for charts
 * @param {number} count - Number of colors to generate
 * @returns {Array} - Array of color strings
 */
function generateColors(count) {
  // Predefined color palette for consistency
  const colorPalette = [
    '#0057B8', // CISEPA blue
    '#FF6B35', // Orange
    '#4CAF50', // Green
    '#9C27B0', // Purple
    '#FF9800', // Amber
    '#03A9F4', // Light Blue
    '#E91E63', // Pink
    '#8BC34A', // Light Green
    '#673AB7', // Deep Purple
    '#FFC107', // Yellow
    '#00BCD4', // Cyan
    '#FF5722', // Deep Orange
    '#3F51B5', // Indigo
    '#CDDC39', // Lime
    '#2196F3', // Blue
    '#F44336'  // Red
  ];
  
  if (count <= colorPalette.length) {
    return colorPalette.slice(0, count);
  }
  
  // If we need more colors than in the palette, generate them
  const colors = [...colorPalette];
  const additionalColors = count - colorPalette.length;
  
  for (let i = 0; i < additionalColors; i++) {
    const hue = (i * 137.5) % 360; // Use golden ratio to spread colors
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return colors;
}

// Export functions for use in other modules
window.DataLoader = {
  loadCSVData,
  filterByYear,
  filterBySchool,
  getUniqueValues,
  populateDropdown,
  createPieChart,
  createBarChart,
  createLineChart,
  generateColors
};
