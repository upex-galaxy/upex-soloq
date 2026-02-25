/**
 * Minimal layout for documentation pages
 * No sidebar, no header - just the content
 */

export default function MinimalLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
