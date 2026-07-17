export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div data-layout="publish">
      {/* publish layout shell — sidebar/nav di M8 */}
      {children}
    </div>
  );
}
