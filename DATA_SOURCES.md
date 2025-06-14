# Data Sources for CISEPA Dashboard

This document explains how to update the data sources for the CISEPA Dashboard.

## Current Data Structure

The dashboard uses CSV files hosted on GitHub as its data sources. These files are loaded dynamically when the dashboard is viewed, so updating the data only requires updating the CSV files.

## CSV Data Files

The dashboard uses the following CSV data files:

1. **Student Support Data**: 
   - URL: `https://raw.githubusercontent.com/rdupart/student_support_dashboard/main/student_support_data.csv`
   - Contains data for Tier II and Tier III student supports

2. **Tier Support Activities Data**:
   - URL: `https://raw.githubusercontent.com/rdupart/student_support_dashboard/main/tier_support_data.csv`
   - Contains data for support activities, categories, and yearly trends

3. **Caseload Data**:
   - URL: `https://raw.githubusercontent.com/rdupart/student_support_dashboard/main/caseload_data.csv`
   - Contains data for caseload buildup over time

4. **Referral Data**:
   - URL: `https://raw.githubusercontent.com/rdupart/student_support_dashboard/main/referral_data.csv`
   - Contains data for referral reasons

5. **Annual Outcomes Data**:
   - URL: `https://raw.githubusercontent.com/rdupart/student_support_dashboard/main/annual_outcomes.csv`
   - Contains data for annual outcomes

## How to Update Data

### Option 1: Update CSV Files on GitHub

1. Go to the GitHub repository: `https://github.com/rdupart/student_support_dashboard/`
2. Navigate to the CSV file you want to update
3. Click the "Edit" button (pencil icon)
4. Make your changes or replace the content with updated CSV data
5. Commit the changes

### Option 2: Upload New CSV Files

1. Export your data from Excel, Google Sheets, or another data source as a CSV file
2. Go to the GitHub repository: `https://github.com/rdupart/student_support_dashboard/`
3. Click "Add file" > "Upload files"
4. Upload your new CSV file
5. If replacing an existing file, use the same filename
6. Commit the changes

### Option 3: Change Data Source URLs

If you want to use CSV files from a different location:

1. Open the file `dashboards/data-loader.js`
2. Locate the `DATA_SOURCES` object at the top of the file
3. Update the URLs for the data sources you want to change
4. Save the file and commit the changes

## CSV Format Requirements

For the dashboard to work correctly, your CSV files must have the following columns:

### Student Support Data
- `school_year`: The academic year (e.g., "2023_2024")
- `school`: The school name
- `support_tier`: The support tier (e.g., "Tier II", "Tier III")
- `student_count`: Number of students

### Tier Support Activities Data
- `school_year`: The academic year
- `school`: The school name
- `support_category`: Category of support
- `activity_type`: Type of activity
- `count`: Number of activities

### Caseload Data
- `school_year`: The academic year
- `school`: The school name
- `month`: Month (numeric, 1-12)
- `student_count`: Total students in caseload
- `new_students`: New students added that month

## Google Sheets Integration

You can also use Google Sheets as a data source:

1. Create your data in Google Sheets
2. File > Share > Publish to the web
3. Choose "Comma-separated values (.csv)" as the format
4. Copy the published URL
5. Update the URL in `dashboards/data-loader.js`

## Troubleshooting

If your data isn't displaying correctly:

1. Check that your CSV files have the correct column names (case-sensitive)
2. Ensure numeric values are properly formatted (no special characters)
3. Check the browser console for any JavaScript errors
4. Verify that your CSV files are accessible from the URLs specified in `data-loader.js`

For any questions or assistance, please contact the dashboard administrator.
