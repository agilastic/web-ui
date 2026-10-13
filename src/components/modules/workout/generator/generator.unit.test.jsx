import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { mockService } = vi.hoisted(() => ({ mockService: { current: null } }))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useWorkoutGenerator: () => mockService.current }
})
vi.mock('../../../molecules', () => ({
    Dialog: ({ children, title }) => <div role='dialog' aria-label={title}>{children}</div>,
    WorkoutGraph: () => <div data-testid='graph' />,
}))

import { WorkoutGeneratorDialog, WorkoutGeneratorButton, formatDetails } from './index'

const OPTIONS = {
    durations: [30, 45, 60],
    energySystems: [{ id: 'threshold', label: 'Threshold', subtitle: 'Raise your FTP' }, { id: 'anaerobic', label: 'Anaerobic', subtitle: 'Short, hard efforts' }],
    difficulties: [1, 2, 3, 4, 5],
    concentrations: [1, 2, 3],
}

const createGenerated = (props = {}) => ({
    name: 'Burn Box', description: '7 efforts peaking at 136% in 45 minutes.', energy: 'anaerobic',
    difficulty: 3, concentration: 2, duration: 2700, tss: 47, peak: 136, seed: 1, workout: {},
    details: [
        { title: 'Warmup', lines: ['7m ramp 45-75%'] },
        { title: 'Main Set', lines: ['6x 1m29s 136% / 3m46s 48%', '1m29s 136%'] },
        { title: 'Cooldown', lines: ['5m01s ramp 55-40%'] },
    ],
    ...props,
})

describe('Workout Generator', () => {

    beforeEach(() => {
        mockService.current = {
            getOptions: vi.fn(() => OPTIONS),
            getFtp: vi.fn(() => 275),
            generate: vi.fn(() => createGenerated()),
            save: vi.fn(() => true),
        }
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('formats the details', () => {
        expect(formatDetails(createGenerated().details)).toBe(
            'Warmup\n- 7m ramp 45-75%\n\nMain Set\n- 6x 1m29s 136% / 3m46s 48%\n- 1m29s 136%\n\nCooldown\n- 5m01s ramp 55-40%')
    })

    test('shows a first workout right away', () => {
        render(<WorkoutGeneratorDialog />)

        expect(mockService.current.generate).toHaveBeenCalledWith({ duration: 60 })
        expect(screen.getByText('Burn Box')).toBeInTheDocument()
        expect(screen.getByText('47')).toBeInTheDocument()
        expect(screen.getByText('45min', { selector: 'b' })).toBeInTheDocument()
        expect(screen.getByText('275W')).toBeInTheDocument()
        expect(screen.getByTestId('graph')).toBeInTheDocument()
    })

    test('generates with the selected choices', () => {
        render(<WorkoutGeneratorDialog />)

        fireEvent.change(screen.getByLabelText('Duration'), { target: { value: '45' } })
        fireEvent.change(screen.getByLabelText('Energy System'), { target: { value: 'threshold' } })
        fireEvent.click(screen.getAllByTestId('difficulty-4')[0])
        fireEvent.click(screen.getAllByTestId('concentration-2')[0])
        fireEvent.click(screen.getByText('Generate'))

        expect(mockService.current.generate).toHaveBeenLastCalledWith({ duration: 45, energy: 'threshold', difficulty: 4, concentration: 2 })
    })

    test('"Any" lets the generator choose', () => {
        render(<WorkoutGeneratorDialog />)

        fireEvent.change(screen.getByLabelText('Duration'), { target: { value: 'any' } })
        fireEvent.click(screen.getAllByTestId('difficulty-4')[0])
        fireEvent.click(screen.getAllByText('Any', { selector: 'button' })[0])
        fireEvent.click(screen.getByText('Generate'))

        expect(mockService.current.generate).toHaveBeenLastCalledWith({})
    })

    test('shows the workout details on request', () => {
        render(<WorkoutGeneratorDialog />)
        expect(screen.queryByText(/6x 1m29s 136%/)).toBeNull()

        fireEvent.click(screen.getByText(/Workout Details/))

        expect(screen.getByText(/6x 1m29s 136%/)).toBeInTheDocument()
    })

    test('saves the workout', () => {
        render(<WorkoutGeneratorDialog />)

        fireEvent.click(screen.getByText('Save to My Workouts'))

        expect(mockService.current.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Burn Box' }))
        expect(screen.getByText('Saved')).toBeInTheDocument()
    })

    test('a new workout can be saved again', () => {
        render(<WorkoutGeneratorDialog />)
        fireEvent.click(screen.getByText('Save to My Workouts'))

        fireEvent.click(screen.getByText('Generate'))

        expect(screen.getByText('Save to My Workouts')).toBeInTheDocument()
    })

    test('the button opens and closes the dialog', () => {
        render(<WorkoutGeneratorButton />)
        expect(screen.queryByRole('dialog')).toBeNull()

        fireEvent.click(screen.getByText('Generate workout'))
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Close'))
        expect(screen.queryByRole('dialog')).toBeNull()
    })
})
