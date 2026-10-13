import React, { useState } from "react"
import styled from "styled-components"
import { Button, ButtonBar, Column } from "../../../atoms"
import { Dialog, WorkoutGraph } from "../../../molecules"

export const ANY = 'any'

const ACCENT = '#4fc3f7'
const MUTED = 'rgba(127,127,127,0.45)'

const ContentArea = styled(Column)`
    height: calc(100% - 7.7vh);
    width: calc(100% - 2vw);
    padding: 0 1vw;
    overflow-y: auto;
`

const Choices = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 2vw;
    padding: 1.5vh 1vw;
    margin-top: 1vh;
    border: 1px solid ${MUTED};
    border-radius: 12px;
`

const Choice = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6vh;
`

const ChoiceLabel = styled.label`
    font-size: 1.3vh;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.75;
`

const Select = styled.select`
    font-size: 1.8vh;
    padding: 0.6vh 0.6vw;
    border-radius: 8px;
`

const Picker = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.3vw;
    height: 3.6vh;
`

const AnyPill = styled.button`
    font-size: 1.6vh;
    padding: 0.3vh 0.6vw;
    margin-right: 0.4vw;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    color: ${props => props.$active ? ACCENT : 'inherit'};
    background: ${props => props.$active ? 'rgba(79,195,247,0.15)' : 'transparent'};
`

const Chevron = styled.span`
    font-size: ${props => props.$size ?? '2.4vh'};
    font-weight: bold;
    line-height: 1;
    cursor: ${props => props.onClick ? 'pointer' : 'default'};
    color: ${props => props.$on ? ACCENT : MUTED};
`

const Bars = styled.span`
    display: inline-flex;
    align-items: flex-end;
    gap: 0.15vw;
    height: ${props => props.$height ?? '2.6vh'};
`

const Bar = styled.span`
    display: inline-block;
    width: 0.35vw;
    min-width: 4px;
    height: ${props => props.$level * 33}%;
    border-radius: 2px;
    cursor: ${props => props.onClick ? 'pointer' : 'default'};
    background: ${props => props.$on ? ACCENT : MUTED};
`

const Result = styled.div`
    margin-top: 1.5vh;
    padding: 1.5vh 1.5vw;
    border: 1px solid ${MUTED};
    border-radius: 12px;
`

const ResultHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

const Name = styled.h2`
    margin: 0;
    font-size: 3.2vh;
`

const EnergyPill = styled.span`
    font-size: 1.6vh;
    padding: 0.4vh 0.8vw;
    border-radius: 8px;
    color: ${ACCENT};
    background: rgba(79,195,247,0.12);
`

const Stats = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 2.5vw;
    margin-top: 1.2vh;
    font-size: 1.7vh;
`

const Stat = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.6vw;
`

const StatValue = styled.b`
    font-family: monospace;
    font-size: 2vh;
`

const Description = styled.p`
    font-style: italic;
    opacity: 0.85;
    margin: 1.2vh 0;
`

const Graph = styled.div`
    width: 100%;
    height: 28vh;
`

const DetailsToggle = styled.button`
    margin-top: 1.2vh;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 1.5vh;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.5vh 0;
`

const Details = styled.pre`
    font-size: 1.6vh;
    margin: 0.5vh 0 0 0;
    white-space: pre-wrap;
