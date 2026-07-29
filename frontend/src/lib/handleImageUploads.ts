const handleImageUploadmultiple = async (files) => {
  if (files.length === 0) return;
  try {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file as Blob);

      const response = await fetch(
        "https://img-srv.lmstream.xyz/api/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload`);
      }

      const result = await response.json();
      return (
        `https://img-srv.lmstream.xyz/api/files/${result._id}${result.extension}` ||
        "https://img-srv.lmstream.xyz/api/files/ed4799d57ba0"
      );
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return uploadedUrls;
  } catch (error) {
    return "https://img-srv.lmstream.xyz/api/files/ed4799d57ba0";
  }
};

const handleImageUploadsingl = async (file: string | File) => {
  try {
    let fileToUpload: Blob;
    
    // Check if the input is a base64 string
    if (typeof file === 'string' && file.startsWith('data:')) {
      // Convert base64 to Blob
      const base64Response = await fetch(file);
      fileToUpload = await base64Response.blob();
    } else {
      // It's already a File object
      fileToUpload = file as Blob;
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    const response = await fetch(
      "https://img-srv.lmstream.xyz/api/files/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to upload`);
    }

    const result = await response.json();
    return (
      `https://img-srv.lmstream.xyz/api/files/${result._id}${result.extension}` ||
      "https://img-srv.lmstream.xyz/api/files/ed4799d57ba0"
    );
  } catch (error) {
    return "https://img-srv.lmstream.xyz/api/files/ed4799d57ba0";
  }
};

export { handleImageUploadsingl, handleImageUploadmultiple };
