import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { UploadCloud, X, Calendar, DollarSign, Tag, ShieldCheck } from 'lucide-react';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    minIncrement: '',
    startTime: '',
    endTime: '',
    category: 'electronics',
    paymentSecurity: true,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to the newly created auction room
      navigate('/auction/new-123');
    }, 1500);
  };

  return (
    <div className="flex gap-8">
      <Sidebar />
      
      <div className="flex-1 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Auction</h1>
          <p className="text-text-secondary">Fill in the details to list your product for live bidding.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Image Upload Section */}
          <GlassCard className="p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" /> Product Images
            </h3>
            
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors bg-white/5 relative group">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setImagePreview(null)}
                    className="absolute -top-3 -right-3 bg-danger text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-text-secondary">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                  </div>
                </>
              )}
            </div>
          </GlassCard>

          {/* Basic Details */}
          <GlassCard className="p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> Basic Details
            </h3>
            
            <div className="space-y-6">
              <Input 
                label="Auction Title" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Vintage Rolex Submariner 1980" 
                required
              />
              
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-text-secondary">Product Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="glass-input w-full min-h-[120px] resize-y"
                  placeholder="Describe the item in detail, including condition, specifications, and history..."
                  required
                ></textarea>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-text-secondary">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="glass-input w-full appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23CBD5E1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:0.65em_auto]"
                >
                  <option value="electronics" className="bg-background">Electronics & Tech</option>
                  <option value="art" className="bg-background">Art & Collectibles</option>
                  <option value="vehicles" className="bg-background">Vehicles</option>
                  <option value="fashion" className="bg-background">Fashion & Accessories</option>
                  <option value="realestate" className="bg-background">Real Estate</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Pricing & Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" /> Pricing
              </h3>
              
              <div className="space-y-6">
                <Input 
                  label="Starting Price ($)" 
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  placeholder="0.00" 
                  min="0"
                  step="0.01"
                  required
                />
                <Input 
                  label="Minimum Bid Increment ($)" 
                  type="number"
                  name="minIncrement"
                  value={formData.minIncrement}
                  onChange={handleChange}
                  placeholder="5.00" 
                  min="1"
                  step="1"
                  required
                />
              </div>
            </GlassCard>

            <GlassCard className="p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-warning" /> Timing
              </h3>
              
              <div className="space-y-6">
                <Input 
                  label="Start Time" 
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  required
                />
                <Input 
                  label="End Time" 
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  required
                />
              </div>
            </GlassCard>
          </div>

          {/* Security Settings */}
          <GlassCard className="p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Security Settings
            </h3>
            
            <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  name="paymentSecurity"
                  checked={formData.paymentSecurity}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary/50 bg-background" 
                />
              </div>
              <div>
                <p className="text-white font-medium mb-1">Require Payment Verification</p>
                <p className="text-sm text-text-secondary">Bidders must authorize a temporary hold on their card before placing bids. This prevents unpaid wins and ensures a secure auction.</p>
              </div>
            </label>
          </GlassCard>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost">Cancel</Button>
            <Button type="submit" size="lg" isLoading={loading}>Publish Auction</Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
