import { useState, useEffect } from 'react';
import { getMyTransactions } from '../services/api';

const statusColors = {
  PENDING:  'bg-yellow-50 text-yellow-700',
  SUCCESS:  'bg-green-50 text-green-700',
  FAILED:   'bg-red-50 text-red-600',
  REFUNDED: 'bg-blue-50 text-blue-700',
};

const typeColors = {
  PAYMENT:   'bg-blue-50 text-blue-700',
  DEPOSIT:   'bg-purple-50 text-purple-700',
  REFUND:    'bg-green-50 text-green-700',
  EXTENSION: 'bg-orange-50 text-orange-700',
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTransactions()
      .then(res => setTransactions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">Your payment history</p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions yet</h3>
            <p className="text-gray-400">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(txn => {
              const isRefund = txn.type === 'REFUND';
              const displayTotal = isRefund ? txn.rental?.depositAmount : txn.rental?.totalAmount;
              const displayRental = isRefund ? 0 : txn.rental?.rentalAmount;

              return (
                <div key={txn.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {txn.rental?.item?.name || 'Item'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₹{displayTotal}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[txn.status]}`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Type</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[txn.type]}`}>
                        {txn.type}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Rental Amount</p>
                      <p className="text-sm font-medium text-gray-900">₹{displayRental}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Deposit</p>
                      <p className="text-sm font-medium text-gray-900">₹{txn.rental?.depositAmount}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
