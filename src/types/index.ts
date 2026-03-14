export interface Member {
    id?: string;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
    sex?: string | null;
    marital_status?: string | null;
    birthday?: string | null;
    baptism?: boolean | null;
    address?: string | null;
    status?: string | null;
    notes?: string | null;
    groups?: string[] | null;
    profession?: string | null;
    role?: string | null;
    member_since?: string | null;
    is_kid?: boolean | null;
    company?: string | null;
    account_id?: string | null;
    relationship?: string | null;
    favorite_channel?: string | null;
    created_at?: string;
    latitude?: number | null;
    longitude?: number | null;
    postal_code?: string | null;
}

export interface Group {
    id: string;
    name: string;
    description?: string | null;
    type?: string | null;
    member_count?: number;
    member_ids?: string[];
    color?: string;
    created_at?: string;
}

export interface GalleryItem {
    id: string;
    title: string;
    description?: string | null;
    image_url: string;
    event_date?: string | null;
    event_name?: string | null;
    tags?: string[] | null;
    created_at?: string;
    updated_at?: string;
}
