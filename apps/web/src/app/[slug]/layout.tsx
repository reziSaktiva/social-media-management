export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div data-layout="workspace">
      {/* workspace layout shell — sidebar/nav di M8 */}
      {children}
    </div>
  );
}
