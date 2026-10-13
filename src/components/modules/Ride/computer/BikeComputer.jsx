import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useActivityRide, useRideDisplay } from 'incyclist-services'
import { MapOverlay } from '../overlays/Map/MapOverlay'
import { UpcomingElevationOverlay } from '../overlays/UpcomingElevation/UpcomingElevationOverlay'
import { ElevationProfile } from './ElevationProfile'

// the unit looks like a real bike computer on the handlebar: slightly tilted back, raised bezel, glass reflection
const Mount = styled.div`
    width: 100%;
    height: 100%;
    perspective: 900px;
    perspective-origin: 50% 0%;
`

const Unit = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 0.7vh 0.55vw 0;
    border-radius: 18px 18px 0 0;
    cursor: pointer;
    transform: rotateX(20deg);
    transform-origin: 50% 100%;
    background: linear-gradient(175deg, #3a404b 0%, #1c2027 18%, #111419 60%, #0b0d10 100%);
    border: 1px solid rgba(255,255,255,.18);
    border-bottom: none;
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,.25),
        inset 0 -6px 12px rgba(0,0,0,.6),
        inset 2px 0 3px rgba(255,255,255,.06),
        inset -2px 0 3px rgba(0,0,0,.5),
        0 -4px 10px rgba(0,0,0,.35),
        0 14px 34px rgba(0,0,0,.65);
    display: flex;
    flex-direction: column;
    gap: 0.4vh;
    color: white;
    user-select: none;
    &::after {
        /* glass reflection on the screen */
        content: '';
        position: absolute;
        inset: 0.7vh 0.55vw 0;
        border-radius: 12px 12px 0 0;
        pointer-events: none;
        background: linear-gradient(125deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,.03) 28%, rgba(255,255,255,0) 45%);
    }
`

const Row = styled.div`
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: row;
    gap: 0.4vw;
`

const Fields = styled.div`
    flex: ${props => props.$fill ? '1 1 0' : 'none'};
    height: ${props => props.$fill ? '100%' : 'auto'};
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(${props => props.$columns ?? 2}, 1fr);
    grid-auto-rows: 1fr;
    border-radius: 10px;
    overflow: hidden;
    background: #0b0d10;
    border: 1px solid rgba(255,255,255,.08);
    ${props => props.$compact ? `
        .computer-field { padding: 0.15vh 0.5vw 0.2vh; }
        .computer-field > div:first-of-type { font-size: 0.85vh; }
        .computer-field-value { font-size: 2vh; line-height: 1.05; }
        .computer-field-secondary { font-size: 1.05vh; }
    ` : ''}
`

const Field = styled.div`
    position: relative;
    box-sizing: border-box;
    padding: 0.3vh 0.5vw 0.35vh;
    border-right: 1px solid rgba(255,255,255,.08);
    border-bottom: 1px solid rgba(255,255,255,.08);
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    grid-column: ${props => props.$span ? `span ${props.$span}` : 'auto'};
`

const FieldTitle = styled.div`
    font-size: 0.95vh;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: rgba(255,255,255,.6);
    white-space: nowrap;
`

const FieldValue = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.25vw;
    font-size: ${props => props.$small ? '1.7vh' : '2.4vh'};
    font-weight: 700;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
`

const FieldUnit = styled.span`
    font-size: 1vh;
    font-weight: 500;
    color: rgba(255,255,255,.65);
`

const FieldSecondary = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.3vw;
    font-size: 1.25vh;
    color: rgba(255,255,255,.75);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    > span:first-child:not(:only-child) {
        font-size: 0.85vh;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: rgba(255,255,255,.5);
    }
`

const Led = styled.span`
    position: absolute;
    top: 0.6vh;
    right: 0.5vw;
    width: 0.8vh;
    height: 0.8vh;
    border-radius: 50%;
    background: ${props => props.$color};
    box-shadow: 0 0 6px ${props => props.$color};
`

const Section = styled.div`
    position: relative;
    flex: ${props => props.$flex};
    min-height: 0;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.08);
    background: #0b0d10;
`

const SectionLabel = styled.div`
    position: absolute;
    top: 0.4vh;
    left: 0.5vw;
    z-index: 2;
    font-size: 1.1vh;
    font-weight: 700;
    letter-spacing: .12em;
    color: rgba(255,255,255,.6);
