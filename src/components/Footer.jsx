import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { pathname } = useLocation();
  if (pathname === '/admin') return null;

  return (
    <>
      <style>{`
        .footer-link {
          display: block;
          font-size: 0.875rem;
          color: rgba(156,163,175,1);
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .footer-link:hover {
          color: white;
          transform: translateX(4px);
        }

        .trust-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(209,213,219,1);
          transition: background 0.2s;
        }
        .trust-pill:hover {
          background: rgba(255,255,255,0.09);
        }

        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent);
        }
      `}</style>

      <footer className="bg-gray-900 text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg tracking-tight">RentShare</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 mb-5">
                Rent items from people near you.<br />Safe, affordable, and convenient.
              </p>

            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
              <div className="space-y-3">
                <Link to="/"             className="footer-link">Browse Items</Link>
                <Link to="/add-item"     className="footer-link">List an Item</Link>
                <Link to="/my-rentals"   className="footer-link">My Rentals</Link>
                <Link to="/report-issue" className="footer-link">Report an Issue</Link>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Platform</h4>
              <div className="flex flex-col gap-2.5">
                {['KYC Verified Users', 'Secure Payments', 'Deposit Protection'].map(text => (
                  <div key={text} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer-divider mb-6" />
          <p className="text-center text-xs text-gray-600">
            © {currentYear} RentShare. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;