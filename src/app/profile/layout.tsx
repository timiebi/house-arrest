import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artist Profile | Sigag Lauren',
  description:
    'Sigag Lauren — DJ, producer, House Music visionary. Artist profile, upcoming events, releases, gallery and live shows.',
};

export default function ProfileLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
