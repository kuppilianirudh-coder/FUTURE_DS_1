/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SalesRecord {
  orderId: string;
  orderDate: string;
  productName: string;
  category: string;
  subCategory: string;
  sales: number;
  profit: number;
  quantity: number;
  region: 'East' | 'West' | 'Central' | 'South';
  customerName: string;
  segment: 'Consumer' | 'Corporate' | 'Home Office';
  outlierType: 'High Margin' | 'High Sales Severe Loss' | 'None';
}

export type MainTab = 'dashboard' | 'notebook' | 'python-cli' | 'client-report' | 'github';

export interface DashboardFilters {
  year: 'All' | '2024' | '2025' | '2026';
  region: 'All' | 'East' | 'West' | 'Central' | 'South';
  category: 'All' | 'Technology' | 'Furniture' | 'Office Supplies';
}

export interface SalesMetrics {
  totalSales: number;
  totalProfit: number;
  profitMargin: number;
  totalQuantity: number;
  outlierCount: number;
}
