import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

const YourComponent: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    try {
      const response = await fetch('/api/generateImage:1', {
        method: 'POST',
        // your options...
      });
      
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      setImageUrl(data.imageUrl);
      
    } catch (err) {
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