import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PackageOpen, Plus } from 'lucide-react';

export default function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 text-primary border-4 border-background shadow-card shadow-primary/20">
        <PackageOpen size={48} />
      </div>
      <h3 className="text-xl font-display font-bold text-textMain mb-2">
        {t('home.noListings')}
      </h3>
      <p className="text-textMuted mb-8 max-w-md mx-auto">
        Be the first one to post an item for sale in the dorm!
      </p>
      <Link 
        to="/post" 
        className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
      >
        <Plus size={20} strokeWidth={3} />
        {t('header.postItem')}
      </Link>
    </div>
  );
}
