import { Bot } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";
import WithAuthentication from "@/hocs/with-authentication";

const SecretariaIaPage = () => {
  return (
    <WithAuthentication mustHaveClinic>
      <ComingSoon
        title="Secretar.IA"
        description="Agente de inteligencia artificial para atendimento automatizado de pacientes via WhatsApp. Configure e ative sua secretaria virtual."
        icon={Bot}
      />
    </WithAuthentication>
  );
};

export default SecretariaIaPage;
