import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
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
    return <div className="animate-pulse h-96 bg-surface rounded-2xl w-full max-w-2xl mx-auto"></div>;
  }

  if (!item) {
    return <div className="text-center py-20 text-textMuted">{t('details.notFound')}</div>;
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
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-24">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface hover:bg-surfaceHover rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert(t('details.linkCopied'));
          }} 
          className="p-2 bg-surface hover:bg-surfaceHover rounded-full transition-colors"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Image Gallery */}
      <div className="bg-surface rounded-3xl overflow-hidden border border-border relative aspect-[4/3] sm:aspect-video group">
        {isSold && (
          <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-error text-white font-bold tracking-widest px-8 py-3 rotate-[-15deg] shadow-2xl text-2xl uppercase">
              {t('home.sold')}
            </div>
          </div>
        )}
        
        {item.photos && item.photos.length > 0 ? (
          <>
            <img 
              src={item.photos[activePhoto]} 
              alt="Listing" 
              className={clsx("w-full h-full object-cover transition-opacity duration-300", isSold && "grayscale")}
            />
            {item.photos.length > 1 && (
              <>
                <button 
                  onClick={() => setActivePhoto(p => p === 0 ? item.photos.length - 1 : p - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/50 hover:bg-background/80 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setActivePhoto(p => p === item.photos.length - 1 ? 0 : p + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/50 hover:bg-background/80 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {item.photos.map((_, i) => (
                    <div key={i} className={clsx("w-2 h-2 rounded-full transition-all", i === activePhoto ? "bg-white w-4" : "bg-white/50")} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-textMuted bg-surfaceHover">
            <span className="text-6xl">📦</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
        <div className="inline-block px-3 py-1 bg-surfaceHover rounded-lg text-sm font-medium mb-4">
          {t(`categories.${item.category}`)} • {t(`post.conditions.${item.condition}`)}
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-textMain mb-2">{item.title}</h1>
        <div className="text-3xl font-bold text-primary mb-6">
          {item.price > 0 ? `${item.price.toLocaleString()} KZT` : t('post.pricePlaceholder')}
        </div>

        {item.description && (
          <div className="mb-6 pb-6 border-b border-border">
            <p className="text-textMain whitespace-pre-wrap leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Seller Block */}
        <h3 className="font-display font-bold text-lg mb-4">{t('details.seller')}</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-textMain">
            <div className="w-10 h-10 rounded-full bg-surfaceHover flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            <span className="font-medium text-lg">{item.firstName}</span>
          </div>
          
          <div className="flex flex-col gap-2 pl-13 text-textMuted">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{t('details.room')} {item.roomNumber}</span>
            </div>
            {timeAgo && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Posted {timeAgo}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        {isOwner && !isSold && (
          <button 
            onClick={handleMarkAsSold}
            className="w-full bg-surface border border-border hover:border-primary text-textMain py-4 rounded-xl font-bold transition-all"
          >
            {t('details.markSold')}
          </button>
        )}
        
        {!isOwner && (
          <button 
            onClick={() => setShowReport(true)}
            className="flex items-center justify-center gap-2 text-textMuted hover:text-error transition-colors py-2"
          >
            <AlertTriangle size={16} />
            {t('details.reportListing')}
          </button>
        )}
      </div>

      {/* Sticky Bottom Action (WhatsApp) */}
      {!isSold && (
        <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-md border-t border-border p-4 z-40">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5c] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-[#25D366]/20 active:scale-95"
            >
              <MessageCircle size={24} />
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-2xl p-6 border border-border shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4">{t('report.title')}</h3>
              
              <div className="mb-4">
                <label className="block text-sm text-textMuted mb-2">{t('report.reason')}</label>
                <select 
                  value={reportReason} onChange={e => setReportReason(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary"
                >
                  <option value="spam">{t('report.reasonSpam')}</option>
                  <option value="inappropriate">{t('report.reasonInappropriate')}</option>
                  <option value="sold">{t('report.reasonSold')}</option>
                  <option value="other">{t('report.reasonOther')}</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-textMuted mb-2">{t('report.note')}</label>
                <textarea 
                  value={reportNote} onChange={e => setReportNote(e.target.value)} rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-xl bg-surfaceHover font-medium">{t('report.cancel')}</button>
                <button onClick={handleReport} className="flex-1 py-3 rounded-xl bg-error hover:bg-error/90 text-white font-medium shadow-lg shadow-error/20">{t('report.submitBtn')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