`

const formatMinutes = (sec) => `${Math.round(sec / 60)}min`

export const DifficultyChevrons = ({ value, onSelect, size }) => (
    <span aria-label={`Difficulty ${value ?? 'any'}`}>
        {[1, 2, 3, 4, 5].map(level => (
            <Chevron key={level} $size={size} $on={value !== ANY && value >= level} data-testid={`difficulty-${level}`}
                onClick={onSelect ? () => onSelect(level) : undefined}>❯</Chevron>
        ))}
    </span>
)

export const ConcentrationBars = ({ value, onSelect, height }) => (
    <Bars $height={height} aria-label={`Concentration ${value ?? 'any'}`}>
        {[1, 2, 3].map(level => (
            <Bar key={level} $level={level} $on={value !== ANY && value >= level} data-testid={`concentration-${level}`}
                onClick={onSelect ? () => onSelect(level) : undefined} />
        ))}
    </Bars>
)

export const formatDetails = (details) =>
    (details ?? []).map(section => [section.title, ...section.lines.map(l => `- ${l}`)].join('\n')).join('\n\n')

/**
 * Workout Generator dialog (view only - all logic is in the WorkoutGeneratorService)
 */
export const WorkoutGeneratorView = ({ options, choice, generated, ftp, saved, onChange, onGenerate, onSave, onClose }) => {
    const [showDetails, setShowDetails] = useState(false)
    const energyInfo = options?.energySystems?.find(e => e.id === generated?.energy)

    const set = (key) => (value) => onChange?.({ ...choice, [key]: value })
    const toValue = (v) => v === ANY ? ANY : Number(v)

    return (
        <Dialog id='WorkoutGenerator' title='Generate Workout' width='80vw' height='88vh' zIndex={100} onESC={onClose}>
            <ContentArea>
                <Choices>
                    <Choice>
                        <ChoiceLabel htmlFor='generator-duration'>Duration</ChoiceLabel>
                        <Select id='generator-duration' value={choice.duration} onChange={e => set('duration')(toValue(e.target.value))}>
                            <option value={ANY}>Any</option>
                            {options.durations.map(d => <option key={d} value={d}>{d}min</option>)}
                        </Select>
                    </Choice>
                    <Choice>
                        <ChoiceLabel htmlFor='generator-energy'>Energy System</ChoiceLabel>
                        <Select id='generator-energy' value={choice.energy} onChange={e => set('energy')(e.target.value)}>
                            <option value={ANY}>Any</option>
                            {options.energySystems.map(e => <option key={e.id} value={e.id}>{e.label} - {e.subtitle}</option>)}
                        </Select>
                    </Choice>
                    <Choice>
                        <ChoiceLabel>Difficulty</ChoiceLabel>
                        <Picker>
                            <AnyPill $active={choice.difficulty === ANY} onClick={() => set('difficulty')(ANY)}>Any</AnyPill>
                            <DifficultyChevrons value={choice.difficulty} onSelect={set('difficulty')} />
                        </Picker>
                    </Choice>
                    <Choice>
                        <ChoiceLabel>Concentration</ChoiceLabel>
                        <Picker>
                            <AnyPill $active={choice.concentration === ANY} onClick={() => set('concentration')(ANY)}>Any</AnyPill>
                            <ConcentrationBars value={choice.concentration} onSelect={set('concentration')} />
                        </Picker>
                    </Choice>
                    <Choice>
                        <Button primary={true} text='Generate' onClick={onGenerate} />
                    </Choice>
                </Choices>

                {generated ?
                    <Result>
                        <ResultHeader>
                            <Name>{generated.name}</Name>
                            {energyInfo ? <EnergyPill>{energyInfo.label}</EnergyPill> : null}
                        </ResultHeader>
                        <Stats>
                            <Stat>Difficulty <DifficultyChevrons value={generated.difficulty} size='2vh' /></Stat>
                            <Stat>Concentration <ConcentrationBars value={generated.concentration} height='2vh' /></Stat>
                            <Stat>TSS <StatValue>{generated.tss}</StatValue></Stat>
                            <Stat>Duration <StatValue>{formatMinutes(generated.duration)}</StatValue></Stat>
                            <Stat>FTP <StatValue>{ftp}W</StatValue></Stat>
                        </Stats>
                        <Description>{generated.description}</Description>
                        {generated.workout ? <Graph className='graph'><WorkoutGraph workout={generated.workout} ftp={ftp} /></Graph> : null}
                        <DetailsToggle onClick={() => setShowDetails(!showDetails)}>{showDetails ? '⌄' : '›'} Workout Details</DetailsToggle>
                        {showDetails ? <Details>{formatDetails(generated.details)}</Details> : null}
                    </Result>
                    : null}
            </ContentArea>
            <ButtonBar justify='center'>
                <Button primary={true} text={saved ? 'Saved' : 'Save to My Workouts'} disabled={!generated || saved} onClick={onSave} />
                <Button primary={false} text='Close' onClick={onClose} />
            </ButtonBar>
        </Dialog>
    )
}
