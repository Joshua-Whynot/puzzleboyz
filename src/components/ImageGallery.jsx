function ImageGallery({ images }) {
    return (
        <div className="gallery">
            {images.map((image, index) => (
                <div key={index} className="image-card">
                    <img src={image.src} alt={image.caption || `Image ${index + 1}`} />
                    {image.caption && <div className="caption">{image.caption}</div>}
                </div>
            ))}
        </div>
    )
}

export default ImageGallery
