/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { generateSyntheticDataset, convertToCSV } from './src/dataGenerator.js';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize the deterministic dataset once
const fullSalesDataset = generateSyntheticDataset(1000, 54321);

// GET: Raw structured Sales dataset
app.get('/api/sales/data', (req, res) => {
  try {
    res.json({
      success: true,
      data: fullSalesDataset,
      meta: {
        totalRecords: fullSalesDataset.length,
        timeframe: '2024-01-01 to 2026-05-28'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Serves the dataset as a direct download attachment CSV
app.get('/api/sales/download-csv', (req, res) => {
  try {
    const csvContent = convertToCSV(fullSalesDataset);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="FUTURE_DS_01_sales_performance.csv"');
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).send(`Error generating CSV: ${error.message}`);
  }
});

// POST: Calls Gemini to generate elite strategic business recommendations & insights
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { filters, metrics, topProducts, categoryPerformance, regionalBreakdown } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Elegant, verbose placeholder insights if Key is missing, explaining the dashboard stats
      return res.json({
        success: true,
        isMock: true,
        report: `## Executive Summary & Strategic Insights (Demo Mode)

We have analyzed your filtered dataset spanning **${filters?.year || 'All Years'}** across the **${filters?.region || 'All Regions'}** region:

### 📊 Key Performance Observations
1. **Financial Health**: Backed by a high average margin in **Technology**, the business enjoys total sales of **$${metrics?.totalSales?.toLocaleString() || 'N/A'}** with a healthy cumulative profit of **$${metrics?.totalProfit?.toLocaleString() || 'N/A'}** (margin of **${metrics?.profitMargin || 'N/A'}%**).
2. **Growth Trend**: Our EDA models identify a **${filters?.year === '2025' ? '+18%' : '+24%'} YoY compound growth rate**, strongly influenced by high seasonal traffic in **November and December (Holiday Spikes)**.
3. **Regional Champion**: The **West** region consistently yields the highest volume, but the **Central** is heavily exposed to shipping adjustments, leading to occasional outliers.

### 🚫 Strategic Recommendations
* **Focus on Tech Acceleration**: Laptops and accessories drive **74% of Category Profits**. Double down on hardware bundles.
* **Control Furniture Heavy Freight**: Binders and paper offset Furniture losses. Restructure logistics contracts in remote territories.
* **Outlier Mitigation**: Restrict stacking discount codes on multiple quantity options (e.g. system anomalies on MacBook sets).

*(To unlock real-time, bespoke cognitive analysis based on your selections, activate your **GEMINI_API_KEY** inside AI Studio Settings > Secrets)*`
      });
    }

    // Initialize the official @google/genai client
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Create a precise, quantitative context block for Gemini
    const systemPrompt = `You are an elite Lead Enterprise Data Scientist and Business Strategy advisor.
Your goal is to parse detailed sales performance analytics data, summarize key insights (EDA, Outliers, growth patterns), and provide highly actionable corporate recommendations.
Use elegant, professional Markdown formatting with clear sections, executive language, bullet points, and dynamic stats.`;

    const userPrompt = `Please analyze the current filtered Business Sales Performance database with the following active parameters:
- Year filter: ${filters?.year || 'All Years'}
- Region filter: ${filters?.region || 'All Regions'}
- Category filter: ${filters?.category || 'All Categories'}

Current Visualized Metrics:
- Total Revenue: $${metrics?.totalSales?.toLocaleString() || 'N/A'}
- Total Profit: $${metrics?.totalProfit?.toLocaleString() || 'N/A'}
- Profit Margin: ${metrics?.profitMargin || 'N/A'}%
- Total Quantity Ordered: ${metrics?.totalQuantity || '0'}
- Outlier Records Detected: ${metrics?.outlierCount || '0'}

Top Selling Products Under Filter:
${(topProducts || []).map((p: any, i: number) => `${i + 1}. ${p.name} ($${p.sales.toLocaleString()} Sales, $${p.profit.toLocaleString()} Profit)`).join('\n')}

Category Breakdown:
${(categoryPerformance || []).map((c: any) => `- ${c.name}: $${c.sales.toLocaleString()} Sales, $${c.profit.toLocaleString()} Profit`).join('\n')}

Regional Performance Breakdown:
${(regionalBreakdown || []).map((r: any) => `- ${r.name}: $${r.sales.toLocaleString()} Sales, $${r.profit.toLocaleString()} Profit`).join('\n')}

Please compose a cohesive, client-ready "Strategic Intelligence Brief":
1. EXECUTIVE SUMMARY: Focus on growth trends, overall performance, and outlier impacts under this scope.
2. REGIONAL INSIGHTS: Analyze which regions are over/underperforming and why.
3. PRODUCTABILITY & PRODUCT ADVISORY: Call out maximum profit drivers and any loss-making sub-categories or outliers (such as stacking code discount errors).
4. INVENTORY & MARKETING RECOMMENDATIONS: Actionable points on stock optimization, promotional pacing, and geographical focus.

Keep the tone highly professional, precise, polished, and advisory. Avoid generic boilerplate statements. Use realistic details that correspond perfectly with these metrics.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.25,
      }
    });

    res.json({
      success: true,
      report: response.text || 'Unable to generate analysis results.',
      isMock: false
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve Vite client app in Dev / Static files in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OK] Full-Stack Analytics server running on http://localhost:${PORT}`);
  });
}

startServer();
