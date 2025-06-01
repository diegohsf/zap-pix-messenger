
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: {
        transaction_id?: string;
        value?: number;
        currency?: string;
        items?: Array<{
          item_id: string;
          item_name: string;
          category: string;
          quantity: number;
          price: number;
        }>;
      }
    ) => void;
    dataLayer: any[];
  }
}

export {};
