import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ru, kk, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Share2, MapPin, Clock, User, AlertTriangle, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

const locales = { ru, kk, en: enUS };

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
          
          // Check ownership
          const tokens = JSON.parse(localStorage.getItem('dormbazar_seller_tokens') || '[]');
          if (tokens.includes(data.sellerToken)) {
            setIsOwner(true);
          }
        } else {
          // not found
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse flex flex-col gap-6">
          <div className="h-10 w-10 bg-surfaceHover rounded-full"></div>
          <div className="aspect-[4/3] bg-white rounded-2xl shadow-card"></div>
          <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4">
            <div className="h-4 bg-surfaceHover rounded-lg w-1/4"></div>
            <div className="h-7 bg-surfaceHover rounded-lg w-3/4"></div>
            <div className="h-8 bg-surfaceHover rounded-lg w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return <div className="text-center py-20 text-textMuted text-sm">{t('details.notFound')}</div>;
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
    <div className="max-w-2xl mx-auto flex flex-col gap-5 pb-28">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-white hover:bg-surfaceHover rounded-xl transition-all duration-200 shadow-card"
        >
          <ChevronLeft size={20} className="text-textSecondary" />
        </button>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert(t('details.linkCopied'));
          }} 
          className="p-2.5 bg-white hover:bg-surfaceHover rounded-xl transition-all duration-200 shadow-card"
        >
          <Share2 size={18} className="text-textSecondary" />
        </button>
      </div>

      {/* Image Gallery */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-card relative aspect-[4/3] sm:aspect-video group">
        {isSold && (
          <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-error text-white font-bold tracking-widest px-8 py-3 rotate-[-12deg] rounded-lg shadow-lg text-xl uppercase">
              {t('home.sold')}
            </div>
          </div>
        )}
        
        {item.photos && item.photos.length > 0 ? (
          <>
            <img 
              src={item.photos[activePhoto]} 
              alt="Listing" 
              className={clsx("w-full h-full object-cover transition-opacity duration-300", isSold && "grayscale opacity-60")}
            />
            {item.photos.length > 1 && (
              <>
                <button 
                  onClick={() => setActivePhoto(p => p === 0 ? item.photos.length - 1 : p - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-textSecondary rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setActivePhoto(p => p === item.photos.length - 1 ? 0 : p + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-textSecondary rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {item.photos.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActivePhoto(i)}
                      className={clsx(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === activePhoto ? "bg-white w-5 shadow-sm" : "bg-white/50 w-1.5 hover:bg-white/70"
                      )} 
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-textMuted bg-surfaceHover">
            <span className="text-6xl opacity-30">📦</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="inline-flex items-center px-3 py-1.5 bg-surfaceHover rounded-lg text-xs font-medium text-textSecondary mb-4">
          {t(`categories.${item.category}`)} • {t(`post.conditions.${item.condition}`)}
        </div>
        
        <h1 className="text-xl sm:text-2xl font-bold text-textMain mb-2 leading-tight">{item.title}</h1>
        <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mb-5">
          {item.price > 0 ? `${item.price.toLocaleString()} ₸` : t('post.pricePlaceholder')}
        </div>

        {item.description && (
          <div className="mb-5 pb-5 border-b border-border/60">
            <p className="text-sm text-textSecondary whitespace-pre-wrap leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Seller Block */}
        <h3 className="font-semibold text-sm text-textMuted uppercase tracking-wider mb-3">{t('details.seller')}</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-textMain">
            <div className="w-10 h-10 rounded-xl bg-surfaceHover flex items-center justify-center text-textMuted">
              <User size={18} />
            </div>
            <span className="font-semibold">{item.firstName}</span>
          </div>
          
          <div className="flex flex-col gap-2 pl-[52px] text-sm text-textMuted">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="opacity-60" />
              <span>{t('details.room')} {item.roomNumber}</span>
            </div>
            {timeAgo && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="opacity-60" />
                <span>Posted {timeAgo}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {isOwner && !isSold && (
          <button 
            onClick={handleMarkAsSold}
            className="w-full bg-white border border-border hover:border-borderHover text-textMain py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-card hover:shadow-elevated"
          >
            {t('details.markSold')}
          </button>
        )}

        {isOwner && (
          <button 
            onClick={handleDelete}
            className="w-full bg-error/5 hover:bg-error/10 text-error border border-error/15 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
          >
            {t('details.delete')}
          </button>
        )}
        
        {!isOwner && (
          <button 
            onClick={() => setShowReport(true)}
            className="flex items-center justify-center gap-2 text-sm text-textMuted hover:text-error transition-colors duration-200 py-2"
          >
            <AlertTriangle size={14} />
            {t('details.reportListing')}
          </button>
        )}
      </div>

      {/* Sticky Bottom Action (WhatsApp) */}
      {!isSold && (
        <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-border/50 p-4 z-40">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5c] text-white py-3.5 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg shadow-[#25D366]/15 active:scale-[0.98]"
            >
              <MessageCircle size={20} />
              {t('details.contactWhatsApp')}
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowReport(false)}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-2xl p-6 shadow-dropdown"
            >
              <h3 className="text-lg font-bold text-textMain mb-5">{t('report.title')}</h3>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-textMuted uppercase tracking-wider mb-2">{t('report.reason')}</label>
                <select 
                  value={reportReason} onChange={e => setReportReason(e.target.value)}
                  className="w-full bg-surfaceHover border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all duration-200"
                >
                  <option value="spam">{t('report.reasonSpam')}</option>
                  <option value="inappropriate">{t('report.reasonInappropriate')}</option>
                  <option value="sold">{t('report.reasonSold')}</option>
                  <option value="other">{t('report.reasonOther')}</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-textMuted uppercase tracking-wider mb-2">{t('report.note')}</label>
                <textarea 
                  value={reportNote} onChange={e => setReportNote(e.target.value)} rows={3}
                  className="w-full bg-surfaceHover border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowReport(false)} 
                  className="flex-1 py-3 rounded-xl bg-surfaceHover hover:bg-surfaceActive font-medium text-sm text-textSecondary transition-colors duration-200"
                >
                  {t('report.cancel')}
                </button>
                <button 
                  onClick={handleReport} 
                  className="flex-1 py-3 rounded-xl bg-error hover:bg-error/90 text-white font-medium text-sm transition-all duration-200 shadow-sm"
                >
                  {t('report.submitBtn')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
