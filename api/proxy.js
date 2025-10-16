export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;
  const teamId = req.query.teamId || req.body?.teamId;

  if (!teamId) {
    return res.status(400).json({
      success: false,
      message: 'Team ID is required',
      error: 'MISSING_TEAM_ID'
    });
  }

  // Map actions to n8n webhook URLs
  const webhookMap = {
    'start': 'https://abd15.app.n8n.cloud/webhook/task1-start',
    'end': 'https://abd15.app.n8n.cloud/webhook/task1-end'
  };

  const webhookUrl = webhookMap[action];

  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use: start or end',
      error: 'INVALID_ACTION'
    });
  }

  try {
    // Forward request to n8n
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ teamId })
    });

    const data = await response.json();

    // Return n8n response to client
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Proxy error: ' + error.message,
      error: 'PROXY_ERROR'
    });
  }
}
```

4. **Commit the file**

5. **Vercel will auto-redeploy** (1-2 minutes)

After redeployment, your proxy URL will be:
```
https://adventure-game-proxy.vercel.app/api/proxy
