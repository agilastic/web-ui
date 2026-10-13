import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { useWorkoutInbox } from "incyclist-services"
import { Button } from "../../../atoms"
import { useAppUI } from "../../../../bindings/native-ui"

const Bar = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5vw;
`

const Switch = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 0.5vw;
    white-space: nowrap;
    font-size: 1.8vh;
    color: white;
    cursor: pointer;
    text-shadow: 0 1px 6px rgba(0,0,0,.55);
    input { width: 1.8vh; height: 1.8vh; margin: 0; cursor: pointer; accent-color: #f0a03c; }
`

const Hint = styled.div`
    max-width: 18vw;
    font-size: 1.4vh;
    line-height: 1.3;
    color: #ffcf87;
    text-shadow: 0 1px 6px rgba(0,0,0,.7);
`

/**
 * Workouts page toolbar: opens a workout library in the browser and switches
 * the automatic import of downloaded workouts (Workout Inbox) on/off
 */
export const WorkoutInboxBar = () => {
    const inbox = useWorkoutInbox()
    const appUI = useAppUI()
    const [enabled, setEnabled] = useState(() => inbox.isEnabled())
    const [status, setStatus] = useState(() => inbox.getStatus())

    useEffect(() => {
        const onStatus = (s) => setStatus(s)
        inbox.on('status', onStatus)
        return () => { inbox.off('status', onStatus) }
    }, [inbox])

    if (!inbox.isSupported())
        return null

    const onFind = () => {
        appUI.openBrowserWindow(inbox.getLibraryUrl())
    }

    const onToggle = (e) => {
        const checked = e.target.checked
        setEnabled(checked)
        inbox.setEnabled(checked)
    }

    return (
        <Bar>
            <Button text='Find workouts' onClick={onFind} />
            <Switch>
                <input type='checkbox' checked={enabled} onChange={onToggle} />
                Import downloads automatically
            </Switch>
            {enabled && status === 'no-access' ?
                <Hint role='alert'>No access to the Downloads folder. Allow it in System Settings › Privacy &amp; Security › Files and Folders, then switch the import off and on.</Hint>
                : null}
        </Bar>
    )
}
