import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru, kk, enUS } from 'date-fns/locale';

const locales = { ru, kk, en: enUS };

export default function ListingCard({ item }) {
  const { t, i18n } = useTranslation();
  
  const isSold = item.status === 'sold';
  
  // Safe formatting for timestamp
  let timeAgo = '';
  if (item.createdAt) {
    try {
      const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      timeAgo = formatDistanceToNow(date, { 
        addSuffix: true,
        locale: locales[i18n.language] || locales.en 
      });
    } catch {
      timeAgo = '';
    }
  }

  return (
    <Link 
      to={`/item/${item.id}`} 
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-card hover:shadow-cardHover flex flex-col relative h-full"
    >
      {/* Sold Overlay */}
      {isSold && (
        <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-error text-white font-bold tracking-widest px-6 py-2 rotate-[-12deg] rounded-lg text-sm uppercase shadow-lg">
            {t('home.sold')}
          </div>
        </div>
      )}

      {/* Image Container */}
      <div className="aspect-square bg-surfaceHover relative overflow-hidden">
        {item.photos && item.photos.length > 0 ? (
          <img 
            src={item.photos[0]} 
            alt={item.title} 
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${isSold ? 'grayscale opacity-60' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-textMuted bg-surfaceHover">
            <span className="text-4xl opacity-40">📦</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-textSecondary shadow-sm">
          {t(`categories.${item.category}`)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-1">
        <h3 className="font-semibold text-sm line-clamp-2 text-textMain group-hover:text-accent transition-colors duration-300 leading-snug">
          {item.title}
        </h3>
        
        <div className="text-lg font-extrabold text-primary tracking-tight mt-0.5">
          {item.price > 0 ? `${item.price.toLocaleString()} ₸` : t('post.pricePlaceholder')}
        </div>
        
        <div className="mt-auto pt-2 flex flex-col gap-1 text-xs text-textMuted">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0 opacity-60" />
            <span className="truncate">{t('details.room')} {item.roomNumber}</span>
          </div>
          {timeAgo && (
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="shrink-0 opacity-60" />
              <span className="truncate">{timeAgo}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
