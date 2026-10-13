import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useMap } from 'react-leaflet';

/**
 * Bounds of a route as [[south,west],[north,east]], undefined if the route has no points
 */
export const getRouteBounds = (routeData) => {
    const path = routeData?.points ?? routeData?.decoded
    if (!path?.length)
        return undefined

    let south = 90, north = -90, west = 180, east = -180
    path.forEach( p => {
        const lat = Array.isArray(p) ? p[0] : p?.lat
        const lng = Array.isArray(p) ? p[1] : p?.lng
        if (typeof lat !== 'number' || typeof lng !== 'number')
            return
        south = Math.min(south, lat); north = Math.max(north, lat)
        west = Math.min(west, lng); east = Math.max(east, lng)
    })
    if (south > north)
        return undefined
    return [[south, west], [north, east]]
}

/**
 * Applies the map view mode (rendered inside the map):
 * navigation = zoomed in on the rider, overview = complete route.
 * Runs whenever the mode changes - in between the map simply follows the rider (FreeMap) and
 * keeps any zoom the user chose with the +/- buttons.
 */
export const MapViewController = ({ view, zoom, center, bounds, onMap }) => {
    const map = useMap()

    useEffect(() => { onMap?.(map) }, [map, onMap])

    useEffect(() => {
        try {
            if (view === 'overview' && bounds)
                map.fitBounds(bounds, { padding: [12, 12], animate: false })
            else if (view === 'navigation' && center && zoom)
                map.setView(center, zoom, { animate: false })
        }
        catch {
            // map not ready
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, map])

    return null
}

const Buttons = styled.div`
    position: absolute;
    left: 10px;
    bottom: 26px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 6px;
`

const ViewButton = styled.button`
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 8px;
    border: 2px solid rgba(0,0,0,.25);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    color: ${props => props.$active ? 'white' : '#333'};
    background: ${props => props.$active ? '#f0a03c' : 'white'};
    box-shadow: 0 1px 4px rgba(0,0,0,.3);
`

/**
 * The two map view buttons (hotkeys: n = navigation, o = overview)
 */
export const MapViewButtons = ({ view, onSelect }) => (
    <Buttons className='map-view-buttons'>
        <ViewButton type='button' title='Navigation (n)' aria-label='Navigation view' aria-pressed={view === 'navigation'}
            $active={view === 'navigation'} onClick={() => onSelect?.('navigation')}>➤</ViewButton>
        <ViewButton type='button' title='Complete route (o)' aria-label='Complete route' aria-pressed={view === 'overview'}
            $active={view === 'overview'} onClick={() => onSelect?.('overview')}>⤢</ViewButton>
    </Buttons>
)

// heading-up: the rider is placed in the lower part of the map, so more of the road ahead is visible
export const RIDER_Y = 0.68

/**
 * Turns an angle step by step, always the short way round (359° -> 1° turns by 2°, not by -358°)
 */
export const nextRotation = (prev, bearing) => {
    if (prev === undefined || prev === null)
        return bearing
    const delta = ((bearing - prev) % 360 + 540) % 360 - 180
    return prev + delta
}

// 3D view: the map is tilted towards the horizon (like the navigation view of a bike computer)
export const TILT_DEG = 50
// distance of the viewer, relative to the map height - smaller = stronger perspective
export const PERSPECTIVE_FACTOR = 1.0
// how far ahead the map reaches (relative to the map height) - further away is covered by the horizon haze
export const MAX_AHEAD_FACTOR = 2

/**
 * Size and position of the turning map: a square around the rider that covers the visible area at any angle.
 * With a tilt, the far part of the map is shown smaller - so the map must reach further ahead and be wider there.
 */
export const getStageGeometry = (width, height, riderY = RIDER_Y, tiltDeg = 0) => {
    const pivotX = width / 2
    const pivotY = height * riderY
    const halfWidth = Math.max(pivotX, width - pivotX)
    const below = height - pivotY

    let ahead = pivotY
    let farHalfWidth = halfWidth
    const perspective = height * PERSPECTIVE_FACTOR
    if (tiltDeg > 0) {
        const tilt = tiltDeg * Math.PI / 180
        const denominator = perspective * Math.cos(tilt) - pivotY * Math.sin(tilt)
        // map distance ahead that appears at the top edge (capped if the horizon is inside the view)
        ahead = denominator > 0 ? pivotY * perspective / denominator : MAX_AHEAD_FACTOR * height
        ahead = Math.min(ahead, MAX_AHEAD_FACTOR * height)
        // far away, the map appears smaller - it needs to be wider there
        farHalfWidth = halfWidth * (perspective + ahead * Math.sin(tilt)) / perspective
    }

    const radius = Math.ceil(Math.hypot(Math.max(halfWidth, farHalfWidth), Math.max(ahead, below)))
    const size = 2 * radius
    return { size, left: pivotX - radius, top: pivotY - radius, perspective: Math.round(perspective) }
}

const StageArea = styled.div`
    position: absolute;
    inset: 0;
    overflow: hidden;
`

// haze towards the horizon - hides the far edge of the map
const Horizon = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 30%;
    z-index: 500;
    pointer-events: none;
    background: linear-gradient(to bottom, rgb(150,190,225) 0%, rgb(190,215,235) 45%, rgba(215,228,238,0.6) 75%, rgba(215,228,238,0) 100%);
`

const Stage = styled.div`
    position: absolute;
    transform-origin: 50% 50%;
    transition: transform 0.8s linear;
    @media (prefers-reduced-motion: reduce) { transition: none; }
`

/**
 * Turns its content (the map) so that the riding direction points up
 */
export const HeadingUpStage = ({ bearing = 0, tilt = TILT_DEG, children }) => {
    const ref = React.useRef(null)
    const rotation = React.useRef(undefined)
    const [box, setBox] = React.useState(null)

    useEffect(() => {
        const el = ref.current
        if (!el)
            return undefined
        const measure = () => setBox({ width: el.clientWidth, height: el.clientHeight })
        measure()
        if (typeof ResizeObserver === 'undefined')
            return undefined
        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    rotation.current = nextRotation(rotation.current, bearing ?? 0)

    const geometry = box?.width ? getStageGeometry(box.width, box.height, RIDER_Y, tilt) : undefined
    const transform = tilt > 0
        ? `perspective(${geometry?.perspective}px) rotateX(${tilt}deg) rotate(${-rotation.current}deg)`
        : `rotate(${-rotation.current}deg)`

    return (
        <StageArea ref={ref} className='heading-up'>
            {geometry ?
                <Stage data-testid='heading-up-stage' style={{ width: geometry.size, height: geometry.size, left: geometry.left, top: geometry.top, transform }}>
                    {children}
                </Stage>
                : null}
            {geometry && tilt > 0 ? <Horizon /> : null}
        </StageArea>
    )
}

const ZoomButtons = styled.div`
    position: absolute;
    left: 10px;
    top: 10px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 6px;
`

const Attribution = styled.div`
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1000;
    padding: 1px 5px;
    font-size: 11px;
    color: #333;
    background: rgba(255,255,255,.8);
    a { color: #0078a8; text-decoration: none; }
`

/**
 * Zoom buttons and map credits that stay upright while the map turns
 */
export const HeadingUpControls = ({ onZoomIn, onZoomOut, attribution }) => (
    <>
        <ZoomButtons>
            <ViewButton type='button' aria-label='Zoom in' title='Zoom in' onClick={onZoomIn}>+</ViewButton>
            <ViewButton type='button' aria-label='Zoom out' title='Zoom out' onClick={onZoomOut}>−</ViewButton>
        </ZoomButtons>
        {attribution ? <Attribution dangerouslySetInnerHTML={{ __html: attribution }} /> : null}
    </>
)
