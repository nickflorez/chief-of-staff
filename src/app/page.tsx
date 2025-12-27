import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingPage from "./(public)/page";
import PublicLayout from "./(public)/layout";

export default async function RootPage() {
  const { userId } = await auth();

  // If already signed in, redirect to chat
  if (userId) {
    redirect("/chat");
  }

  // Show the public landing page with the public layout
  return (
    <PublicLayout>
      <LandingPage />
    </PublicLayout>
  );
}
