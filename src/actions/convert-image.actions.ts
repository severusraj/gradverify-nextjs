"use server";

export async function convertImageToBase64(imageUrl: string) {
  try {
    if (!imageUrl) {
      return { success: false, error: 'Image URL is required' };
    }

    // Fetch the image from S3
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    // Convert to buffer
    const buffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64 = Buffer.from(buffer).toString('base64');
    
    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Return base64 data URL
    const dataUrl = `data:${contentType};base64,${base64}`;
    
    return { 
      success: true, 
      dataUrl,
      contentType 
    };

  } catch (error) {
    console.error('Image conversion error:', error);
    return { 
      success: false, 
      error: 'Failed to convert image' 
    };
  }
} 