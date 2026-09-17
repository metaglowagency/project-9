import { TreePine, Mail, Phone, MapPin, Truck, RefreshCw, Hammer, Ruler, Home as HomeIcon, ShieldCheck, Award } from 'lucide-react';
import { useState } from 'react';
import { useSEO, BASE_URL } from '../hooks/useSEO';

interface InfoPageProps {
  navigate: (path: string) => void;
}

function BackHome({ navigate }: InfoPageProps) {
  return <button onClick={() => navigate('/')} className="text-sm text-stone-500 hover:text-stone-700 mb-6">← Home</button>;
}

function PolicyLayout({ navigate, title, children, canonical }: InfoPageProps & { title: string; children: React.ReactNode; canonical: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <BackHome navigate={navigate} />
      <h1 className="font-serif text-4xl font-bold text-stone-900 mb-3">{title}</h1>
      <p className="text-sm text-stone-500 mb-8">Last updated: 8 September 2026</p>
      <div className="space-y-8 text-stone-600 leading-relaxed">{children}</div>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="font-serif text-xl font-bold text-stone-900 mb-2">{title}</h2>{children}</section>;
}

function PolicyList({ items }: { items: string[] }) {
  return <ul className="list-disc pl-5 space-y-1">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
}

export function AboutPage({ navigate }: InfoPageProps) {
  useSEO({
    title: 'About Mark Atkins | Outdoor Furniture & Carpentry UK',
    description: 'Family-run, London-based outdoor furniture and carpentry business since 2010. Premium rattan sets, loungers, gazebos and bespoke carpentry made for the British garden.',
    canonical: `${BASE_URL}/about`,
    ogImage: 'https://images.pexels.com/photos/7969008/pexels-photo-7969008.jpeg?auto=compress&cs=tinysrgb&w=1200',
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <BackHome navigate={navigate} />
      <p className="text-green-700 text-sm font-medium tracking-widest uppercase mb-3">Our Story</p>
      <h1 className="font-serif text-4xl font-bold text-stone-900 mb-6">About Mark Atkins</h1>
      <div className="prose prose-stone max-w-none space-y-6 text-stone-600 leading-relaxed">
        <div className="grid md:grid-cols-2 gap-4 mb-2">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden">
            <img src="https://images.pexels.com/photos/7969008/pexels-photo-7969008.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Garden patio with wooden furniture" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden">
            <img src="https://images.pexels.com/photos/11637161/pexels-photo-11637161.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Carpenter hand-planing wood" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-lg">Mark Atkins Carpentry was founded in 2010 from a small workshop in London. What began as a one-man operation crafting garden benches has grown into one of the UK's trusted names in premium outdoor furniture.</p>
        <p>We believe garden furniture should be beautiful, comfortable, and built to last. Every product is selected or crafted with those principles in mind, from aluminium and teak dining sets to British-made cushions designed for the weather.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 my-10">
        <div className="rounded-2xl overflow-hidden aspect-[4/3]">
          <img src="https://images.pexels.com/photos/11832851/pexels-photo-11832851.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Wooden garden pergola" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">Bespoke Carpentry, Made for Your Space</h2>
          <p className="text-stone-600 leading-relaxed mb-4">Alongside our ready-to-order collection, we make furniture to order for gardens and interiors. If you need a built-in bench, pergola, planter, dining table, shelving, storage, or another specific carpentry project, tell us what you have in mind.</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-stone-700"><Ruler className="w-4 h-4 text-green-700" /> Measured precisely for your space</div>
            <div className="flex items-center gap-2 text-sm text-stone-700"><Hammer className="w-4 h-4 text-green-700" /> Hand-built with traditional joinery</div>
            <div className="flex items-center gap-2 text-sm text-stone-700"><HomeIcon className="w-4 h-4 text-green-700" /> Indoor or outdoor projects welcome</div>
          </div>
          <button onClick={() => navigate('/contact')} className="self-start px-6 py-3 bg-green-800 text-white rounded-full font-semibold hover:bg-green-900 transition-colors text-sm">Request a bespoke quote</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 my-10">
        <div className="flex flex-col justify-center order-2 md:order-1">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">Our Craftsmanship</h2>
          <p className="text-stone-600 leading-relaxed">Our carpentry heritage means we understand wood, joinery, and construction in a way that most furniture retailers don't. Every frame, joint, and stitch is held to a standard we'd be happy to put in our own gardens.</p>
        </div>
        <div className="rounded-2xl overflow-hidden aspect-[4/3] order-1 md:order-2">
          <img src="https://images.pexels.com/photos/13005858/pexels-photo-13005858.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Craftsman shaping wooden planks" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="bg-stone-50 rounded-2xl p-8 my-10">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-5 text-center">Our Promise to You</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="flex items-start gap-3"><Truck className="w-6 h-6 text-green-700 mt-0.5 shrink-0" /><div><p className="font-semibold text-stone-900 text-sm">Free Shipping</p><p className="text-xs text-stone-500">Fast. Reliable. Trackable</p></div></div>
          <div className="flex items-start gap-3"><ShieldCheck className="w-6 h-6 text-green-700 mt-0.5 shrink-0" /><div><p className="font-semibold text-stone-900 text-sm">2-Year Guarantee</p><p className="text-xs text-stone-500">On all furniture</p></div></div>
          <div className="flex items-start gap-3"><RefreshCw className="w-6 h-6 text-green-700 mt-0.5 shrink-0" /><div><p className="font-semibold text-stone-900 text-sm">15-Day Returns</p><p className="text-xs text-stone-500">On eligible stock items</p></div></div>
          <div className="flex items-start gap-3"><Phone className="w-6 h-6 text-green-700 mt-0.5 shrink-0" /><div><p className="font-semibold text-stone-900 text-sm">Real People</p><p className="text-xs text-stone-500">On the phone, no call centres</p></div></div>
          <div className="flex items-start gap-3"><Award className="w-6 h-6 text-green-700 mt-0.5 shrink-0" /><div><p className="font-semibold text-stone-900 text-sm">Clear Quotations</p><p className="text-xs text-stone-500">Agreed before any work begins</p></div></div>
          <div className="flex items-start gap-3"><Hammer className="w-6 h-6 text-green-700 mt-0.5 shrink-0" /><div><p className="font-semibold text-stone-900 text-sm">Bespoke Builds</p><p className="text-xs text-stone-500">Made to your measurements</p></div></div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage({ navigate }: InfoPageProps) {
  const [sent, setSent] = useState(false);
  useSEO({
    title: 'Contact Us | Mark Atkins Carpentry',
    description: 'Contact Mark Atkins Carpentry for product enquiries, delivery questions, returns, or bespoke carpentry quotes. Phone 07984 230942, email hello@markatkins.co.uk.',
    canonical: `${BASE_URL}/contact`,
  });
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <BackHome navigate={navigate} />
      <h1 className="font-serif text-4xl font-bold text-stone-900 mb-3">Contact Us</h1>
      <p className="text-stone-600 mb-8">We're here to help with products, delivery, orders, returns, and bespoke carpentry for your garden or home.</p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-start gap-3"><Phone className="w-6 h-6 text-green-700 mt-1 shrink-0" /><div><p className="font-semibold text-stone-900">Phone</p><p className="text-stone-600">07984 230942</p><p className="text-sm text-stone-500">Mon-Fri, 9am-5pm</p></div></div>
          <div className="flex items-start gap-3"><Mail className="w-6 h-6 text-green-700 mt-1 shrink-0" /><div><p className="font-semibold text-stone-900">Email</p><p className="text-stone-600">hello@markatkins.co.uk</p><p className="text-sm text-stone-500">We reply within 24 hours</p></div></div>
          <div className="flex items-start gap-3"><MapPin className="w-6 h-6 text-green-700 mt-1 shrink-0" /><div><p className="font-semibold text-stone-900">Address</p><p className="text-stone-600">28 Chester Rd</p><p className="text-stone-600">London N17 6BY, UK</p></div></div>
          <div className="rounded-2xl bg-green-50 border border-green-100 p-5"><p className="font-semibold text-stone-900 mb-1">Have a specific project in mind?</p><p className="text-sm text-stone-600">Send us your measurements, photos, or a rough sketch and we'll help turn it into a practical quote.</p></div>
        </div>
        <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
          {sent ? <div className="text-center py-8"><div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><TreePine className="w-6 h-6 text-green-700" /></div><h3 className="font-semibold text-stone-900 mb-2">Message Sent</h3><p className="text-sm text-stone-600">We'll get back to you within 24 hours.</p></div> : <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4"><h3 className="font-semibold text-stone-900">Ask a question or request a quote</h3><div><label className="block text-sm font-medium text-stone-700 mb-1">Name</label><input type="text" required className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700" /></div><div><label className="block text-sm font-medium text-stone-700 mb-1">Email</label><input type="email" required className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700" /></div><div><label className="block text-sm font-medium text-stone-700 mb-1">Message or project details</label><textarea required rows={5} placeholder="Tell us what you would like made or how we can help" className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700 resize-none" /></div><button type="submit" className="w-full py-3 bg-green-800 text-white rounded-full font-semibold hover:bg-green-900 transition-colors">Send Enquiry</button></form>}
        </div>
      </div>
    </div>
  );
}

export function DeliveryPage({ navigate }: InfoPageProps) {
  useSEO({
    title: 'Shipping & Delivery Policy | Mark Atkins Carpentry',
    description: 'Free UK shipping on eligible orders. Order cut-off 14:00 GMT. Handling 0-2 working days, transit 4-5 working days. Tracking provided. Read our full shipping policy.',
    canonical: `${BASE_URL}/delivery`,
  });
  return (
    <PolicyLayout navigate={navigate} title="Shipping Policy" canonical={`${BASE_URL}/delivery`}>
      <p>At <strong>Mark Atkins</strong>, we aim to provide clear, reliable, and timely delivery throughout the United Kingdom.</p>
      <p>We are a UK-based family-run business specializing in premium outdoor furniture and carpentry products, crafted for the British garden.</p>

      <PolicySection title="Delivery Locations">
        <p>We currently deliver eligible products to <strong>customer addresses within the United Kingdom</strong>.</p>
        <p>Delivery is made directly to the delivery address provided by the customer at checkout.</p>
        <p>Certain products or delivery locations may be subject to specific delivery restrictions or arrangements. Where applicable, these requirements will be communicated to the customer.</p>
      </PolicySection>

      <PolicySection title="Order Cut-Off Time">
        <p>Our daily order cut-off time is <strong>14:00 GMT (Greenwich Mean Time)</strong>, Monday through Friday.</p>
        <p>Orders placed before the daily cut-off time will begin processing according to our standard handling schedule.</p>
        <p>Orders placed after the cut-off time, during weekends, or on UK public holidays will begin processing on the next applicable business day.</p>
      </PolicySection>

      <PolicySection title="Handling and Processing Time">
        <p>Orders are generally prepared for dispatch within <strong>0-2 working days</strong>.</p>
        <p>Handling takes place <strong>Monday through Friday</strong>, excluding UK public holidays.</p>
        <p>The handling period represents the time between the order being placed and the shipment being prepared and handed over to the carrier.</p>
        <p>Some products may require additional preparation due to their size, construction, customization, availability, or delivery requirements. If additional time is required, we will provide the customer with an appropriate update.</p>
      </PolicySection>

      <PolicySection title="Transit and Delivery Time">
        <p>After an order has been dispatched, standard carrier transit time is estimated at <strong>4-5 working days</strong>.</p>
        <p>The total estimated delivery time is therefore approximately <strong>4-7 working days</strong>, including:</p>
        <PolicyList items={[
          'Handling time: 0-2 working days',
          'Transit time: 4-5 working days',
        ]} />
        <p>Delivery estimates are calculated based on the time the order is placed, whether it is placed before or after the daily order cut-off, the applicable handling period, transit time, weekends, and UK public holidays.</p>
        <p>Please note that delivery estimates are estimates only and are not guaranteed delivery dates.</p>
      </PolicySection>

      <PolicySection title="Shipping Costs">
        <p>Any applicable delivery charges will be displayed to the customer during the checkout process before the order is completed.</p>
        <p>Where free delivery or a specific delivery promotion applies, the applicable terms will be displayed on the relevant product page or during checkout.</p>
      </PolicySection>

      <PolicySection title="Order Confirmation and Tracking">
        <p>After placing an order, customers will receive an order confirmation containing the relevant purchase details.</p>
        <p>Once an order has been dispatched, customers may receive a shipping confirmation and tracking information where tracking is available for the selected delivery service.</p>
        <p>Tracking information may take some time to become active after the carrier receives the shipment.</p>
      </PolicySection>

      <PolicySection title="Delivery Carriers">
        <p>Orders may be delivered using established courier, delivery, or freight carriers depending on the product's size, weight, destination, and delivery requirements.</p>
        <p>For larger outdoor furniture, carpentry products, or oversized items, specialized delivery services may be required.</p>
        <p>The carrier may contact the customer where delivery coordination is necessary.</p>
      </PolicySection>

      <PolicySection title="Delivery Delays">
        <p>Estimated delivery times may be affected by circumstances outside our reasonable control, including:</p>
        <PolicyList items={[
          'Carrier disruptions',
          'Severe weather',
          'UK public holidays',
          'High seasonal demand',
          'Transportation delays',
          'Incorrect or incomplete delivery addresses',
          'Remote or difficult-to-access delivery locations',
          'Unexpected operational or logistical issues',
        ]} />
        <p>Where we become aware of a significant delay, we will provide available information and updates where reasonably possible.</p>
      </PolicySection>

      <PolicySection title="Incorrect or Incomplete Addresses">
        <p>Customers are responsible for providing a complete and accurate delivery address at checkout.</p>
        <p>If you notice an error in your delivery information, please contact us as soon as possible.</p>
        <p>We will make reasonable efforts to assist with address changes, but we cannot guarantee that changes can be made once an order has entered processing or has been dispatched.</p>
        <p>Mark Atkins is not responsible for delays, failed deliveries, additional delivery charges, or returned shipments resulting from incorrect or incomplete address information provided by the customer.</p>
      </PolicySection>

      <PolicySection title="Order Changes and Cancellations">
        <p>Customers should contact us as soon as possible if they wish to change or cancel an order.</p>
        <p>We will make reasonable efforts to accommodate requests, but changes or cancellations cannot be guaranteed once an order has entered processing, been prepared for dispatch, or has already been shipped.</p>
        <p>Orders that have already been dispatched may be subject to our applicable Return and Refund Policy.</p>
      </PolicySection>

      <PolicySection title="Multiple Shipments">
        <p>Orders containing multiple products may occasionally be shipped separately depending on product availability, warehouse or production location, product size, or carrier requirements.</p>
        <p>If an order is divided into multiple shipments, customers may receive separate delivery or tracking information.</p>
        <p>Any applicable delivery charges will be communicated during checkout or as otherwise stated at the time of purchase.</p>
      </PolicySection>

      <PolicySection title="Large and Oversized Products">
        <p>Certain products, particularly larger outdoor furniture, gazebos, carpentry products, and other bulky items, may require specialized or scheduled delivery.</p>
        <p>For these deliveries:</p>
        <PolicyList items={[
          'The carrier may contact the customer to arrange delivery.',
          'A valid telephone number may be required.',
          'An adult may need to be present to receive the delivery.',
          'Delivery may be made to the customer\'s property or another accessible delivery point depending on the carrier\'s service.',
          'Customers should inspect the shipment upon delivery where reasonably possible.',
        ]} />
        <p>Product-specific delivery information may be provided on the relevant product page or communicated to the customer after the order has been placed.</p>
      </PolicySection>

      <PolicySection title="Lost or Delayed Orders">
        <p>If tracking information indicates that an order has stopped moving for an extended period, or if an order appears to have been lost during transit, please contact us with your order number.</p>
        <p>We will review the shipment and, where appropriate, work with the delivery carrier to investigate the issue.</p>
        <p>A carrier investigation may be required before a replacement, refund, or other resolution can be provided.</p>
      </PolicySection>

      <PolicySection title="Damaged Orders">
        <p>Customers should inspect their delivery and products as soon as reasonably possible after receipt.</p>
        <p>If an order arrives damaged, please contact us promptly and provide, where possible:</p>
        <PolicyList items={[
          'Your order number',
          'A description of the damage',
          'Photographs of the damaged product',
          'Photographs of the packaging',
          'Photographs of the shipping label',
          'Any available delivery documentation',
        ]} />
        <p>Please retain the original product and packaging while the matter is being reviewed, as these may be required for a carrier or product investigation.</p>
        <p>Mark Atkins will assess the circumstances and work with the customer toward an appropriate resolution in accordance with our applicable policies.</p>
      </PolicySection>

      <PolicySection title="Delivered but Not Received">
        <p>If tracking information shows that an order has been delivered but you cannot locate it, we recommend that you:</p>
        <PolicyList items={[
          'Check around your property and any designated delivery location.',
          'Check with household members or others who may have accepted the delivery.',
          'Check for any delivery notice or photograph provided by the carrier.',
          'Contact the delivery carrier where appropriate.',
          'Contact Mark Atkins if the order remains missing.',
        ]} />
        <p>We may request additional information or require a carrier investigation before a resolution can be provided.</p>
      </PolicySection>

      <PolicySection title="Contact Us">
        <p>For questions regarding delivery, shipping, or an existing order, please contact us:</p>
        <p><strong>Mark Atkins</strong> — Outdoor Furniture &amp; Carpentry</p>
        <p>Website: markatkinscarpentry.co.uk<br />Email: hello@markatkins.co.uk<br />Address: 28 Chester Rd, London N17 6BY, UK</p>
        <p>We are a family-run, UK-based business dedicated to providing premium outdoor furniture and carpentry products crafted for the British garden.</p>
      </PolicySection>
    </PolicyLayout>
  );
}

export function PrivacyPage({ navigate }: InfoPageProps) {
  useSEO({
    title: 'Privacy Policy | Mark Atkins Carpentry',
    description: 'How Mark Atkins Carpentry collects, uses, and protects your personal information when you browse, contact us, or place an order.',
    canonical: `${BASE_URL}/privacy`,
  });
  return (
    <PolicyLayout navigate={navigate} title="Privacy Policy" canonical={`${BASE_URL}/privacy`}>
      <p>Mark Atkins Carpentry respects your privacy. This policy explains what we collect when you browse, contact us, or place an order, how we use it, and the choices available to you.</p>
      <PolicySection title="Information we collect"><p>We may collect your name, email address, phone number, billing and delivery address, order details, messages, and information about returns or warranty requests. We may also receive technical information such as your browser, device, pages visited, and cart activity.</p></PolicySection>
      <PolicySection title="How we use your information"><PolicyList items={[
        'Process, deliver, and support your orders',
        'Send order confirmations, tracking, and service updates',
        'Handle returns, refunds, bespoke enquiries, and customer support',
        'Prevent fraud and protect the website',
        'Improve our products and shopping experience',
        'Send marketing only where permitted and with appropriate consent',
        'Meet accounting, tax, legal, and regulatory duties',
      ]} /></PolicySection>
      <PolicySection title="Payments and trusted service providers"><p>Payments are handled by the payment provider available at checkout. We do not ask for or store complete card details on this website. We may share the information needed to fulfil your order with payment providers, delivery carriers, hosting and database providers, customer service tools, professional advisers, or authorities where the law requires it. We do not sell your personal information.</p></PolicySection>
      <PolicySection title="Cookies and embedded services"><p>Essential cookies help the cart and secure checkout work. We may use limited analytics or embedded content to improve the site. You can block cookies in your browser, although the cart or checkout may not work correctly as a result. Third-party services have their own privacy policies.</p></PolicySection>
      <PolicySection title="Retention and your rights"><p>We keep order and accounting records for as long as required by law and retain support records only as reasonably necessary. Depending on your circumstances, you may ask to access, correct, delete, or restrict use of your information, or withdraw marketing consent. Contact hello@markatkins.co.uk to make a request.</p></PolicySection>
      <PolicySection title="Security and contact"><p>We use reasonable technical and organisational safeguards, but no online service can guarantee absolute security. For privacy questions or data requests, contact Mark Atkins Carpentry at hello@markatkins.co.uk or 07984 230942.</p></PolicySection>
    </PolicyLayout>
  );
}

export function ReturnsPage({ navigate }: InfoPageProps) {
  useSEO({
    title: 'Returns & Refund Policy | Mark Atkins Carpentry',
    description: '15-day returns for eligible products. No restocking fees. Refunds processed within 15 days. Read our full returns and refund policy for conditions and contact details.',
    canonical: `${BASE_URL}/returns`,
  });
  return (
    <PolicyLayout navigate={navigate} title="Returns & Refund Policy" canonical={`${BASE_URL}/returns`}>
      <p>At <strong>Mark Atkins</strong>, we want our customers to be satisfied with their purchases. If you need to return a product or request an exchange, we aim to make the process clear and straightforward.</p>
      <p>This Returns &amp; Refund Policy applies to purchases made in the <strong>United Kingdom</strong>.</p>

      <PolicySection title="Returns">
        <p>We accept returns for both <strong>defective and non-defective products</strong>, provided that the product meets the return conditions outlined below.</p>
        <p>Customers may request a return within <strong>15 days of receiving their order</strong>.</p>
        <p>To be eligible for a return, the product must be:</p>
        <PolicyList items={[
          'New and unused',
          'In its original condition',
          'Complete with all original components, accessories, and packaging where applicable',
          'Accompanied by proof of purchase or the relevant order information',
        ]} />
        <p>Products that have been used, damaged after delivery, altered, assembled incorrectly, or otherwise returned in a condition that is not new may not be eligible for a return.</p>
      </PolicySection>

      <PolicySection title="Return Period">
        <p>Customers have <strong>15 days</strong> from the date of delivery to request a return.</p>
        <p>Returns requested after the 15-day period may not be accepted unless otherwise required by applicable UK consumer law.</p>
      </PolicySection>

      <PolicySection title="Return Method">
        <p>Returns must be made <strong>in store</strong>.</p>
        <p>Customers should contact Mark Atkins before returning a product to confirm the return procedure and any information required.</p>
        <p>Please bring the product together with the relevant proof of purchase or order information.</p>
      </PolicySection>

      <PolicySection title="Exchanges">
        <p>We <strong>accept exchanges</strong> for eligible products.</p>
        <p>Exchange requests must be made within <strong>15 days of delivery</strong>, and the product must meet the same condition requirements applicable to returns.</p>
        <p>An exchange may be subject to product availability. If the requested replacement product is unavailable, we may offer an alternative resolution where appropriate.</p>
      </PolicySection>

      <PolicySection title="Defective or Damaged Products">
        <p>If a product is defective, customers should contact us as soon as possible after discovering the issue.</p>
        <p>Please provide:</p>
        <PolicyList items={[
          'Your order or purchase information',
          'A description of the defect',
          'Photographs or other relevant information where appropriate',
        ]} />
        <p>We will assess the issue and determine the appropriate resolution in accordance with applicable UK consumer protection laws and this policy.</p>
        <p>Depending on the circumstances, an eligible defective product may qualify for a repair, replacement, exchange, or refund.</p>
      </PolicySection>

      <PolicySection title="Non-Defective Products">
        <p>Returns of non-defective products are accepted within the <strong>15-day return period</strong>, provided that the product is returned <strong>new and unused</strong> and meets the applicable return conditions.</p>
        <p>Products that show signs of use, damage, modification, or improper handling may not qualify for a return.</p>
      </PolicySection>

      <PolicySection title="Restocking Fees">
        <p><strong>No restocking fees are charged</strong> for eligible returns.</p>
      </PolicySection>

      <PolicySection title="Refunds">
        <p>Once an eligible return has been received and assessed, refunds will be processed within <strong>15 days</strong>.</p>
        <p>The refund will generally be issued using the original payment method, unless otherwise agreed or required by applicable law.</p>
        <p>Please note that the time required for the refunded amount to appear in the customer's account may depend on the customer's bank or payment provider.</p>
      </PolicySection>

      <PolicySection title="Return Eligibility">
        <p>A return may be refused where the product:</p>
        <PolicyList items={[
          'Is not in new condition',
          'Shows signs of use beyond what is reasonably necessary to inspect the product',
          'Has been damaged after delivery',
          'Has been modified or altered',
          'Is missing components, accessories, or other included items',
          'Is returned outside the applicable 15-day period, subject to statutory rights',
        ]} />
        <p>Nothing in this policy affects any rights that customers may have under applicable UK consumer protection legislation.</p>
      </PolicySection>

      <PolicySection title="Consumer Rights">
        <p>This policy does not limit or exclude any statutory rights available to consumers under applicable UK law.</p>
        <p>Where a product is faulty, not as described, or otherwise does not meet the requirements imposed by applicable consumer protection legislation, customers may have additional legal rights regardless of the terms of this voluntary returns policy.</p>
      </PolicySection>

      <PolicySection title="How to Contact Us">
        <p>For return, exchange, or refund enquiries, please contact:</p>
        <p><strong>Mark Atkins</strong> — Outdoor Furniture &amp; Carpentry</p>
        <p>Website: markatkinscarpentry.co.uk<br />Returns Policy: markatkinscarpentry.co.uk/returns<br />Email: hello@markatkins.co.uk<br />Address: 28 Chester Rd, London N17 6BY, UK</p>
        <p>We are a family-run, UK-based business dedicated to providing premium outdoor furniture and carpentry products crafted for the British garden.</p>
      </PolicySection>
    </PolicyLayout>
  );
}

export function TermsPage({ navigate }: InfoPageProps) {
  useSEO({
    title: 'Terms of Service | Mark Atkins Carpentry',
    description: 'Terms governing the use of the Mark Atkins Carpentry website and how orders, products, delivery, returns, and bespoke work are handled.',
    canonical: `${BASE_URL}/terms`,
  });
  return (
    <PolicyLayout navigate={navigate} title="Terms of Service" canonical={`${BASE_URL}/terms`}>
      <p>These terms explain how you may use the Mark Atkins Carpentry website and how orders, products, delivery, returns, and bespoke work are handled. By using the site or placing an order, you agree to these terms. Your statutory consumer rights are not affected.</p>
      <PolicySection title="Using the website"><p>You must provide accurate information, use the website lawfully, and avoid interfering with its security or operation. We may restrict access where necessary to protect customers, the business, or the website.</p></PolicySection>
      <PolicySection title="Products, prices, and availability"><p>We describe products and prices as accurately as reasonably possible, but colours and finishes can vary by screen, material, and batch. We may correct genuine errors, update availability, limit quantities, or discontinue products. An order is accepted once payment has been authorised and we have issued an order confirmation.</p></PolicySection>
      <PolicySection title="Orders and payment"><p>You confirm that your checkout information is accurate and that you are authorised to use the chosen payment method. We may pause or cancel an order if payment cannot be verified, information appears incorrect, fraud is suspected, stock is unavailable, or a clear pricing error has occurred.</p></PolicySection>
      <PolicySection title="Bespoke carpentry"><p>Bespoke work is agreed through a written quotation covering the design, measurements, materials, finish, price, deposit or payment schedule, and expected timing. We may need a site visit or additional measurements. Changes requested after approval may change the price or completion date. Bespoke work is not normally cancellable or returnable after materials or construction have been committed, except where required by law or where the work is faulty.</p></PolicySection>
      <PolicySection title="Delivery, returns, and guarantee"><p>Our Shipping and Returns &amp; Refund policies form part of these terms. Delivery estimates are guidance and may be affected by carriers, weather, public holidays, or incorrect customer information. Eligible furniture is covered by our stated guarantee, subject to its exclusions.</p></PolicySection>
      <PolicySection title="Safety and intellectual property"><p>Use products according to their instructions, care guidance, and intended purpose. Website text, images, branding, design, and code belong to Mark Atkins Carpentry or their respective owners and may not be copied commercially without permission.</p></PolicySection>
      <PolicySection title="Website availability and liability"><p>We aim to keep the site accurate and available but cannot promise uninterrupted access. Nothing in these terms excludes liability that cannot legally be excluded. To the extent permitted by law, our liability for a product or transaction will not exceed the amount paid for that product or service.</p></PolicySection>
      <PolicySection title="Contact and changes"><p>We may update these terms when our services or legal obligations change. The latest version will appear on this page. Questions can be sent to hello@markatkins.co.uk or 07984 230942.</p></PolicySection>
    </PolicyLayout>
  );
}
