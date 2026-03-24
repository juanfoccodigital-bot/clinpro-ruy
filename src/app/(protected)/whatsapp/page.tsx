import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import {
  getConversations,
  getMessageTemplates,
  getQuickReplies,
  getWhatsappConnections,
  getWhatsappLabels,
} from "@/data/get-whatsapp-data";
import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import WhatsAppLayout from "./_components/whatsapp-layout";

const WhatsAppPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) return null;
  const clinicId = session.user.clinic.id;

  const [connections, labels, templates, quickReplies, members] =
    await Promise.all([
      getWhatsappConnections({ clinicId }),
      getWhatsappLabels({ clinicId }),
      getMessageTemplates({ clinicId }),
      getQuickReplies({ clinicId }),
      db.query.usersToClinicsTable.findMany({
        where: eq(usersToClinicsTable.clinicId, clinicId),
        with: { user: true },
      }),
    ]);

  let conversations: Awaited<ReturnType<typeof getConversations>> = [];
  if (connections.length > 0) {
    conversations = await getConversations({
      clinicId,
      connectionId: connections[0].id,
    });
  }

  return (
    <WithAuthentication mustHaveClinic>
      <WhatsAppLayout
        connections={connections.map((c) => ({
          id: c.id,
          instanceName: c.instanceName,
          phoneNumber: c.phoneNumber,
          status: c.status,
        }))}
        conversations={conversations.map((c) => ({
          id: c.id,
          remotePhone: c.remotePhone,
          contactName: c.contactName || c.contact?.name || null,
          profilePictureUrl: c.contact?.profilePictureUrl || null,
          contactPatientId: c.contact?.patientId || null,
          isRead: c.isRead,
          isArchived: c.isArchived,
          unreadCount: c.unreadCount,
          lastMessageContent: c.lastMessageContent,
          lastMessageAt: c.lastMessageAt?.toISOString() || null,
          lastMessageDirection: c.lastMessageDirection,
          assignedToName: c.assignedTo?.name || null,
          crmStage: c.contact?.patient?.crmContactStage?.stage
            ? {
                name: c.contact.patient.crmContactStage.stage.name,
                color: c.contact.patient.crmContactStage.stage.color,
              }
            : null,
          labels: c.labels.map((cl) => ({
            id: cl.label.id,
            name: cl.label.name,
            color: cl.label.color,
          })),
        }))}
        labels={labels.map((l) => ({
          id: l.id,
          name: l.name,
          color: l.color,
        }))}
        templates={templates.map((t) => ({
          id: t.id,
          name: t.name,
          content: t.content,
          category: t.category,
        }))}
        quickReplies={quickReplies.map((qr) => ({
          id: qr.id,
          shortcut: qr.shortcut,
          content: qr.content,
        }))}
        members={members.map((m) => ({
          userId: m.userId,
          name: m.user.name,
        }))}
        currentUserId={session.user.id}
        currentUserName={session.user.name}
      />
    </WithAuthentication>
  );
};

export default WhatsAppPage;
