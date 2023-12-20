import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageInput = () => {
  const [image, setImage] = useState<File | null>(null);

  const  imageValidator = (file : File) => {
    if(file.type != "image"){
        return {
            code: "filetype not accepted",
            message: `bite`
          };
      
    }
    return null

  }

  const {acceptedFiles, getRootProps, getInputProps } = useDropzone({
    validator:imageValidator,
    onDrop: acceptedFiles => {
      setImage(acceptedFiles[0]);
    },
  });

  const handleSubmit = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);

    await fetch('http://votreServeur.com/upload', {
      method: 'POST',
      body: formData,
    });
    // Gérer la réponse
  };

  const acceptedFileItems = acceptedFiles.map(file => (
    <li key={file.webkitRelativePath}>
      {file.webkitRelativePath} - {file.size} bytes
    </li>
  ));


  return (
    <>
    <div {...getRootProps({ className: 'dropzone' })} >
      <input {...getInputProps()} />
      {image && <img src={URL.createObjectURL(image)} alt="Aperçu" />}
      <button onClick={handleSubmit}>Envoyer</button>
    </div>
    <div>
        {acceptedFileItems}
    </div>
    </>
  );
};

export default ImageInput;
