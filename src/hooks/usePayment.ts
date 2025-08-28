import { useState } from 'react';
import { 
  createPaymentToken, 
  initializeSnapPayment, 
  generateOrderId, 
  mapPaymentMethod,
  validateMidtransConfig,
  type PaymentRequest 
} from '../utils/midtrans';
import { API_CONFIG, getHeaders } from '../utils/api';

interface PaymentData {
  gameData: {
    name: string;
    image: string;
    currency: string;
  };
  userInfo: {
    userId: string;
    zoneId?: string;
  };
  selectedVariant: {
    name: string;
    price: number;
  };
  selectedPayment: {
    id: string;
    name: string;
    fee: number;
  };
  totalAmount: number;
}

interface UsePaymentResult {
  processPayment: (data: PaymentData) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const usePayment = (): UsePaymentResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const saveTransaction = async (orderId: string, paymentData: PaymentData, status: string = 'Pending') => {
    try {
      // Check if API is configured
      if (!API_CONFIG.XATA_API_KEY || !API_CONFIG.XATA_DB_URL || 
          API_CONFIG.XATA_API_KEY === 'your_xata_api_key_here' ||
          API_CONFIG.XATA_DB_URL === 'https://your-workspace-your-database.xata.sh/db/your-database') {
        console.log('Mock transaction saved:', { orderId, status });
        return;
      }

      const transactionData = {
        trxId: orderId,
        productName: paymentData.gameData.name,
        variantName: paymentData.selectedVariant.name,
        amount: paymentData.totalAmount,
        status: status,
        userEmail: 'user@example.com', // This should come from user context
        userId: paymentData.userInfo.userId,
        zoneId: paymentData.userInfo.zoneId || '',
        paymentMethod: paymentData.selectedPayment.name,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/transactions/data`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }
    } catch (err) {
      console.error('Error saving transaction:', err);
      // Don't throw error here to avoid breaking payment flow
    }
  };

  const processPayment = async (data: PaymentData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validate Midtrans configuration
      if (!validateMidtransConfig()) {
        // Mock payment for demo purposes
        console.log('Mock payment processing:', data);
        
        const orderId = generateOrderId();
        await saveTransaction(orderId, data, 'Success');
        
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setSuccess(true);
        alert(`Mock Payment Success!\nOrder ID: ${orderId}\nAmount: ${data.totalAmount}`);
        return;
      }

      // Generate order ID
      const orderId = generateOrderId();

      // Prepare payment request
      const paymentRequest: PaymentRequest = {
        orderId,
        amount: data.totalAmount,
        customerDetails: {
          firstName: `User ${data.userInfo.userId}`,
          email: 'user@example.com', // This should come from user context
          phone: '08123456789' // This should come from user context
        },
        itemDetails: [
          {
            id: data.selectedVariant.name.toLowerCase().replace(/\s+/g, '-'),
            price: data.selectedVariant.price,
            quantity: 1,
            name: `${data.gameData.name} - ${data.selectedVariant.name}`
          }
        ],
        paymentType: mapPaymentMethod(data.selectedPayment.id)
      };

      // Add payment fee if applicable
      if (data.selectedPayment.fee > 0) {
        paymentRequest.itemDetails.push({
          id: 'admin-fee',
          price: data.selectedPayment.fee,
          quantity: 1,
          name: 'Biaya Admin'
        });
      }

      // Save transaction as pending
      await saveTransaction(orderId, data, 'Pending');

      // Create payment token
      const paymentResponse = await createPaymentToken(paymentRequest);

      // Initialize Snap payment
      initializeSnapPayment(paymentResponse.token, {
        onSuccess: async (result) => {
          console.log('Payment success:', result);
          await saveTransaction(orderId, data, 'Success');
          setSuccess(true);
        },
        onPending: async (result) => {
          console.log('Payment pending:', result);
          await saveTransaction(orderId, data, 'Pending');
        },
        onError: async (result) => {
          console.error('Payment error:', result);
          await saveTransaction(orderId, data, 'Failed');
          setError('Payment failed. Please try again.');
        },
        onClose: () => {
          console.log('Payment popup closed');
        }
      });

    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    processPayment,
    loading,
    error,
    success
  };
};