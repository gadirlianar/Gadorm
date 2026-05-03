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
      className="group bg-surface rounded-3xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow flex flex-col relative h-full"
    >
      {/* Sold Overlay */}
      {isSold && (
        <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-error text-white font-black tracking-widest px-8 py-2.5 rotate-[-15deg] shadow-glow text-lg uppercase border border-error/50">
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
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? 'grayscale' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-textMuted">
            <span className="text-4xl">📦</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/10 shadow-sm">
          {t(`categories.${item.category}`)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col gap-1.5">
        <h3 className="font-display font-bold text-lg line-clamp-2 text-white group-hover:text-primary transition-colors leading-tight">
          {item.title}
        </h3>
        
        <div className="text-xl font-bold text-primary mt-1 mb-2">
          {item.price > 0 ? `${item.price.toLocaleString()} KZT` : t('post.pricePlaceholder')}
        </div>
        
        <div className="mt-auto flex flex-col gap-1.5 text-sm text-textMuted">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{t('details.room')} {item.roomNumber}</span>
          </div>
          {timeAgo && (
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="shrink-0" />
              <span className="truncate">{timeAgo}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
