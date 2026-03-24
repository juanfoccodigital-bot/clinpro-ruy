interface EvolutionApiConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

export class EvolutionApiClient {
  private config: EvolutionApiConfig;

  constructor(config: EvolutionApiConfig) {
    this.config = config;
  }

  private getBaseUrl() {
    // Remove trailing slash and /manager path if present
    return this.config.apiUrl
      .replace(/\/manager\/?$/, "")
      .replace(/\/+$/, "");
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        apikey: this.config.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[EvolutionAPI] ${options.method || "GET"} ${endpoint} -> ${response.status}: ${error}`);
      throw new Error(`Evolution API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createInstance(webhookUrl?: string) {
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
    const payload: Record<string, unknown> = {
      instanceName: this.config.instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
    };

    if (webhookUrl) {
      const webhookConfig: Record<string, unknown> = {
        url: webhookUrl,
        byEvents: false,
        base64: true,
        events: [
          "MESSAGES_UPSERT",
          "CONNECTION_UPDATE",
          "QRCODE_UPDATED",
        ],
      };
      if (webhookSecret) {
        webhookConfig.headers = {
          "x-webhook-secret": webhookSecret,
        };
      }
      payload.webhook = webhookConfig;
    }

    return this.request("/instance/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getInstanceStatus() {
    return this.request(
      `/instance/connectionState/${this.config.instanceName}`,
    );
  }

  async getQrCode() {
    return this.request(`/instance/connect/${this.config.instanceName}`);
  }

  async logoutInstance() {
    return this.request(
      `/instance/logout/${this.config.instanceName}`,
      { method: "DELETE" },
    );
  }

  async deleteInstance() {
    return this.request(
      `/instance/delete/${this.config.instanceName}`,
      { method: "DELETE" },
    );
  }

  async setWebhook(webhookUrl: string) {
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
    const payload: Record<string, unknown> = {
      url: webhookUrl,
      webhook_by_events: false,
      webhook_base64: true,
      events: [
        "MESSAGES_UPSERT",
        "CONNECTION_UPDATE",
        "QRCODE_UPDATED",
      ],
    };
    if (webhookSecret) {
      payload.headers = {
        "x-webhook-secret": webhookSecret,
      };
    }

    return this.request(`/webhook/set/${this.config.instanceName}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async sendTextMessage(phone: string, text: string) {
    return this.request(`/message/sendText/${this.config.instanceName}`, {
      method: "POST",
      body: JSON.stringify({
        number: phone,
        text,
      }),
    });
  }

  async sendMediaMessage(
    phone: string,
    mediaBase64: string,
    mimeType: string,
    mediaType: string = "image",
    caption?: string,
    fileName?: string,
  ) {
    return this.request(`/message/sendMedia/${this.config.instanceName}`, {
      method: "POST",
      body: JSON.stringify({
        number: phone,
        mediatype: mediaType,
        mimetype: mimeType,
        media: mediaBase64,
        caption: caption || undefined,
        fileName: fileName || undefined,
      }),
    });
  }

  async sendAudioMessage(phone: string, audioBase64: string) {
    return this.request(
      `/message/sendWhatsAppAudio/${this.config.instanceName}`,
      {
        method: "POST",
        body: JSON.stringify({
          number: phone,
          audio: audioBase64,
          encoding: true,
        }),
      },
    );
  }

  async fetchContacts() {
    return this.request(`/chat/findContacts/${this.config.instanceName}`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async getProfilePicture(phone: string) {
    try {
      return await this.request(
        `/chat/fetchProfilePictureUrl/${this.config.instanceName}`,
        {
          method: "POST",
          body: JSON.stringify({ number: phone }),
        },
      );
    } catch {
      return null;
    }
  }
}
