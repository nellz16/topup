import React, { useState } from 'react';
import { Loader2, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { API_CONFIG, getHeaders } from '../utils/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLoginView) {
        // Check if API is configured
        if (!API_CONFIG.XATA_API_KEY || API_CONFIG.XATA_API_KEY === 'your_xata_api_key_here') {
          // Mock login for demo
          if (formData.email === 'demo@zhivlux.com' && formData.password === 'demo123') {
            onLoginSuccess({
              id: 'demo-user',
              username: 'Demo User',
              email: formData.email
            });
          } else {
            setError('Demo login: gunakan email "demo@zhivlux.com" dan password "demo123"');
          }
          setLoading(false);
          return;
        }

        try {
          const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/users/query`, {
            method: 'POST',
            headers: getHeaders('xata'),
            body: JSON.stringify({
              filter: { email: formData.email, password: formData.password }
            })
          });

          if (!response.ok) throw new Error('Login gagal, coba lagi.');

          const data = await response.json();
          if (data.records.length > 0) {
            onLoginSuccess(data.records[0]);
          } else {
            setError('Email atau password salah.');
          }
        } catch (apiError) {
          console.error('Login API error:', apiError);
          setError('Koneksi ke database gagal. Pastikan Xata sudah dikonfigurasi.');
        }
      } else {
        // Check if API is configured
        if (!API_CONFIG.XATA_API_KEY || API_CONFIG.XATA_API_KEY === 'your_xata_api_key_here') {
          setError('Pendaftaran tidak tersedia dalam mode demo. Silakan setup database Xata.');
          setLoading(false);
          return;
        }

        try {
          // Check if email already exists
          const checkEmail = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/users/query`, {
            method: 'POST',
            headers: getHeaders('xata'),
            body: JSON.stringify({
              filter: { email: formData.email }
            })
          });

          const emailData = await checkEmail.json();
          if (emailData.records.length > 0) {
            setError('Email sudah terdaftar.');
            setLoading(false);
            return;
          }

          const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/users/data`, {
            method: 'POST',
            headers: getHeaders('xata'),
            body: JSON.stringify(formData)
          });

          if (!response.ok) throw new Error('Pendaftaran gagal, coba lagi.');

          setSuccess('Pendaftaran berhasil! Silakan login.');
          setIsLoginView(true);
          setFormData({ username: '', email: '', password: '' });
        } catch (apiError) {
          console.error('Register API error:', apiError);
          setError('Koneksi ke database gagal. Pastikan Xata sudah dikonfigurasi.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/50">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
          </div>
          
          <div className="relative p-8 space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                {isLoginView ? 'Selamat Datang' : 'Buat Akun'}
              </h1>
              <p className="text-gray-400">
                {isLoginView ? 'Masuk ke akun ZhivLux Anda' : 'Daftar untuk mulai top up game'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLoginView && (
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-4 px-6 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-4 px-6 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-4 px-6 pr-14 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : isLoginView ? (
                  <>
                    <LogIn size={20} />
                    <span>Masuk</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Daftar</span>
                  </>
                )}
              </button>
            </form>

            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-center font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 text-center font-medium">{success}</p>
              </div>
            )}

            {/* Switch mode */}
            <div className="text-center">
              <p className="text-gray-400">
                {isLoginView ? "Belum punya akun?" : "Sudah punya akun?"}
                <button
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="ml-2 font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {isLoginView ? "Daftar di sini" : "Masuk di sini"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};