// LEGACY FILE — no longer imported by any component. Kept in the repo
// for reference only.
//
// Original behavior: hardcoded uploads to a private host. All URLs have
// been replaced with placeholders. If you ever revive this file, point
// it at your own express-upload server (see src/lib/api.ts for the
// current pattern using API_BASE_URL from src/lib/endpoints.ts).

const PLACEHOLDER_URL = 'https://your-server.example.com/api/files/upload';
const PLACEHOLDER_FILE_ID = 'placeholder-file-id';

const handleImageUploadmultiple = async (files: File[] | Blob[]): Promise<string[]> => {
  if (!files || files.length === 0) return [];
  try {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file as Blob);

      const response = await fetch(PLACEHOLDER_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload');
      }

      const result = await response.json();
      return `${PLACEHOLDER_URL.replace('/upload', '')}/${result._id ?? PLACEHOLDER_FILE_ID}`;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    return [`${PLACEHOLDER_URL.replace('/upload', '')}/${PLACEHOLDER_FILE_ID}`];
  }
};

const handleImageUploadsingl = async (file: string | File | Blob): Promise<string> => {
  try {
    let fileToUpload: Blob;

    if (typeof file === 'string' && file.startsWith('data:')) {
      const base64Response = await fetch(file);
      fileToUpload = await base64Response.blob();
    } else {
      fileToUpload = file as Blob;
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    const response = await fetch(PLACEHOLDER_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload');
    }

    const result = await response.json();
    return `${PLACEHOLDER_URL.replace('/upload', '')}/${result._id ?? PLACEHOLDER_FILE_ID}`;
  } catch (error) {
    return `${PLACEHOLDER_URL.replace('/upload', '')}/${PLACEHOLDER_FILE_ID}`;
  }
};

export { handleImageUploadsingl, handleImageUploadmultiple };
