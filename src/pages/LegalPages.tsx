// LegalPages.tsx — Privacy, Terms, Refunds, Shipping policy pages
// Each exported as a named component; all share the same layout shell
import React from 'react';
import { Link } from 'react-router-dom';

const ACCENT = '#2E5BFF';

const LAST_UPDATED = '25 February 2026';

// ─────────────────────────────────────────
// Shared layout shell
// ─────────────────────────────────────────
interface LegalShellProps {
  badge: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const LegalShell: React.FC<LegalShellProps> = ({ badge, title, subtitle, children }) => (
  <div className="bg-[#FAFAF8] min-h-screen">
    {/* Header */}
    <section className="py-20 md:py-28 bg-white border-b border-[#0D0D10]/[0.06]">
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        <p className="text-xs font-black uppercase tracking-[0.5em] mb-4" style={{ color: ACCENT }}>"{badge}"</p>
        <h1
          className="font-black text-[#0D0D10] leading-[1.0] tracking-[-0.04em] mb-4"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-[#1A1A1A]/55 font-medium">{subtitle}</p>
        )}
        <p className="text-sm text-[#1A1A1A]/40 font-semibold mt-3">Last updated: {LAST_UPDATED}</p>
      </div>
    </section>

    {/* Content */}
    <section className="py-12 md:py-20">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        <div className="prose-saltd space-y-10">
          {children}
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-[#0D0D10]/[0.07] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <p className="text-sm text-[#1A1A1A]/45 font-semibold">
            Questions? Email us at{' '}
            <a href="mailto:timepassventures@gmail.com" className="underline" style={{ color: ACCENT }}>
              timepassventures@gmail.com
            </a>
          </p>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'Privacy', path: '/privacy' },
              { label: 'Terms', path: '/terms' },
              { label: 'Refunds', path: '/refunds' },
              { label: 'Shipping', path: '/shipping' },
            ].map(l => (
              <Link
                key={l.path}
                to={l.path}
                className="text-xs font-black uppercase tracking-[0.3em] text-[#1A1A1A]/40 hover:text-[#0D0D10] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  </div>
);

// ─────────────────────────────────────────
// Shared prose helpers
// ─────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-xl font-black text-[#0D0D10] tracking-[-0.02em] mb-4">{title}</h2>
    <div className="text-base text-[#1A1A1A]/65 leading-relaxed font-medium space-y-3">{children}</div>
  </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full mt-[9px] flex-shrink-0" style={{ background: ACCENT }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

// ─────────────────────────────────────────
// Privacy Policy
// ─────────────────────────────────────────
export const PrivacyPage: React.FC = () => (
  <LegalShell badge="Legal" title="Privacy Policy" subtitle="How Aurevia Ventures collects, uses, and protects your personal information.">

    <p className="text-base text-[#1A1A1A]/65 leading-relaxed font-medium -mt-4">
      This Privacy Policy explains how <strong className="text-[#0D0D10]/80">Aurevia Ventures</strong> ("Company", "we", "us", or "our") collects, uses, stores, and protects your personal information when you access or use the website, products, or services of <strong className="text-[#0D0D10]/80">SALTD.</strong> (the "Platform"). By accessing or using our Platform, you agree to this Privacy Policy.
    </p>

    <Section title="1. Scope and Applicability">
      <p>This Policy applies to individuals who visit the SALTD. website, purchase SALTD. products, subscribe to marketing communications, contact customer support, or participate in promotions or campaigns.</p>
      <p>This Privacy Policy is drafted in accordance with applicable Indian laws, including the Information Technology Act, 2000 and relevant data protection rules.</p>
    </Section>

    <Section title="2. Information We Collect">
      <p><strong className="text-[#0D0D10]/80">A. Information You Provide</strong></p>
      <BulletList items={['Full name', 'Email address', 'Phone number', 'Billing and shipping address', 'Order details', 'Feedback, reviews, and survey responses', 'Customer service communications']} />
      <p className="mt-3"><strong className="text-[#0D0D10]/80">B. Information Collected Automatically</strong></p>
      <p>When you visit the SALTD. website, we may collect IP address, device and browser information, pages visited, time spent on pages, referring URLs, and cookies and tracking data.</p>
      <p><strong className="text-[#0D0D10]/80">C. Payment Information</strong></p>
      <p>Payments are processed via secure third-party payment gateways that comply with industry security standards (such as PCI-DSS). Aurevia Ventures does not store full credit or debit card details on its servers.</p>
    </Section>

    <Section title="3. How We Use Your Information">
      <p>We use personal information to process and fulfil orders, provide shipping and delivery updates, respond to customer queries, improve website functionality and user experience, analyse performance and usage trends, send marketing communications (if you opt in), prevent fraud and secure our platform, and comply with legal obligations.</p>
      <p className="font-bold text-[#0D0D10]/75">We do not sell or trade personal information.</p>
    </Section>

    <Section title="4. Marketing Communications">
      <p>If you subscribe to receive updates from SALTD., we may send product launches, special offers, and brand updates. You may unsubscribe at any time using the link in our emails. Transactional communications such as order confirmations and shipping updates will continue as necessary.</p>
    </Section>

    <Section title="5. Cookies and Tracking Technologies">
      <p>We use cookies to enable shopping cart functionality, remember user preferences, analyse traffic and website performance, and improve marketing effectiveness. You may disable cookies through your browser settings. However, some website features may not function properly if cookies are disabled. We may use third-party analytics tools (such as Google Analytics) to collect anonymised usage data.</p>
    </Section>

    <Section title="6. Sharing of Information">
      <p>We may share personal information with trusted third parties strictly for operational purposes, including payment processors, shipping and logistics providers, IT and hosting service providers, marketing and analytics partners, and legal authorities when required by law. All partners are contractually obligated to safeguard your data. We do not rent, sell, or commercially exploit personal data.</p>
    </Section>

    <Section title="7. Data Security">
      <p>We implement reasonable technical and organizational safeguards, including SSL encryption, secure hosting infrastructure, restricted access to sensitive data, and regular security monitoring. While we take strong precautions, no digital system can guarantee absolute security.</p>
    </Section>

    <Section title="8. Data Retention">
      <p>We retain personal information only as long as necessary to complete transactions, comply with tax and legal requirements, resolve disputes, and prevent fraud. When no longer required, information is securely deleted or anonymized.</p>
    </Section>

    <Section title="9. Your Rights">
      <p>Subject to applicable law, you may request access to your personal data, request correction of inaccurate data, request deletion (subject to legal obligations), and withdraw consent for marketing communications. To exercise these rights, contact us using the details below.</p>
    </Section>

    <Section title="10. Third-Party Links">
      <p>The SALTD. website may contain links to third-party websites. Aurevia Ventures is not responsible for the privacy practices of external platforms. We encourage reviewing their privacy policies separately.</p>
    </Section>

    <Section title="11. Children's Privacy">
      <p>SALTD. is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors. If such information is identified, it will be deleted promptly.</p>
    </Section>

    <Section title="12. Business Transfers">
      <p>In the event of a merger, acquisition, restructuring, or sale involving Aurevia Ventures, user information may be transferred as part of business assets. Your information will continue to be protected under this Privacy Policy.</p>
    </Section>

    <Section title="13. Policy Updates">
      <p>We may update this Privacy Policy periodically. Changes will be reflected by revising the "Last Updated" date. Continued use of the Platform after updates constitutes acceptance of the revised Policy.</p>
    </Section>

    <Section title="14. Contact & Grievance Redressal">
      <p><strong className="text-[#0D0D10]/80">Company Name:</strong> Aurevia Ventures<br />
      <strong className="text-[#0D0D10]/80">Brand:</strong> SALTD.<br />
      <strong className="text-[#0D0D10]/80">Registered Address:</strong> South City 2, Gurgaon, Haryana<br />
      <strong className="text-[#0D0D10]/80">Email:</strong> timepassventures@gmail.com</p>
      <p>We aim to respond to grievances within 30 days or as required by applicable law.</p>
    </Section>

  </LegalShell>
);

// ─────────────────────────────────────────
// Terms & Conditions
// ─────────────────────────────────────────
export const TermsPage: React.FC = () => (
  <LegalShell badge="Legal" title="Terms & Conditions" subtitle="Please read these terms carefully before using the website or purchasing products from SALTD.">

    <p className="text-base text-[#1A1A1A]/65 leading-relaxed font-medium -mt-4">
      This document is an electronic record in terms of the Information Technology Act, 2000. By accessing, browsing, or purchasing from the website operated under the brand <strong className="text-[#0D0D10]/80">SALTD.</strong>, owned by <strong className="text-[#0D0D10]/80">Aurevia Ventures</strong>, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Platform.
    </p>

    <Section title="1. Eligibility">
      <p>You must be at least 18 years old and legally capable of entering into binding contracts under Indian law to use this website. If you are under 18, you may use the website only under supervision of a parent or legal guardian.</p>
    </Section>

    <Section title="2. Amendments">
      <p>We reserve the right to update or modify these Terms at any time. Changes will be effective immediately upon posting. Continued use of the website constitutes acceptance of revised Terms.</p>
    </Section>

    <Section title="3. Products & Usage">
      <BulletList items={[
        'SALTD. products are intended for personal use only.',
        'Resale, redistribution, or commercial exploitation without written consent is prohibited.',
        'Product images are for representation purposes; packaging and appearance may vary.',
        'Prices and availability are subject to change without prior notice.',
      ]} />
      <p className="mt-3">SALTD. products are dietary supplements and are not intended to diagnose, treat, cure, or prevent any disease.</p>
    </Section>

    <Section title="4. Health Disclaimer">
      <p>Information provided on the website is for informational purposes only. It is not medical advice. Consult a qualified healthcare professional before using any supplement, especially if you have a medical condition, are pregnant or nursing, are taking medication, or have sodium restrictions. The Company is not liable for misuse of products.</p>
    </Section>

    <Section title="5. Orders & Payment">
      <p>We accept payments through approved payment gateways including UPI, debit/credit cards, net banking, wallets, and other available options. All prices are inclusive of applicable taxes unless stated otherwise.</p>
      <p>We reserve the right to refuse or cancel any order, limit quantities purchased, or cancel orders due to pricing errors. If payment is charged and order is cancelled, the amount will be refunded as per our refund policy.</p>
    </Section>

    <Section title="6. Shipping & Delivery">
      <p>Delivery timelines are estimates and may vary. Delays due to logistics, weather, or external factors are beyond our control. Risk of loss transfers upon delivery. Detailed shipping terms are available in our Shipping Policy.</p>
    </Section>

    <Section title="7. Account Responsibility">
      <p>If you create an account, you are responsible for maintaining confidentiality of login credentials, agree to provide accurate information, and must notify us immediately of unauthorized use. We may suspend accounts for suspected fraud or policy violations.</p>
    </Section>

    <Section title="8. Acceptable Use">
      <p>You agree not to engage in illegal activities, attempt unauthorized access to systems, upload malicious software, post harmful or defamatory content, or interfere with website functionality. Violation may result in account termination and legal action.</p>
    </Section>

    <Section title="9. Intellectual Property">
      <p>All content on the SALTD. website including logos, product names, text, graphics, designs, and images are owned by Aurevia Ventures or licensed to us. Unauthorized reproduction or use is prohibited.</p>
    </Section>

    <Section title="10. Warranty Disclaimer">
      <p>Products and services are provided "as is" without warranties of any kind. We do not guarantee uninterrupted website availability, error-free functionality, or specific health outcomes. To the fullest extent permitted by law, we disclaim all implied warranties.</p>
    </Section>

    <Section title="11. Limitation of Liability">
      <p>To the maximum extent permitted by law, Aurevia Ventures shall not be liable for indirect or consequential damages, loss of profits, loss of data, or business interruption. Total liability shall not exceed the amount paid by you for the product giving rise to the claim.</p>
    </Section>

    <Section title="12. Indemnification">
      <p>You agree to indemnify and hold harmless Aurevia Ventures, its directors, employees, and affiliates from any claims, damages, or expenses arising from violation of these Terms, misuse of the website, or misuse of products.</p>
    </Section>

    <Section title="13. Force Majeure">
      <p>We are not liable for failure or delay caused by events beyond our reasonable control, including natural disasters, strikes, internet outages, governmental actions, or supply chain disruptions.</p>
    </Section>

    <Section title="14. Governing Law & Jurisdiction">
      <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts located in Gurgaon, Haryana.</p>
    </Section>

    <Section title="15. Contact Details">
      <p><strong className="text-[#0D0D10]/80">Company Name:</strong> Aurevia Ventures<br />
      <strong className="text-[#0D0D10]/80">Brand:</strong> SALTD.<br />
      <strong className="text-[#0D0D10]/80">Registered Address:</strong> South City 2, Gurgaon, Haryana<br />
      <strong className="text-[#0D0D10]/80">Email:</strong> timepassventures@gmail.com</p>
      <p>We aim to respond to grievances within 30 days or as required by law.</p>
    </Section>

  </LegalShell>
);

// ─────────────────────────────────────────
// Refunds & Cancellation Policy
// ─────────────────────────────────────────
export const RefundsPage: React.FC = () => (
  <LegalShell badge="Legal" title="Refunds & Cancellation Policy" subtitle="For purchases made through the SALTD. website.">

    <Section title="1. Order Cancellation Policy">
      <p>You may request cancellation <strong className="text-[#0D0D10]/80">only if your order has not yet been shipped.</strong></p>
      <p>To request cancellation, email us at timepassventures@gmail.com with your Order ID and registered contact details. If the order has not been dispatched, we will cancel it and initiate a refund. Once an order has been shipped, it cannot be cancelled.</p>
    </Section>

    <Section title="2. Return Policy">
      <p>Due to the nature of our products (consumable health supplements), we <strong className="text-[#0D0D10]/80">do not accept returns</strong> except in the following cases:</p>
      <BulletList items={[
        'Product damaged during transit',
        'Incorrect product delivered',
        'Manufacturing defect',
        'Tampered packaging upon delivery',
      ]} />
      <p className="mt-3">We do not accept returns for change of mind, taste preference, opened or used products, personal intolerance after use, or delayed delivery caused by logistics partners.</p>
    </Section>

    <Section title="3. Reporting a Damaged or Incorrect Product">
      <p>If you receive a damaged, defective, or incorrect product, you must notify us within <strong className="text-[#0D0D10]/80">48 hours of delivery</strong>. Please email your Order ID, clear photos of outer packaging and the product, and a description of the issue. Requests made after 48 hours may not be eligible.</p>
    </Section>

    <Section title="4. Return Conditions (If Approved)">
      <p>To qualify for return approval, the product must be unused, seal must be intact, original packaging must be preserved, and batch number and labels must be clearly visible. We reserve the right to reject returns that do not meet these conditions.</p>
    </Section>

    <Section title="5. Refund Process">
      <p>Once we receive and inspect the returned product, you will be notified of approval or rejection. If approved:</p>
      <BulletList items={[
        'Prepaid orders: Refunded within 5–7 business days to original payment method',
        'COD orders: Refunded within 7–14 business days via bank transfer',
      ]} />
      <p className="mt-2">Refund timelines may vary depending on banking partners.</p>
    </Section>

    <Section title="6. Replacement Policy">
      <p>In eligible cases, customers may choose a replacement product (subject to stock availability) or a refund. Replacement shipping charges (if any) will be borne by SALTD. only if the issue is validated.</p>
    </Section>

    <Section title="7. Non-Returnable Items">
      <p>The following are strictly non-returnable:</p>
      <BulletList items={[
        'Opened sachets or tubs',
        'Products without original packaging',
        'Products returned without approval',
        'Promotional / free items',
      ]} />
    </Section>

    <Section title="8. Refund Delays">
      <p>If you have not received your refund within the stated timeline, first check your bank statement, then contact your payment provider, and then contact us at timepassventures@gmail.com.</p>
    </Section>

    <Section title="9. Fraud Prevention">
      <p>We reserve the right to deny refund requests in cases of repeated abuse, limit COD options for customers with high refusal rates, and investigate suspicious claims.</p>
    </Section>

    <Section title="10. Contact Details">
      <p><strong className="text-[#0D0D10]/80">Company Name:</strong> Aurevia Ventures<br />
      <strong className="text-[#0D0D10]/80">Brand:</strong> SALTD.<br />
      <strong className="text-[#0D0D10]/80">Email:</strong> timepassventures@gmail.com</p>
    </Section>

  </LegalShell>
);

// ─────────────────────────────────────────
// Shipping Policy
// ─────────────────────────────────────────
export const ShippingPage: React.FC = () => (
  <LegalShell badge="Legal" title="Shipping Policy" subtitle="How orders placed on the SALTD. website are processed and delivered.">

    <Section title="1. Order Confirmation">
      <p>Once you place an order, you will receive an order confirmation email acknowledging receipt. This confirmation does not signify final acceptance of your order. We reserve the right to cancel or refuse orders due to stock issues, pricing errors, or suspected fraud.</p>
      <p>For Cash on Delivery (COD) orders, additional verification via SMS, call, or email may be required before processing.</p>
    </Section>

    <Section title="2. Order Processing">
      <p>Orders are typically processed within <strong className="text-[#0D0D10]/80">1–3 business days</strong> (excluding Sundays and public holidays). Orders may be dispatched from different warehouses depending on availability. In case of high demand, dispatch timelines may extend slightly. All products undergo quality inspection and secure packaging before shipment.</p>
    </Section>

    <Section title="3. Shipping & Delivery Timeline">
      <p>Estimated delivery timelines:</p>
      <BulletList items={[
        'Metro cities: 3–6 business days',
        'Non-metro / remote areas: 5–8 business days',
      ]} />
      <p className="mt-3">Delivery timelines are estimates and may vary due to courier partner delays, weather conditions, local restrictions, or unforeseen logistical challenges. SALTD. is not liable for delays caused by third-party logistics providers.</p>
    </Section>

    <Section title="4. Shipping Charges">
      <p>Shipping charges (if applicable) will be displayed at checkout before payment. Free shipping thresholds and flat shipping fees are shown at the time of purchase.</p>
    </Section>

    <Section title="5. Order Tracking">
      <p>Once your order is shipped, you will receive tracking details via email and/or SMS. You may also track your order via your account dashboard (if registered). Please allow up to 24 hours after dispatch for tracking to become active.</p>
    </Section>

    <Section title="6. Delivery Attempts">
      <p>Our delivery partners will attempt delivery at the address provided. If delivery is unsuccessful due to incorrect address, recipient unavailable, or refusal to accept order, the package may be returned to us. Re-shipping charges may apply.</p>
    </Section>

    <Section title="7. Cash on Delivery (COD)">
      <p>For COD orders, additional verification may be required. Excessive refusal of COD orders may result in future COD restrictions. We reserve the right to limit COD availability in certain regions.</p>
    </Section>

    <Section title="8. International Shipping">
      <p>Currently, SALTD. delivers <strong className="text-[#0D0D10]/80">only within India</strong>. We do not offer international shipping at this time.</p>
    </Section>

    <Section title="9. Damaged or Tampered Packages">
      <p>If you receive a package that appears damaged, opened, or tampered, please do not accept the package. If already accepted, contact us within <strong className="text-[#0D0D10]/80">24 hours of delivery</strong> with your Order ID, clear photos of packaging and product, and a description of the issue. We will investigate and resolve as per our Refund & Cancellation Policy.</p>
    </Section>

    <Section title="10. Incorrect Address">
      <p>Customers are responsible for providing accurate shipping details. SALTD. is not responsible for delays or failed deliveries due to incorrect or incomplete addresses.</p>
    </Section>

    <Section title="11. Contact for Shipping Queries">
      <p><strong className="text-[#0D0D10]/80">Company Name:</strong> Aurevia Ventures<br />
      <strong className="text-[#0D0D10]/80">Brand:</strong> SALTD.<br />
      <strong className="text-[#0D0D10]/80">Email:</strong> timepassventures@gmail.com</p>
      <p>Our support team will respond within standard business hours.</p>
    </Section>

  </LegalShell>
);
