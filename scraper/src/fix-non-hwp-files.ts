import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BUCKET = 'legal-files';

const CONTENT_TYPES: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.gif': 'image/gif',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.zip': 'application/zip',
    '.csv': 'text/csv',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.hwp': 'application/x-hwp',
};

function getContentType(fileName: string): string {
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return CONTENT_TYPES[ext] || 'application/octet-stream';
}

async function fixNonHwpFiles() {
    console.log('=== 비-HWP 파일 바이너리 복원 시작 ===\n');

    let allFiles: string[] = [];
    let offset = 0;

    while (true) {
        const { data: files, error } = await supabase.storage
            .from(BUCKET)
            .list('forms', { limit: 1000, offset });

        if (error || !files || files.length === 0) break;
        allFiles.push(...files.map(f => f.name));
        offset += files.length;
        if (files.length < 1000) break;
    }

    // Filter to non-HWP files only
    const nonHwpFiles = allFiles.filter(f => !f.endsWith('.hwp'));
    console.log(`Total non-HWP files: ${nonHwpFiles.length}\n`);

    let fixed = 0;
    let skipped = 0;
    let errors = 0;

    for (const fileName of nonHwpFiles) {
        const storagePath = `forms/${fileName}`;
        try {
            const { data: fileData, error: dlError } = await supabase.storage
                .from(BUCKET)
                .download(storagePath);

            if (dlError || !fileData) {
                console.error(`  ✗ Download failed: ${fileName}`);
                errors++;
                continue;
            }

            const buffer = Buffer.from(await fileData.arrayBuffer());

            // If it starts with '{' it's likely still a JSON wrapper
            if (buffer[0] !== 0x7B) { // '{'
                skipped++;
                continue; // Already binary
            }

            let jsonContent: any;
            try {
                jsonContent = JSON.parse(buffer.toString('utf8'));
            } catch {
                skipped++;
                continue;
            }

            if (!jsonContent.data) {
                console.error(`  ✗ No 'data' field: ${fileName}`);
                errors++;
                continue;
            }

            const binary = Buffer.from(jsonContent.data, 'base64');
            const contentType = getContentType(fileName);

            const { error: upError } = await supabase.storage
                .from(BUCKET)
                .upload(storagePath, binary, {
                    contentType,
                    upsert: true,
                });

            if (upError) {
                console.error(`  ✗ Upload failed: ${fileName} - ${upError.message}`);
                errors++;
                continue;
            }

            fixed++;
            console.log(`  ✓ Fixed: ${fileName} (${contentType}, ${binary.length} bytes)`);
        } catch (err: any) {
            console.error(`  ✗ Error: ${fileName} - ${err.message}`);
            errors++;
        }
    }

    console.log('\n=== 복원 완료 ===');
    console.log(`총 비-HWP 파일 수: ${nonHwpFiles.length}`);
    console.log(`복원 완료: ${fixed}`);
    console.log(`이미 정상: ${skipped}`);
    console.log(`오류: ${errors}`);
}

fixNonHwpFiles().catch(console.error);
