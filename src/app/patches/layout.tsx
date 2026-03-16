import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sample Packs | Sigag Lauren',
  description:
    'Sample packs that hit. Professional loops and one-shots by Sigag Lauren. Drop them in your DAW — buy once, own forever. No subscriptions.',
};

export default function PatchesLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
