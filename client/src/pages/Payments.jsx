import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { CreditCard, DollarSign, Download, ArrowRight, ShieldCheck, CheckCircle2, Package, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Payments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  const checkoutItem = location.state?.item;

  const transactions = [
    { id: 'TXN-001', item: 'Vintage 1960s Rolex Submariner', date: 'Oct 15, 2023', amount: '$12,400.00', status: 'Completed', type: 'Purchase' },
    { id: 'TXN-002', item: 'Apple MacBook Pro M3 Max', date: 'Oct 10, 2023', amount: '$4,100.00', status: 'Completed', type: 'Purchase' },
    { id: 'TXN-003', item: 'Deposit Funds', date: 'Sep 28, 2023', amount: '$5,000.00', status: 'Completed', type: 'Deposit' },
    { id: 'TXN-004', item: 'Sony A7RV Camera Body', date: 'Oct 24, 2023', amount: '$3,250.00', status: 'Pending', type: 'Hold' },
  ];

  return (
    <div className="flex gap-8">
      <Sidebar />
      <div className="flex-1 max-w-5xl">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Payments & Billing</h1>
          <p className="text-text-secondary">Manage your payment methods and view transaction history.</p>
        </div>

        <AnimatePresence mode="wait">
          {isPaid ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <GlassCard className="p-12 text-center border-success/30 bg-success/5">
                <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/30">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  Your payment for <strong>{checkoutItem?.item}</strong> has been processed. You will receive a confirmation email shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => setIsPaid(false)}>View Transaction History</Button>
                  <Button variant="outline" onClick={() => navigate('/')}>Return to Dashboard</Button>
                </div>
              </GlassCard>
            </motion.div>
          ) : checkoutItem ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-8"
            >
              <GlassCard className="p-0 overflow-hidden border-primary/30">
                <div className="p-6 border-b border-white/10 bg-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-white">Complete Checkout</h2>
                  </div>
                  <button onClick={() => navigate(-1)} className="text-sm text-text-secondary hover:text-white flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                </div>
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Order Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white">{checkoutItem.item}</span>
                        <span className="font-bold text-white">{checkoutItem.amount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-text-secondary">
                        <span>Platform Fee (2%)</span>
                        <span>$248.00</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-text-secondary">
                        <span>Shipping & Handling</span>
                        <span>$45.00</span>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-lg font-bold text-white">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">$12,693.00</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Payment Method</h3>
                    <div className="bg-white/5 border border-primary/50 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gradient-to-br from-blue-900 to-blue-600 rounded flex items-center justify-center">
                          <span className="text-white font-bold italic text-xs">VISA</span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">•••• 4242</p>
                          <p className="text-xs text-text-secondary">Secure Card</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <Button className="w-full py-4 text-lg" onClick={() => setIsPaid(true)}>
                      Pay Now <ShieldCheck className="w-5 h-5 ml-2" />
                    </Button>
                    <p className="text-center text-xs text-text-secondary">
                      By clicking Pay Now, you agree to the Terms of Service.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <GlassCard className="p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <DollarSign className="w-24 h-24 text-primary" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-text-secondary mb-1">Total Spent</p>
                    <h2 className="text-4xl font-bold text-white mb-4">$16,500.00</h2>
                    <div className="flex items-center gap-2 text-sm text-success">
                      <ShieldCheck className="w-4 h-4" /> Securely processed via Stripe
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-4">Saved Payment Method</p>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="w-12 h-8 bg-gradient-to-br from-blue-900 to-blue-600 rounded flex items-center justify-center shadow-inner">
                        <span className="text-white font-bold italic text-xs">VISA</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">•••• •••• •••• 4242</p>
                        <p className="text-xs text-text-secondary">Expires 12/25</p>
                      </div>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-primary hover:text-white transition-colors text-left mt-4 inline-flex items-center gap-1">
                    Manage Methods <ArrowRight className="w-4 h-4" />
                  </button>
                </GlassCard>
              </div>

              <GlassCard className="p-0 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> Recent Transactions
                  </h3>
                  <button className="text-sm font-medium text-text-secondary hover:text-white transition-colors inline-flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Transaction ID</th>
                        <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</th>
                        <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {transactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 text-sm font-mono text-text-secondary group-hover:text-white transition-colors">{txn.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{txn.item}</div>
                            <div className="text-xs text-text-secondary">{txn.type}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{txn.date}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-white text-right">{txn.amount}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              txn.status === 'Completed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                            }`}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Payments;
