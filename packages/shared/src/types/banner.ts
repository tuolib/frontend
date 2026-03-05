export interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkType: string;
  linkValue: string | null;
  sortOrder: number;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
}
