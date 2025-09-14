# Seasonal Influenza Vaccination Dashboard

An interactive data visualization dashboard built using **D3.js** to explore seasonal influenza vaccination coverage across the United States. Users can filter by state, flu season, race/ethnicity, and estimate type to view monthly trends, yearly comparisons, and sample sizes.

> Created for Arizona State University's **CSE 478: Foundations of Data Visualization** course — received 100% on the assignment.

---

## Live Demo

[View Dashboard](https://rfaerber1.github.io/CSE-478-Assignment/) 

---

## Features

- **State Selector** – Choose any U.S. state/area
- **Year Selector** – Explore data by flu season (e.g., 2018–19)
- **Estimate Type** – Toggle between *Average* or *Maximum* estimate
- **Race/Ethnicity Filters** – Select/deselect categories dynamically
- **Three Coordinated Views**:
  - **Line Chart** – Monthly estimates during selected season
  - **Yearly Trends Line Chart** – Estimates across multiple years
  - **Bar Chart** – Monthly sample sizes by group
- **Tooltips** & dynamic **legend**
- Relatively responsive layout with media queries

---

## Project Structure

```
/project-root
│
├── dashboard/                   # Front-end dashboard built with D3.js
│   ├── index.html
│   ├── scripts.js
│   └── styles.css              # (or any other relevant files)
│
├── data/                        # Raw and cleaned datasets
│   ├── Influenza_Vaccination_Coverage.csv
│   └── cleaned_data.csv
│
├── notebooks/                   # Data preprocessing and exploration
│   └── data_preprocessing.ipynb
│
└── README.md                    # Project overview
```
---

## Dataset

- Source: [Data.gov - Influenza Vaccination Coverage for All Ages (6+ Months)](https://catalog.data.gov/dataset/influenza-vaccination-coverage-for-all-ages-6-months-bbec0)
- Data includes estimates by:
  - State
  - Flu season/year
  - Month (Jul–May)
  - Race/ethnicity
  - Sample size
- Cleaned to remove categories with insufficient year continuity

---

## Data Preprocessing

The raw dataset from the CDC included multiple dimensions, including region-level data, missing values, and formatting inconsistencies. I cleaned the data using a Jupyter Notebook, where I:

- Dropped entries with missing or invalid values
- Filtered data to include only U.S. states and territories
- Focused on the “Race and Ethnicity” dimension
- Exported a cleaned version in both CSV and JSON formats for use in the D3.js dashboard

[View the preprocessing notebook](https://github.com/rfaerber1/CSE-478-Assignment/blob/main/notebooks/CSE_478_dashboard_data_pre_processing.ipynb)

