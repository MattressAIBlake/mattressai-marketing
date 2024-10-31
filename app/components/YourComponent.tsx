import React, { useState } from 'react';
import { toast } from 'react-toastify';

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
      
      // Handle success...
      
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    // Your component JSX
  );
};

export default YourComponent; 