const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Settings file path
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// Default settings
const DEFAULT_SETTINGS = {
  companyName: 'RSLAF Machine Rentals',
  timezone: 'UTC-08:00',
  currency: 'USD',
  theme: 'light',
  email: 'admin@rslaf.com',
  emailNotifications: true,
  inAppNotifications: true,
  smsNotifications: false,
  autoBackup: true,
  maintenanceMode: false,
  paymentGateway: 'none',
  stripePublishableKey: '',
  stripeSecretKey: '',
  paypalClientId: '',
  paypalClientSecret: '',
  orangeMoneyApiKey: '',
  orangeMoneyMerchantId: '',
  afrimoneyApiKey: '',
  afrimoneyMerchantCode: '',
  vultApiKey: '',
  vultMerchantId: '',
  bankTransferEnabled: false,
  bankAccountNumber: '',
  bankName: '',
  bankSwiftCode: '',
  paymentMode: 'test',
  lastUpdated: new Date().toISOString()
};

// Initialize settings file if it doesn't exist
async function initializeSettings() {
  try {
    await fs.access(SETTINGS_FILE);
    console.log('✅ Settings file exists');
  } catch (error) {
    console.log('📝 Creating settings file...');
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    console.log('✅ Settings file created');
  }
}

// Read settings from file
async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Write settings to file
async function writeSettings(settings) {
  try {
    settings.lastUpdated = new Date().toISOString();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    console.log('💾 Settings saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error writing settings:', error);
    return false;
  }
}

// Store connected clients for real-time updates
const connectedClients = new Set();

// GET /api/settings - Get current settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await readSettings();
    console.log('📖 Settings retrieved');
    res.json(settings);
  } catch (error) {
    console.error('❌ Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// PUT /api/settings - Update settings
app.put('/api/settings', async (req, res) => {
  try {
    const newSettings = req.body;
    
    // Validate required fields
    if (!newSettings.companyName || !newSettings.currency) {
      return res.status(400).json({ error: 'Company name and currency are required' });
    }
    
    const success = await writeSettings(newSettings);
    
    if (success) {
      console.log('🔄 Settings updated, notifying clients...');
      
      // Notify all connected clients about the update
      broadcastSettingsUpdate(newSettings);
      
      res.json({ 
        success: true, 
        message: 'Settings updated successfully',
        settings: newSettings
      });
    } else {
      res.status(500).json({ error: 'Failed to save settings' });
    }
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /api/settings/sync - Server-Sent Events for real-time updates
app.get('/api/settings/sync', (req, res) => {
  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Add client to connected clients
  connectedClients.add(res);
  console.log(`📡 Client connected for settings sync. Total: ${connectedClients.size}`);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Settings sync connected' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    connectedClients.delete(res);
    console.log(`📡 Client disconnected from settings sync. Total: ${connectedClients.size}`);
  });
});

// Broadcast settings update to all connected clients
function broadcastSettingsUpdate(settings) {
  const message = JSON.stringify({
    type: 'settings_updated',
    data: settings,
    timestamp: new Date().toISOString()
  });

  connectedClients.forEach(client => {
    try {
      client.write(`data: ${message}\n\n`);
    } catch (error) {
      console.error('❌ Error sending update to client:', error);
      connectedClients.delete(client);
    }
  });

  console.log(`📢 Settings update broadcasted to ${connectedClients.size} clients`);
}

// GET /api/settings/export - Export settings
app.get('/api/settings/export', async (req, res) => {
  try {
    const settings = await readSettings();
    res.setHeader('Content-Disposition', 'attachment; filename=rslaf-settings.json');
    res.setHeader('Content-Type', 'application/json');
    res.json(settings);
  } catch (error) {
    console.error('❌ Error exporting settings:', error);
    res.status(500).json({ error: 'Failed to export settings' });
  }
});

// POST /api/settings/import - Import settings
app.post('/api/settings/import', async (req, res) => {
  try {
    const importedSettings = req.body;
    
    // Merge with default settings to ensure all fields exist
    const mergedSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
    
    const success = await writeSettings(mergedSettings);
    
    if (success) {
      broadcastSettingsUpdate(mergedSettings);
      res.json({ 
        success: true, 
        message: 'Settings imported successfully',
        settings: mergedSettings
      });
    } else {
      res.status(500).json({ error: 'Failed to import settings' });
    }
  } catch (error) {
    console.error('❌ Error importing settings:', error);
    res.status(500).json({ error: 'Failed to import settings' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'RSLAF Settings API',
    connectedClients: connectedClients.size,
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    await initializeSettings();
    
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🎯 RSLAF SETTINGS API SERVER STARTED');
      console.log('='.repeat(60));
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`📖 Get settings: GET /api/settings`);
      console.log(`💾 Update settings: PUT /api/settings`);
      console.log(`📡 Real-time sync: GET /api/settings/sync`);
      console.log(`📤 Export settings: GET /api/settings/export`);
      console.log(`📥 Import settings: POST /api/settings/import`);
      console.log(`❤️ Health check: GET /health`);
      console.log('='.repeat(60));
      console.log('✅ Ready to sync settings between portals!');
      console.log('🔄 Changes will be broadcasted in real-time');
      console.log('\nPress Ctrl+C to stop\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down settings API server...');
  process.exit(0);
});

startServer();
