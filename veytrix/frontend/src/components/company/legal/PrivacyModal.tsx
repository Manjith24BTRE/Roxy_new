import React from 'react';
import { Shield, Lock, Eye, HardDrive } from 'lucide-react';
import { LegalModalWrapper } from './LegalModalWrapper';
import { ModalSection } from './ModalSection';

export function PrivacyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <LegalModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy"
      subtitle="Protecting your creative workspace."
      icon="🛡"
      version="Version 1.0"
    >
      <div className="space-y-4">
        <ModalSection title="Collected Information" icon={<Shield size={16} />}>
          <p>At VEYTRIX, protecting user privacy is one of our highest priorities. We only collect parameters required to authenticate sessions and maintain standard workspaces:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 font-semibold text-xs md:text-sm">
            <li>Account settings & credentials</li>
            <li>Workspace state & preferences</li>
            <li>Browser capabilities to adjust canvas shaders</li>
          </ul>
        </ModalSection>

        <ModalSection title="Data Storage & Encryption" icon={<HardDrive size={16} />}>
          <p>All video and audio files loaded inside the editor remain in local sandboxed memory directories. Creative assets are not uploaded to servers without explicit developer command.</p>
        </ModalSection>

        <ModalSection title="Security Operations" icon={<Lock size={16} />}>
          <p>Session tokens are signed and verification flows run through Supabase endpoints with TLS encryption. We maintain regular updates to keep local packages secure.</p>
        </ModalSection>

        <ModalSection title="User Rights & Access" icon={<Eye size={16} />}>
          <p>You retain full rights to request complete removal of your Veytrix profile and metadata loops by emailing support lines.</p>
        </ModalSection>
      </div>
    </LegalModalWrapper>
  );
}
export default PrivacyModal;
