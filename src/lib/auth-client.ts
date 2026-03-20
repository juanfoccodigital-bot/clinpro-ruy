import { customSessionClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    customSessionClient<typeof auth>(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/authentication/two-factor";
      },
    }),
  ],
});
