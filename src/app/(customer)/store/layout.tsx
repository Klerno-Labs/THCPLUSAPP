import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Store | THC Plus",
  description:
    "Visit THC Plus at 5720 Hillcroft St, Houston, TX 77036. Store hours, directions, and contact information for will-call pickup.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
