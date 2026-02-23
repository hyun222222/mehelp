import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { supabase } from '../db/supabase';

const DOWNLOADS_DIR = path.join(__dirname, '..', '..', 'downloads');
const BUCKET = process.env.SUPABASE_BUCKET || 'legal-files';

// Ensure the downloads directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

/**
 * Download a file from a URL to local disk, then upload to Supabase Storage.
 * Returns the public URL of the uploaded file, or null on failure.
 */
export async function downloadAndUpload(
    fileUrl: string,
    fileName: string,
    storagePath: string
): Promise<string | null> {
    const localPath = path.join(DOWNLOADS_DIR, fileName);

    try {
        // 1. Download the file
        const response = await axios.get(fileUrl, {
            responseType: 'arraybuffer',
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        fs.writeFileSync(localPath, response.data);

        // 2. Upload to Supabase Storage
        const fileBuffer = fs.readFileSync(localPath);
        const uploadPath = `${storagePath}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(uploadPath, fileBuffer, {
                cacheControl: '3600',
                upsert: true,
                contentType: getContentType(fileName),
            });

        if (uploadError) {
            console.error(`[Upload] Failed to upload ${fileName}: ${uploadError.message}`);
            return null;
        }

        // 3. Get the public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(uploadPath);

        // 4. Clean up local file
        try { fs.unlinkSync(localPath); } catch { /* ignore */ }

        return urlData.publicUrl;
    } catch (err) {
        console.error(`[Upload] Failed to download ${fileUrl}:`, err instanceof Error ? err.message : err);
        try { fs.unlinkSync(localPath); } catch { /* ignore */ }
        return null;
    }
}

function getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
        case '.pdf': return 'application/pdf';
        case '.hwp': return 'application/x-hwp';
        case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case '.doc': return 'application/msword';
        case '.xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        default: return 'application/octet-stream';
    }
}
