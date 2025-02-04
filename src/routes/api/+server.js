import { Storage } from '@google-cloud/storage';

let credentials;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    credentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString());
} else {
    // Dynamically import JSON file for local development
    const { default: localCredentials } = await import(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    credentials = localCredentials;
}

// Initialize Google Cloud Storage
const storage = new Storage({ credentials });
const bucketName = process.env.GCS_BUCKET_NAME;

export async function GET({ url }) {
    const filename = url.searchParams.get('filename');

    if (!filename) {
        return new Response(JSON.stringify({ error: "Filename is required" }), { status: 400 });
    }

    try {
        const file = storage.bucket(bucketName).file(filename);
        const [exists] = await file.exists();

        if (!exists) {
            return new Response(JSON.stringify({ error: "File not found" }), { status: 404 });
        }

        // Generate a signed URL for secure access
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1-hour expiration
        });

        return new Response(JSON.stringify({ url: signedUrl }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Storage access failed", details: error.message }), { status: 500 });
    }
}