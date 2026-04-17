import { HiMiniHome, HiMiniArrowLeft, HiMiniMagnifyingGlass } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function NotFound() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 flex items-center justify-center p-4">
      <div className={`max-w-lg w-full transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          <div className="p-8 text-center">
            {/* 404 Number */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 blur-3xl opacity-10 animate-pulse" />
              <h1 className="text-8xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                4<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">0</span>4
              </h1>
            </div>
            
            {/* Message */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Sahifa topilmadi</h2>
              <p className="text-slate-500 text-sm">
                Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
              >
                <HiMiniArrowLeft size={18} />
                Orqaga
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <HiMiniHome size={18} />
                Bosh sahifa
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <HiMiniMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Sahifa qidirish..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 mb-2">Tezkor sahifalar:</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <button onClick={() => navigate('/admin')} className="text-slate-500 hover:text-blue-600">Dashboard</button>
            <button onClick={() => navigate('/admin/students')} className="text-slate-500 hover:text-blue-600">Studentlar</button>
            <button onClick={() => navigate('/admin/groups')} className="text-slate-500 hover:text-blue-600">Guruhlar</button>
            <button onClick={() => navigate('/admin/courses')} className="text-slate-500 hover:text-blue-600">Kurslar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;