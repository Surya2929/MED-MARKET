import { Link } from 'react-router-dom';
// 🚀 FIX: Removed deleted brand icons (Facebook, Apple etc.) and used safe ones
import { Pill, Play, Smartphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#F8FAFC] border-t border-slate-200 pt-16 pb-8 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 🌟 TOP GRID SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* Column 1: Company Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-slate-900 p-1.5 rounded-md">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-900 font-bold text-xl tracking-tight">
                MedMarket<span className="text-blue-600">.</span>
              </span>
            </Link>
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Company</h3>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li><Link to="#" className="hover:text-blue-600 transition">About Us</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">Health Articles</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">Diseases & Health Conditions</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">Understanding Generic Medicines</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">All Brands</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">FAQ & Help</Link></li>
            </ul>
          </div>

          {/* Column 2: Legal & Social */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Social</h3>
            <div className="flex gap-4 mb-8">
              {/* 🚀 FIX: Used Text-based sleek icons instead of Lucide Brand icons */}
              <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-sm font-bold text-sm">IG</a>
              <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-sm font-bold text-sm">FB</a>
              <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-sm font-bold text-sm">X</a>
              <a href="#" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-sm font-bold text-sm">IN</a>
            </div>

            <h3 className="font-bold text-slate-800 mb-4 text-lg">Legal</h3>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li><Link to="#" className="hover:text-blue-600 transition">Terms & Conditions</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">Editorial Policy</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">Returns & Cancellations</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">Lowest Price Guarantee T&C</Link></li>
            </ul>
          </div>

          {/* Column 3: Subscribe & Address */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Subscribe</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">Claim your complimentary health tips subscription and stay updated on our promotions.</p>
            <div className="flex mb-8">
              <input type="email" placeholder="Enter your email ID" className="w-full px-4 py-2.5 border border-slate-300 rounded-l-lg outline-none focus:border-blue-500 text-sm" />
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-r-lg font-bold text-sm hover:bg-blue-700 transition">Subscribe</button>
            </div>

            <h3 className="font-bold text-slate-800 mb-3 text-lg">Registered Office Address</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
              MedMarket Solutions Private Limited<br/>
              Software Technology Park, Sector 62,<br/>
              Noida, Uttar Pradesh, India, 201309.
            </p>
            
            <h3 className="font-bold text-slate-800 mb-2 text-lg">Grievance Officer</h3>
            <div className="text-sm text-slate-600 font-medium">
              <p>Name: Suryansh Chaudhary</p>
              <p>Email: <a href="mailto:grievance@medmarket.in" className="text-blue-600 hover:underline">grievance@medmarket.in</a></p>
            </div>
          </div>

          {/* Column 4: App Download & Contact */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Download MedMarket App</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">Manage your health with ease. Download our app now and start taking control of your health.</p>
            
            <div className="flex gap-3 mb-8">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition flex-1">
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[9px] uppercase leading-none text-slate-300">Get it on</div>
                  <div className="text-sm font-bold leading-none mt-1">Google Play</div>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition flex-1">
                <Smartphone className="w-6 h-6" /> {/* 🚀 FIX: Used Smartphone instead of Apple */}
                <div className="text-left">
                  <div className="text-[9px] uppercase leading-none text-slate-300">Download on the</div>
                  <div className="text-sm font-bold leading-none mt-1">App Store</div>
                </div>
              </button>
            </div>

            <h3 className="font-bold text-slate-800 mb-4 text-lg">Contact Us</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">Our customer representative team is available 7 days a week from 8:00 am - 10:00 pm.</p>
            <div className="space-y-2 text-sm font-bold text-slate-700">
              <p className="flex justify-between"><span>Support:</span> <a href="mailto:support@medmarket.in" className="text-blue-600 font-medium hover:underline">support@medmarket.in</a></p>
              <p className="flex justify-between"><span>Phone:</span> <span className="font-medium">+91 88698 93378</span></p>
            </div>
          </div>

        </div>

        {/* 🌟 BOTTOM BAR */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500 font-medium text-center md:text-left max-w-2xl">
            © 2024 - MedMarket. All rights reserved. Our content is for informational purposes only. <a href="#" className="underline hover:text-slate-800">See additional information</a>.
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 mr-2">Our Payment Partners</span>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-blue-800 shadow-sm">VISA</span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-red-600 shadow-sm">MasterCard</span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-800 shadow-sm">UPI</span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-sky-600 shadow-sm">Paytm</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;