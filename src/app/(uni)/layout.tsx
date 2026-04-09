export default function UniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin sidebar/navbar will go here */}
      <main>{children}</main>
    </div>
  );
}
