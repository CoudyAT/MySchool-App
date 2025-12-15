export interface Faq {
    id: number;
    question: string;
    answer: string;
    category: string; // general, payments, courses, etc
    tags?: string[];
    isActive: boolean;
    helpfulCount?: number;
    notHelpfulCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryGroup {
    title: string;
    key: string;
    faqs: Faq[];
}