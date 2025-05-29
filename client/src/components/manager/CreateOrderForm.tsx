import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Plus, Trash2, Package, Clock, DollarSign } from 'lucide-react';
import apiService from '../../services/api';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface CreateOrderData {
  items: OrderItem[];
  prepTime: number;
}

const orderSchema = yup.object({
  items: yup.array().of(
    yup.object({
      name: yup.string().required('Item name is required').min(2, 'Name must be at least 2 characters'),
      quantity: yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1'),
      price: yup.number().required('Price is required').min(0, 'Price cannot be negative')
    })
  ).min(1, 'At least one item is required'),
  prepTime: yup.number().required('Prep time is required').min(1, 'Prep time must be at least 1 minute').max(120, 'Prep time cannot exceed 120 minutes')
});

interface CreateOrderFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<CreateOrderData>({
    resolver: yupResolver(orderSchema),
    defaultValues: {
      items: [{ name: '', quantity: 1, price: 0 }],
      prepTime: 30
    },
    mode: 'onChange'
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');
  const totalAmount = watchedItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  const onSubmit = async (data: CreateOrderData) => {
    try {
      setIsSubmitting(true);
      setError('');

      await apiService.post('/orders', data);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    append({ name: '', quantity: 1, price: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
              <p className="text-sm text-gray-500">Add items and set preparation time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Order Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Item Name */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Item Name
                      </label>
                      <input
                        {...register(`items.${index}.name`)}
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.items?.[index]?.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Margherita Pizza"
                      />
                      {errors.items?.[index]?.name && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.items[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        type="number"
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.items?.[index]?.quantity ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Price (₹)
                      </label>
                      <input
                        {...register(`items.${index}.price`, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.items?.[index]?.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.items?.[index]?.price && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.items[index]?.price?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.items && typeof errors.items.message === 'string' && (
              <p className="text-sm text-red-600 mt-2">{errors.items.message}</p>
            )}
          </div>

          {/* Prep Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preparation Time (minutes)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                {...register('prepTime', { valueAsNumber: true })}
                type="number"
                min="1"
                max="120"
                className={`w-full pl-10 pr-3 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.prepTime ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter preparation time in minutes"
              />
            </div>
            {errors.prepTime && (
              <p className="text-sm text-red-600 mt-1">{errors.prepTime.message}</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium">{fields.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Quantity:</span>
                <span className="font-medium">
                  {watchedItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                </span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2">
                <span className="text-gray-900 font-medium">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                isSubmitting || !isValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  <span>Create Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderForm;