import React, { useState, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { VeytrixLogo } from '../components/VeytrixLogo';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { socialLinks } from '../config/socialLinks';
import { LandingModal } from '../components/landing/modals/LandingModal';

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

export type FooterModalType = 'about' | 'contact' | 'careers' | 'press' | 'help' | 'tutorials' | 'documentation' | 'report' | null;

type FooterItem = { label: string; modalKey?: FooterModalType; to?: string; disabled?: boolean };
type FooterColumn = { title: string; items: FooterItem[] };

const COLS: FooterColumn[] = [
  {
    title: "Product",
    items: [
      { label: "Editor", to: "/editor" },
      { label: "Templates", disabled: true },
      { label: "Features", disabled: true },
      { label: "Learning", disabled: true },
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
  const [activeModal, setActiveModal] = useState<FooterModalType>(null);

  const closeModal = () => setActiveModal(null);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'about': return <AboutContent onClose={closeModal} />;
      case 'contact': return <ContactContent onClose={closeModal} />;
      case 'careers': return <CareersContent onClose={closeModal} onSwitchToContact={() => setActiveModal('contact')} />;
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
      <footer className="border-t border-[rgba(230,242,248,0.12)] bg-[#1D2B64] text-[#FFFFFF]">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-12">
            
            <div className="md:col-span-4 flex flex-col items-start">
              <div className="flex items-center gap-2">
                <VeytrixLogo className="h-6 w-6 text-[#FFFFFF]" />
                <span className="font-display text-lg font-semibold tracking-tight text-[#FFFFFF]">VEYTRIX</span>
              </div>
              
              <p className="mt-4 text-sm text-[rgba(230,242,248,0.72)] max-w-[280px] leading-relaxed">
                Professional video editing, built for speed, precision, and creative flow.
              </p>
              
              <p className="mt-4 text-[13px] text-[#E6F2F8] font-medium">
                Associated with Mavros Tech Pvt Ltd.
              </p>

              <div className="mt-6 flex items-center gap-3">
                {socialLinks.linkedin ? (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="VEYTRIX on LinkedIn"
                    className="flex items-center justify-center w-9 h-9 rounded-md border border-[rgba(230,242,248,0.16)] text-[#E6F2F8] bg-transparent transition-colors duration-150 hover:bg-[rgba(140,200,232,0.10)] hover:text-[#FFFFFF] hover:border-[rgba(140,200,232,0.35)]"
                  >
                    <Linkedin className="w-[18px] h-[18px]" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="flex items-center justify-center w-9 h-9 rounded-md border border-[rgba(230,242,248,0.16)] text-[#E6F2F8] bg-transparent opacity-50 cursor-not-allowed" aria-hidden="true">
                    <Linkedin className="w-[18px] h-[18px]" aria-hidden="true" />
                  </span>
                )}
                {socialLinks.instagram ? (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="VEYTRIX on Instagram"
                    className="flex items-center justify-center w-9 h-9 rounded-md border border-[rgba(230,242,248,0.16)] text-[#E6F2F8] bg-transparent transition-colors duration-150 hover:bg-[rgba(140,200,232,0.10)] hover:text-[#FFFFFF] hover:border-[rgba(140,200,232,0.35)]"
                  >
                    <Instagram className="w-[18px] h-[18px]" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="flex items-center justify-center w-9 h-9 rounded-md border border-[rgba(230,242,248,0.16)] text-[#E6F2F8] bg-transparent opacity-50 cursor-not-allowed" aria-hidden="true">
                    <Instagram className="w-[18px] h-[18px]" aria-hidden="true" />
                  </span>
                )}
                {socialLinks.facebook ? (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="VEYTRIX on Facebook"
                    className="flex items-center justify-center w-9 h-9 rounded-md border border-[rgba(230,242,248,0.16)] text-[#E6F2F8] bg-transparent transition-colors duration-150 hover:bg-[rgba(140,200,232,0.10)] hover:text-[#FFFFFF] hover:border-[rgba(140,200,232,0.35)]"
                  >
                    <Facebook className="w-[18px] h-[18px]" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="flex items-center justify-center w-9 h-9 rounded-md border border-[rgba(230,242,248,0.16)] text-[#E6F2F8] bg-transparent opacity-50 cursor-not-allowed" aria-hidden="true">
                    <Facebook className="w-[18px] h-[18px]" aria-hidden="true" />
                  </span>
                )}
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
              {COLS.map((c) => (
                <nav key={c.title} aria-label={c.title}>
                  <div className="text-xs font-mono uppercase tracking-widest text-[#8CC8E8]">
                    {c.title}
                  </div>
                  <ul className="mt-4 space-y-3">
                    {c.items.map((i) => (
                      <li key={i.label}>
                        {i.disabled ? (
                          <span className="text-sm text-[rgba(230,242,248,0.72)] opacity-50 cursor-not-allowed">
                            {i.label}
                          </span>
                        ) : i.modalKey ? (
                          <button
                            type="button"
                            onClick={() => setActiveModal(i.modalKey!)}
                            className="text-sm text-[rgba(230,242,248,0.72)] hover:text-[#8CC8E8] transition-colors duration-150 text-left"
                          >
                            {i.label}
                          </button>
                        ) : (
                          <Link
                            to={i.to!}
                            className="text-sm text-[rgba(230,242,248,0.72)] hover:text-[#8CC8E8] transition-colors duration-150"
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

          <div className="mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-[rgba(230,242,248,0.12)] pt-8">
            <p className="text-xs text-[rgba(230,242,248,0.72)]">
              © {new Date().getFullYear()} VEYTRIX. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-[rgba(230,242,248,0.72)] font-mono">
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
