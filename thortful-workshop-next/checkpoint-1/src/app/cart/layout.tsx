import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Basket | thortful",
  description: "Review and manage items in your shopping basket",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
