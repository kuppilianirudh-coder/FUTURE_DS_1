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

// Simple LCG PRNG for reproducibility in Data Science presentations
class SeededRandom {
  private seed: number;
  constructor(seed = 12345) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const CATEGORIES: Record<string, { sub: string[]; products: string[]; marginRange: [number, number]; avgPrice: number }> = {
  'Technology': {
    sub: ['Phones', 'Laptops', 'Accessories', 'Printers'],
    products: [
      'iPhone 15 Pro Max', 'MacBook Air M3', 'Dell XPS 15 Carbon',
      'Sony WH-1000XM5 ANC', 'Anker PowerCore 24K', 'HP LaserJet Pro Color',
      'Samsung 34" Odyssey G8', 'Logitech MX Master 3S'
    ],
    marginRange: [0.15, 0.40],
    avgPrice: 450
  },
  'Furniture': {
    sub: ['Chairs', 'Tables', 'Bookcases', 'Furnishings'],
    products: [
      'Steelcase Gesture Chair', 'Modern Oak Dining Table', 'Tall Walnut Bookcase',
      'LED Adjustable Desk Lamp', 'Ergonomic Standing Desk', 'Minimalist Sofa Platform',
      'Leather Executive Lounge', 'Modular File Organizer'
    ],
    marginRange: [-0.05, 0.15], // Heavy shipping costs reduce margins
    avgPrice: 280
  },
  'Office Supplies': {
    sub: ['Paper', 'Art', 'Binders', 'Storage', 'Appliances'],
    products: [
      'Premium Copy Paper 5-Ream Case', 'Copic Sketch Marker Set', 'Heavy Duty 3-Ring Binder',
      'Plush Canvas Storage Box', 'Dyson Desk Fan Purifier', 'Fellowes Shredder Elite',
      'Pilot G2 Gel Pens Bulk Pack', 'Magnetic Mobile Whiteboard'
    ],
    marginRange: [0.20, 0.55], // High markup, lower sticker price
    avgPrice: 45
  }
};

const REGIONS = ['East', 'West', 'Central', 'South'] as const;
const SEGMENTS = ['Consumer', 'Corporate', 'Home Office'] as const;

const CUSTOMERS = [
  { name: 'Arthur Dent', segment: 'Consumer' },
  { name: 'Sarah Connor', segment: 'Corporate' },
  { name: 'Bruce Wayne', segment: 'Corporate' },
  { name: 'Tony Stark', segment: 'Home Office' },
  { name: 'Leia Organa', segment: 'Consumer' },
  { name: 'John Doe', segment: 'Consumer' },
  { name: 'Michael Scott', segment: 'Corporate' },
  { name: 'Pam Beesly', segment: 'Corporate' },
  { name: 'Harry Potter', segment: 'Consumer' },
  { name: 'Katniss Everdeen', segment: 'Home Office' },
  { name: 'Walter White', segment: 'Home Office' },
  { name: 'Hermione Granger', segment: 'Corporate' },
  { name: 'Clark Kent', segment: 'Consumer' },
  { name: 'Bruce Banner', segment: 'Corporate' },
  { name: 'Diana Prince', segment: 'Home Office' }
];

export function generateSyntheticDataset(recordCount = 1000, seed = 54321): SalesRecord[] {
  const rng = new SeededRandom(seed);
  const data: SalesRecord[] = [];

  // Generate date ranges mainly for 2024 to 2026
  const startYear = 2024;
  const daysInPeriod = 365 * 2 + 150; // Approximately 2.4 years of timeline

  for (let i = 0; i < recordCount; i++) {
    // Generate Order date with seasonal patterns (more sales in Nov-Dec, and June)
    let relativeDay = Math.floor(rng.next() * daysInPeriod);
    
    // Add custom skew to make Q4 more active
    const skewFactor = rng.next();
    if (skewFactor > 0.6) {
      // Re-map to Nov/Dec (days approx 300-365, or 665-730)
      const yearIdx = Math.floor(relativeDay / 365);
      const isLeap = yearIdx === 0 ? 0 : 1; 
      const startNov = yearIdx * 365 + 304;
      const endDec = yearIdx * 365 + 364;
      relativeDay = Math.floor(startNov + rng.next() * (endDec - startNov));
    }

    const baseDate = new Date(startYear, 0, 1);
    baseDate.setDate(baseDate.getDate() + relativeDay);
    const orderDate = baseDate.toISOString().split('T')[0];

    // Pick Category and relevant products
    const categoriesKeys = Object.keys(CATEGORIES);
    const category = categoriesKeys[Math.floor(rng.next() * categoriesKeys.length)];
    const catConfig = CATEGORIES[category];
    const subCategory = catConfig.sub[Math.floor(rng.next() * catConfig.sub.length)];
    const productName = catConfig.products[Math.floor(rng.next() * catConfig.products.length)];

    // Pricing & Metrics
    const baseUnitPrice = catConfig.avgPrice * (0.7 + rng.next() * 0.6);
    const quantity = Math.floor(rng.next() * 8) + 1; // 1 to 8 quantity

    // Basic sales = Price * Quantity
    let sales = Math.round(baseUnitPrice * quantity * 100) / 100;

    // Normal base margin
    const margin = catConfig.marginRange[0] + rng.next() * (catConfig.marginRange[1] - catConfig.marginRange[0]);
    let profit = Math.round(sales * margin * 100) / 100;

    // Region & Customer
    const region = REGIONS[Math.floor(rng.next() * REGIONS.length)];
    const customer = CUSTOMERS[Math.floor(rng.next() * CUSTOMERS.length)];
    const segment = customer.segment as 'Consumer' | 'Corporate' | 'Home Office';

    const orderId = `ORD-${baseDate.getFullYear()}-${10000 + i}`;

    let outlierType: 'High Margin' | 'High Sales Severe Loss' | 'None' = 'None';

    // Inject intentionally structured outliers for Business Profitability & Analytics Case Study:
    // Case 1: High Sales Severe Loss anomaly (e.g. huge system promo discount stacked or massive heavy shipping costs to remote Central/South regions)
    if (i % 47 === 0) {
      sales = Math.round(sales * 1.8 * 100) / 100;
      profit = Math.round(-sales * 0.45 * 100) / 100; // Large negative margin
      outlierType = 'High Sales Severe Loss';
    } 
    // Case 2: Extreme High Margin outlier (e.g. customized corporate elite installation services)
    else if (i % 93 === 0) {
      profit = Math.round(sales * 0.75 * 100) / 100; // Spectacular 75% margin
      outlierType = 'High Margin';
    }

    data.push({
      orderId,
      orderDate,
      productName,
      category,
      subCategory,
      sales,
      profit,
      quantity,
      region,
      customerName: customer.name,
      segment,
      outlierType
    });
  }

  // Sort by date to make chronological line-series look correct
  return data.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
}

export function convertToCSV(data: SalesRecord[]): string {
  const headers = ['Order ID', 'Order Date', 'Product Name', 'Category', 'Sub-Category', 'Sales', 'Profit', 'Quantity', 'Region', 'Customer Name', 'Segment', 'Outlier Type'];
  const rows = data.map(record => [
    record.orderId,
    record.orderDate,
    `"${record.productName.replace(/"/g, '""')}"`,
    record.category,
    record.subCategory,
    record.sales.toFixed(2),
    record.profit.toFixed(2),
    record.quantity.toString(),
    record.region,
    `"${record.customerName.replace(/"/g, '""')}"`,
    record.segment,
    record.outlierType
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
