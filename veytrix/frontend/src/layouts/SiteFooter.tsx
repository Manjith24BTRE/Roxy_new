import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { VeytrixLogo } from '../components/VeytrixLogo';
import { Facebook, Instagram, Linkedin, Twitter, Github, Mail } from 'lucide-react';
import { socialLinks } from '../config/socialLinks';
import { LandingModal } from '../components/landing/modals/LandingModal';
import { useFooterModal, FooterModalType } from '../context/FooterModalContext';

// Static/Lightweight Modals
import AboutContent from '../components/landing/modals/company/AboutContent';
import ContactContent from '../components/landing/modals/company/ContactContent';
import CareersContent from '../components/landing/modals/company/CareersContent';
import PressContent from '../components/landing/modals/company/PressContent';

// Heavy Modals loaded lazily
const HelpCenterContent = React.lazy(() => import('../components/landing/modals/resources/HelpCenterContent'));
const TutorialsContent = React.lazy(() => import('../components/landing/modals/resources/TutorialsContent'));
const DocumentationContent = React.lazy(() => import('../components/landing/modals/resources/DocumentationContent'));
const ReportProblemContent = React.lazy(() => import('../components/landing/modals/resources/ReportProblemContent'));

type FooterItem = { label: string; modalKey?: FooterModalType; to?: string; disabled?: boolean };
type FooterColumn = { title: string; items: FooterItem[] };

const COLS: FooterColumn[] = [
  {
    title: "Product",
    items: [
      { label: "Editor", to: "/editor" },
      { label: "Features", disabled: true },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", modalKey: "about" },
      { label: "Contact", modalKey: "contact" },
      { label: "Careers", modalKey: "careers" },
      { label: "Press", modalKey: "press" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Help Center", modalKey: "help" },
      { label: "Tutorials", modalKey: "tutorials" },
      { label: "Documentation", modalKey: "documentation" },
      { label: "Report a Problem", modalKey: "report" },
    ],
  },
];

export function SiteFooter() {
  const { activeModal, openModal, closeModal } = useFooterModal();

  const renderModalContent = () => {
    switch (activeModal) {
      case 'about': return <AboutContent onClose={closeModal} />;
      case 'contact': return <ContactContent onClose={closeModal} />;
      case 'careers': return <CareersContent onClose={closeModal} onSwitchToContact={() => openModal('contact')} />;
      case 'press': return <PressContent onClose={closeModal} />;
      case 'help': 
      case 'tutorials': 
      case 'documentation': 
      case 'report':
        return (
          <Suspense fallback={<div className="p-12 text-center text-[#1D2B64]/50">Loading...</div>}>
            {activeModal === 'help' && <HelpCenterContent onClose={closeModal} />}
            {activeModal === 'tutorials' && <TutorialsContent onClose={closeModal} />}
            {activeModal === 'documentation' && <DocumentationContent onClose={closeModal} />}
            {activeModal === 'report' && <ReportProblemContent onClose={closeModal} />}
          </Suspense>
        );
      default: return null;
    }
  };

  return (
    <>
      <footer className="border-t border-[#1D2B64]/5 bg-[#FFFFFF] text-[#1D2B64] py-16 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 md:grid-cols-12">
            
            <div className="md:col-span-4 flex flex-col items-start">
              <div className="flex items-center gap-2">
                <VeytrixLogo className="h-6 w-6 text-[#1D2B64]" />
                <span className="font-display text-lg font-bold tracking-tight text-[#1D2B64]">VEYTRIX</span>
              </div>
              
              <p className="mt-4 text-sm text-[#1D2B64]/70 max-w-[280px] leading-relaxed">
                Professional browser-native video editing built for speed, precision, and agency workflow.
              </p>
              
              <p className="mt-4 text-xs text-[#1D2B64]/50 font-semibold tracking-wide">
                Associated Product of Mavros Tech Pvt Ltd.
              </p>

              {/* Social Media Link Icons */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VEYTRIX on LinkedIn"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-[#1D2B64]/10 text-[#1D2B64]/60 hover:text-[#3B6CE7] hover:border-[#3B6CE7]/30 hover:bg-[#E6F2F8]/30 transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VEYTRIX on Instagram"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-[#1D2B64]/10 text-[#1D2B64]/60 hover:text-[#3B6CE7] hover:border-[#3B6CE7]/30 hover:bg-[#E6F2F8]/30 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VEYTRIX on Facebook"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-[#1D2B64]/10 text-[#1D2B64]/60 hover:text-[#3B6CE7] hover:border-[#3B6CE7]/30 hover:bg-[#E6F2F8]/30 transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VEYTRIX on X"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-[#1D2B64]/10 text-[#1D2B64]/60 hover:text-[#3B6CE7] hover:border-[#3B6CE7]/30 hover:bg-[#E6F2F8]/30 transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VEYTRIX on GitHub"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-[#1D2B64]/10 text-[#1D2B64]/60 hover:text-[#3B6CE7] hover:border-[#3B6CE7]/30 hover:bg-[#E6F2F8]/30 transition-all"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="mailto:support@veytrix.com"
                  aria-label="Email VEYTRIX"
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-[#1D2B64]/10 text-[#1D2B64]/60 hover:text-[#3B6CE7] hover:border-[#3B6CE7]/30 hover:bg-[#E6F2F8]/30 transition-all"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
              {COLS.map((c) => (
                <nav key={c.title} aria-label={c.title}>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3B6CE7]">
                    {c.title}
                  </div>
                  <ul className="mt-4 space-y-3">
                    {c.items.map((i) => (
                      <li key={i.label}>
                        {i.disabled ? (
                          <span className="text-xs font-semibold text-[#1D2B64]/30 cursor-not-allowed uppercase tracking-wider">
                            {i.label}
                          </span>
                        ) : i.modalKey ? (
                          <button
                            type="button"
                            onClick={() => openModal(i.modalKey!)}
                            className="text-sm text-[#1D2B64]/70 hover:text-[#3B6CE7] transition-colors duration-150 text-left font-medium"
                          >
                            {i.label}
                          </button>
                        ) : (
                          <Link
                            to={i.to!}
                            className="text-sm text-[#1D2B64]/70 hover:text-[#3B6CE7] transition-colors duration-150 font-medium"
                          >
                            {i.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-[#1D2B64]/5 pt-8">
            <p className="text-xs text-[#1D2B64]/50 font-medium">
              © {new Date().getFullYear()} VEYTRIX. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-[#1D2B64]/40 font-mono">
                v1.0.0 · build
              </p>
            </div>
          </div>
        </div>
      </footer>

      <LandingModal isOpen={activeModal !== null} onClose={closeModal}>
        {renderModalContent()}
      </LandingModal>
    </>
  );
}
