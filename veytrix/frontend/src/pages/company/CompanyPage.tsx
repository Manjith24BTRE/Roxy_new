import React, { useEffect, Suspense } from 'react';
import { 
  BackgroundEffects,
  PageContainer,
  CompanyHero,
  AboutVeytrix,
  MissionSection,
  VisionSection,
  OurStoryPlaceholder,
  CoreValues,
  WhyChooseVeytrix,
  TechnologyStack,
  DevelopmentPrinciples,
  PlatformHighlights,
  SecurityPrivacy,
  RoadmapSection,
  FAQSection,
  ContactSection,
  SocialSection,
  AssociatedCompany,
  CompanyFooter
} from '../../components/company';
import { useLegalModal } from '../../components/company/legal/LegalModalProvider';

// Lazy load legal modals from index barrel file to ensure TS types are correctly mapped
const PrivacyModal = React.lazy(() => import('../../components/company/legal').then(module => ({ default: module.PrivacyModal })));
const TermsModal = React.lazy(() => import('../../components/company/legal').then(module => ({ default: module.TermsModal })));
const CookiesModal = React.lazy(() => import('../../components/company/legal').then(module => ({ default: module.CookiesModal })));
const DocumentationModal = React.lazy(() => import('../../components/company/legal').then(module => ({ default: module.DocumentationModal })));

export function CompanyPage() {
  const { activeModal, closeModal } = useLegalModal();

  // Set SEO metadata and load reveal triggers
  useEffect(() => {
    document.title = "VEYTRIX - Enterprise Company Profile | AI Video Editing Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Learn about Veytrix, a next-generation AI-powered video editing platform built to automate modern creator workflows under Mavros Tech Pvt Ltd.");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px 80px 0px' }
    );

    const elements = document.querySelectorAll('.company-reveal');
    elements.forEach((el) => observer.observe(el));

    const timeout = setTimeout(() => {
      elements.forEach((el) => el.classList.add('reveal-active'));
    }, 150);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <PageContainer>
      <style dangerouslySetInnerHTML={{__html: `
        .company-reveal {
          opacity: 0.1;
          transform: translateY(10px);
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .reveal-active {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}} />
      <BackgroundEffects />
      
      <div className="space-y-16">
        <div className="company-reveal"><CompanyHero /></div>
        <div className="company-reveal"><AboutVeytrix /></div>
        <div className="company-reveal"><MissionSection /></div>
        <div className="company-reveal"><VisionSection /></div>
        <div className="company-reveal"><OurStoryPlaceholder /></div>
        <div className="company-reveal"><CoreValues /></div>
        <div className="company-reveal"><WhyChooseVeytrix /></div>
        <div className="company-reveal"><TechnologyStack /></div>
        <div className="company-reveal"><DevelopmentPrinciples /></div>
        <div className="company-reveal"><PlatformHighlights /></div>
        <div className="company-reveal"><SecurityPrivacy /></div>
        <div className="company-reveal"><RoadmapSection /></div>
        <div className="company-reveal"><FAQSection /></div>
        <div className="company-reveal"><ContactSection /></div>
        <div className="company-reveal"><SocialSection /></div>
        <div className="company-reveal"><AssociatedCompany /></div>
      </div>
      
      <CompanyFooter />

      {/* Modal lazy loading Suspense triggers via React Portal */}
      <Suspense fallback={null}>
        {activeModal === 'privacy' && <PrivacyModal isOpen={true} onClose={closeModal} />}
        {activeModal === 'terms' && <TermsModal isOpen={true} onClose={closeModal} />}
        {activeModal === 'cookies' && <CookiesModal isOpen={true} onClose={closeModal} />}
        {activeModal === 'documentation' && <DocumentationModal isOpen={true} onClose={closeModal} />}
      </Suspense>
    </PageContainer>
  );
}
export default CompanyPage;
