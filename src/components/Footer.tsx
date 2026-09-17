import { Mail, Phone, MapPin, Truck, ShieldCheck, LockKeyhole, Hammer } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export function Footer({ navigate }: FooterProps) {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      {/* Trust badges */}
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <Truck className="w-7 h-7 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-white">Free UK Delivery</p>
              <p className="text-xs text-stone-400">Fast, tracked courier shipping</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <ShieldCheck className="w-7 h-7 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-white">2-Year Guarantee</p>
              <p className="text-xs text-stone-400">British craftsmanship warranty</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <LockKeyhole className="w-7 h-7 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-white">Encrypted Checkout</p>
              <p className="text-xs text-stone-400">Direct 256-bit secure payment</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <Hammer className="w-7 h-7 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-white">Bespoke Joinery</p>
              <p className="text-xs text-stone-400">Made for your garden space</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-5 group">
            <img src="/Mark_Atkins_Logo_2_-_Nature_Inspired.png" alt="Mark Atkins Carpentry" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform" />
            <div className="text-left">
              <p className="font-serif text-lg font-bold text-white leading-none">Mark Atkins</p>
              <p className="text-[10px] text-stone-500 tracking-widest uppercase mt-1">Outdoor Furniture & Carpentry</p>
            </div>
          </button>
          <p className="text-sm text-stone-400 leading-relaxed">
            Premium outdoor furniture and carpentry products, crafted for the British garden. Family-run, UK-based, built to last.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => navigate('/shop')} className="hover:text-green-500 transition-colors">All Products</button></li>
            <li><button onClick={() => navigate('/shop?category=Garden+Furniture+Sets')} className="hover:text-green-500 transition-colors">Furniture Sets</button></li>
            <li><button onClick={() => navigate('/shop?category=Loungers+%26+Chairs')} className="hover:text-green-500 transition-colors">Loungers & Chairs</button></li>
            <li><button onClick={() => navigate('/shop?category=Garden+Cushions')} className="hover:text-green-500 transition-colors">Cushions</button></li>
            <li><button onClick={() => navigate('/shop?category=Gazebos')} className="hover:text-green-500 transition-colors">Gazebos</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Customer Service</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => navigate('/contact')} className="hover:text-green-500 transition-colors">Contact Us</button></li>

            <li><button onClick={() => navigate('/delivery')} className="hover:text-green-500 transition-colors">Shipping Policy</button></li>
            <li><button onClick={() => navigate('/returns')} className="hover:text-green-500 transition-colors">Returns Policy</button></li>
            <li><button onClick={() => navigate('/about')} className="hover:text-green-500 transition-colors">About Us</button></li>
            <li><button onClick={() => navigate('/privacy')} className="hover:text-green-500 transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => navigate('/terms')} className="hover:text-green-500 transition-colors">Terms of Service</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Get in Touch</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <span>07984 230942</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <span>hello@markatkins.co.uk</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <span>28 Chester Rd, London N17 6BY, UK</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>&copy; {new Date().getFullYear()} Mark Atkins Carpentry. All rights reserved.</p>
          <div className="flex items-center gap-2" aria-label="Payment methods accepted at checkout">
            <span className="text-stone-400 mr-1">Payment methods</span>
            <span className="rounded bg-white px-2 py-1 font-bold tracking-tight text-[#1a1f71]">VISA</span>
            <span className="rounded bg-white px-2 py-1 font-bold tracking-tight text-[#eb001b]">MC</span>
            <span className="rounded bg-white px-2 py-1 font-bold tracking-tight text-[#2e77bc]">AMEX</span>
            <span className="rounded bg-white px-2 py-1 font-bold tracking-tight text-[#003087]">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
