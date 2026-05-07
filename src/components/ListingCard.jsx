import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru, kk, enUS } from 'date-fns/locale';

const locales = { ru, kk, en: enUS };

export default function ListingCard({ item, featured = false }) {
  const { t, i18n } = useTranslation();

  const isSold = item.status === 'sold';

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
    <Link to={`/item/${item.id}`} className="block h-full">
      <motion.div
        whileHover={{
          scale: 1.03,
          boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.06)',
          y: -6,
        }}
        whileTap={{ scale: 0.96 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 350,
        }}
        className={`
          group relative flex flex-col
          bg-card rounded-3xl overflow-hidden
          h-full cursor-pointer
          ${featured ? 'shadow-cardLift' : 'shadow-card'}
        `}
        style={{ willChange: 'transform' }}
      >
        {/* ── SOLD OVERLAY ── */}
        {isSold && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 bg-card/80 backdrop-blur-sm flex items-center justify-center rounded-3xl"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -8 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
              className="bg-red text-white font-black text-xs tracking-[0.2em] uppercase px-5 py-1.5 rounded-full shadow-lg"
            >
              {t('home.sold')}
            </motion.div>
          </motion.div>
        )}

        {/* ── IMAGE — Edge-to-edge, no padding ── */}
        <div className={`relative overflow-hidden ${featured ? 'aspect-[4/5]' : 'aspect-square'}`}>
          {item.photos && item.photos.length > 0 ? (
            <img
              src={item.photos[0]}
              alt={item.title}
              className={`
                w-full h-full object-cover
                transition-transform duration-700 ease-apple
                group-hover:scale-[1.06]
                ${isSold ? 'grayscale opacity-50' : ''}
              `}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-pill/30">
              <span className="text-5xl opacity-20 select-none">📦</span>
            </div>
          )}

          {/* Category chip — floating on image */}
          <div className="absolute top-3 left-3 glass-nav px-2.5 py-1 rounded-full text-[11px] font-semibold text-label shadow-pill">
            {t(`categories.${item.category}`)}
          </div>

          {/* Photo count indicator */}
          {item.photos && item.photos.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              1/{item.photos.length}
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col gap-0.5">
          {/* Price — THE hero element */}
          <span className="text-[22px] font-black tracking-[-0.03em] text-label leading-none">
            {item.price > 0 ? `${item.price.toLocaleString()} ₸` : t('post.pricePlaceholder')}
          </span>

          {/* Title */}
          <h3 className="text-[13px] font-medium text-labelSecondary line-clamp-2 leading-snug mt-1">
            {item.title}
          </h3>

          {/* Meta */}
          <div className="mt-auto pt-2.5 flex items-center gap-1 text-[11px] text-labelTertiary">
            <MapPin size={10} strokeWidth={2.5} className="opacity-50 shrink-0" />
            <span className="truncate">{t('details.room')} {item.roomNumber}</span>
            {timeAgo && (
              <>
                <span className="opacity-30 mx-0.5">·</span>
                <span className="truncate">{timeAgo}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
