
export interface MessageData {
  phoneNumber: string;
  messageText: string;
  mediaType: 'none' | 'photo' | 'audio' | 'video';
  mediaFile: File | null;
  mediaFileUrl?: string;
  mediaFileName?: string;
  price: number;
  couponCode?: string;
  originalPrice?: number;
  discountAmount?: number;
}
