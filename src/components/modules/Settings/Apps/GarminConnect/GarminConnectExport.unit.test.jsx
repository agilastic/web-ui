import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { store, settingsMock } = vi.hoisted(() => {
    const store = {}
    return { store, settingsMock: { get: vi.fn((k, d) => store[k] ?? d), set: vi.fn((k, v) => { store[k] = v }) } }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useUserSettings: () => settingsMock }
})

import { GarminConnectExport, GARMIN_CONNECT_GPX_EXPORT } from './GarminConnectExport'

describe('GarminConnectExport', () => {
    beforeEach(() => { Object.keys(store).forEach(k => delete store[k]) })
    afterEach(() => { vi.clearAllMocks() })

    test('is off by default', () => {
        render(<GarminConnectExport />)

        expect(screen.getByLabelText('Upload ride to Garmin Connect (GPX)').checked).toBe(false)
    })

    test('shows the stored setting', () => {
        store[GARMIN_CONNECT_GPX_EXPORT] = true

        render(<GarminConnectExport />)

        expect(screen.getByLabelText('Upload ride to Garmin Connect (GPX)').checked).toBe(true)
    })

    test('stores the setting when switched on', () => {
        render(<GarminConnectExport />)

        fireEvent.click(screen.getByLabelText('Upload ride to Garmin Connect (GPX)'))

        expect(settingsMock.set).toHaveBeenCalledWith('preferences.garminConnect.gpxExport', true)
    })
})
