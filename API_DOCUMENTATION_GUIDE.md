# API Documentation Guide

## Overview

This guide provides comprehensive documentation for the **Zomato Ops Pro** delivery management system API. The API supports role-based authentication with two main user types: **Managers** and **Delivery Partners**.

## Available Documentation

- **Postman Collection**: `Zomato_API_Collection.postman_collection.json` - Complete API collection with examples and automated testing

## Using the Postman Collection

### 1. Import the Collection

1. Open Postman
2. Click **Import** button
3. Select the `Zomato_API_Collection.postman_collection.json` file
4. The collection will be imported with all endpoints organized by category

### 2. Set Up Environment Variables

The collection uses environment variables for easy configuration:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:5000` | Backend server URL |
| `authToken` | (auto-set) | JWT token for authentication |
| `userId` | (auto-set) | Current user ID |
| `userRole` | (auto-set) | Current user role |
| `orderId` | (manual) | Order ID for testing |
| `deliveryPartnerId` | (manual) | Delivery partner ID for assignment |

### 3. Authentication Flow

1. **Login**: Use the "Login User" request with default credentials:
   - Manager: `admin@zomato.com` / `admin123`
   - Delivery: `delivery1@zomato.com` / `password123`

2. **Auto Token Setup**: The login request automatically sets the `authToken` in your environment

3. **Authenticated Requests**: All subsequent requests will use the token automatically

### 4. Testing API Endpoints

#### Authentication Endpoints
- **Register User**: Create new manager or delivery partner accounts
- **Login User**: Authenticate and get JWT token
- **Get Profile**: Retrieve current user information
- **Logout**: End user session

#### Order Management (Manager Role)
- **Get All Orders**: List orders with filtering and pagination
- **Create Order**: Add new delivery orders
- **Get Order by ID**: Retrieve specific order details
- **Update Order Status**: Change order status (PENDING → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED)
- **Assign Delivery Partner**: Assign orders to available delivery partners

#### Delivery Operations (Delivery Partner Role)
- **Get My Orders**: View assigned orders
- **Toggle Availability**: Set online/offline status
- **Update Location**: Send current GPS coordinates
- **Get Delivery Profile**: View performance statistics

#### Analytics (Manager Role)
- **Order Metrics**: Get order statistics and trends
- **Delivery Metrics**: View delivery performance data
- **System Metrics**: Monitor system health
- **Connected Users**: See real-time user connections

#### Tracking (Both Roles)
- **Get Order Tracking**: Real-time order location and status
- **Subscribe to Tracking**: Enable real-time updates

## API Testing Tips

### Authentication Requirements

All endpoints except registration, login, and health check require authentication:

```
Authorization: Bearer <jwt_token>
```

### Role-Based Access

- **Manager Only**: Order creation, partner assignment, analytics
- **Delivery Only**: Availability toggle, location updates, assigned orders
- **Both Roles**: Order viewing, profile management, tracking

### Common Request Examples

#### Creating an Order (Manager)
```json
{
  "customerName": "Rajesh Kumar",
  "customerPhone": "+91-9876543210",
  "items": [
    {
      "name": "Butter Chicken",
      "quantity": 2,
      "price": 350
    }
  ],
  "deliveryAddress": {
    "street": "123 MG Road",
    "area": "Bandra West",
    "city": "Mumbai",
    "coordinates": {
      "latitude": 19.0596,
      "longitude": 72.8295
    }
  },
  "totalAmount": 700
}
```

#### Updating Order Status
```json
{
  "status": "CONFIRMED",
  "notes": "Order confirmed and being prepared"
}
```

#### Updating Location (Delivery Partner)
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

### Response Formats

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Order Status Flow

Orders follow this status progression:
1. **PENDING** - Order created, awaiting confirmation
2. **CONFIRMED** - Order accepted by restaurant
3. **PREPARING** - Food being prepared
4. **OUT_FOR_DELIVERY** - Assigned to delivery partner
5. **DELIVERED** - Successfully delivered
6. **CANCELLED** - Order cancelled

## Real-time Features

The API supports real-time updates via Socket.io:

### Socket Events

#### Order Updates
- `orderStatusChanged` - Order status updates
- `orderAssigned` - Delivery partner assignment
- `locationUpdate` - Real-time location tracking

#### User Connection
- `userConnected` - User comes online
- `userDisconnected` - User goes offline

### Connecting to Socket.io
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Listen for order updates
socket.on('orderStatusChanged', (data) => {
  console.log('Order status updated:', data);
});
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if you're logged in
   - Verify the auth token is set in environment
   - Ensure token hasn't expired

2. **403 Forbidden**
   - Check user role permissions
   - Verify you're using the correct role for the endpoint

3. **404 Not Found**
   - Verify the endpoint URL
   - Check if the resource ID exists

4. **500 Internal Server Error**
   - Check server logs
   - Verify database connection
   - Ensure all required fields are provided

### Debug Tips

1. **Check Environment Variables**: Ensure all variables are set correctly
2. **Verify Base URL**: Make sure the server is running on the correct port
3. **Review Request Body**: Validate JSON format and required fields
4. **Check Response Headers**: Look for error details in response headers

## Rate Limiting

The API implements rate limiting:
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Real-time updates**: No limit (Socket.io)

## Testing Workflows

### Manager Workflow
1. Login as manager
2. Create new orders
3. View all orders
4. Assign delivery partners
5. Monitor analytics
6. Track order progress

### Delivery Partner Workflow
1. Login as delivery partner
2. Set availability status
3. Update current location
4. View assigned orders
5. Update order status
6. Complete deliveries

This documentation provides everything needed to effectively test and integrate with the Zomato Ops Pro API using the provided Postman collection. 