import { notFound } from "next/navigation";
import { getSession } from "@/app/actions/sessions";
import { SessionDetail } from "@/components/history/session-detail";

interface SessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  const { session, error } = await getSession(sessionId);

  if (error || !session) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SessionDetail session={session} />
    </div>
  );
}
