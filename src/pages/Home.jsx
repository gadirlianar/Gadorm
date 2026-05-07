import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs, where, startAfter } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, ArrowUpDown } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import ListingSkeleton from '../components/ListingSkeleton';
import EmptyState from '../components/EmptyState';
import clsx from 'clsx';

const categories = ['all', 'electronics', 'books', 'clothing', 'furniture', 'food', 'other'];
const sorts = ['newest', 'priceAsc', 'priceDesc'];

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Motion variants ──────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 260,
    },
  },
};

const filterBarVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 300,
      delay: 0.05,
    },
  },
};

const sortDropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 24, stiffness: 400 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: { duration: 0.15, ease: 'easeInOut' },
  },
};

export default function Home() {
  const { t } = useTranslation();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [showSort, setShowSort] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchListings();
  }, [debouncedSearchTerm, activeCategory, activeSort]);

  async function fetchListings(isLoadMore = false) {
    if (!isLoadMore) {
      setLoading(true);
      setListings([]);
    } else {
      setLoadingMore(true);
    }

    try {
      let q = collection(db, 'listings');
      let constraints = [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      constraints.push(where('createdAt', '>=', thirtyDaysAgo));

      if (activeCategory !== 'all') {
        constraints.push(where('category', '==', activeCategory));
      }

      if (activeSort === 'newest') constraints.push(orderBy('createdAt', 'desc'));
      if (activeSort === 'priceAsc') constraints.push(orderBy('price', 'asc'));
      if (activeSort === 'priceDesc') constraints.push(orderBy('price', 'desc'));

      if (isLoadMore && lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      constraints.push(limit(ITEMS_PER_PAGE));

      const finalQuery = query(q, ...constraints);
      const snapshot = await getDocs(finalQuery);
      
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

      let fetchedListings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (debouncedSearchTerm) {
        const lowerSearch = debouncedSearchTerm.toLowerCase();
        fetchedListings = fetchedListings.filter(item => 
          item.title.toLowerCase().includes(lowerSearch) || 
          (item.description && item.description.toLowerCase().includes(lowerSearch))
        );
      }

      if (isLoadMore) {
        setListings(prev => [...prev, ...fetchedListings]);
      } else {
        setListings(fetchedListings);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      if (error.message.includes('index')) {
        console.warn("Index missing. Falling back to basic query.");
        const basicQuery = query(collection(db, 'listings'), limit(50));
        const snap = await getDocs(basicQuery);
        let data = snap.docs.map(d => ({id: d.id, ...d.data()}));
        
        if (activeCategory !== 'all') data = data.filter(i => i.category === activeCategory);
        if (activeSort === 'newest') data.sort((a,b) => b.createdAt - a.createdAt);
        if (activeSort === 'priceAsc') data.sort((a,b) => a.price - b.price);
        if (activeSort === 'priceDesc') data.sort((a,b) => b.price - a.price);
        
        if (debouncedSearchTerm) {
          const s = debouncedSearchTerm.toLowerCase();
          data = data.filter(i => i.title.toLowerCase().includes(s) || (i.description && i.description.toLowerCase().includes(s)));
        }
        
        setListings(data.slice(0, ITEMS_PER_PAGE));
        setHasMore(data.length > ITEMS_PER_PAGE);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ═══════════════════════════════════════════
          SEARCH BAR — Plush, inner-shadow, Apple Spotlight feel
          ═══════════════════════════════════════════ */}
      <motion.div
        variants={filterBarVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-2.5"
      >
        <div className="relative flex-1">
          <Search 
            className={clsx(
              "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200",
              searchFocused ? "text-blue" : "text-labelTertiary"
            )} 
            size={17} 
            strokeWidth={2} 
          />
          <input
            type="text"
            placeholder={t('home.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={clsx(
              "w-full rounded-2xl py-3 pl-10 pr-4 text-[15px] text-label placeholder:text-labelTertiary/60 transition-all duration-300 ease-apple border-none outline-none",
              searchFocused
                ? "bg-card shadow-float ring-2 ring-blue/20"
                : "bg-pill/40 shadow-searchInset"
            )}
          />
        </div>
        
        {/* Sort toggle */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowSort(!showSort)}
            className="h-full aspect-square flex items-center justify-center bg-pill/40 hover:bg-pill rounded-2xl transition-all duration-200 ease-apple text-labelTertiary hover:text-label"
          >
            <ArrowUpDown size={17} strokeWidth={2} />
          </motion.button>
          
          <AnimatePresence>
            {showSort && (
              <motion.div
                variants={sortDropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-52 bg-card rounded-2xl shadow-dropdownApple overflow-hidden z-20 py-1"
              >
                {sorts.map(sort => (
                  <button
                    key={sort}
                    onClick={() => { setActiveSort(sort); setShowSort(false); }}
                    className={clsx(
                      "w-full text-left px-4 py-3 text-[13px] font-medium transition-colors duration-150 flex items-center justify-between",
                      activeSort === sort
                        ? "text-blue bg-blue/5"
                        : "text-label hover:bg-bg"
                    )}
                  >
                    <span>{t(`sort.${sort}`)}</span>
                    {activeSort === sort && (
                      <svg className="w-3.5 h-3.5 text-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          CATEGORY TOGGLES — iOS Control Center style with layout animation
          ═══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300, delay: 0.12 }}
        className="flex overflow-x-auto no-scrollbar gap-2 pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
      >
        {categories.map(cat => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.93 }}
            layout
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              "ios-segment whitespace-nowrap",
              activeCategory === cat
                ? "ios-segment-active"
                : "ios-segment-inactive"
            )}
          >
            {t(`categories.${cat}`)}
          </motion.button>
        ))}
      </motion.div>

      {/* ═══════════════════════════════════════════
          PRODUCT GRID — Staggered cascade entrance
          ═══════════════════════════════════════════ */}
      {loading ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
        >
          <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2">
            <ListingSkeleton featured />
          </motion.div>
          {[...Array(7)].map((_, i) => (
            <motion.div key={i} variants={itemVariants}>
              <ListingSkeleton />
            </motion.div>
          ))}
        </motion.div>
      ) : listings.length > 0 ? (
        <>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory + activeSort}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-fr"
            >
              {listings.map((item, index) => {
                // First item gets featured treatment on desktop
                const isFeatured = index === 0;
                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    layout
                    className={clsx(
                      isFeatured && "md:col-span-2 md:row-span-2"
                    )}
                  >
                    <ListingCard item={item} featured={isFeatured} />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', damping: 20, stiffness: 200 }}
              className="flex justify-center mt-4 mb-2"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => fetchListings(true)}
                disabled={loadingMore}
                className="bg-card hover:bg-cardHover text-labelSecondary px-8 py-3 rounded-full text-[13px] font-semibold transition-all duration-200 ease-apple disabled:opacity-40 shadow-card hover:shadow-float"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                ) : t('home.loadMore')}
              </motion.button>
            </motion.div>
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
