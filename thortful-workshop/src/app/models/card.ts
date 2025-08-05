export interface Card {
  id: string;
  title: string;
  creator: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  recipient?: string;
  style?: string;
  tags: string[];
  isNew?: boolean;
  isBestseller?: boolean;
}
