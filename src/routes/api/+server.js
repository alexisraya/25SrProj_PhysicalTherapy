import path from 'path';

export async function GET({ url }) {
    console.log("📡 API request received:", url.toString());

    const filename = url.searchParams.get('filename');
    if (!filename) {
        console.error("❌ Missing filename parameter.");
        return new Response(JSON.stringify({ error: 'Filename is required.' }), { status: 400 });
    }

    const sanitizedFilename = path.basename(filename);
    const bucketName = process.env.GCS_BUCKET_NAME || 'exercise_model_bucket';

    if (!bucketName) {
        console.error("❌ GCS_BUCKET_NAME is not set.");
        return new Response(JSON.stringify({ error: 'GCS_BUCKET_NAME is not set in environment variables.' }), { status: 500 });
    }

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${sanitizedFilename}`;
    console.log("✅ Returning model URL:", publicUrl);

    return new Response(JSON.stringify({ url: publicUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

