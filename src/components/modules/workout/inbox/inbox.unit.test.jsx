import React from 'react'
import { EventEmitter } from 'events'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'

const { mockInbox, mockUI } = vi.hoisted(() => ({
    mockInbox: { current: null },
    mockUI: { openBrowserWindow: vi.fn() },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useWorkoutInbox: () => mockInbox.current }
})
vi.mock('../../../../bindings/native-ui', () => ({ useAppUI: () => mockUI }))

import { WorkoutInboxBar, WorkoutInboxToast, TOAST_DURATION } from './index'

const createInbox = (props = {}) => {
    const inbox = new EventEmitter()
    inbox.isSupported = vi.fn(() => true)
    inbox.isEnabled = vi.fn(() => true)
    inbox.setEnabled = vi.fn()
    inbox.getLibraryUrl = vi.fn(() => 'https://whatsonzwift.com/workouts')
    return Object.assign(inbox, props)
}

describe('Workout Inbox', () => {

    beforeEach(() => {
        mockInbox.current = createInbox()
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.useRealTimers()
    })

    describe('WorkoutInboxBar', () => {
        test('shows nothing when the platform does not support the inbox', () => {
            mockInbox.current.isSupported.mockReturnValue(false)
            const { container } = render(<WorkoutInboxBar />)
            expect(container).toBeEmptyDOMElement()
        })

        test('opens the workout library in the browser', () => {
            render(<WorkoutInboxBar />)
            fireEvent.click(screen.getByText('Find workouts'))
            expect(mockUI.openBrowserWindow).toHaveBeenCalledWith('https://whatsonzwift.com/workouts')
        })

        test('shows the current setting', () => {
            mockInbox.current.isEnabled.mockReturnValue(false)
            render(<WorkoutInboxBar />)
            expect(screen.getByRole('checkbox')).not.toBeChecked()
        })

        test('switches the automatic import off', () => {
            render(<WorkoutInboxBar />)
            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).toBeChecked()

            fireEvent.click(checkbox)

            expect(mockInbox.current.setEnabled).toHaveBeenCalledWith(false)
            expect(checkbox).not.toBeChecked()
        })
    })

    describe('WorkoutInboxToast', () => {
        test('shows nothing without an import', () => {
            render(<WorkoutInboxToast />)
            expect(screen.queryByRole('status')).toBeNull()
        })

        test('shows an imported workout and hides it after a few seconds', () => {
            vi.useFakeTimers()
            render(<WorkoutInboxToast />)

            act(() => { mockInbox.current.emit('imported', { name: 'Sweet Spot 3x15', count: 1 }) })
            expect(screen.getByRole('status')).toHaveTextContent('Workout imported: Sweet Spot 3x15')

            act(() => { vi.advanceTimersByTime(TOAST_DURATION) })
            expect(screen.queryByRole('status')).toBeNull()
        })

        test('shows the number of workouts when a file contains several', () => {
            render(<WorkoutInboxToast />)
            act(() => { mockInbox.current.emit('imported', { name: 'Plan', count: 3 }) })
            expect(screen.getByRole('status')).toHaveTextContent('3 workouts imported: Plan')
        })

        test('shows import errors', () => {
            render(<WorkoutInboxToast />)
            act(() => { mockInbox.current.emit('error', { name: 'broken', error: 'invalid file' }) })
            expect(screen.getByRole('status')).toHaveTextContent('Workout could not be imported: broken')
        })

        test('stops listening when removed', () => {
            const { unmount } = render(<WorkoutInboxToast />)
            unmount()
            expect(mockInbox.current.listenerCount('imported')).toBe(0)
            expect(mockInbox.current.listenerCount('error')).toBe(0)
        })
    })
})
