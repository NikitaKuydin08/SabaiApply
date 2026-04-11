import { StudentLocaleProvider } from "./i18n/context";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLocaleProvider>{children}</StudentLocaleProvider>;
}
