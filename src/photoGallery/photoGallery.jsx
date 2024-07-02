import './photoGallery.css'
import zvejuNamelis from '../Images/zveju.jpg'
import arrow from '../Images/arrowDown.png'
import { useState } from 'react'
import { LazyLoadImage, blur } from 'react-lazy-load-image-component'
import pagrindinis from '../Images/pagrinidispastatas.jpg'



function PhotoGallery({images}){
    const [imageIndex, setImageIndex] = useState(0);

    const handleNextClick = () => {
        setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrevClick = () => {
        setImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const extractFileName = (url) => {
        const fileNameWithExtension = url.split('/').pop(); // Get the last segment after the last slash
        const fileName = fileNameWithExtension.split('.').slice(0, -1).join('.'); // Removes the extension
        // Remove the hash part, assuming it follows a predictable pattern like a dot followed by a hash
        const cleanFileName = fileName.replace(/\.[0-9a-f]{10,}$/i, '');
        return cleanFileName;
    };
    return(
        <div className='photoGalleryContainer'>
            <LazyLoadImage
             className="photoGalleryImage"
              src={images[imageIndex]}
              effect={blur}>
                
            </LazyLoadImage>
            <div className='photoGalleryNav'>
                <button className='button' onClick={handlePrevClick}><img className="photoGalleryArrowLeft"src={arrow} alt="" /></button>
                <button className='button' onClick={handleNextClick}><img className="photoGalleryArrowRight"src={arrow} alt="" /></button>
                <a className='photoGalleryImageName'>{extractFileName(images[imageIndex])}</a>
            </div>
        </div>
    )
}

export default PhotoGallery