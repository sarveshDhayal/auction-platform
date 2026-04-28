import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Bell, Shield, Key, Camera } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  
  // Form states
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');

  return (
    <div className="flex gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20">
      <Sidebar />
      <div className="flex-1">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Account Settings</h1>
          <p className="text-text-secondary">Manage your profile, notifications, and security preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <GlassCard className="p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'profile' ? 'bg-primary/20 text-white border border-primary/30' : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <User className="w-4 h-4" /> Profile Details
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'notifications' ? 'bg-primary/20 text-white border border-primary/30' : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Bell className="w-4 h-4" /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'security' ? 'bg-primary/20 text-white border border-primary/30' : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Shield className="w-4 h-4" /> Security
              </button>
            </GlassCard>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <GlassCard className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group cursor-pointer">
                    <img 
                      src={user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User')} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full border-2 border-primary/50 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">Avatar Image</h4>
                    <p className="text-sm text-text-secondary mb-3">JPG, GIF or PNG. Max size of 5MB.</p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10">Upload New</button>
                      <button className="px-4 py-2 text-danger hover:bg-danger/10 text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-danger/20">Remove</button>
                    </div>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input 
                      label="Full Name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      icon={User}
                    />
                    <Input 
                      label="Email Address" 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      icon={Mail}
                      disabled
                    />
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => {
                      setName(user?.name || '');
                      setEmail(user?.email || '');
                    }}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </GlassCard>
            )}

            {activeTab === 'notifications' && (
              <GlassCard className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  {[
                    { title: 'Outbid Alerts', desc: 'Get notified immediately when someone outbids you.', defaultChecked: true },
                    { title: 'Auction Ending Soon', desc: 'Alerts for when an auction on your watchlist is about to end.', defaultChecked: true },
                    { title: 'Marketing Emails', desc: 'Receive weekly digests of recommended auctions.', defaultChecked: false },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white font-medium text-sm mb-1">{notif.title}</p>
                        <p className="text-text-secondary text-xs">{notif.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={notif.defaultChecked} />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end">
                    <Button type="button">Save Preferences</Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === 'security' && (
              <GlassCard className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
                <form className="space-y-5 max-w-md" onSubmit={(e) => e.preventDefault()}>
                  <Input 
                    label="Current Password" 
                    type="password"
                    placeholder="••••••••" 
                    icon={Key}
                  />
                  <Input 
                    label="New Password" 
                    type="password"
                    placeholder="••••••••" 
                    icon={Key}
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password"
                    placeholder="••••••••" 
                    icon={Key}
                  />
                  <div className="pt-4 border-t border-white/10">
                    <Button type="submit">Update Password</Button>
                  </div>
                </form>
              </GlassCard>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
