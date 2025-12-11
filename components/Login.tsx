import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { generateDemoData } from '../contexts/DataContext';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for registration
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use resetData logic to populate DB after registration
  // We can't access resetData from useData here easily because user is null,
  // but we can manually trigger it if needed or just let the user start empty.
  // For better UX, let's just let them start fresh or use the button inside app.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        // You could initialize demo data here if you moved logic to a service
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('帳號或密碼錯誤');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('此 Email 已被註冊');
      } else if (err.code === 'auth/weak-password') {
        setError('密碼長度需至少 6 碼');
      } else {
        setError('登入失敗，請稍後再試');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isRegistering ? '註冊帳戶' : '歡迎回來'}
          </h1>
          <p className="text-blue-100">FinanceFlow 智慧財務管理</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">您的姓名</label>
                <input
                  type="text"
                  required={isRegistering}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="請輸入姓名"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">電子郵件</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="example@mail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="請輸入密碼 (至少6碼)"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg shadow-blue-600/20 mt-6 flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {isRegistering ? '立即註冊' : '登入系統'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isRegistering ? '已有帳號？點此登入' : '還沒有帳號？立即註冊'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;