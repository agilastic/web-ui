import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { getRouteBounds, MapViewButtons, nextRotation, getStageGeometry, HeadingUpStage, HeadingUpControls } from './MapView'

describe('getRouteBounds', () => {
    test('bounds of route points', () => {
        const routeData = { points: [{lat:52.3,lng:9.7},{lat:52.4,lng:9.9},{lat:52.35,lng:9.8}] }
        expect(getRouteBounds(routeData)).toEqual([[52.3,9.7],[52.4,9.9]])
    })

    test('works with decoded [lat,lng] arrays', () => {
        expect(getRouteBounds({ decoded: [[1,2],[3,4]] })).toEqual([[1,2],[3,4]])
    })

    test('no bounds without points', () => {
        expect(getRouteBounds({})).toBeUndefined()
        expect(getRouteBounds(undefined)).toBeUndefined()
    })
})

describe('MapViewButtons', () => {
    test('marks the active view', () => {
        render(<MapViewButtons view='navigation' />)
        expect(screen.getByLabelText('Navigation view')).toHaveAttribute('aria-pressed','true')
        expect(screen.getByLabelText('Complete route')).toHaveAttribute('aria-pressed','false')
    })

    test('selects a view', () => {
        const onSelect = vi.fn()
        render(<MapViewButtons view='navigation' onSelect={onSelect} />)

        fireEvent.click(screen.getByLabelText('Complete route'))
        expect(onSelect).toHaveBeenCalledWith('overview')

        fireEvent.click(screen.getByLabelText('Navigation view'))
        expect(onSelect).toHaveBeenCalledWith('navigation')
    })
})

describe('nextRotation', () => {
    test('first value is used as it is', () => {
        expect(nextRotation(undefined, 90)).toBe(90)
    })

    test('turns the short way round', () => {
        expect(nextRotation(359, 1)).toBe(361)
        expect(nextRotation(1, 359)).toBe(-1)
        expect(nextRotation(720, 90)).toBe(810)
    })
})

describe('getStageGeometry', () => {
    test('the turning map covers the visible area at any angle', () => {
        const width = 300, height = 200
        const { size, left, top } = getStageGeometry(width, height)
        const cx = left + size/2, cy = top + size/2
        // rider (pivot) in the middle, in the lower part
        expect(cx).toBe(150)
        expect(cy).toBeCloseTo(136)
        // every corner of the visible area is inside the circle the square turns in
        const corners = [[0,0],[width,0],[0,height],[width,height]]
        corners.forEach(([x,y]) => expect(Math.hypot(x-cx,y-cy)).toBeLessThanOrEqual(size/2))
    })
})

describe('HeadingUpStage', () => {
    test('turns the map against the riding direction', () => {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable:true, get: () => 300 })
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable:true, get: () => 200 })
        render(<HeadingUpStage bearing={45} tilt={0}><div>map</div></HeadingUpStage>)
        expect(screen.getByTestId('heading-up-stage').style.transform).toBe('rotate(-45deg)')
        delete HTMLElement.prototype.clientWidth
        delete HTMLElement.prototype.clientHeight
    })
})

describe('3D view', () => {
    test('the tilted map reaches further ahead and is wider far away', () => {
        const flat = getStageGeometry(300, 300, 0.68, 0)
        const tilted = getStageGeometry(300, 300, 0.68, 40)
        expect(tilted.size).toBeGreaterThan(flat.size)
        // but stays small enough to load few map tiles
        expect(tilted.size).toBeLessThan(5 * 300)
    })

    test('tilts the map towards the horizon', () => {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable:true, get: () => 300 })
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable:true, get: () => 300 })
        render(<HeadingUpStage bearing={90} tilt={40}><div>map</div></HeadingUpStage>)
        expect(screen.getByTestId('heading-up-stage').style.transform).toBe('perspective(300px) rotateX(40deg) rotate(-90deg)')
        delete HTMLElement.prototype.clientWidth
        delete HTMLElement.prototype.clientHeight
    })
})

describe('HeadingUpControls', () => {
    test('zoom buttons and map credits stay available', () => {
        const onZoomIn = vi.fn(), onZoomOut = vi.fn()
        render(<HeadingUpControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} attribution='&copy; OpenStreetMap contributors' />)
        fireEvent.click(screen.getByLabelText('Zoom in'))
        fireEvent.click(screen.getByLabelText('Zoom out'))
        expect(onZoomIn).toHaveBeenCalled()
        expect(onZoomOut).toHaveBeenCalled()
        expect(screen.getByText(/OpenStreetMap contributors/)).toBeInTheDocument()
    })
})
