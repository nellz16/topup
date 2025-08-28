import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  LogOut,
  Users,
  Package,
  BarChart3,
  Settings,
  Upload,
  Loader2,
  Star
} from 'lucide-react';
import { formatCurrency } from '../utils/api';
import { gameService } from '../services/gameService';
import { GameInfo, GameFormData, GameStats } from '../types/game';
import { OptimizedImage } from '../components/OptimizedImage';

interface AdminUser {
  username: string;
  password: string;
}

const ADMIN_CREDENTIALS: AdminUser = {
  username: 'admin',
  password: 'zhivlux2025'
};

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Admin panel state
  const [activeTab, setActiveTab] = useState('products');
  const [games, setGames] = useState<GameInfo[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingGame, setEditingGame] = useState<GameInfo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadGames();
      loadStats();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginForm.username === ADMIN_CREDENTIALS.username && 
        loginForm.password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      loadGames();
      loadStats();
    } else {
      setLoginError('Username atau password salah');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    navigate('/');
  };

  const loadGames = async () => {
    try {
      setLoading(true);
      const allGames = await gameService.getAllGames({});
      setGames(allGames as GameInfo[]);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const gameStats = await gameService.getGameStats();
      setStats(gameStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveGame = async (gameData: GameFormData) => {
    try {
      setLoading(true);
      await gameService.createGame(gameData);
      await loadGames();
      await loadStats();
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGame = async (id: string, gameData: Partial<GameFormData>) => {
    try {
      setLoading(true);
      await gameService.updateGame(id, gameData);
      await loadGames();
      await loadStats();
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async (id: string) => {
    if (!confirm('Yakin ingin menghapus game ini?')) return;

    try {
      setLoading(true);
      await gameService.deleteGame(id);
      await loadGames();
      await loadStats();
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative p-8 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-white" size={24} />
                </div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2">
                  Admin Panel
                </h1>
                <p className="text-gray-400">Masuk untuk mengakses panel admin</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{loginError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  Masuk Admin
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Kembali ke Beranda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900 to-orange-900 p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-red-200 text-sm">ZhivLux Gaming Store</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 min-h-screen p-6">
          <nav className="space-y-2">
            {[
              { id: 'products', label: 'Kelola Produk', icon: Package },
              { id: 'users', label: 'Kelola User', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Pengaturan', icon: Settings }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'products' && (
            <GameManagement
              games={games}
              loading={loading}
              onSave={saveGame}
              onUpdate={updateGame}
              onDelete={deleteGame}
              onRefresh={loadGames}
            />
          )}
          
          {activeTab === 'users' && (
            <div className="text-center py-16">
              <Users className="mx-auto text-gray-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
              <p className="text-gray-400">Fitur ini akan segera tersedia</p>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsDashboard stats={stats} loading={loading} />
          )}
          
          {activeTab === 'settings' && (
            <div className="text-center py-16">
              <Settings className="mx-auto text-gray-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Pengaturan</h3>
              <p className="text-gray-400">Pengaturan sistem akan segera tersedia</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Game Management Component
interface GameManagementProps {
  games: GameInfo[];
  loading: boolean;
  onSave: (game: GameFormData) => Promise<void>;
  onUpdate: (id: string, game: Partial<GameFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const GameManagement: React.FC<GameManagementProps> = ({
  games,
  loading,
  onSave,
  onUpdate,
  onDelete,
  onRefresh
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGame, setEditingGame] = useState<GameInfo | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Kelola Game</h2>
          <p className="text-gray-400">Tambah, edit, atau hapus game</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Refresh'}
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
          >
            <Plus size={16} />
            Tambah Game
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-300">Game</th>
                <th className="text-left p-4 font-semibold text-gray-300">Kategori</th>
                <th className="text-center p-4 font-semibold text-gray-300">Rating</th>
                <th className="text-center p-4 font-semibold text-gray-300">Popular</th>
                <th className="text-center p-4 font-semibold text-gray-300">Status</th>
                <th className="text-center p-4 font-semibold text-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <OptimizedImage 
                        src={game.image_url} 
                        alt={game.name}
                        className="w-12 h-12 rounded-xl object-cover"
                        width={48}
                        height={48}
                      />
                      <div>
                        <h3 className="font-semibold text-white">{game.name}</h3>
                        <p className="text-sm text-gray-400 truncate max-w-xs">
                          {game.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                      {game.category}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-white font-medium">{game.rating}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {game.is_popular ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      game.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      game.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {game.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingGame(game)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(game.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingGame) && (
        <GameModal
          game={editingGame}
          onSave={async (productData) => {
            if (editingGame) {
              await onUpdate(editingGame.id, productData);
              setEditingGame(null);
            } else {
              await onSave(productData);
              setShowAddModal(false);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingGame(null);
          }}
        />
      )}
    </div>
  );
};

// Analytics Dashboard Component
interface AnalyticsDashboardProps {
  stats: GameStats | null;
  loading: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="mx-auto text-gray-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">No Analytics Data</h3>
        <p className="text-gray-400">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
        <p className="text-gray-400">Overview of your gaming store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-blue-400" size={24} />
            <h3 className="font-semibold text-gray-300">Total Games</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total_games}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-yellow-400" size={24} />
            <h3 className="font-semibold text-gray-300">Popular Games</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.popular_games}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-green-400" size={24} />
            <h3 className="font-semibold text-gray-300">Avg Rating</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.avg_rating.toFixed(1)}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-purple-400" size={24} />
            <h3 className="font-semibold text-gray-300">Total Reviews</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total_reviews.toLocaleString()}</p>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Games by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.categories).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
              <span className="text-gray-300">{category}</span>
              <span className="font-bold text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Game Modal Component
interface GameModalProps {
  game?: GameInfo | null;
  onSave: (game: GameFormData) => Promise<void>;
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: game?.name || '',
    slug: game?.slug || '',
    description: game?.description || '',
    long_description: game?.long_description || '',
    category: game?.category || 'Game',
    is_popular: game?.is_popular || false,
    image_url: game?.image_url || '',
    banner_image_url: game?.banner_image_url || '',
    icon_url: game?.icon_url || '',
    variants: game?.variants || '[]',
    currency_name: game?.currency_name || 'Coins',
    instructions: game?.instructions || '[]',
    user_fields: game?.user_fields || '{"userId":{"label":"User ID","placeholder":"Enter User ID","required":true}}',
    rating: game?.rating || 4.5,
    status: game?.status || 'active',
    meta_title: game?.meta_title || '',
    meta_description: game?.meta_description || '',
    tags: game?.tags || '[]',
    developer: game?.developer || '',
    publisher: game?.publisher || '',
    age_rating: game?.age_rating || '',
    platforms: game?.platforms || '[]'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave(formData as GameFormData);
      onClose();
    } catch (error) {
      console.error('Error saving game:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {game ? 'Edit Game' : 'Tambah Game'}
            </h3>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Game</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="game-slug"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="Game">Game</option>
                  <option value="Apps">Apps</option>
                  <option value="Voucher">Voucher</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                placeholder="https://ik.imagekit.io/..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Banner Image URL</label>
                <input
                  type="url"
                  value={formData.banner_image_url}
                  onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="https://ik.imagekit.io/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency Name</label>
                <input
                  type="text"
                  value={formData.currency_name}
                  onChange={(e) => setFormData({ ...formData, currency_name: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Diamonds, UC, VP, etc."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                rows={2}
                placeholder="Short description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Long Description</label>
              <textarea
                value={formData.long_description}
                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                rows={4}
                placeholder="Detailed description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Variants (JSON Format)
              </label>
              <textarea
                value={formData.variants}
                onChange={(e) => setFormData({ ...formData, variants: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-mono text-sm"
                rows={6}
                placeholder='[{"name":"100 Diamonds","price":15000}]'
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: {`[{"name":"Item Name","price":15000,"description":"Optional"}]`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instructions (JSON Array)
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-mono text-sm"
                rows={3}
                placeholder='["Step 1", "Step 2", "Step 3"]'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                User Fields (JSON Object)
              </label>
              <textarea
                value={formData.user_fields}
                onChange={(e) => setFormData({ ...formData, user_fields: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-mono text-sm"
                rows={3}
                placeholder='{"userId":{"label":"User ID","placeholder":"Enter ID","required":true}}'
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Developer</label>
                <input
                  type="text"
                  value={formData.developer}
                  onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Game developer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age Rating</label>
                <input
                  type="text"
                  value={formData.age_rating}
                  onChange={(e) => setFormData({ ...formData, age_rating: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="12+, 16+, etc."
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPopular"
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
              />
              <label htmlFor="isPopular" className="text-sm font-medium text-gray-300">
                Tandai sebagai game populer
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};