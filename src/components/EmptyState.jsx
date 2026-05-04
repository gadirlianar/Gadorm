import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PackageOpen, Plus } from 'lucide-react';

export default function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 bg-surfaceHover rounded-2xl flex items-center justify-center mb-6 text-textMuted">
        <PackageOpen size={36} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-textMain mb-2">
        {t('home.noListings')}
      </h3>
      <p className="text-sm text-textMuted mb-8 max-w-sm mx-auto leading-relaxed">
        Be the first one to post an item for sale in the dorm!
      </p>
      <Link 
        to="/post" 
        className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-elevated active:scale-[0.97]"
      >
        <Plus size={18} strokeWidth={2.5} />
        {t('header.postItem')}
      </Link>
    </div>
  );
}
