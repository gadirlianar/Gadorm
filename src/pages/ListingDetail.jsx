import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ru, kk, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Share2, MapPin, Clock, User, Flag, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

const locales = { ru, kk, en: enUS };

// ── Motion variants ──────────────────────────────────────
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 260,
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 22, stiffness: 280 },
  },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
};

const modalContentVariants = {
  hidden: { y: -80, opacity: 0, scale: 0.92 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 18, stiffness: 300 },
  },
  exit: {
    y: -60,
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportNote, setReportNote] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setItem({ id: docSnap.id, ...data });
          
          const tokens = JSON.parse(localStorage.getItem('aktaudorm_seller_tokens') || '[]');
          if (tokens.includes(data.sellerToken)) {
            setIsOwner(true);
          }
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleMarkAsSold = async () => {
    if (!window.confirm(t('details.markSoldConfirm'))) return;
    try {
      await updateDoc(doc(db, 'listings', id), { status: 'sold' });
      setItem(prev => ({ ...prev, status: 'sold' }));
    } catch (error) {
      console.error("Error updating status:", error);
      alert(t('details.updateFail'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('details.deleteConfirm'))) return;
    try {
      await deleteDoc(doc(db, 'listings', id));
      navigate('/');
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert(t('details.updateFail'));
    }
  };

  const handleReport = async () => {
    try {
      await addDoc(collection(db, 'reports'), {
        listingId: id,
        reason: reportReason,
        note: reportNote,
        createdAt: serverTimestamp()
      });
      alert(t('report.success'));
      setShowReport(false);
    } catch (error) {
      console.error("Error reporting:", error);
    }
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="w-10 h-10 bg-pill/20 rounded-full animate-pulse-soft" />
          <div className="w-10 h-10 bg-pill/20 rounded-full animate-pulse-soft" />
        </div>
        <div className="aspect-[4/3] bg-card rounded-3xl animate-pulse-soft" />
        <div className="bg-card rounded-3xl p-6 flex flex-col gap-4">
          <div className="h-8 bg-pill/20 rounded-xl w-1/3 animate-pulse-soft" />
          <div className="h-5 bg-pill/20 rounded-xl w-3/4 animate-pulse-soft" />
          <div className="h-4 bg-pill/20 rounded-xl w-1/2 animate-pulse-soft" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 text-labelTertiary text-[15px]"
      >
        {t('details.notFound')}
      </motion.div>
    );
  }

  const isSold = item.status === 'sold';
  
  let timeAgo = '';
  if (item.createdAt) {
    const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
    timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: locales[i18n.language] || locales.en });
  }

  const handleWhatsApp = () => {
    let msg = t('details.whatsappMessage', { title: item.title, price: item.price.toLocaleString() });
    let number = item.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto flex flex-col gap-4 pb-28"
    >

      {/* ── Top bar — floating pill buttons ── */}
      <motion.div variants={childVariants} className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-card rounded-full shadow-card hover:shadow-float transition-all duration-200 ease-apple"
        >
          <ChevronLeft size={20} className="text-label" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert(t('details.linkCopied'));
          }}
          className="w-10 h-10 flex items-center justify-center bg-card rounded-full shadow-card hover:shadow-float transition-all duration-200 ease-apple"
        >
          <Share2 size={17} className="text-label" />
        </motion.button>
      </motion.div>

      {/* ── Image Gallery — Full bleed, rounded-3xl ── */}
      <motion.div variants={childVariants} className="bg-card rounded-3xl overflow-hidden relative aspect-[4/3] group">
        {isSold && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 bg-card/70 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -8 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="bg-red text-white font-black text-sm tracking-[0.2em] uppercase px-8 py-2.5 rounded-full shadow-lg"
            >
              {t('home.sold')}
            </motion.div>
          </motion.div>
        )}

        {item.photos && item.photos.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={activePhoto}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                src={item.photos[activePhoto]}
                alt="Listing"
                className={clsx(
                  "w-full h-full object-cover",
                  isSold && "grayscale opacity-50"
                )}
              />
            </AnimatePresence>
            {item.photos.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActivePhoto(p => p === 0 ? item.photos.length - 1 : p - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-card/80 backdrop-blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-pill"
                >
                  <ChevronLeft size={18} className="text-label" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActivePhoto(p => p === item.photos.length - 1 ? 0 : p + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-card/80 backdrop-blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-pill"
                >
                  <ChevronRight size={18} className="text-label" />
                </motion.button>
                {/* Pill indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass-nav px-3 py-1.5 rounded-full flex gap-1.5 z-10">
                  {item.photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={clsx(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === activePhoto ? "bg-label w-4" : "bg-labelTertiary/40 w-1.5"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-pill/20">
            <span className="text-7xl opacity-15 select-none">📦</span>
          </div>
        )}
      </motion.div>

      {/* ── Info Card — iOS grouped style ── */}
      <motion.div variants={childVariants} className="bg-card rounded-3xl overflow-hidden">
        <div className="p-5 sm:p-6">
          {/* Category & Condition badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-pill/60 text-labelSecondary text-[11px] font-semibold px-2.5 py-1 rounded-full">
              {t(`categories.${item.category}`)}
            </span>
            <span className="bg-pill/60 text-labelSecondary text-[11px] font-semibold px-2.5 py-1 rounded-full">
              {t(`post.conditions.${item.condition}`)}
            </span>
          </div>

          {/* Price — THE hero */}
          <div className="text-[32px] sm:text-[36px] font-black tracking-[-0.04em] text-label leading-none mb-1.5">
            {item.price > 0 ? `${item.price.toLocaleString()} ₸` : t('post.pricePlaceholder')}
          </div>

          {/* Title */}
          <h1 className="text-[17px] sm:text-[19px] font-semibold text-labelSecondary leading-snug mb-1">
            {item.title}
          </h1>
        </div>

        {/* Description — separated */}
        {item.description && (
          <div className="px-5 sm:px-6 pb-5">
            <div className="border-t border-separatorLight pt-4">
              <p className="text-[14px] text-labelSecondary/80 whitespace-pre-wrap leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Seller Card — iOS grouped row style ── */}
      <motion.div variants={childVariants} className="bg-card rounded-3xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <p className="text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-3">
            {t('details.seller')}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue/10 flex items-center justify-center text-blue">
              <User size={20} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-[15px] text-label block">{item.firstName}</span>
              <div className="flex items-center gap-3 mt-0.5 text-[12px] text-labelTertiary">
                <span className="flex items-center gap-1">
                  <MapPin size={11} strokeWidth={2.5} />
                  {t('details.room')} {item.roomNumber}
                </span>
                {timeAgo && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} strokeWidth={2.5} />
                    {timeAgo}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Owner Actions ── */}
      {isOwner && (
        <motion.div variants={childVariants} className="bg-card rounded-3xl overflow-hidden divide-y divide-separatorLight">
          {!isSold && (
            <motion.button
              whileTap={{ scale: 0.97, backgroundColor: 'rgba(0,0,0,0.02)' }}
              onClick={handleMarkAsSold}
              className="w-full px-5 py-4 text-[15px] font-medium text-blue text-center hover:bg-bg transition-colors duration-150"
            >
              {t('details.markSold')}
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.97, backgroundColor: 'rgba(0,0,0,0.02)' }}
            onClick={handleDelete}
            className="w-full px-5 py-4 text-[15px] font-medium text-red text-center hover:bg-bg transition-colors duration-150"
          >
            {t('details.delete')}
          </motion.button>
        </motion.div>
      )}

      {/* ── Report ── */}
      {!isOwner && (
        <motion.button
          variants={childVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowReport(true)}
          className="flex items-center justify-center gap-1.5 text-[13px] text-labelTertiary hover:text-red transition-colors duration-200 py-3"
        >
          <Flag size={13} />
          {t('details.reportListing')}
        </motion.button>
      )}

      {/* ── Sticky WhatsApp Bar ── */}
      {!isSold && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.3 }}
          className="fixed bottom-0 left-0 w-full glass-bottom border-t border-separatorLight/50 p-4 z-40 safe-area-bottom"
        >
          <div className="max-w-2xl mx-auto">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FAD55] text-white py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-200 ease-apple shadow-fab"
            >
              <MessageCircle size={20} />
              {t('details.contactWhatsApp')}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── Report Modal — Drop-from-top spring animation ── */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start sm:items-center justify-center pt-20 sm:pt-0"
            onClick={(e) => e.target === e.currentTarget && setShowReport(false)}
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-card w-full max-w-md rounded-3xl p-6 shadow-dropdownApple mx-4"
            >
              <h3 className="text-[17px] font-bold text-label mb-5">{t('report.title')}</h3>

              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">
                  {t('report.reason')}
                </label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="ios-input"
                >
                  <option value="spam">{t('report.reasonSpam')}</option>
                  <option value="inappropriate">{t('report.reasonInappropriate')}</option>
                  <option value="sold">{t('report.reasonSold')}</option>
                  <option value="other">{t('report.reasonOther')}</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">
                  {t('report.note')}
                </label>
                <textarea
                  value={reportNote}
                  onChange={e => setReportNote(e.target.value)}
                  rows={3}
                  className="ios-input resize-none"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReport(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-pill/60 hover:bg-pill font-semibold text-[15px] text-label transition-colors duration-150"
                >
                  {t('report.cancel')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReport}
                  className="flex-1 py-3.5 rounded-2xl bg-red hover:bg-red/90 text-white font-semibold text-[15px] transition-all duration-150"
                >
                  {t('report.submitBtn')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
