import { useState } from 'react'

function ImageGallery({ images }) {
    const [selectedImage, setSelectedImage] = useState(null)

    return (
        <>
            <div className="gallery">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="image-card"
                        onClick={() => setSelectedImage(image)}
                    >
                        <img src={image.src} alt={image.caption || `Image ${index + 1}`} />
                        {image.caption && <div className="caption">{image.caption}</div>}
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div className="lightbox" onClick={() => setSelectedImage(null)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
                            ×
                        </button>
                        <img src={selectedImage.src} alt={selectedImage.caption} />
                        {selectedImage.caption && (
                            <div className="lightbox-caption">{selectedImage.caption}</div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default ImageGallery
