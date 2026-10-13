import React, { useState } from "react"
import styled from "styled-components"
import { useWorkoutInbox } from "incyclist-services"
import { Button, CheckBox } from "../../../atoms"
import { useAppUI } from "../../../../bindings/native-ui"

const Bar = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5vw;
    margin-left: auto;
`

/**
 * Workouts page toolbar: opens a workout library in the browser and switches
 * the automatic import of downloaded workouts (Workout Inbox) on/off
 */
export const WorkoutInboxBar = () => {
    const inbox = useWorkoutInbox()
    const appUI = useAppUI()
    const [enabled, setEnabled] = useState(() => inbox.isEnabled())

    if (!inbox.isSupported())
        return null

    const onFind = () => {
        appUI.openBrowserWindow(inbox.getLibraryUrl())
    }

    const onToggle = (checked) => {
        setEnabled(checked)
        inbox.setEnabled(checked)
    }

    return (
        <Bar>
            <Button text='Find workouts' onClick={onFind} />
            <CheckBox id='workout-inbox-enabled' label='Import downloads automatically' value={enabled} onValueChange={onToggle} />
        </Bar>
    )
}
