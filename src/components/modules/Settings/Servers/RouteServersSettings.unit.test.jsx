import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { store, settingsMock } = vi.hoisted(() => {
    const store = {}
    return {
        store,
        settingsMock: {
            get: vi.fn((key, def) => store[key] ?? def),
            set: vi.fn((key, value) => { store[key] = value }),
        },
    }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useUserSettings: () => settingsMock }
})

import { RouteServersSettings } from './RouteServersSettings'
import { isValidServerUrl } from './RouteServersSettingsView'

const enter = (container, cls, value) => {
    const input = container.querySelector(`.${cls} input`) ?? container.querySelectorAll('input[type="text"]')[cls === 'server-name' ? 0 : 1]
    fireEvent.change(input, { target: { value } })
    fireEvent.blur(input)   // EditText reports the value when it loses focus
}

describe('RouteServersSettings', () => {

    beforeEach(() => {
        Object.keys(store).forEach(k => delete store[k])
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('starts with the server configured in ROUTE_API', () => {
        store.ROUTE_API = 'https://a.example.com/routes'

        render(<RouteServersSettings />)

        expect(screen.getByText('https://a.example.com/routes')).toBeTruthy()
    })

    test('shows the configured server list', () => {
        store.ROUTE_SERVERS = [{ id: 'a', name: 'Server A', url: 'https://a.example.com/routes' }]

        render(<RouteServersSettings />)

        expect(screen.getByText('Server A')).toBeTruthy()
    })

    test('adds a server and stores the list', () => {
        const { container } = render(<RouteServersSettings />)

        enter(container, 'server-name', 'My server')
        enter(container, 'server-url', 'https://b.example.com/routes/')
        fireEvent.click(screen.getByText('Add server'))

        expect(settingsMock.set).toHaveBeenCalledWith('ROUTE_SERVERS', [
            expect.objectContaining({ name: 'My server', url: 'https://b.example.com/routes', enabled: true }),
        ])
        expect(screen.getByText('My server')).toBeTruthy()
    })

    test('rejects an invalid URL', () => {
        const { container } = render(<RouteServersSettings />)

        enter(container, 'server-url', 'not a url')
        fireEvent.click(screen.getByText('Add server'))

        expect(settingsMock.set).not.toHaveBeenCalled()
        expect(container.querySelector('.server-error')).toBeTruthy()
    })

    test('removes a server', () => {
        store.ROUTE_SERVERS = [{ id: 'a', name: 'Server A', url: 'https://a.example.com/routes' }]
        render(<RouteServersSettings />)

        fireEvent.click(screen.getByLabelText('Remove Server A'))

        expect(settingsMock.set).toHaveBeenCalledWith('ROUTE_SERVERS', [])
    })

    test('disables a server', () => {
        store.ROUTE_SERVERS = [{ id: 'a', name: 'Server A', url: 'https://a.example.com/routes', enabled: true }]
        const { container } = render(<RouteServersSettings />)

        fireEvent.click(container.querySelector('.route-server input[type="checkbox"]'))

        expect(settingsMock.set).toHaveBeenCalledWith('ROUTE_SERVERS', [expect.objectContaining({ id: 'a', enabled: false })])
    })
})

describe('isValidServerUrl', () => {
    test('accepts http(s) URLs', () => {
        expect(isValidServerUrl('https://example.com/rlv/api/v1/routes')).toBe(true)
        expect(isValidServerUrl('http://localhost:8765/routes')).toBe(true)
    })

    test('rejects everything else', () => {
        expect(isValidServerUrl('example.com')).toBe(false)
        expect(isValidServerUrl('ftp://example.com')).toBe(false)
        expect(isValidServerUrl('')).toBe(false)
    })
})
