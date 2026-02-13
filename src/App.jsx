import AudioOnJoin from "./components/AudioOnJoin";
import Chat from "./components/Chat";
import ImageGallery from "./components/ImageGallery";

// Dynamically import all images from the images folder
const imageFiles = import.meta.glob("/public/images/*", {
    eager: true,
    query: "?url",
    import: "default",
});
const images = Object.entries(imageFiles)

    .map(([path, src]) => {
        const filename = path.split("/").pop();

        const num = parseInt(filename.match(/pb(\d+)/)?.[1] || "0", 10);

        // Set initial upvotes to 0
        const upvotes = 0;
        return { src, num, caption: `Day ${num}`, upvotes };
    })

    .sort((a, b) => b.num - a.num);

// Set random favicon from loaded images
if (images.length > 0) {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const favicon = document.getElementById("favicon");
    if (favicon) {
        favicon.href = randomImage.src;
    }
}

function App() {
    const [latestImage, ...olderImages] = images;

    return (
        <div className="app">
            <h1 className="title">Puzzle Boyz</h1>

            <AudioOnJoin src="/audio/join.mp3" />

            <ImageGallery latestImage={latestImage} images={olderImages} />

            <Chat />
        </div>
    );
}

export default App;
