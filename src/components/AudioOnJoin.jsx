import { useCallback, useEffect, useRef, useState } from 'react'

const INTERACTION_EVENTS = [
    'click', 'keydown', 'keyup', 'keypress',
    'mousemove', 'mousedown', 'mouseup', 'mouseover',
    'scroll', 'wheel',
    'touchstart', 'touchend', 'touchmove',
    'pointerdown', 'pointermove', 'pointerup',
]

export default function AudioOnJoin({ src = '/audio/join.mp3', initialVolume = 0.7 }) {
    const audioRef = useRef(null)
    const hasPlayedRef = useRef(false)
    const [volume, setVolume] = useState(initialVolume)

    // Create audio element once on mount, keep it ready
    useEffect(() => {
        const audio = new Audio(src)
        audio.preload = 'auto'
        audio.volume = volume
        audio.loop = true
        audioRef.current = audio

        return () => {
            audio.pause()
            audio.src = ''
            audioRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src])

    // The single handler that fires on ANY interaction
    const playOnInteraction = useCallback(() => {
        if (hasPlayedRef.current) return
        if (!audioRef.current) return

        const audio = audioRef.current
        audio.volume = volume
        audio.play()
            .then(() => {
                hasPlayedRef.current = true
            })
            .catch(() => {
                // Rare edge case — keep listeners alive to retry on next interaction
            })
    }, [volume])

    // Attach / detach listeners for every interaction type
    useEffect(() => {
        // First, try autoplay immediately (works if browser allows it)
        playOnInteraction()

        // If that didn't work, listen for literally any interaction
        if (!hasPlayedRef.current) {
            const handler = () => {
                playOnInteraction()
                // Clean up all listeners once played
                if (hasPlayedRef.current) {
                    INTERACTION_EVENTS.forEach((evt) =>
                        document.removeEventListener(evt, handler, { capture: true })
                    )
                }
            }

            INTERACTION_EVENTS.forEach((evt) =>
                document.addEventListener(evt, handler, { capture: true, passive: true })
            )

            return () => {
                INTERACTION_EVENTS.forEach((evt) =>
                    document.removeEventListener(evt, handler, { capture: true })
                )
            }
        }
    }, [playOnInteraction])

    const handleVolumeChange = (e) => {
        const v = Math.min(1, Math.max(0.3, Number(e.target.value)))
        setVolume(v)
        if (audioRef.current) {
            audioRef.current.volume = v
        }
    }

    return (
        <div className="audio-controls" role="group" aria-label="Site audio controls">
            <label className="volume-label" htmlFor="volume-slider">Volume</label>
            <input
                id="volume-slider"
                className="volume-slider"
                type="range"
                min={0.3}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                aria-valuemin={0.3}
                aria-valuemax={1}
                aria-valuenow={volume}
            />
        </div>
    )
}
