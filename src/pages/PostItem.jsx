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
const dormBlocks = ['Block A', 'Block B', 'Block C', 'Block D', 'Other'];

export default function PostItem() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form State
  const [photos, setPhotos] = useState([]); // Array of File objects
  const [photoPreviews, setPhotoPreviews] = useState([]); // Array of ObjectURLs
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
      
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1080,
        useWebWorker: true
      };
      
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
      // 1. Upload photos to ImgBB
      const photoUrls = [];
      const IMGBB_API_KEY = "b45fad18684cd1affa8f9aea6c62f471";
      
      for (let file of photos) {
        const formData = new FormData();
        formData.append("image", file);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        if (data && data.success) {
          photoUrls.push(data.data.display_url);
        } else {
          throw new Error("Şəkil yüklənərkən xəta baş verdi / ImgBB upload failed");
        }
      }

      // 2. Generate Seller Token
      const sellerToken = uuidv4();

      // 3. Save to Firestore
      const docData = {
        title: title.trim(),
        price: Number(price),
        category,
        condition,
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

      // 4. Save token to localStorage
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

  // Previews for Step 3
  const previewItem = {
    id: 'preview',
    title,
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-border rounded-2xl p-8 text-center flex flex-col items-center shadow-card shadow-primary/10"
        >
          <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-display font-bold text-textMain mb-2">{t('post.success')}</h2>
          <p className="text-textMuted mb-8">{t('post.successDesc')}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button 
              onClick={() => {
                const url = `${window.location.origin}/item/${successId}`;
                const text = `Check out my listing on DormBazar: ${title}\n${url}`;
                window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5c] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#25D366]/20 active:scale-95"
            >
              <Share2 size={20} />
              {t('post.shareWhatsApp')}
            </button>
            <button 
              onClick={() => navigate(`/item/${successId}`)}
              className="flex-1 bg-surfaceHover hover:bg-border text-textMain px-6 py-3 rounded-xl font-bold transition-colors"
            >
              {t('post.viewListing')}
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={clsx(
                  "h-1.5 flex-1 rounded-full transition-colors duration-500",
                  step >= i ? "bg-primary" : "bg-surfaceHover"
                )}
              />
            ))}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 shadow-card overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <h2 className="text-xl font-display font-bold">{t('post.step1')}</h2>
                  
                  {/* Photos */}
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">{t('post.photosLimit', { count: photos.length })}</label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {photoPreviews.map((url, i) => (
                        <div key={i} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-border">
                          <img src={url} alt="preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 bg-background/80 text-white p-1 rounded-full hover:bg-error transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {photos.length < 3 && (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-border hover:border-primary text-textMuted hover:text-primary flex flex-col items-center justify-center gap-1 transition-colors"
                        >
                          <Upload size={24} />
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">
                      {t('post.title')} <span className="text-xs text-textMuted/50 float-right">{title.length}/60</span>
                    </label>
                    <input 
                      type="text" 
                      maxLength={60}
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder={t('post.titlePlaceholder')}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Category & Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textMuted mb-2">{t('post.categoryLabel')}</label>
                      <select 
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary transition-colors appearance-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMuted mb-2">{t('post.price')}</label>
                      <input 
                        type="number" 
                        min="0"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">{t('post.condition')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {conditions.map(c => (
                        <button
                          key={c}
                          onClick={() => setCondition(c)}
                          className={clsx(
                            "px-3 py-2 rounded-xl text-sm font-medium transition-colors border",
                            condition === c 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "bg-background border-border text-textMuted hover:border-textMuted"
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
                    className="mt-4 w-full bg-primary hover:bg-primaryHover text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:hover:bg-primary flex items-center justify-center gap-2"
                  >
                    {t('post.next')} <ChevronRight size={20} />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4">
                    <button onClick={() => setStep(1)} className="p-2 hover:bg-surfaceHover rounded-full text-textMuted transition-colors">
                      <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-display font-bold">{t('post.step2')}</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">
                      {t('post.description')} <span className="text-xs text-textMuted/50 float-right">{description.length}/300</span>
                    </label>
                    <textarea 
                      maxLength={300}
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={t('post.descPlaceholder')}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">{t('post.firstName')}</label>
                    <input 
                      type="text" 
                      maxLength={20}
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textMuted mb-2">Room Number</label>
                      <input 
                        type="text" 
                        maxLength={4}
                        value={roomNumber}
                        onChange={e => setRoomNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">{t('post.whatsappNumber')}</label>
                    <input 
                      type="tel" 
                      value={whatsappNumber}
                      onChange={e => setWhatsappNumber(e.target.value)}
                      placeholder="+7 777 000 0000"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-textMuted mt-2">{t('post.whatsappNote')}</p>
                  </div>

                  <button 
                    disabled={!validateStep2()}
                    onClick={() => setStep(3)}
                    className="mt-4 w-full bg-primary hover:bg-primaryHover text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:hover:bg-primary flex items-center justify-center gap-2"
                  >
                    {t('post.preview')} <ChevronRight size={20} />
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4">
                    <button onClick={() => setStep(2)} className="p-2 hover:bg-surfaceHover rounded-full text-textMuted transition-colors">
                      <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-display font-bold">{t('post.step3')}</h2>
                  </div>

                  <div className="bg-background p-4 rounded-2xl border border-border flex justify-center">
                    <div className="w-full max-w-[280px]">
                      <ListingCard item={previewItem} />
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primaryHover text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? t('post.publishing') : t('post.publish')}
                  </button>

                  {errorMsg && (
                    <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium">
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
