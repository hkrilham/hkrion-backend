import { NextResponse } from 'next/server'

export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>HKRiON API Documentation</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/png" href="/favicon.ico" />
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <script
    id="api-reference"
    data-url="/api/openapi.json"
    data-configuration='{
      "theme": "kepler",
      "layout": "modern",
      "darkMode": true,
      "hideModels": false,
      "showSidebar": true,
      "metaData": {
        "title": "HKRiON API Documentation",
        "description": "Complete API documentation for HKRiON POS & Inventory Management System"
      },
      "defaultHttpClient": {
        "targetKey": "javascript",
        "clientKey": "fetch"
      },
      "customCss": ".dark-mode { --scalar-background-1: #0f172a; --scalar-background-2: #1e293b; --scalar-color-accent: #22c55e; }"
    }'
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
