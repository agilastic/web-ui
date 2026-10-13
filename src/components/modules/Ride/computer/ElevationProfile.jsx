import React, { useMemo } from 'react'
import styled from 'styled-components'

const MAX_POINTS = 240

/**
 * Elevation profile of the complete route as [{x,y}] in 0..1 (x = distance, y = elevation), downsampled
 */
export const getProfile = (routeData) => {
    const points = routeData?.points
    if (!points?.length)
        return undefined

    const total = points[points.length - 1]?.routeDistance || routeData?.distance
    if (!total)
        return undefined

    const step = Math.max(1, Math.floor(points.length / MAX_POINTS))
    const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1)
    const elevations = sampled.map(p => p.elevation ?? 0)
    const min = Math.min(...elevations)
    const max = Math.max(...elevations)
    const range = max - min || 1

    return {
        total, min, max,
        points: sampled.map(p => ({ x: (p.routeDistance ?? 0) / total, y: ((p.elevation ?? 0) - min) / range }))
    }
}

const Area = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 0.4vh 0.5vw 0.3vh;
    display: flex;
    flex-direction: column;
`

const Label = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.85vh;
    font-weight: 700;
    letter-spacing: .12em;
    color: rgba(255,255,255,.55);
    > span:last-child { font-weight: 500; letter-spacing: 0; color: rgba(255,255,255,.7); }
`

const Graph = styled.div`
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    svg { position: absolute; inset: 0; width: 100%; height: 100%; }
`

const Marker = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    margin-left: -1px;
    background: #f0a03c;
    &::after {
        content: '';
        position: absolute;
        bottom: ${props => props.$y}%;
        left: -0.45vh;
        width: 0.9vh;
        height: 0.9vh;
        margin-bottom: -0.45vh;
        border-radius: 50%;
        background: #f0a03c;
        box-shadow: 0 0 6px #f0a03c;
    }
`

const toPath = (points, untilX) => {
    const list = untilX === undefined ? points : points.filter(p => p.x <= untilX)
    if (list.length < 2)
        return undefined
    const line = list.map((p, i) => `${i ? 'L' : 'M'}${(p.x * 100).toFixed(2)},${(100 - p.y * 88 - 6).toFixed(2)}`).join(' ')
    const last = list[list.length - 1], first = list[0]
    return `${line} L${(last.x * 100).toFixed(2)},100 L${(first.x * 100).toFixed(2)},100 Z`
}

/**
 * Compact elevation profile of the complete route with the rider's position - made for small spaces
 */
export const ElevationProfile = ({ routeData, position }) => {
    const profile = useMemo(() => getProfile(routeData), [routeData])
    if (!profile)
        return null

    const done = Math.min(1, Math.max(0, (position?.routeDistance ?? 0) / profile.total))
    // elevation at the rider's position (for the marker dot)
    const next = profile.points.find(p => p.x >= done) ?? profile.points[profile.points.length - 1]
    const y = 6 + next.y * 88

    return (
        <Area className='elevation-profile'>
            <Label><span>ELEVATION</span><span>{Math.round(profile.min)}–{Math.round(profile.max)} m</span></Label>
            <Graph>
                <svg viewBox='0 0 100 100' preserveAspectRatio='none' aria-hidden='true'>
                    <path d={toPath(profile.points)} fill='rgba(255,255,255,0.16)' stroke='rgba(255,255,255,0.85)' strokeWidth='1.2' vectorEffect='non-scaling-stroke' />
                    {toPath(profile.points, done) ?
                        <path d={toPath(profile.points, done)} fill='rgba(240,160,60,0.35)' stroke='#f0a03c' strokeWidth='1.6' vectorEffect='non-scaling-stroke' />
                        : null}
                </svg>
                <Marker data-testid='elevation-position' style={{ left: `${done * 100}%` }} $y={y} />
            </Graph>
        </Area>
    )
}
