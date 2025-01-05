import { NextApiRequest, NextApiResponse } from 'next';
import { LumaAI } from 'lumaai';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

// Load and validate environment variables
const LUMA_API_TOKEN = process.env.LUMA_API_TOKEN;
const BUCKET_NAME = 'medusaio';

// Service account credentials type
interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

/**
 * Configuration Notes:
 * 1. Google Cloud Storage:
 *    - Bucket should have uniform bucket-level access enabled
 *    - Service account needs storage.objects.create and storage.objects.get permissions
 *    - Files are uploaded with signed URLs that expire in 1 hour
 * 
 * 2. Luma API:
 *    - Using model "ray-1-6" for video generation
 *    - Supports multiple aspect ratios: "16:9", "1:1", "9:16", "4:3", "3:4", "21:9", "9:21"
 *    - Requires at least one keyframe image
 */

// Load service account credentials from JSON file
const serviceAccountPath = path.join(process.cwd(), 'medusaio-f444b45b023d.json');
let serviceAccountCredentials: ServiceAccountCredentials | null = null;

try {
  console.log('Loading credentials from:', serviceAccountPath);
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('Credentials file not found at:', serviceAccountPath);
  } else {
    const rawCredentials = fs.readFileSync(serviceAccountPath, 'utf8');
    const parsedCredentials = JSON.parse(rawCredentials) as ServiceAccountCredentials;
    
    // Validate the required fields
    if (!parsedCredentials.project_id || !parsedCredentials.private_key) {
      throw new Error('Invalid credentials format: missing required fields');
    }
    
    serviceAccountCredentials = parsedCredentials;
    console.log('Successfully loaded Google Cloud credentials for project:', parsedCredentials.project_id);
  }
} catch (error) {
  console.error('Error loading Google Cloud credentials:', error);
  if (error instanceof Error) {
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Initialize Google Cloud Storage with validated credentials
let storage: Storage | null = null;
if (serviceAccountCredentials) {
  try {
    storage = new Storage({
      projectId: serviceAccountCredentials.project_id,
      credentials: serviceAccountCredentials
    });
    console.log('Successfully initialized Google Cloud Storage');
  } catch (error) {
    console.error('Error initializing Google Cloud Storage:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

const bucket = storage?.bucket(BUCKET_NAME);

// Initialize Luma client with API token
const client = new LumaAI({
  authToken: LUMA_API_TOKEN
});

// Type definitions for API responses and parameters
type LumaResponse = {
  status: string;
  id?: string;
  error?: string;
  state?: 'completed' | 'failed' | 'dreaming' | 'queued';
  generation?: any;
};

type AspectRatio = "16:9" | "1:1" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";

/**
 * Uploads an image to Google Cloud Storage and returns a signed URL
 * @param url - Local URL of the image to upload
 * @returns Signed URL valid for 1 hour
 */
async function uploadToGCS(url: string): Promise<string> {
  if (!storage || !bucket) {
    throw new Error('Google Cloud Storage not initialized');
  }

  if (url.startsWith('http://localhost:')) {
    try {
      // Extract the file path from the URL
      const urlObj = new URL(url);
      const filePath = path.join(process.cwd(), 'public', urlObj.pathname);
      console.log('Reading file from:', filePath);

      // Validate file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      // Read and upload file
      const buffer = fs.readFileSync(filePath);
      const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      const file = bucket.file(fileName);

      // Upload with metadata
      await file.save(buffer, {
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000'
        }
      });

      // Generate signed URL for secure access
      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000 // 1 hour
      });

      console.log('File uploaded successfully, signed URL:', signedUrl);
      return signedUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }
  return url;
}

/**
 * API handler for video generation requests
 * Processes image uploads and creates video generations using the Luma API
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LumaResponse>
) {
  // Validate environment variables and credentials
  if (!LUMA_API_TOKEN) {
    console.error('LUMA_API_TOKEN not configured');
    return res.status(500).json({
      status: 'error',
      error: 'Please configure your LUMA_API_TOKEN in .env.local'
    });
  }

  if (!serviceAccountCredentials) {
    console.error('Google Cloud service account credentials not found');
    return res.status(500).json({
      status: 'error',
      error: 'Google Cloud service account credentials not found'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      error: 'Method not allowed'
    });
  }

  try {
    const {
      prompt,
      aspect_ratio,
      loop,
      start_frame_url,
      end_frame_url
    } = req.body;

    // Validate required fields
    if (!req.body.keyframes?.frame0?.url && !start_frame_url && !end_frame_url) {
      return res.status(400).json({
        status: 'error',
        error: 'Either keyframes or frame URLs must be provided'
      });
    }

    // Process keyframes from request body
    const initialKeyframes = req.body.keyframes || {};

    // Upload images to GCS and get signed URLs
    if (initialKeyframes.frame0?.url) {
      initialKeyframes.frame0.url = await uploadToGCS(initialKeyframes.frame0.url);
    }
    if (initialKeyframes.frame1?.url) {
      initialKeyframes.frame1.url = await uploadToGCS(initialKeyframes.frame1.url);
    }

    // Prepare request parameters for Luma API
    const params: {
      generation_type: "video";
      prompt: string;
      aspect_ratio: AspectRatio;
      loop: boolean;
      model: string;
      keyframes: {
        frame0?: {
          type: "image";
          url: string;
        };
        frame1?: {
          type: "image";
          url: string;
        };
      };
    } = {
      generation_type: "video",
      prompt: prompt || 'Generate video from image',
      aspect_ratio: (aspect_ratio || "16:9") as AspectRatio,
      loop: loop ?? true,
      model: "ray-1-6",
      keyframes: {
        frame0: initialKeyframes.frame0 ? {
          type: "image",
          url: initialKeyframes.frame0.url
        } : undefined,
        frame1: initialKeyframes.frame1 ? {
          type: "image",
          url: initialKeyframes.frame1.url
        } : undefined
      }
    };

    // Handle start/end frame URLs if not using request body keyframes
    if (!initialKeyframes.frame0) {
      if (start_frame_url) {
        const publicStartUrl = await uploadToGCS(start_frame_url);
        params.keyframes = {
          frame0: {
            type: "image",
            url: publicStartUrl
          },
          frame1: {
            type: "image",
            url: publicStartUrl
          }
        };
      } else if (end_frame_url) {
        const publicEndUrl = await uploadToGCS(end_frame_url);
        params.keyframes = {
          frame0: {
            type: "image",
            url: publicEndUrl
          },
          frame1: {
            type: "image",
            url: publicEndUrl
          }
        };
      }
    }

    // Override frame1 if end_frame_url is provided
    if (end_frame_url && start_frame_url && !initialKeyframes.frame0) {
      const publicEndUrl = await uploadToGCS(end_frame_url);
      params.keyframes.frame1 = {
        type: "image",
        url: publicEndUrl
      };
    }

    // Create generation using Luma API
    const generation = await client.generations.create(params);

    return res.status(200).json({
      status: 'success',
      id: generation.id,
      state: generation.state,
      generation: generation
    });

  } catch (error) {
    console.error('Error in video generation:', error);
    return res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Error generating video'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 