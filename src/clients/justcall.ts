export class JustCallClient {
    private baseURL = 'https://api.justcall.io';
    private auth: string;
  
    constructor(apiKey: string, apiSecret: string) {
      this.auth = `${apiKey}:${apiSecret}`;
    }
  
    async sendSMS(data: {
      to: string;
      from: string;
      message: string;
    }) {
      try {
        const response = await fetch(`${this.baseURL}/v2.1/texts/new`, {
          method: 'POST',
          headers: {
            'Authorization': this.auth,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`JustCall API error (${response.status}): ${error}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('JustCall API error:', error);
        throw error;
      }
    }
  
    async validateCredentials(): Promise<boolean> {
      try {
        // Test with a simple API call to verify credentials
        const response = await fetch(`${this.baseURL}/v2.1/phone-numbers?per_page=1`, {
          method: 'GET',
          headers: {
            'Authorization': this.auth
          }
        });
        return response.ok;
      } catch {
        return false;
      }
    }
  }