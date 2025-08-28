/**
 * Midtrans Payment Gateway Integration Utilities
 * Provides secure payment processing for the gaming platform
 */

export interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerDetails: {
    firstName: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  paymentType: string;
}

export interface PaymentResponse {
  token: string;
  redirectUrl: string;
  orderId: string;
  status: 'pending' | 'success' | 'failed';
}

// Midtrans configuration (should be moved to environment variables)
const MIDTRANS_CONFIG: MidtransConfig = {
  serverKey: import.meta.env.VITE_MIDTRANS_SERVER_KEY || 'your-server-key',
  clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'your-client-key',
  isProduction: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true' || false
};

/**
 * Generate unique order ID for transactions
 */
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ZLX-${timestamp}-${random}`;
};

/**
 * Get Midtrans API base URL based on environment
 */
export const getMidtransApiUrl = (): string => {
  return MIDTRANS_CONFIG.isProduction 
    ? 'https://api.midtrans.com/v2'
    : 'https://api.sandbox.midtrans.com/v2';
};

/**
 * Get Midtrans Snap URL based on environment
 */
export const getMidtransSnapUrl = (): string => {
  return MIDTRANS_CONFIG.isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
};

/**
 * Create payment token from Midtrans
 */
export const createPaymentToken = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const apiUrl = `${getMidtransApiUrl()}/charge`;
    
    // Encode server key for basic auth
    const auth = btoa(`${MIDTRANS_CONFIG.serverKey}:`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        payment_type: paymentData.paymentType,
        transaction_details: {
          order_id: paymentData.orderId,
          gross_amount: paymentData.amount
        },
        customer_details: paymentData.customerDetails,
        item_details: paymentData.itemDetails
      })
    });

    if (!response.ok) {
      throw new Error(`Payment request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      token: result.token || '',
      redirectUrl: result.redirect_url || '',
      orderId: paymentData.orderId,
      status: 'pending'
    };
  } catch (error) {
    console.error('Midtrans payment error:', error);
    throw new Error('Failed to create payment token');
  }
};

/**
 * Initialize Snap payment popup
 */
export const initializeSnapPayment = (token: string, callbacks: {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}) => {
  // Load Snap.js if not already loaded
  if (!(window as any).snap) {
    const script = document.createElement('script');
    script.src = getMidtransSnapUrl();
    script.setAttribute('data-client-key', MIDTRANS_CONFIG.clientKey);
    script.onload = () => {
      (window as any).snap.pay(token, callbacks);
    };
    document.head.appendChild(script);
  } else {
    (window as any).snap.pay(token, callbacks);
  }
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (orderId: string): Promise<{
  status: string;
  transactionStatus: string;
  fraudStatus?: string;
}> => {
  try {
    const apiUrl = `${getMidtransApiUrl()}/${orderId}/status`;
    const auth = btoa(`${MIDTRANS_CONFIG.serverKey}:`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      status: result.status_code,
      transactionStatus: result.transaction_status,
      fraudStatus: result.fraud_status
    };
  } catch (error) {
    console.error('Payment status check error:', error);
    throw new Error('Failed to check payment status');
  }
};

/**
 * Map payment method to Midtrans payment type
 */
export const mapPaymentMethod = (paymentMethodId: string): string => {
  const paymentMap: Record<string, string> = {
    'dana': 'dana',
    'gopay': 'gopay',
    'ovo': 'ovo',
    'bca': 'bank_transfer',
    'bni': 'bank_transfer',
    'bri': 'bank_transfer',
    'mandiri': 'echannel',
    'alfamart': 'cstore',
    'indomaret': 'cstore'
  };
  
  return paymentMap[paymentMethodId] || 'bank_transfer';
};

/**
 * Validate Midtrans configuration
 */
export const validateMidtransConfig = (): boolean => {
  return !!(
    MIDTRANS_CONFIG.serverKey && 
    MIDTRANS_CONFIG.clientKey &&
    MIDTRANS_CONFIG.serverKey !== 'your-server-key' &&
    MIDTRANS_CONFIG.clientKey !== 'your-client-key'
  );
};