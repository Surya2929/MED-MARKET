import { Link } from 'react-router-dom';
// 🚀 FIX: Removed deleted brand icons (Facebook, Apple etc.) and used safe ones
import { Pill, Play, Smartphone } from 'lucide-react';

const Footer = () => {
  const linkCls = "hover:text-lime-accent transition";
  const headingCls = "font-semibold text-white mb-4 text-base";

  return (
    <footer className="mt-auto font-sans px-3 sm:px-6 lg:px-8 pb-4 pt-12">
      <div className="max-w-7xl mx-auto bg-brand-800 rounded-[28px] px-6 sm:px-10 lg:px-14 pt-14 pb-8 text-brand-100/80 relative overflow-hidden">
        <div className="absolute -top-40 -left-24 w-[420px] h-[420px] bg-brand-600/40 rounded-full blur-3xl pointer-events-none" />

        {/* 🌟 TOP GRID SECTION */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Column 1: Company Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-lime-accent p-1.5 rounded-lg">
                <Pill className="w-5 h-5 text-brand-800" />
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">
                MedMarket<span className="text-lime-accent">.</span>
              </span>
            </Link>
            <h3 className={headingCls}>Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className={linkCls}>About Us</Link></li>
              <li><Link to="#" className={linkCls}>Health Articles</Link></li>
              <li><Link to="#" className={linkCls}>Diseases & Health Conditions</Link></li>
              <li><Link to="#" className={linkCls}>Understanding Generic Medicines</Link></li>
              <li><Link to="#" className={linkCls}>All Brands</Link></li>
              <li><Link to="#" className={linkCls}>FAQ & Help</Link></li>
            </ul>
          </div>

          {/* Column 2: Legal & Social */}
          <div>
            <h3 className={headingCls}>Social</h3>
            <div className="flex gap-3 mb-8">
              {/* 🚀 FIX: Used Text-based sleek icons instead of Lucide Brand icons */}
              {['IG', 'FB', 'X', 'IN'].map((s) => (
                <a key={s} href="#" className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-lime-accent hover:text-brand-900 transition font-bold text-sm">{s}</a>
              ))}
            </div>

            <h3 className={headingCls}>Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className={linkCls}>Terms & Conditions</Link></li>
              <li><Link to="#" className={linkCls}>Privacy Policy</Link></li>
              <li><Link to="#" className={linkCls}>Editorial Policy</Link></li>
              <li><Link to="#" className={linkCls}>Returns & Cancellations</Link></li>
              <li><Link to="#" className={linkCls}>Lowest Price Guarantee T&C</Link></li>
            </ul>
          </div>

          {/* Column 3: Subscribe & Address */}
          <div>
            <h3 className={headingCls}>Subscribe</h3>
            <p className="text-sm mb-4 leading-relaxed">Claim your complimentary health tips subscription and stay updated on our promotions.</p>
            <div className="flex mb-8 bg-white rounded-full p-1">
              <input type="email" placeholder="Enter your email ID" className="w-full px-4 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400" />
              <button className="bg-lime-accent text-brand-900 px-5 py-2 rounded-full font-bold text-sm hover:bg-lime-accent-dark transition">Subscribe</button>
            </div>

            <h3 className="font-semibold text-white mb-3 text-base">Registered Office Address</h3>
            <p className="text-sm leading-relaxed mb-4">
              MedMarket Solutions Private Limited<br/>
              Software Technology Park, Sector 62,<br/>
              Noida, Uttar Pradesh, India, 201309.
            </p>

            <h3 className="font-semibold text-white mb-2 text-base">Grievance Officer</h3>
            <div className="text-sm">
              <p>Name: Suryansh Chaudhary</p>
              <p>Email: <a href="mailto:grievance@medmarket.in" className="text-lime-accent hover:underline">grievance@medmarket.in</a></p>
            </div>
          </div>

          {/* Column 4: App Download & Contact */}
          <div>
            <h3 className={headingCls}>Download MedMarket App</h3>
            <p className="text-sm mb-4 leading-relaxed">Manage your health with ease. Download our app now and start taking control of your health.</p>

            <div className="flex gap-3 mb-8">
              <button className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl hover:bg-white/20 transition flex-1">
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[9px] uppercase leading-none text-brand-100/70">Get it on</div>
                  <div className="text-sm font-bold leading-none mt-1">Google Play</div>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl hover:bg-white/20 transition flex-1">
                <Smartphone className="w-6 h-6" /> {/* 🚀 FIX: Used Smartphone instead of Apple */}
                <div className="text-left">
                  <div className="text-[9px] uppercase leading-none text-brand-100/70">Download on the</div>
                  <div className="text-sm font-bold leading-none mt-1">App Store</div>
                </div>
              </button>
            </div>

            <h3 className={headingCls}>Contact Us</h3>
            <p className="text-sm mb-4 leading-relaxed">Our customer representative team is available 7 days a week from 8:00 am - 10:00 pm.</p>
            <div className="space-y-2 text-sm font-semibold text-white">
              <p className="flex justify-between"><span>Support:</span> <a href="mailto:support@medmarket.in" className="text-lime-accent font-medium hover:underline">support@medmarket.in</a></p>
              <p className="flex justify-between"><span>Phone:</span> <span className="font-medium">+91 88698 93378</span></p>
            </div>
          </div>

        </div>

        {/* 🌟 BOTTOM BAR */}
        <div className="relative border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-brand-100/60 text-center md:text-left max-w-2xl">
            © 2024 - MedMarket. All rights reserved. Our content is for informational purposes only. <a href="#" className="underline hover:text-white">See additional information</a>.
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-brand-100/60 mr-2">Our Payment Partners</span>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-white rounded text-[10px] font-black text-blue-800">VISA</span>
              <span className="px-2.5 py-1 bg-white rounded text-[10px] font-black text-red-600">MasterCard</span>
              <span className="px-2.5 py-1 bg-white rounded text-[10px] font-black text-slate-800">UPI</span>
              <span className="px-2.5 py-1 bg-white rounded text-[10px] font-black text-sky-600">Paytm</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
