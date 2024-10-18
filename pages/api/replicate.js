import Replicate from "replicate";

// Initialize Replicate client with API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  console.log("Received request body:", req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("REPLICATE_API_TOKEN is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const { prompt, model } = req.body;

    console.log("Received request:", { prompt, model });

    if (!prompt || !model) {
      return res.status(400).json({ error: "Prompt and model are required." });
    }

    // Define the model key based on user selection
    let modelKey;
    if (model === "flux-schnell") {
      modelKey = "black-forest-labs/flux-schnell:bf53bdb93d739c9c915091cfa5f49ca662d11273a5eb30e7a2ec1939bcf27a00";
    } else if (model === "stablediffusion") {
      modelKey = "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf";
    } else {
      return res.status(400).json({ error: "Unsupported model selected." });
    }

    console.log("Selected model key:", modelKey);

    // Set input parameters based on the selected model
    const input = {
      prompt,
      go_fast: model === "flux-schnell",  // Fast mode for flux-schnell
      num_outputs: 1,
      aspect_ratio: "1:1",  // Modify as needed
      output_format: "webp",  // You can adjust this depending on your requirements
      output_quality: 80,
    };

    console.log("Input parameters:", input);

    // Run the selected model using Replicate API
    const output = await replicate.run(modelKey, { input });

    console.log("Replicate output:", output);

    // Handle the output based on its structure
    let imageUrl;
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === 'object' && output.output) {
      imageUrl = output.output;
    } else {
      imageUrl = output;
    }

    // Return the output URL to the user
    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({ 
      error: "Failed to generate image", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}