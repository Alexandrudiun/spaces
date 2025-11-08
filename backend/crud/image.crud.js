import path from 'path';
import { readdir, stat } from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all image URLs from the ./images folder.
 * baseUrl can be passed or taken from WEBSITE_URL / BASE_URL env var.
 * Returns Promise<string[]>
 */
export async function getAllImages(baseUrl = process.env.WEBSITE_URL || process.env.BASE_URL) {
    if (!baseUrl) throw new Error('baseUrl required or set WEBSITE_URL/BASE_URL env var');

    const imagesDir = path.join(__dirname, 'images');
    let entries;
    try {
        entries = await readdir(imagesDir);
    } catch (err) {
        if (err.code === 'ENOENT') return []; // no images folder
        throw err;
    }

    const allowedExt = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico']);
    const base = baseUrl.replace(/\/+$/, ''); // trim trailing slashes
    const urls = [];

    for (const name of entries) {
        const full = path.join(imagesDir, name);
        try {
            const s = await stat(full);
            if (!s.isFile()) continue;
        } catch {
            continue;
        }
        if (!allowedExt.has(path.extname(name).toLowerCase())) continue;
        urls.push(`${base}/images/${encodeURIComponent(name)}`);
    }

    urls.sort();
    return urls;
}
