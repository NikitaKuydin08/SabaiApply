export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Student navbar will go here */}
      <main>{children}</main>
    </div>
  );
}
