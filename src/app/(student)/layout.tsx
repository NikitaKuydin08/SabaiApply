import { LocaleProvider } from "@/lib/i18n/context";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocaleProvider defaultLocale="en" storageKey="sabaiapply-student-locale">{children}</LocaleProvider>;
}
