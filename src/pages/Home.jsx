import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, limit, getDocs, where, startAfter } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, SlidersHorizontal } from 'lucide-react';
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

export default function Home() {
  const { t } = useTranslation();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [showSort, setShowSort] = useState(false);

  const ITEMS_PER_PAGE = 10;

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

      // Only show non-expired items (this requires a compound index or we handle it client-side if missing index)
      // For simplicity in a free-tier app without predefined indexes, we'll fetch all and filter expired locally, 
      // OR rely on a simple query. The prompt says "Listings older than 30 days are automatically hidden... filter out in query".
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      constraints.push(where('createdAt', '>=', thirtyDaysAgo));

      if (activeCategory !== 'all') {
        constraints.push(where('category', '==', activeCategory));
      }

      if (activeSort === 'newest') constraints.push(orderBy('createdAt', 'desc'));
      if (activeSort === 'priceAsc') constraints.push(orderBy('price', 'asc'));
      if (activeSort === 'priceDesc') constraints.push(orderBy('price', 'desc'));

      // If load more, start after last document
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

      // Client-side search (since Firestore doesn't have native full-text search)
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
      // Fallback for missing indexes - fetch basic and sort locally
      if (error.message.includes('index')) {
        console.warn("Index missing. Falling back to basic query.");
        const basicQuery = query(collection(db, 'listings'), limit(50));
        const snap = await getDocs(basicQuery);
        let data = snap.docs.map(d => ({id: d.id, ...d.data()}));
        
        // Local filter & sort
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
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
          <input 
            type="text" 
            placeholder={t('home.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-textMain placeholder:text-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowSort(!showSort)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface border border-border hover:bg-surfaceHover px-4 py-3 rounded-xl transition-colors font-medium text-textMain"
          >
            <SlidersHorizontal size={20} />
            <span className="sm:hidden lg:inline">{t(`sort.${activeSort}`)}</span>
          </button>
          
          {showSort && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-card overflow-hidden z-20">
              {sorts.map(sort => (
                <button
                  key={sort}
                  onClick={() => { setActiveSort(sort); setShowSort(false); }}
                  className={clsx(
                    "w-full text-left px-4 py-3 text-sm transition-colors hover:bg-surfaceHover",
                    activeSort === sort ? "text-primary font-bold bg-surfaceHover/50" : "text-textMain"
                  )}
                >
                  {t(`sort.${sort}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              "whitespace-nowrap px-5 py-2 rounded-full font-medium text-sm transition-all border",
              activeCategory === cat 
                ? "bg-gradient-to-r from-primary to-accent text-white border-transparent shadow-glow" 
                : "bg-surface text-textMuted border-white/5 hover:border-white/20"
            )}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => <ListingSkeleton key={i} />)}
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {listings.map(item => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => fetchListings(true)}
                disabled={loadingMore}
                className="bg-surface border border-border hover:border-primary text-textMain px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {loadingMore ? '...' : t('home.loadMore')}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
