import { Gavel, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-background/50 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Gavel className="text-white w-3 h-3" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary">
                BidMaster
              </span>
            </Link>
            <p className="text-sm text-text-secondary max-w-sm">
              The premier real-time auction platform. Experience lightning-fast bidding, secure payments, and a premium SaaS-grade dashboard.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-text-secondary hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-text-secondary hover:text-white transition-colors"><Github size={18} /></a>
              <a href="#" className="text-text-secondary hover:text-white transition-colors"><Linkedin size={18} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to="/" className="hover:text-primary transition-colors">Explore Auctions</Link></li>
              <li><Link to="/create-auction" className="hover:text-primary transition-colors">Sell an Item</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Trust & Safety</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} BidMaster. All rights reserved. Built for Major Project.
          </p>
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-text-secondary font-medium uppercase tracking-wider border border-white/10">React.js</span>
            <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-text-secondary font-medium uppercase tracking-wider border border-white/10">Node.js</span>
            <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-text-secondary font-medium uppercase tracking-wider border border-white/10">Socket.io</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
