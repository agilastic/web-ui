import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

const { settingsGet, scanMock, hasFeatureMock } = vi.hoisted(() => ({
    settingsGet: vi.fn(),
    scanMock: vi.fn(),
    hasFeatureMock: vi.fn(),
}))

vi.mock('incyclist-services', () => ({ useUserSettings: () => ({ get: settingsGet }) }))
vi.mock('../../../../utils/electron', () => ({ hasFeature: hasFeatureMock, api: { network: { scan: scanMock } } }))

import { TCPLegacyBinding, resetScanCache, SCAN_CACHE_MS } from './tcpip'

describe('TCPLegacyBinding.list', () => {

    const configureHost = (host) => {
        settingsGet.mockImplementation((key, def) => key === 'interfaces' ? [{ name: 'tcpip', enabled: true, port: 51955, host }] : def)
    }

    beforeEach(() => {
        resetScanCache()
        hasFeatureMock.mockReturnValue(true)
        scanMock.mockResolvedValue(['192.168.1.20'])
        configureHost(undefined)
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
    })

    test('uses the configured host without scanning the network', async () => {
        configureHost(' 192.168.1.50 ')

        const ports = await TCPLegacyBinding.list(51955, [])

        expect(ports.map(p => p.path)).toEqual(['192.168.1.50:51955'])
        expect(scanMock).not.toHaveBeenCalled()
    })

    test('does not return the configured host when it is already in use', async () => {
        configureHost('192.168.1.50')

        const ports = await TCPLegacyBinding.list(51955, ['192.168.1.50:51955'])

        expect(ports).toEqual([])
    })

    test('scans the network on the configured port when no host is set', async () => {
        const ports = await TCPLegacyBinding.list(12345, [])

        expect(scanMock).toHaveBeenCalledWith(12345)
        expect(ports.map(p => p.path)).toEqual(['192.168.1.20:12345'])
    })

    test('reuses the scan result for repeated calls', async () => {
        vi.useFakeTimers()
        scanMock.mockResolvedValue([])

        await TCPLegacyBinding.list(51955, [])
        await TCPLegacyBinding.list(51955, [])
        expect(scanMock).toHaveBeenCalledTimes(1)

        vi.advanceTimersByTime(SCAN_CACHE_MS + 1)
        await TCPLegacyBinding.list(51955, [])
        expect(scanMock).toHaveBeenCalledTimes(2)
    })

    test('returns nothing when scanning is not supported and no host is set', async () => {
        hasFeatureMock.mockReturnValue(false)

        expect(await TCPLegacyBinding.list(51955, [])).toEqual([])
        expect(scanMock).not.toHaveBeenCalled()
    })
})
