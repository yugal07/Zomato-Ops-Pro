import React, { useState } from 'react';
import { 
  Wand2, 
  Package, 
  Clock, 
  User, 
  Plus,
  Shuffle,
  Zap,
  AlertCircle,
  CheckCircle,
  X,
  Bug
} from 'lucide-react';
import apiService from '../../services/api';

interface MockOrderGeneratorProps {
  onOrderCreated: () => void;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

// API Debug Helper Component
const APIDebugHelper: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testOrderCreation = async () => {
    setIsLoading(true);
    setTestResult('');

    // Generate a unique order ID for the test
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const orderId = `TEST-${timestamp}-${random}`;

    const testOrder = {
      orderId, // Include orderId in test
      items: [
        {
          name: "Margherita Pizza",
          quantity: 1,
          price: 299
        }
      ],
      prepTime: 30
    };

    try {
      console.log('Testing order creation with data:', testOrder);
      
      const response = await apiService.post<any>('/orders', testOrder);
      
      setTestResult(`✅ SUCCESS: Order created successfully!
Response: ${JSON.stringify(response, null, 2)}`);
      
      console.log('Order creation successful:', response);
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      };
      
      setTestResult(`❌ ERROR: ${error.message}
Status: ${error.response?.status} ${error.response?.statusText}
Server Response: ${JSON.stringify(error.response?.data, null, 2)}
Request Data Sent: ${JSON.stringify(testOrder, null, 2)}`);
      
      console.error('Order creation failed:', errorDetails);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuth = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      const response = await apiService.get<any>('/auth/profile');
      setTestResult(`✅ AUTH SUCCESS: User authenticated
User Data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ AUTH ERROR: ${error.message}
Status: ${error.response?.status}
Response: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
        <h4 className="font-medium text-red-900 dark:text-red-200">API Debug Helper</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <button
          onClick={testAuth}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 border border-green-300 dark:border-green-700 rounded text-sm transition-colors disabled:opacity-50"
        >
          <span className="text-green-700 dark:text-green-300">Test Auth</span>
        </button>

        <button
          onClick={testOrderCreation}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded text-sm transition-colors disabled:opacity-50"
        >
          <span className="text-blue-700 dark:text-blue-300">Test Order Creation</span>
        </button>
      </div>

      {testResult && (
        <div className="bg-white dark:bg-gray-800 rounded p-3">
          <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-40">
            {testResult}
          </pre>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-2">
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-red-600 dark:text-red-400 text-sm">Testing...</span>
        </div>
      )}
    </div>
  );
};

interface MockOrderGeneratorProps {
  onOrderCreated: () => void;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

const MockOrderGenerator: React.FC<MockOrderGeneratorProps> = ({ onOrderCreated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomOrder, setShowCustomOrder] = useState(false);
  const [batchSize, setBatchSize] = useState(1);
  const [customItems, setCustomItems] = useState<OrderItem[]>([
    { name: 'Margherita Pizza', quantity: 2, price: 299 }
  ]);
  const [customPrepTime, setCustomPrepTime] = useState(30);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Mock data pools
  const mockItems = {
    pizzas: [
      { name: 'Margherita Pizza', basePrice: 299 },
      { name: 'Pepperoni Pizza', basePrice: 349 },
      { name: 'Veggie Supreme', basePrice: 399 },
      { name: 'BBQ Chicken Pizza', basePrice: 449 },
      { name: 'Hawaiian Pizza', basePrice: 379 },
      { name: 'Meat Lovers Pizza', basePrice: 499 }
    ],
    sides: [
      { name: 'Garlic Bread', basePrice: 149 },
      { name: 'Chicken Wings', basePrice: 249 },
      { name: 'Mozzarella Sticks', basePrice: 199 },
      { name: 'Caesar Salad', basePrice: 179 },
      { name: 'Onion Rings', basePrice: 129 }
    ],
    beverages: [
      { name: 'Coca Cola', basePrice: 49 },
      { name: 'Orange Juice', basePrice: 79 },
      { name: 'Iced Tea', basePrice: 59 },
      { name: 'Mineral Water', basePrice: 29 }
    ]
  };

  const customerNames = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta',
    'Vikram Singh', 'Anita Rao', 'Rohit Verma', 'Kavya Nair',
    'Suresh Reddy', 'Meera Iyer', 'Arjun Joshi', 'Divya Mehta'
  ];

  const generateRandomItems = (): OrderItem[] => {
    const items: OrderItem[] = [];
    const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
    
    // Always include at least one main item (pizza)
    const mainItem = mockItems.pizzas[Math.floor(Math.random() * mockItems.pizzas.length)];
    items.push({
      name: mainItem.name,
      quantity: Math.floor(Math.random() * 2) + 1, // 1-2 quantity
      price: mainItem.basePrice
    });

    // Add random sides and beverages
    for (let i = 1; i < numItems; i++) {
      const allItems = [...mockItems.sides, ...mockItems.beverages];
      const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
      
      // Avoid duplicates
      if (!items.find(item => item.name === randomItem.name)) {
        items.push({
          name: randomItem.name,
          quantity: Math.floor(Math.random() * 3) + 1, // 1-3 quantity
          price: randomItem.basePrice
        });
      }
    }

    return items;
  };

  const generateRandomOrder = () => {
    const items = generateRandomItems();
    const prepTime = Math.floor(Math.random() * 31) + 15; // 15-45 minutes
    
    // Generate a unique order ID manually since the pre-save hook might not be working
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const orderId = `ORD-${timestamp}-${random}`;
    
    return {
      orderId, // Include the orderId in the request
      items,
      prepTime
    };
  };

  const generateBatchOrders = async () => {
    try {
      setIsGenerating(true);
      setError('');
      setSuccess('');

      const orders = [];
      for (let i = 0; i < batchSize; i++) {
        orders.push(generateRandomOrder());
      }

      // Create orders with slight delays to simulate realistic timing
      let successCount = 0;
      for (const orderData of orders) {
        try {
          console.log('Sending order data:', orderData); // Debug log
          const response = await apiService.post<any>('/orders', orderData);
          console.log('Order created successfully:', response); // Debug log
          successCount++;
          
          // Small delay between orders
          if (orders.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (err: any) {
          console.error('Failed to create order:', err);
          console.error('Error response:', err.response?.data); // Debug log
          if (err.response?.data?.message) {
            setError(err.response.data.message);
          }
        }
      }

      if (successCount > 0) {
        setSuccess(`Successfully created ${successCount} mock order${successCount > 1 ? 's' : ''}!`);
        onOrderCreated();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else if (successCount === 0) {
        setError('Failed to create any orders. Check console for details.');
      }
    } catch (err: any) {
      console.error('Batch generation error:', err);
      setError(err.message || 'Failed to generate orders');
    } finally {
      setIsGenerating(false);
    }
  };

  const createCustomOrder = async () => {
    try {
      setIsGenerating(true);
      setError('');
      setSuccess('');

      // Generate a unique order ID for custom orders too
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      const orderId = `ORD-${timestamp}-${random}`;

      const orderData = {
        orderId, // Include the orderId
        items: customItems,
        prepTime: customPrepTime
      };

      console.log('Sending custom order data:', orderData); // Debug log
      const response = await apiService.post<any>('/orders', orderData);
      console.log('Custom order created successfully:', response); // Debug log

      setSuccess('Custom order created successfully!');
      onOrderCreated();
      setShowCustomOrder(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to create custom order:', err);
      console.error('Error response:', err.response?.data); // Debug log
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to create custom order');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const addCustomItem = () => {
    setCustomItems([...customItems, { name: '', quantity: 1, price: 0 }]);
  };

  const updateCustomItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...customItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setCustomItems(updatedItems);
  };

  const removeCustomItem = (index: number) => {
    if (customItems.length > 1) {
      setCustomItems(customItems.filter((_, i) => i !== index));
    }
  };

  const fillRandomCustomOrder = () => {
    const randomOrder = generateRandomOrder();
    setCustomItems(randomOrder.items);
    setCustomPrepTime(randomOrder.prepTime);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mock Order Generator</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate test orders for development and testing</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCustomOrder(!showCustomOrder)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Custom Order</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Debug Helper */}
        <APIDebugHelper />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => {
              setBatchSize(1);
              generateBatchOrders();
            }}
            disabled={isGenerating}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-600 dark:text-blue-400">Quick Order</span>
          </button>

          <button
            onClick={() => {
              setBatchSize(5);
              generateBatchOrders();
            }}
            disabled={isGenerating}
            className="flex items-center justify-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-600 dark:text-green-400">Batch (5)</span>
          </button>

          <button
            onClick={() => {
              setBatchSize(10);
              generateBatchOrders();
            }}
            disabled={isGenerating}
            className="flex items-center justify-center space-x-2 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <Shuffle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-600 dark:text-purple-400">Stress Test (10)</span>
          </button>
        </div>

        {/* Custom Batch Size */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custom Batch Size
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={generateBatchOrders}
              disabled={isGenerating || batchSize < 1}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Generate {batchSize} Order{batchSize > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Order Form */}
        {showCustomOrder && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Order</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fillRandomCustomOrder}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Shuffle className="h-3 w-3" />
                  <span>Random Fill</span>
                </button>
                <button
                  onClick={() => setShowCustomOrder(false)}
                  className="p-1 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Custom Items */}
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Items</label>
              {customItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateCustomItem(index, 'name', e.target.value)}
                      placeholder="Item name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCustomItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateCustomItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => removeCustomItem(index)}
                      disabled={customItems.length === 1}
                      className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addCustomItem}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Prep Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preparation Time (minutes)
              </label>
              <div className="relative w-32">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customPrepTime}
                  onChange={(e) => setCustomPrepTime(parseInt(e.target.value) || 30)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Create Custom Order Button */}
            <button
              onClick={createCustomOrder}
              disabled={isGenerating || !customItems.every(item => item.name && item.quantity > 0 && item.price >= 0)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  <span>Create Custom Order</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 font-medium">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-600 dark:text-red-400 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">How it works</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Generated orders are created with realistic menu items and pricing</li>
                <li>• Orders start in "PREP" status and can be assigned to delivery partners</li>
                <li>• Use these to test the full delivery workflow and partner dashboard</li>
                <li>• Batch generation helps test system performance under load</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockOrderGenerator;