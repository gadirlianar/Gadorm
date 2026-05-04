import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import { Upload, X, ChevronLeft, ChevronRight, CheckCircle2, Share2 } from 'lucide-react';
import clsx from 'clsx';
import ListingCard from '../components/ListingCard';

const categories = ['electronics', 'books', 'clothing', 'furniture', 'food', 'other'];
const conditions = ['new', 'likeNew', 'good', 'fair'];

export default function PostItem() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [condition, setCondition] = useState(conditions[0]);
  
  const [description, setDescription] = useState('');
  const [firstName, setFirstName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('+7');

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      alert(t('post.maxPhotosAlert'));
      return;
    }

    const newPhotos = [];
    const newPreviews = [];

    for (let file of files) {
      if (!file.type.startsWith('image/')) continue;
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1080, useWebWorker: true };
      try {
        const compressedFile = await imageCompression(file, options);
        newPhotos.push(compressedFile);
        newPreviews.push(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Compression error:", error);
      }
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateStep1 = () => {
    if (photos.length === 0) return false;
    if (title.trim().length === 0 || title.length > 60) return false;
    if (price === '' || isNaN(Number(price))) return false;
    return true;
  };

  const validateStep2 = () => {
    if (description.length > 300) return false;
    if (firstName.trim().length === 0 || firstName.length > 20) return false;
    if (roomNumber.trim().length === 0 || roomNumber.length > 4) return false;
    if (whatsappNumber.length < 10) return false;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const photoUrls = [];
      const IMGBB_API_KEY = "b45fad18684cd1affa8f9aea6c62f471";
      
      for (let file of photos) {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST', body: formData
        });
        const data = await response.json();
        if (data && data.success) {
          photoUrls.push(data.data.display_url);
        } else {
          throw new Error("ImgBB upload failed");
        }
      }

      const sellerToken = uuidv4();
      const docData = {
        title: title.trim(),
        price: Number(price),
        category, condition,
        description: description.trim(),
        firstName: firstName.trim(),
        roomNumber: roomNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        photos: photoUrls,
        status: 'active',
        sellerToken,
        reportCount: 0,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'listings'), docData);

      const existingTokens = JSON.parse(localStorage.getItem('dormbazar_seller_tokens') || '[]');
      existingTokens.push(sellerToken);
      localStorage.setItem('dormbazar_seller_tokens', JSON.stringify(existingTokens));

      setSuccessId(docRef.id);
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrorMsg(`Firebase xətası: ${error.message}. (Səbəb: Firebase panelinizdə Firestore və ya Storage aktiv deyil, və ya Security Rules icazə vermir. Zəhmət olmasa console.firebase.google.com-dan aktiv edib qaydaları 'allow read, write: if true;' edin).`);
    } finally {
      setLoading(false);
    }
  };

  const previewItem = {
    id: 'preview', title,
    price: Number(price) || 0,
    category,
    photos: photoPreviews,
    roomNumber,
    createdAt: new Date(),
    status: 'active'
  };

  return (
    <div className="max-w-xl mx-auto">
      {successId ? (
        /* ═══ SUCCESS STATE ═══ */
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="bg-card rounded-3xl p-8 text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-green/10 text-green rounded-full flex items-center justify-center mb-5">
            <CheckCircle2 size={36} strokeWidth={1.5} />
          </div>
          <h2 className="text-[20px] font-bold text-label mb-1.5">{t('post.success')}</h2>
          <p className="text-[14px] text-labelTertiary mb-8">{t('post.successDesc')}</p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => {
                const url = `${window.location.origin}/item/${successId}`;
                const text = `Check out my listing on Gadorm: ${title}\n${url}`;
                window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1FAD55] text-white px-5 py-3.5 rounded-2xl font-semibold text-[14px] transition-all duration-200 ease-apple press"
            >
              <Share2 size={17} />
              {t('post.shareWhatsApp')}
            </button>
            <button
              onClick={() => navigate(`/item/${successId}`)}
              className="flex-1 bg-pill/60 hover:bg-pill text-label px-5 py-3.5 rounded-2xl font-semibold text-[14px] transition-colors duration-200 press"
            >
              {t('post.viewListing')}
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* ═══ PROGRESS BAR ═══ */}
          <div className="flex gap-1.5 mb-5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={clsx(
                  "h-[3px] flex-1 rounded-full transition-all duration-500 ease-apple",
                  step >= i ? "bg-blue" : "bg-pill"
                )}
              />
            ))}
          </div>

          {/* ═══ FORM CARD ═══ */}
          <div className="bg-card rounded-3xl p-5 sm:p-6 overflow-hidden">
            <AnimatePresence mode="wait">

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex flex-col gap-5"
                >
                  <h2 className="text-[17px] font-bold text-label">{t('post.step1')}</h2>

                  {/* Photos */}
                  <div>
                    <label className="block text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2.5">
                      {t('post.photosLimit', { count: photos.length })}
                    </label>
                    <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                      {photoPreviews.map((url, i) => (
                        <div key={i} className="relative w-[88px] h-[88px] shrink-0 rounded-2xl overflow-hidden">
                          <img src={url} alt="preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePhoto(i)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-red transition-colors duration-150 press"
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                      {photos.length < 3 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-[88px] h-[88px] shrink-0 rounded-2xl border-2 border-dashed border-pill hover:border-blue text-labelTertiary hover:text-blue flex flex-col items-center justify-center transition-all duration-200 press"
                        >
                          <Upload size={22} strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                    <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="flex items-center justify-between text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">
                      <span>{t('post.title')}</span>
                      <span className="text-labelQuaternary normal-case tracking-normal font-normal">{title.length}/60</span>
                    </label>
                    <input
                      type="text" maxLength={60} value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder={t('post.titlePlaceholder')}
                      className="ios-input"
                    />
                  </div>

                  {/* Category & Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">
                        {t('post.categoryLabel')}
                      </label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="ios-input appearance-none cursor-pointer">
                        {categories.map(c => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">
                        {t('post.price')}
                      </label>
                      <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" className="ios-input" />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">
                      {t('post.condition')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {conditions.map(c => (
                        <button
                          key={c}
                          onClick={() => setCondition(c)}
                          className={clsx(
                            "ios-segment text-[12px]",
                            condition === c ? "ios-segment-active" : "ios-segment-inactive"
                          )}
                        >
                          {t(`post.conditions.${c}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!validateStep1()}
                    onClick={() => setStep(2)}
                    className="mt-1 w-full bg-blue hover:bg-blueHover text-white py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-200 ease-apple disabled:opacity-30 flex items-center justify-center gap-1.5 press"
                  >
                    {t('post.next')} <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => setStep(1)} className="w-9 h-9 flex items-center justify-center hover:bg-pill/50 rounded-full text-labelTertiary transition-colors duration-150 press">
                      <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-[17px] font-bold text-label">{t('post.step2')}</h2>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">
                      <span>{t('post.description')}</span>
                      <span className="text-labelQuaternary normal-case tracking-normal font-normal">{description.length}/300</span>
                    </label>
                    <textarea maxLength={300} rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('post.descPlaceholder')} className="ios-input resize-none" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">{t('post.firstName')}</label>
                    <input type="text" maxLength={20} value={firstName} onChange={e => setFirstName(e.target.value)} className="ios-input" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">Room Number</label>
                    <input type="text" maxLength={4} value={roomNumber} onChange={e => setRoomNumber(e.target.value.replace(/\D/g, ''))} className="ios-input" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-labelTertiary tracking-[0.08em] uppercase mb-2">{t('post.whatsappNumber')}</label>
                    <input type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+7 777 000 0000" className="ios-input" />
                    <p className="text-[11px] text-labelTertiary mt-1.5">{t('post.whatsappNote')}</p>
                  </div>

                  <button
                    disabled={!validateStep2()}
                    onClick={() => setStep(3)}
                    className="mt-1 w-full bg-blue hover:bg-blueHover text-white py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-200 ease-apple disabled:opacity-30 flex items-center justify-center gap-1.5 press"
                  >
                    {t('post.preview')} <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => setStep(2)} className="w-9 h-9 flex items-center justify-center hover:bg-pill/50 rounded-full text-labelTertiary transition-colors duration-150 press">
                      <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-[17px] font-bold text-label">{t('post.step3')}</h2>
                  </div>

                  <div className="bg-bg p-4 rounded-2xl flex justify-center">
                    <div className="w-full max-w-[240px]">
                      <ListingCard item={previewItem} />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue hover:bg-blueHover text-white py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-200 ease-apple flex items-center justify-center disabled:opacity-40 press"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t('post.publishing')}
                      </span>
                    ) : t('post.publish')}
                  </button>

                  {errorMsg && (
                    <div className="p-4 bg-red/5 rounded-2xl text-red text-[12px] font-medium leading-relaxed">
                      {errorMsg}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
