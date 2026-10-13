import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ElevationProfile, getProfile } from './ElevationProfile'

const routeData = { points: [
    { routeDistance:0, elevation:100 },
    { routeDistance:500, elevation:150 },
    { routeDistance:1000, elevation:120 },
] }

describe('getProfile', () => {
    test('scales distance and elevation to 0..1', () => {
        const p = getProfile(routeData)
        expect(p.total).toBe(1000)
        expect(p.min).toBe(100)
        expect(p.max).toBe(150)
        expect(p.points).toEqual([{x:0,y:0},{x:0.5,y:1},{x:1,y:0.4}])
    })

    test('no profile without points', () => {
        expect(getProfile({})).toBeUndefined()
    })

    test('long routes are downsampled', () => {
        const points = Array.from({length:5000}, (_,i) => ({ routeDistance:i, elevation:i%50 }))
        expect(getProfile({points}).points.length).toBeLessThanOrEqual(260)
    })
})

describe('ElevationProfile', () => {
    test('shows the elevation range and the rider position', () => {
        render(<ElevationProfile routeData={routeData} position={{ routeDistance:250 }} />)
        expect(screen.getByText('100–150 m')).toBeInTheDocument()
        expect(screen.getByTestId('elevation-position').style.left).toBe('25%')
    })
})
