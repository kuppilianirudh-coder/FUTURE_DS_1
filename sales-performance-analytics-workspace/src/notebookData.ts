/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NotebookCell {
  id: string;
  type: 'markdown' | 'code';
  content: string;
  output?: {
    type: 'text' | 'image' | 'metrics' | 'table';
    data: any;
  };
  durationMs: number;
}

export const JUPYTER_CELLS: NotebookCell[] = [
  {
    id: '1',
    type: 'markdown',
    content: `# Business Sales Performance Analytics: Exploratory Data Analysis & Preprocessing
**Author:** Lead Data Scientist
**Repository:** \`FUTURE_DS_01\`
**Date:** May 2026

This Jupyter Notebook performs a comprehensive, end-to-end exploratory data analysis (EDA), statistical outlier detection, clean data preprocessing, and revenue trend modeling on our corporate sales transactional dataset. This is part of modern portfolio automation to deliver executive metrics.

Let's start by importing the core analytics stack and preparing our environment parameters.`
    ,
    durationMs: 0
  },
  {
    id: '2',
    type: 'code',
    content: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# Set layout parameters for high-definition visuals
sns.set_theme(style="whitegrid")
plt.rcParams['figure.figsize'] = [12, 6]
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'

print("[OK] Applied custom Seaborn styling. Ready to load database.")`,
    output: {
      type: 'text',
      data: `[OK] Applied custom Seaborn styling. Ready to load database.`
    },
    durationMs: 350
  },
  {
    id: '3',
    type: 'markdown',
    content: `## 1. Load & Standardize Dataset
We will load our raw sales records into a high-performance Pandas DataFrame to standardize schemas, handle potential null indexes, detect duplicates, and re-cast date strings into datetime objects.`
    ,
    durationMs: 0
  },
  {
    id: '4',
    type: 'code',
    content: `# In production, raw transactions are polled from the main data lake: 'raw_sales_logs.csv'
# For this script, we read from our active source file
df = pd.read_csv("FUTURE_DS_01_sales_performance.csv")

# 1. Clean column headers: Standardize to snake_case for clean database interaction
df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('-', '_')

# 2. Date preprocessing
df['order_date'] = pd.to_datetime(df['order_date'])

# 3. Handle duplicates and missing fields
missing_counts = df.isnull().sum()
duplicate_count = df.duplicated().sum()

print("--- Schemas and Quality Matrix ---")
print(f"Total Rows Loaded: {len(df)}")
print(f"Duplicated entries found: {duplicate_count}")
print(f"Missing Values detected per column:\\n{missing_counts[missing_counts > 0].to_string() if len(missing_counts[missing_counts > 0]) > 0 else 'None (Clean Schema)'}")
print("\\nRecord Sample Preview:")
print(df[['order_id', 'order_date', 'product_name', 'sales', 'profit', 'region']].head(3).to_string())`,
    output: {
      type: 'table',
      data: {
        headers: ['Order ID', 'Order Date', 'Product Name', 'Sales', 'Profit', 'Region'],
        rows: [
          ['ORD-2024-10000', '2024-01-03', 'Sony WH-1000XM5 ANC', '$412.30', '$110.12', 'West'],
          ['ORD-2024-10001', '2024-01-05', 'Steelcase Gesture Chair', '$640.00', '-$12.50', 'Central'],
          ['ORD-2024-10002', '2024-01-09', 'Premium Copy Paper Case', '$45.00', '$19.20', 'East']
        ],
        summary: "Loaded 1,000 records chronological | 0 standard duplicates | 0 missing fields"
      }
    },
    durationMs: 600
  },
  {
    id: '5',
    type: 'markdown',
    content: `## 2. Advanced Statistical Outlier Tracking
In retail and corporate logistics, individual anomalies like deep stack-discounts can lead to severe losses on massive orders. We apply both the **IQR (Interquartile Range) Method** and **Z-Score analysis** on sales and margins to isolate outlier behaviors.`
    ,
    durationMs: 0
  },
  {
    id: '6',
    type: 'code',
    content: `# Calculate profit margin ratio
df['profit_margin'] = df['profit'] / df['sales']

# Apply IQR to Profit column
q1 = df['profit'].quantile(0.25)
q3 = df['profit'].quantile(0.75)
iqr = q3 - q1
lower_bound = q1 - 1.5 * iqr
upper_bound = q3 + 1.5 * iqr

outliers_iqr = df[(df['profit'] < lower_bound) | (df['profit'] > upper_bound)]

print("--- Robust Outlier Boundaries ---")
print(f"Profit IQR: {iqr:.2f} (Q1: {q1:.2f}, Q3: {q3:.2f})")
print(f"Statistical Profit Outlier Limits: [{lower_bound:.2f}, {upper_bound:.2f}]")
print(f"Number of Extreme Profit/Loss Records: {len(outliers_iqr)} records found")
print(f"Anomalies account for: {len(outliers_iqr)/len(df)*100:.2f}% of total transactions")`,
    output: {
      type: 'text',
      data: `--- Robust Outlier Boundaries ---
Profit IQR: 35.40 (Q1: 12.50, Q3: 47.90)
Statistical Profit Outlier Limits: [-40.60, 101.00]
Number of Extreme Profit/Loss Records: 32 records found
Anomalies account for: 3.20% of total transactions`
    },
    durationMs: 450
  },
  {
    id: '7',
    type: 'markdown',
    content: `## 3. High-Profit Categories vs Underperforrming Sectors
Integrating a pivot aggregation script reveals which categories bring absolute margin versus volume.`
    ,
    durationMs: 0
  },
  {
    id: '8',
    type: 'code',
    content: `category_stats = df.groupby('category').agg(
    total_sales=('sales', 'sum'),
    total_profit=('profit', 'sum'),
    avg_quantity=('quantity', 'mean'),
    margin_ratio=('profit', lambda x: x.sum() / df.loc[x.index, 'sales'].sum() * 100)
).reset_index()

category_stats['total_sales_display'] = category_stats['total_sales'].map('\${:,.2f}'.format)
category_stats['total_profit_display'] = category_stats['total_profit'].map('\${:,.2f}'.format)
category_stats['cumulative_margin'] = category_stats['margin_ratio'].map('{:.1f}%'.format)

print(category_stats[['category', 'total_sales_display', 'total_profit_display', 'avg_quantity', 'cumulative_margin']].to_string(index=False))`,
    output: {
      type: 'metrics',
      data: [
        { label: 'Technology', sales: '$178,450.00', profit: '$38,200.00', margin: '21.4%' },
        { label: 'Furniture', sales: '$98,200.00', profit: '$3,410.00', margin: '3.4%' },
        { label: 'Office Supplies', sales: '$42,390.00', profit: '$14,923.00', margin: '35.2%' }
      ]
    },
    durationMs: 500
  },
  {
    id: '9',
    type: 'markdown',
    content: `## 4. Seasonal Peak Analytics & Growth Trends
Identifying sales by calendar months across years allows us to calculate compound growth of our business seasonal demand curves.`
    ,
    durationMs: 0
  },
  {
    id: '10',
    type: 'code',
    content: `df['year_month'] = df['order_date'].dt.to_period('M')
monthly_sales = df.groupby('year_month')['sales'].sum().reset_index()

# Extract top months peak traffic
top_months = monthly_sales.sort_values(by='sales', ascending=False).head(3)
print("--- Historical Demand Peaks ---")
for idx, row in top_months.iterrows():
    print(f"Period: {row['year_month']} | Aggregate Revenue: \${row['sales']:,.2f}")`,
    output: {
      type: 'text',
      data: `--- Historical Demand Peaks ---
Period: 2025-11 | Aggregate Revenue: $22,482.10
Period: 2025-12 | Aggregate Revenue: $21,950.40
Period: 2024-11 | Aggregate Revenue: $18,490.50`
    },
    durationMs: 400
  }
];
