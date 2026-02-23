import axios from 'axios';

const BASE_URL = 'https://www.helplaw24.go.kr';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Referer': `${BASE_URL}/statuteinfo/template/korea/list`,
};

async function main() {
    // Form with atchFileId=I0010000000000001784, atchFileSeq=3, pdfId=iFEBIdb1ShNHJW7YMuF8PIQGc0XAGbOiATZRqlQ37IE
    const atchFileId = 'I0010000000000001784';
    const atchFileSeq = 3;
    const pdfId = 'iFEBIdb1ShNHJW7YMuF8PIQGc0XAGbOiATZRqlQ37IE';

    // Test 1: /api/download with CORRECT seq
    const url1 = `${BASE_URL}/api/download?atchFileId=${atchFileId}&atchFileSeq=${atchFileSeq}`;
    console.log('Test 1:', url1);
    try {
        const resp = await axios.get(url1, { headers: HEADERS, responseType: 'arraybuffer', maxRedirects: 5, validateStatus: () => true });
        console.log('  Status:', resp.status);
        console.log('  Content-Type:', resp.headers['content-type']);
        console.log('  Content-Disposition:', resp.headers['content-disposition']);
        console.log('  Body size:', resp.data?.length, 'bytes');
    } catch (e: any) {
        console.log('  Error:', e.message);
    }

    // Test 2: /api/cmm/downloadAtchFile with correct seq
    const url2 = `${BASE_URL}/api/cmm/downloadAtchFile?atchFileId=${atchFileId}&atchFileSeq=${atchFileSeq}`;
    console.log('\nTest 2:', url2);
    try {
        const resp = await axios.get(url2, { headers: HEADERS, responseType: 'arraybuffer', maxRedirects: 5, validateStatus: () => true });
        console.log('  Status:', resp.status);
        console.log('  Content-Type:', resp.headers['content-type']);
        console.log('  Content-Disposition:', resp.headers['content-disposition']);
        console.log('  Body size:', resp.data?.length, 'bytes');
    } catch (e: any) {
        console.log('  Error:', e.message);
    }

    // Test 3: PDF via pdfId - try /api/pdf/view?pdfId=...  
    const url3 = `${BASE_URL}/api/pdf/view?pdfId=${pdfId}`;
    console.log('\nTest 3 (PDF):', url3);
    try {
        const resp = await axios.get(url3, { headers: HEADERS, responseType: 'arraybuffer', maxRedirects: 5, validateStatus: () => true });
        console.log('  Status:', resp.status);
        console.log('  Content-Type:', resp.headers['content-type']);
        console.log('  Content-Disposition:', resp.headers['content-disposition']);
        console.log('  Body size:', resp.data?.length, 'bytes');
    } catch (e: any) {
        console.log('  Error:', e.message);
    }

    // Test 4: /api/download?pdfId=...
    const url4 = `${BASE_URL}/api/download?pdfId=${pdfId}`;
    console.log('\nTest 4:', url4);
    try {
        const resp = await axios.get(url4, { headers: HEADERS, responseType: 'arraybuffer', maxRedirects: 5, validateStatus: () => true });
        console.log('  Status:', resp.status);
        console.log('  Content-Type:', resp.headers['content-type']);
        console.log('  Content-Disposition:', resp.headers['content-disposition']);
        console.log('  Body size:', resp.data?.length, 'bytes');
    } catch (e: any) {
        console.log('  Error:', e.message);
    }

    // Test 5: Try direct HWP download path
    const url5 = `${BASE_URL}/api/lwaCtgry/downloadTmplt?atchFileId=${atchFileId}&atchFileSeq=${atchFileSeq}`;
    console.log('\nTest 5:', url5);
    try {
        const resp = await axios.get(url5, { headers: HEADERS, responseType: 'arraybuffer', maxRedirects: 5, validateStatus: () => true });
        console.log('  Status:', resp.status);
        console.log('  Content-Type:', resp.headers['content-type']);
        console.log('  Content-Disposition:', resp.headers['content-disposition']);
        console.log('  Body size:', resp.data?.length, 'bytes');
    } catch (e: any) {
        console.log('  Error:', e.message);
    }
}

main().catch(e => console.error('FATAL:', e.message));
