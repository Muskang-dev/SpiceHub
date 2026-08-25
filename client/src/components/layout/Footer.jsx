import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="font-head text-2xl text-[#e05c2a] mb-3">🌶 SpiceHub</div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">Authentic Indian cuisine delivered to your door. Fresh ingredients, bold flavours, every time.</p>
          <div className="flex gap-3">
            {['instagram','facebook-f','twitter'].map(s => (
              <a key={s} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#e05c2a] transition-colors"><i className={`fab fa-${s} text-sm`}></i></a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2">
            {[['/', 'Home'],['/menu','Menu'],['/bookings','Reserve Table'],['/orders','My Orders']].map(([to, label]) => (
              <li key={to}><Link to={to} className="text-gray-400 text-sm hover:text-[#e05c2a] transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-center gap-2"><i className="fas fa-map-marker-alt text-[#e05c2a] w-4"></i>42, Spice Lane, New Delhi</li>
            <li className="flex items-center gap-2"><i className="fas fa-phone text-[#e05c2a] w-4"></i>+91 98765 43210</li>
            <li className="flex items-center gap-2"><i className="fas fa-envelope text-[#e05c2a] w-4"></i>hello@spicehub.in</li>
            <li className="flex items-center gap-2"><i className="fas fa-clock text-[#e05c2a] w-4"></i>Mon–Sun: 11am – 11pm</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-gray-500 text-xs">
        © {new Date().getFullYear()} SpiceHub. All rights reserved.
      </div>
    </footer>
  );
}
