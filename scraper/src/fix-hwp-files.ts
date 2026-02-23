import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BUCKET = 'legal-files';
const FOLDER = 'forms/';
const BATCH_SIZE = 100;

async function fixFiles() {
    console.log('=== HWP 파일 바이너리 복원 시작 ===\n');

    // List all files in the bucket
    let allFiles: string[] = [];
    let offset = 0;

    while (true) {
        const { data: files, error } = await supabase.storage
            .from(BUCKET)
            .list('forms', { limit: 1000, offset });

        if (error) {
            console.error('List error:', error.message);
            break;
        }
        if (!files || files.length === 0) break;

        allFiles.push(...files.map(f => f.name));
        console.log(`Listed ${allFiles.length} files so far...`);
        offset += files.length;
        if (files.length < 1000) break;
    }

    console.log(`\nTotal files to process: ${allFiles.length}\n`);

    let fixed = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < allFiles.length; i++) {
        const fileName = allFiles[i];
        const storagePath = `forms/${fileName}`;

        try {
            // Download current file
            const { data: fileData, error: dlError } = await supabase.storage
                .from(BUCKET)
                .download(storagePath);

            if (dlError || !fileData) {
                console.error(`  ✗ Download failed: ${fileName} - ${dlError?.message}`);
                errors++;
                continue;
            }

            const buffer = Buffer.from(await fileData.arrayBuffer());

            // Check if it's already valid HWP (OLE2 magic bytes)
            if (buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0) {
                skipped++;
                continue; // Already a valid HWP binary
            }

            // Try to parse as JSON
            let jsonContent: any;
            try {
                jsonContent = JSON.parse(buffer.toString('utf8'));
            } catch {
                console.error(`  ✗ Not JSON and not HWP: ${fileName}`);
                errors++;
                continue;
            }

            if (!jsonContent.data) {
                console.error(`  ✗ JSON but no 'data' field: ${fileName}`);
                errors++;
                continue;
            }

            // Decode base64
            const hwpBinary = Buffer.from(jsonContent.data, 'base64');

            // Verify it's valid HWP
            if (hwpBinary[0] !== 0xD0 || hwpBinary[1] !== 0xCF) {
                console.error(`  ✗ Decoded data is not valid HWP: ${fileName}`);
                errors++;
                continue;
            }

            // Re-upload with correct binary content
            const { error: upError } = await supabase.storage
                .from(BUCKET)
                .upload(storagePath, hwpBinary, {
                    contentType: 'application/x-hwp',
                    upsert: true,
                });

            if (upError) {
                console.error(`  ✗ Upload failed: ${fileName} - ${upError.message}`);
                errors++;
                continue;
            }

            fixed++;
            if (fixed % 50 === 0 || i === allFiles.length - 1) {
                console.log(`  ✓ Fixed ${fixed} / ${allFiles.length} (skipped: ${skipped}, errors: ${errors})`);
            }

        } catch (err: any) {
            console.error(`  ✗ Error processing ${fileName}: ${err.message}`);
            errors++;
        }
    }

    console.log('\n=== 복원 완료 ===');
    console.log(`총 파일 수: ${allFiles.length}`);
    console.log(`복원 완료: ${fixed}`);
    console.log(`이미 정상: ${skipped}`);
    console.log(`오류: ${errors}`);
}

fixFiles().catch(console.error);
