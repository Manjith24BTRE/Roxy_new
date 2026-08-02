import React from 'react';
import { CheckCircle, AlertTriangle, Scale, Lock, ShieldAlert, Cpu } from 'lucide-react';
import { LegalModalWrapper } from './LegalModalWrapper';
import { ModalSection } from './ModalSection';

export function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <LegalModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Terms of Service"
      subtitle="Using VEYTRIX responsibly."
      icon="📄"
      version="Version 1.0"
    >
      <div className="space-y-4">
        <ModalSection title="Allowed Actions" icon={<CheckCircle size={16} />}>
          <p>Users may create workspace draft files, assemble tracks on the web timeline, trigger local AI auto-cuts, and export compiled videos for corporate and personal usage.</p>
        </ModalSection>

        <ModalSection title="Restrictions & Prohibited Actions" icon={<AlertTriangle size={16} />}>
          <ul className="list-disc pl-5 space-y-1.5 font-semibold text-xs md:text-sm">
            <li>Do not upload files violating local copyright provisions.</li>
            <li>Do not attempt to disrupt Supabase authorization routes.</li>
            <li>Do not execute scrape cycles on weight models or template directories.</li>
          </ul>
        </ModalSection>

        <ModalSection title="User Responsibilities" icon={<Scale size={16} />}>
          <p>You remain solely responsible for any content processed through the video canvas. VEYTRIX does not verify authorship rights on local workspace tracks.</p>
        </ModalSection>

        <ModalSection title="Account Suspension & Audits" icon={<ShieldAlert size={16} />}>
          <p>We reserve rights to suspend profile parameters if security triggers locate anomalous credential logins or service abuse loops.</p>
        </ModalSection>

        <ModalSection title="Intellectual Property" icon={<Lock size={16} />}>
          <p>The code layout, layout algorithms, WASM preview systems, and custom design tokens are owned by VEYTRIX and Mavros Tech Pvt Ltd.</p>
        </ModalSection>

        <ModalSection title="Service Availability" icon={<Cpu size={16} />}>
          <p>VEYTRIX builds are delivered on an as-is basis. Browser features may be updated, adjusted, or deprecated as creative standards change.</p>
        </ModalSection>
      </div>
    </LegalModalWrapper>
  );
}
export default TermsModal;
