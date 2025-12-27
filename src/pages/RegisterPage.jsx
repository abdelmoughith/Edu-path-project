import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.register(formData.firstName, formData.lastName, formData.email, formData.password, formData.role);
      alert("Inscription réussie ! Connectez-vous maintenant.");
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'inscription";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1470"
          alt="Education"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
          <div className="text-2xl font-bold tracking-wider">EduPath EMSI</div>
          <div>
            <h1 className="text-5xl font-bold mb-6">Rejoignez l'excellence académique.</h1>
            <p className="text-lg text-indigo-100 max-w-md">Créez votre compte pour accéder à des milliers de cours et suivre votre progression en temps réel.</p>
          </div>
          <div className="text-sm text-indigo-200">© 2024 EduPath Inc. All rights reserved.</div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Créer un compte</h2>
            <p className="mt-2 text-gray-500">Commencez votre voyage d'apprentissage aujourd'hui.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${formData.role === 'STUDENT'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Étudiant
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${formData.role === 'ADMIN'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Formateur / Admin
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Prénom"
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Nom"
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email professionnel</label>
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
              {loading ? <Loader className="animate-spin h-5 w-5" /> : <>S'inscrire <ArrowRight className="ml-2 h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;