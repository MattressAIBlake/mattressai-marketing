import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

const YourComponent: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    try {
      const response = await fetch('/api/generateImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'your prompt here',
          platform: 'your platform here',
          url: 'your url here'
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      setImageUrl(data.imageUrl);
      
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <button onClick={handleGenerateImage}>Generate Image</button>
      {imageUrl && (
        <Image 
          src={imageUrl}
          alt="Generated"
          width={500}
          height={500}
          className="w-auto h-auto"
        />
      )}
    </div>
  );
};

export default YourComponent; 