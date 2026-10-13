import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { useWorkoutInbox } from "incyclist-services"

export const TOAST_DURATION = 5000

const Toast = styled.div`
    position: fixed;
    right: 2vw;
    bottom: 3vh;
    z-index: 1000;
    max-width: 30vw;
    padding: 1.2vh 1.2vw;
    border-radius: 10px;
    color: white;
    background: ${props => props.$error ? 'rgba(160,30,30,0.92)' : 'rgba(30,30,30,0.88)'};
    box-shadow: 0 4px 16px rgba(0,0,0,0.35);
    font-size: 1.6vh;
    pointer-events: none;
`

const getText = (event, data) => {
    if (event === 'error')
        return `Workout could not be imported: ${data.name}`
    return data.count > 1 ? `${data.count} workouts imported: ${data.name}` : `Workout imported: ${data.name}`
}

/**
 * Shows a short notice whenever the Workout Inbox imported a downloaded workout (on every page)
 */
export const WorkoutInboxToast = () => {
    const [message, setMessage] = useState(null)
    const refTimeout = useRef(null)

    useEffect(() => {
        const inbox = useWorkoutInbox()

        const show = (event) => (data) => {
            setMessage({ text: getText(event, data), error: event === 'error' })
            clearTimeout(refTimeout.current)
            refTimeout.current = setTimeout(() => setMessage(null), TOAST_DURATION)
        }
        const onImported = show('imported')
        const onError = show('error')

        inbox.on('imported', onImported)
        inbox.on('error', onError)
        return () => {
            inbox.off('imported', onImported)
            inbox.off('error', onError)
            clearTimeout(refTimeout.current)
        }
    }, [])

    if (!message)
        return null

    return <Toast role='status' $error={message.error}>{message.text}</Toast>
}
