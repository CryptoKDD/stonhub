import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, polygon } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'STON Hub',
  projectId: '071b7fcd3fa40db4237db18544a04d5d', // You'll need to generate one from WalletConnect Cloud, this is a placeholder/demo
  chains: [base, polygon],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
