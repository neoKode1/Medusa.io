import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      uploadDir: uploadsDir,
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const fileArray = files.file as formidable.File[] | formidable.File | undefined;
    if (!fileArray) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG and WebP are allowed.' });
    }

    // Get the file name and create a public URL
    const fileName = path.basename(file.filepath);
    const publicUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${fileName}`;

    // Return the public URL
    res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
} 