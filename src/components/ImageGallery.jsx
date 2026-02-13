import { useState } from "react";

function ImageGallery({ latestImage, images }) {
    const [selectedImage, setSelectedImage] = useState(null);

    // Combine latestImage and images for upvote state
    const initialImages = [
        ...(latestImage ? [latestImage] : []),
        ...images,
    ].map((img) => ({
        ...img,
        upvotes: 0,
    }));

    const [galleryImages, setGalleryImages] = useState(initialImages);

    // Track upvoted images in localStorage
    const getUpvotedSet = () => {
        try {
            const stored = localStorage.getItem("upvotedImages");
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    };

    const [upvotedSet, setUpvotedSet] = useState(getUpvotedSet);

    // Helper to get image by index (0 = featured, rest = gallery)
    const getImage = (idx) => galleryImages[idx];

    // Upvote handler
    const handleUpvote = (idx, e) => {
        e.stopPropagation();
        const img = galleryImages[idx];
        const imgKey = img.src;
        if (upvotedSet.has(imgKey)) return;
        setGalleryImages((prev) =>
            prev.map((img, i) =>
                i === idx ? { ...img, upvotes: img.upvotes + 1 } : img,
            ),
        );
        const newSet = new Set(upvotedSet);
        newSet.add(imgKey);
        setUpvotedSet(newSet);
        localStorage.setItem(
            "upvotedImages",
            JSON.stringify(Array.from(newSet)),
        );
    };

    // Find selected image index for upvotes
    const selectedIdx = selectedImage
        ? galleryImages.findIndex((img) => img.src === selectedImage.src)
        : -1;

    return (
        <>
            {galleryImages[0] && (
                <div
                    className="featured-image"
                    onClick={() => setSelectedImage(galleryImages[0])}
                >
                    <img
                        src={galleryImages[0].src}
                        alt={galleryImages[0].caption || "Latest puzzle"}
                    />
                    {galleryImages[0].caption && (
                        <div className="featured-caption">
                            {galleryImages[0].caption}
                        </div>
                    )}
                    <button
                        className="upvote-btn"
                        onClick={(e) => handleUpvote(0, e)}
                        aria-label="Upvote"
                        disabled={upvotedSet.has(galleryImages[0].src)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: upvotedSet.has(galleryImages[0].src)
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "1.2rem",
                            marginRight: "0.5rem",
                            opacity: upvotedSet.has(galleryImages[0].src)
                                ? 0.5
                                : 1,
                        }}
                    >
                        ⬆️
                    </button>
                    <span className="upvotes-badge">
                        {galleryImages[0].upvotes}
                    </span>
                </div>
            )}

            <div className="gallery">
                {galleryImages.slice(1).map((image, index) => (
                    <div
                        key={index + 1}
                        className="image-card"
                        onClick={() => setSelectedImage(image)}
                    >
                        <img
                            src={image.src}
                            alt={image.caption || `Image ${index + 1}`}
                        />
                        {image.caption && (
                            <div className="caption">{image.caption}</div>
                        )}
                        <button
                            className="upvote-btn"
                            onClick={(e) => handleUpvote(index + 1, e)}
                            aria-label="Upvote"
                            disabled={upvotedSet.has(image.src)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: upvotedSet.has(image.src)
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize: "1.2rem",
                                marginRight: "0.5rem",
                                opacity: upvotedSet.has(image.src) ? 0.5 : 1,
                            }}
                        >
                            ⬆️
                        </button>
                        <span className="upvotes-badge">{image.upvotes}</span>
                    </div>
                ))}
            </div>

            {selectedImage && selectedIdx !== -1 && (
                <div
                    className="lightbox"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="lightbox-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="lightbox-close"
                            onClick={() => setSelectedImage(null)}
                        >
                            ×
                        </button>
                        <img
                            src={selectedImage.src}
                            alt={selectedImage.caption}
                        />
                        {selectedImage.caption && (
                            <div className="lightbox-caption">
                                {selectedImage.caption}
                            </div>
                        )}
                        <button
                            className="upvote-btn"
                            onClick={(e) => handleUpvote(selectedIdx, e)}
                            aria-label="Upvote"
                            disabled={upvotedSet.has(selectedImage.src)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: upvotedSet.has(selectedImage.src)
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize: "1.2rem",
                                marginRight: "0.5rem",
                                marginTop: "1rem",
                                opacity: upvotedSet.has(selectedImage.src)
                                    ? 0.5
                                    : 1,
                            }}
                        >
                            ⬆️
                        </button>
                        <span
                            className="upvotes-badge"
                            style={{ marginTop: "1rem", fontSize: "1.2rem" }}
                        >
                            {galleryImages[selectedIdx].upvotes}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}

export default ImageGallery;
