import { HiMiniHome, HiMiniArrowLeft, HiMiniMagnifyingGlass } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 flex items-center justify-center p-4">
      <div className={`max-w-lg w-full transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
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
              <h2 className="mb-2 text-xl font-bold text-slate-800">{t("notFound.title")}</h2>
              <p className="text-sm text-slate-500">
                {t("notFound.description")}
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-700 transition-all hover:bg-slate-50"
              >
                <HiMiniArrowLeft size={18} />
                {t("common.back")}
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <HiMiniHome size={18} />
                {t("common.goHome")}
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <HiMiniMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t("notFound.searchPlaceholder")}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
          <p className="mb-2 text-xs text-slate-400">{t("notFound.quickLinks")}</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <button onClick={() => navigate('/admin')} className="text-slate-500 hover:text-blue-600">{t("sidebar.dashboard")}</button>
            <button onClick={() => navigate('/admin/barbers')} className="text-slate-500 hover:text-blue-600">{t("sidebar.barbers")}</button>
            <button onClick={() => navigate('/admin/bookings')} className="text-slate-500 hover:text-blue-600">{t("sidebar.bookings")}</button>
            <button onClick={() => navigate('/admin/settings')} className="text-slate-500 hover:text-blue-600">{t("sidebar.settings")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
