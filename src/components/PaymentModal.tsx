import React from 'react';
import { X, User, CreditCard, Package, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/api';
import { usePayment } from '../hooks/usePayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    description?: string;
  };
  selectedPayment: {
    id: string;
    name: string;
    fee: number;
  };
  totalAmount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  gameData,
  userInfo,
  selectedVariant,
  selectedPayment,
  totalAmount
}) => {
  const { processPayment, loading, error, success } = usePayment();

  if (!isOpen) return null;

  const handlePayment = async () => {
    await processPayment({
      gameData,
      userInfo,
      selectedVariant,
      selectedPayment,
      totalAmount
    });
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/50">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
          </div>
          
          <div className="relative p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Konfirmasi Pesanan</h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Game Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-2xl">
              <div className="w-16 h-16 rounded-xl overflow-hidden">
                <img 
                  src={gameData.image} 
                  alt={gameData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-white">{gameData.name}</h3>
                <p className="text-sm text-gray-400">Top up {gameData.currency}</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="text-green-400" size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">Informasi Akun</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-white font-mono">{userInfo.userId}</span>
                    </div>
                    {userInfo.zoneId && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Zone ID:</span>
                        <span className="text-white font-mono">{userInfo.zoneId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Package Info */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="text-purple-400" size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">Paket {gameData.currency}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Item:</span>
                      <span className="text-white">{selectedVariant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Harga:</span>
                      <span className="text-white">{formatCurrency(selectedVariant.price)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="text-pink-400" size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">Metode Pembayaran</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Metode:</span>
                      <span className="text-white">{selectedPayment.name}</span>
                    </div>
                    {selectedPayment.fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Biaya Admin:</span>
                        <span className="text-yellow-400">{formatCurrency(selectedPayment.fee)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-700/50 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-300">Total Pembayaran</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
                <p className="text-green-400 text-sm">Pembayaran berhasil! Pesanan Anda sedang diproses.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {success ? 'Tutup' : 'Batal'}
              </button>
              
              {!success && (
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Lanjutkan Pembayaran</span>
                  )}
                </button>
              )}
            </div>

            {/* Terms */}
            <div className="text-xs text-gray-500 text-center">
              Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang berlaku.
              Pastikan data yang dimasukkan sudah benar.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};