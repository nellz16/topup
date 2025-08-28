import React, { useState } from 'react';
import { Search, Loader2, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatCurrency, API_CONFIG, getHeaders } from '../utils/api';

interface TrackResult {
  trxId: string;
  productName: string;
  variantName: string;
  amount: number;
  status: string;
}

export const TrackPage: React.FC = () => {
  const [trxId, setTrxId] = useState('');
  const [result, setResult] = useState<TrackResult | 'not_found' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      setError('Harap masukkan ID Transaksi.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/transactions/query`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          filter: { trxId: trxId.trim() }
        })
      });

      if (!response.ok) throw new Error('Gagal terhubung ke server.');

      const data = await response.json();
      if (data.records.length > 0) {
        setResult(data.records[0]);
      } else {
        setResult('not_found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles = {
      Success: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
      Pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
      Failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    };

    const style = styles[status as keyof typeof styles] || { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: Package };
    const Icon = style.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${style.bg} ${style.text}`}>
        <Icon size={16} />
        <span>{status}</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
          Lacak Pesanan
        </h1>
        <p className="text-gray-400">Masukkan ID transaksi untuk melacak status pesanan Anda</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-50"></div>
          <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-1">
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="Masukkan ID Transaksi (e.g., ZLX-12345)"
              className="w-full bg-transparent py-4 px-6 text-white placeholder-gray-400 focus:outline-none rounded-2xl"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Mencari...</span>
            </>
          ) : (
            <>
              <Search size={20} />
              <span>Lacak Pesanan</span>
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {error && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-400" size={32} />
          </div>
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {result === 'not_found' && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Transaksi Tidak Ditemukan</h3>
          <p className="text-gray-400">Periksa kembali ID transaksi Anda</p>
        </div>
      )}

      {result && result !== 'not_found' && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm"></div>
          
          <div className="relative p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-700/50">
              <h2 className="text-2xl font-bold text-white">Detail Transaksi</h2>
              <StatusBadge status={result.status} />
            </div>

            {/* Transaction details */}
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">ID Transaksi</span>
                <span className="font-mono text-white bg-slate-700/50 px-3 py-1 rounded-lg">
                  {result.trxId}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Produk</span>
                <span className="text-white font-semibold">{result.productName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Item</span>
                <span className="text-white">{result.variantName}</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                <span className="text-gray-400 font-medium text-lg">Total Pembayaran</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  {formatCurrency(result.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};