# SmartRentals Admin UI

A React-based admin dashboard for the SmartRentals API.

## Features

- **Dashboard**: Availability search, price quotes, upcoming reservations overview
- **Products**: Create and manage rental products with daily rates
- **Inventory**: Track individual items per product with locations
- **Customers**: Manage customer information
- **Orders**: Create orders with multiple reservations, update status
- **Reports**: Utilization analytics and reservation details

## Quick Start

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Open in browser**: http://localhost:3000

## Configuration

### API Connection
The frontend connects to your FastAPI backend via proxy (see `package.json`).

- Backend should run on: http://localhost:8000
- Frontend runs on: http://localhost:3000

### API Key (Optional)
If you've set `SMARTRENTALS_API_KEY` environment variable for the backend, create a `.env` file in the frontend directory:

```
REACT_APP_API_KEY=your-secret-key
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout.js       # Navigation sidebar
│   │   ├── Dashboard.js    # Availability search & overview
│   │   ├── Products.js     # Product management
│   │   ├── Inventory.js    # Inventory item management
│   │   ├── Customers.js    # Customer management
│   │   ├── Orders.js       # Order creation & status updates
│   │   └── Reports.js      # Analytics & reporting
│   ├── services/
│   │   └── api.js          # API client functions
│   ├── App.js              # Main app with routing
│   └── index.js            # Entry point
└── package.json
```

## Usage

1. **Start with Products**: Create rental products with daily rates
2. **Add Inventory**: Create individual items for each product
3. **Add Customers**: Register customer information
4. **Check Availability**: Use dashboard to search available items by date
5. **Create Orders**: Book items for customers with automatic pricing
6. **Manage Orders**: Update status (pending → confirmed → returned)
7. **View Reports**: Monitor utilization and upcoming reservations

## Development

- Uses Create React App for easy development
- Proxy configuration routes API calls to backend
- Modern React with hooks and functional components
- Responsive design with inline styles
- Date handling with date-fns library

## Production Deployment

For production, build the frontend and serve static files:

```bash
npm run build
```

Then serve the `build/` directory with any static file server or integrate with your FastAPI backend to serve static files.
