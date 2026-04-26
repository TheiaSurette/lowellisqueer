export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  colorId: string | null;
  imageUrl: string | null;
  featured: boolean;
  tags: string[];
  htmlLink: string;
};

export type SocialLink = {
  platform: string;
  url: string;
  icon?: string;
};

export type Meetup = {
  name: string;
  description: string;
  location: string;
  frequency: string;
  image: string;
  section: string;
};
