import { useAccount } from '@reown/appkit-react-native';
import { ActivityIndicator, View } from 'react-native';

import { pickDesign } from '@/config/design';
import { useOnboardingContext } from '@/contexts/onboarding-context';
import { OnboardingScreen } from '@/designs/thermal/screens/onboarding-screen';
import { WalletLinkScreen } from '@/designs/thermal/screens/wallet-link-screen';

import { OnboardingWizard } from './onboarding-wizard';
import { WalletConnectionModal, useWalletConnectionModal } from './wallet-connection-modal';

interface OnboardingGateProps {
  children: React.ReactNode;
}

// Thermal has its own first-run flow; legacy and HQ keep the retro wizard + modal
const Onboarding = pickDesign({ legacy: OnboardingWizard, thermal: OnboardingScreen, hq: OnboardingWizard });
const WalletPrompt = pickDesign({ legacy: WalletConnectionModal, thermal: WalletLinkScreen, hq: WalletConnectionModal });

/**
 * Onboarding Gate Component
 * Shows onboarding wizard for first-time users,
 * then wallet connection modal for connection,
 * or app content for users who have completed onboarding
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const { isLoading, shouldShowOnboarding, hasCompletedOnboarding, completeOnboarding } = useOnboardingContext();
  const { isConnected } = useAccount();
  const { visible, handleDismiss } = useWalletConnectionModal(isConnected, hasCompletedOnboarding);

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF006E" />
      </View>
    );
  }

  // Show onboarding wizard if not completed
  if (shouldShowOnboarding) {
    return (
      <Onboarding
        onComplete={() => completeOnboarding('explore')}
        onSkip={() => completeOnboarding('explore')}
      />
    );
  }

  // Show app content with wallet modal overlay
  return (
    <>
      {children}
      <WalletPrompt visible={visible} onDismiss={handleDismiss} />
    </>
  );
}
