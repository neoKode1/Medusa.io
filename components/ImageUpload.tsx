import Image from 'next/image'

// When referencing files in the public folder, start with a forward slash
<Image 
  src="/uploads/download(2).jpg"  // Note the forward slash at the start
  alt="Uploaded image"
  width={500}
  height={300}
/> 