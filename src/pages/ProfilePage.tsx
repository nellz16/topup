import React, { useState, useEffect } from 'react';
import { LogOut, Loader2, User, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, API_CONFIG, getHeaders } from '../utils/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Transaction {
  id: string;
  trxId: string;
  productName: string;
  variantName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/transactions/query`, {
          method: 'POST',
          headers: getHeaders('xata'),
          body: JSON.stringify({
            filter: { userEmail: user.email },
            sort: [{ createdAt: 'desc' }]
          })
        });

        if (!response.ok) throw new Error('Gagal mengambil riwayat transaksi.');

        const data = await response.json();
        setTransactions(data.records);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user.email]);

  const totalSpent = transactions
    .filter(t => t.status === 'Success')
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-green-400 bg-green-400/10';
      case 'Pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'Failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Profile header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-white" size={32} />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-1">
            Selamat Datang, {user.username || 'User'}!
          </h1>
          <p className="text-purple-400 mb-6">{user.email}</p>
          
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="text-blue-400" size={24} />
          </div>
          <p className="text-2xl font-bold text-white">{transactions.length}</p>
          <p className="text-sm text-gray-400">Total Transaksi</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <DollarSign className="text-green-400" size={24} />
          </div>
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-sm text-gray-400">Total Pembelian</p>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
          Riwayat Transaksi
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-purple-500" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map(trx => (
                <div
                  key={trx.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">{trx.productName}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(trx.status)}`}>
                      {trx.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Item:</span>
                      <span className="text-white">{trx.variantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID Transaksi:</span>
                      <span className="text-white font-mono">{trx.trxId}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                        {formatCurrency(trx.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="text-gray-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Belum ada transaksi</h3>
                <p className="text-gray-400">Mulai top up game favoritmu sekarang!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};