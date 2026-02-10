import ImageGallery from './components/ImageGallery'

// Dynamically import all images from the images folder
const imageFiles = import.meta.glob('/public/images/*', { eager: true, query: '?url', import: 'default' })

// Extract number from filename and sort numerically
const images = Object.entries(imageFiles)
    .map(([path, src]) => {
        const filename = path.split('/').pop()
        const num = parseInt(filename.match(/pb(\d+)/)?.[1] || '0', 10)
        return { src, num, caption: `Day ${num}` }
    })
    .sort((a, b) => a.num - b.num)

function App() {
    return (
        <div className="app">
            <h1 className="title">Puzzle Boyz</h1>
            <ImageGallery images={images} />
        </div>
    )
}

export default App
