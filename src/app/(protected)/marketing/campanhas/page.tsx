import { Megaphone } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";
import WithAuthentication from "@/hocs/with-authentication";

const CampanhasPage = () => {
  return (
    <WithAuthentication mustHaveClinic>
      <ComingSoon
        title="Campanhas"
        description="Campanhas de aniversario, recuperacao de contatos antigos e envio de mensagens via WhatsApp para contatos selecionados ou grupos."
        icon={Megaphone}
      />
    </WithAuthentication>
  );
};

export default CampanhasPage;
