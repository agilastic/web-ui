import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { ActivitySummaryView } from './ActivitySummary'

const activity = { title: 'Test Ride', logs: [], stats: {}, screenshots: [] }

describe('ActivitySummaryView - Garmin Connect upload', () => {

    test('offers the upload after the ride was saved', () => {
        const onGarminUpload = vi.fn()
        render(<ActivitySummaryView activity={activity} showSave={false} showGarminUpload onGarminUpload={onGarminUpload} />)

        fireEvent.click(screen.getByText('Upload to Garmin Connect'))

        expect(onGarminUpload).toHaveBeenCalled()
    })

    test('no upload button before the ride is saved', () => {
        render(<ActivitySummaryView activity={activity} showSave showGarminUpload />)

        expect(screen.queryByText('Upload to Garmin Connect')).toBeNull()
    })

    test('no upload button when the ride can not be exported', () => {
        render(<ActivitySummaryView activity={activity} showSave={false} showGarminUpload={false} />)

        expect(screen.queryByText('Upload to Garmin Connect')).toBeNull()
    })
})
