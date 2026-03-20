import { headers } from "next/headers";

import { getWhatsappContacts } from "@/data/get-whatsapp-data";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import ContactsView from "./_components/contacts-view";

const WhatsAppContactsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) return null;

  const contacts = await getWhatsappContacts({
    clinicId: session.user.clinic.id,
  });

  return (
    <WithAuthentication mustHaveClinic>
      <ContactsView
        contacts={contacts.map((c) => ({
          id: c.id,
          name: c.name,
          phoneNumber: c.phoneNumber,
          email: c.email,
          notes: c.notes,
          patientName: c.patient?.name || null,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </WithAuthentication>
  );
};

export default WhatsAppContactsPage;