`

const asArray = (data) => Array.isArray(data) ? data : (data ? [data] : [])
const hasValue = (d) => d?.value !== undefined && d?.value !== null && d?.value !== ''

/**
 * One data field of the bike computer - main value plus the second line (e.g. AVG, time/distance to go)
 */
// fields that keep their second line on the small strips (time -> remaining time)
const ALWAYS_SECONDARY = ['time']

export const ComputerField = ({ item, span, small }) => {
    const [main, secondary] = asArray(item?.data)
    const led = item?.dataState === 'red' ? '#e74c3c' : item?.dataState === 'amber' ? '#ffbf00' : undefined

    return (
        <Field $span={span} className='computer-field'>
            {led ? <Led $color={led} /> : null}
            <FieldTitle>{item?.title}</FieldTitle>
            <FieldValue $small={small} className='computer-field-value'>
                <span>{hasValue(main) ? main.value : '–'}</span>
                {main?.unit ? <FieldUnit>{main.unit}</FieldUnit> : null}
            </FieldValue>
            {secondary && (!small || ALWAYS_SECONDARY.includes(item?.title?.toLowerCase())) ?
                <FieldSecondary className='computer-field-secondary'>
                    {secondary.label ? <span>{secondary.label}</span> : null}
                    <span>{hasValue(secondary) ? secondary.value : ' '}</span>
                    {secondary.unit ? <FieldUnit>{secondary.unit}</FieldUnit> : null}
                </FieldSecondary>
                : null}
        </Field>
    )
}

const Extra = styled.div`
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    grid-column: span ${props => props.$span};
`

/**
 * Data fields in a grid - the free space after the last field is used by `extra` (or the last field fills its row)
 */
export const ComputerFields = ({ items = [], columns = 3, small = false, fill = false, compact = false, extra }) => {
    const fields = items.filter(Boolean)
    const rest = fields.length % columns
    const free = rest ? columns - rest : 0
    return (
        <Fields className='computer-fields' $columns={columns} $fill={fill} $compact={compact}>
            {fields.map((item, idx) =>
                <ComputerField key={`${item.title}-${idx}`} item={item} small={small}
                    span={free && !extra && idx === fields.length - 1 ? free + 1 : undefined} />
            )}
            {free && extra ? <Extra $span={free} className='computer-extra'>{extra}</Extra> : null}
        </Fields>
    )
}

// key values shown on top of the map and climb screens
const STRIP_FIELDS = {
    map: ['Time', 'Speed', 'Power', 'Distance'],
    climb: ['Time', 'Slope', 'Speed', 'Power'],
}

export const pickFields = (items, titles) => {
    const picked = titles.map(t => items.find(i => i?.title?.toLowerCase() === t.toLowerCase())).filter(Boolean)
    return picked.length ? picked : items.slice(0, titles.length)
}

export const COMPUTER_SCREENS = ['data', 'map', 'climb']

// same data source as the classic dashboard (DynamicRideDashboard)
const useDashboardItems = () => {
    const service = useActivityRide()
    const refObserver = useRef(null)
    const [items, setItems] = useState(() => service.getDashboardDisplayProperties?.() ?? [])

    const onData = useCallback(() => {
        setItems(service.getDashboardDisplayProperties())
    }, [service])

    useEffect(() => {
        const observer = service.getObserver?.()
        if (!observer)
            return undefined
        refObserver.current = observer
        onData()
        observer.on('data', onData)
        return () => observer.off('data', onData)
    }, [service, onData])

    return items ?? []
}

/**
 * Bike computer: a small unit at the bottom of the screen with several screens (switch with b or a click):
 * all data fields, navigation map, upcoming climb
 */
export const BikeComputer = ({ screen = 'data', map, upcomingElevation, route, position, markers, startPos, endPos,
    lapMode, realityFactor, xScale, yScale, slopeRange, showMap = true }) => {

    const items = useDashboardItems()
    const screens = showMap ? COMPUTER_SCREENS : COMPUTER_SCREENS.filter(s => s !== 'map')
    const current = screens.includes(screen) ? screen : 'data'

    const onClick = (e) => {
        // the map has its own buttons
        if (e.target.closest?.('button, .leaflet-container'))
            return
        useRideDisplay().nextRideScreen?.()
    }

    return (
        <Mount>
        <Unit className='bike-computer' onClick={onClick} title='Next screen (b)'>
            {current === 'data' ?
                <ComputerFields items={items} columns={3} fill compact extra={
                    // the complete route, in the free space after the last field
                    <ElevationProfile routeData={route?.details} position={position} />
                } />
                : null}

            {current === 'map' ?
                <Row>
                    <Section $flex='0 0 30%'>
                        <ComputerFields items={pickFields(items, STRIP_FIELDS.map)} columns={1} small fill />
                    </Section>
                    <Section $flex='1 1 0'>
                        <MapOverlay markers={markers} preview={false} freeRide={false}
                            view={map?.view} zoom={map?.zoom} headingUp={map?.headingUp} bearing={map?.bearing}
                            routeData={route?.details} position={position} startPos={startPos} endPos={endPos} />
                    </Section>
                </Row>
                : null}

            {current === 'climb' ?
                <>
                    <ComputerFields items={pickFields(items, STRIP_FIELDS.climb)} columns={4} small />
                    <Section $flex='1 1 0'>
                        <SectionLabel>CLIMB</SectionLabel>
                        <UpcomingElevationOverlay routeData={route?.details} lapMode={lapMode} pctReality={realityFactor}
                            showXAxis={true} showYAxis={true} line={{ color: 'white' }} xScale={xScale} yScale={yScale} range={slopeRange}
                            position={position} width='100%' height='100%' />
                    </Section>
                </>
                : null}

        </Unit>
        </Mount>
    )
}
