import { describe, test, expect, vi, beforeEach } from 'vitest'

const { settingsGet } = vi.hoisted(() => ({ settingsGet: vi.fn() }))
vi.mock('incyclist-services', () => ({ useUserSettings: () => ({ get: settingsGet }) }))
vi.mock('../../utils', () => ({ api: {}, hasFeature: () => false, isElectron: () => false, isReactNative: () => false }))

import { guardMdns } from './wifi'

describe('Direct Connect binding guard', () => {
    let binding

    const wifi = (enabled) => settingsGet.mockImplementation((key, def) => key === 'interfaces' ? [{ name: 'wifi', enabled }] : def)

    beforeEach(() => {
        binding = { net: { id: 'net' }, mdns: { connect: vi.fn(), disconnect: vi.fn(), find: vi.fn() } }
    })

    test('does not start mDNS discovery when Wi-Fi is switched off', () => {
        wifi(false)
        const guarded = guardMdns(binding)

        guarded.mdns.connect()
        guarded.mdns.find({ type: 'wahoo-fitness-tnp' }, vi.fn())

        expect(binding.mdns.connect).not.toHaveBeenCalled()
        expect(binding.mdns.find).not.toHaveBeenCalled()
    })

    test('starts mDNS discovery when Wi-Fi is switched on', () => {
        wifi(true)
        const guarded = guardMdns(binding)

        guarded.mdns.connect()
        guarded.mdns.find(null, vi.fn())

        expect(binding.mdns.connect).toHaveBeenCalled()
        expect(binding.mdns.find).toHaveBeenCalled()
    })

    test('disconnect is always passed on', () => {
        wifi(false)
        guardMdns(binding).mdns.disconnect()

        expect(binding.mdns.disconnect).toHaveBeenCalled()
    })

    test('keeps the other parts of the binding', () => {
        wifi(false)
        expect(guardMdns(binding).net).toEqual({ id: 'net' })
    })
})
