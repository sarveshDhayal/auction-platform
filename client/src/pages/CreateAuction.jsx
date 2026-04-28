import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, DollarSign, Clock, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import api from '../services/api';

const CATEGORIES = [
  'Digital Art', 'Collectibles', 'Electronics', 'Vehicles', 'Real Estate', 'Antiques'
];

export default function CreateAuction() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    startingPrice: '',
    minIncrement: '',
    endTime: '',
    description: '',
    requiresPaymentVerification: true,
    image: null
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('startingPrice', formData.startingPrice);
      data.append('minIncrement', formData.minIncrement);
      data.append('endTime', formData.endTime);
      data.append('description', formData.description);
      data.append('requiresPaymentVerification', formData.requiresPaymentVerification);
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      const response = await api.post('/auctions', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Redirect to the newly created auction room
      const newAuctionId = response.data.data.id;
      navigate(`/auction/${newAuctionId}`);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create auction');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-primary to-neon-secondary">
          Create New Auction
        </h1>
        <p className="text-text-muted mt-2">List your asset for real-time bidding</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Same UI structure, just updated form logic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-neon-primary" />
                Asset Details
              </h2>
              
              <div className="space-y-4">
                <Input
                  label="Listing Title"
                  placeholder="e.g., Rare Vintage Rolex Daytona"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-secondary">Category</label>
                  <select 
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-primary/50"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-surface-elevated text-text-primary">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-secondary">Description</label>
                  <textarea 
                    className="w-full glass-input rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-primary/50 min-h-[120px]"
                    placeholder="Provide detailed information about your asset..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-neon-secondary" />
                Auction Parameters
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Starting Price ($)"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData({...formData, startingPrice: e.target.value})}
                  required
                />
                
                <Input
                  label="Minimum Bid Increment ($)"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="10.00"
                  value={formData.minIncrement}
                  onChange={(e) => setFormData({...formData, minIncrement: e.target.value})}
                  required
                />
                
                <div className="md:col-span-2">
                  <Input
                    label="End Date & Time"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-neon-primary" />
                Media
              </h2>
              
              <div className="space-y-4">
                {!imagePreview ? (
                  <div className="relative group cursor-pointer">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 group-hover:border-neon-primary/50 group-hover:bg-neon-primary/5 transition-all">
                      <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-text-secondary group-hover:text-neon-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Click to upload image</p>
                        <p className="text-xs text-text-muted mt-1">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-white/10 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <Button variant="danger" size="sm" onClick={removeImage} className="gap-2">
                        <X className="w-4 h-4" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Security
              </h2>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={formData.requiresPaymentVerification}
                    onChange={(e) => setFormData({...formData, requiresPaymentVerification: e.target.checked})}
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    formData.requiresPaymentVerification 
                      ? 'bg-neon-primary border-neon-primary' 
                      : 'border-white/20 group-hover:border-white/40'
                  }`}>
                    {formData.requiresPaymentVerification && <ShieldCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Require Payment Verification</p>
                  <p className="text-xs text-text-muted mt-1">
                    Bidders must pre-authorize their card via Stripe to place bids.
                  </p>
                </div>
              </label>
            </GlassCard>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              disabled={loading}
            >
              {loading ? 'Publishing...' : (
                <>
                  Launch Auction <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>

        </div>
      </form>
    </motion.div>
  );
}
