import React, { useCallback, useState } from "react"
import { useWorkoutGenerator } from "incyclist-services"
import { Button } from "../../../atoms"
import { ANY, WorkoutGeneratorView } from "./WorkoutGeneratorView"

const DEFAULT_CHOICE = { duration: 60, energy: ANY, difficulty: ANY, concentration: ANY }

const toOptions = (choice) => {
    const options = {}
    Object.keys(choice).forEach(key => {
        if (choice[key] !== ANY)
            options[key] = choice[key]
    })
    return options
}

/**
 * Workout Generator dialog - connects the view with the WorkoutGeneratorService
 */
export const WorkoutGeneratorDialog = ({ onClose }) => {
    const service = useWorkoutGenerator()
    const [choice, setChoice] = useState(DEFAULT_CHOICE)
    const [generated, setGenerated] = useState(() => service.generate(toOptions(DEFAULT_CHOICE)))
    const [saved, setSaved] = useState(false)

    const onGenerate = useCallback(() => {
        setGenerated(service.generate(toOptions(choice)))
        setSaved(false)
    }, [service, choice])

    const onSave = useCallback(() => {
        if (generated && service.save(generated))
            setSaved(true)
    }, [service, generated])

    return <WorkoutGeneratorView options={service.getOptions()} choice={choice} generated={generated} ftp={service.getFtp()}
        saved={saved} onChange={setChoice} onGenerate={onGenerate} onSave={onSave} onClose={onClose} />
}

/**
 * Button that opens the Workout Generator
 */
export const WorkoutGeneratorButton = () => {
    const [open, setOpen] = useState(false)
    return <>
        <Button text='Generate workout' onClick={() => setOpen(true)} />
        {open ? <WorkoutGeneratorDialog onClose={() => setOpen(false)} /> : null}
    </>
}
