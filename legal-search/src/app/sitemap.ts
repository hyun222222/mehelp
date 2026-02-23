import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const baseUrl = 'https://forms.kimnhyunlaw.com';

    // Static pages
    const routes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/forms`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/cases`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ];

    // Dynamic form pages
    const { data: forms } = await supabase
        .from('legal_forms')
        .select('id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1000);

    if (forms) {
        for (const form of forms) {
            routes.push({
                url: `${baseUrl}/forms/${form.id}`,
                lastModified: new Date(form.updated_at),
                changeFrequency: 'monthly',
                priority: 0.7,
            });
        }
    }

    // Dynamic case pages
    const { data: cases } = await supabase
        .from('legal_cases')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

    if (cases) {
        for (const c of cases) {
            routes.push({
                url: `${baseUrl}/cases/${c.id}`,
                lastModified: new Date(c.created_at),
                changeFrequency: 'monthly',
                priority: 0.6,
            });
        }
    }

    return routes;
}
