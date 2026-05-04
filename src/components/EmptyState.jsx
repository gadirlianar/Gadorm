import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      {/* Large iOS-style icon */}
      <div className="text-7xl mb-6 select-none animate-pulse-soft">📦</div>
      
      <h3 className="text-[22px] font-bold text-label tracking-[-0.02em] mb-2">
        {t('home.noListings')}
      </h3>
      <p className="text-[15px] text-labelTertiary mb-10 max-w-xs mx-auto leading-relaxed">
        Be the first one to post an item for sale in the dorm!
      </p>
      <Link
        to="/post"
        className="flex items-center gap-2 bg-blue hover:bg-blueHover text-white px-7 py-3.5 rounded-full font-semibold text-[15px] shadow-fab press transition-all duration-200 ease-apple"
      >
        <Plus size={18} strokeWidth={2.5} />
        {t('header.postItem')}
      </Link>
    </div>
  );
}
