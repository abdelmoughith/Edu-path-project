import React, { useState } from 'react';
import { userService } from '../services/userService';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.login(formData.email, formData.password);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error) {
      alert("Échec de la connexion. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-90 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1473"
          alt="Library"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
          <div className="text-2xl font-bold tracking-wider">EduPath EMSI</div>
          <div>
            <h1 className="text-5xl font-bold mb-6">Content de vous revoir.</h1>
            <p className="text-lg text-indigo-100 max-w-md">Connectez-vous pour continuer votre apprentissage et atteindre de nouveaux sommets.</p>
          </div>
          <div className="text-sm text-indigo-200">© 2024 EduPath Inc. All rights reserved.</div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
            <p className="mt-2 text-gray-500">Entrez vos identifiants pour accéder à votre espace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="nom@exemple.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Se connecter <ArrowRight className="ml-2 h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;