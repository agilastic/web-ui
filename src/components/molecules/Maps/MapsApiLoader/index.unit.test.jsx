import { describe, test, expect } from 'vitest'

import { buildMapsUrl } from './index'

describe('buildMapsUrl', () => {

    test('returns undefined without a base url', () => {
        expect(buildMapsUrl(undefined, 'key', 'uuid-1')).toBeUndefined()
    })

    test('adds key and uuid for an own maps proxy', () => {
        expect(buildMapsUrl('https://updates.example.com/api/v1/maps', 'key', 'uuid-1'))
            .toBe('https://updates.example.com/api/v1/maps?key=key&uuid=uuid-1')
    })

    test('adds only the uuid when there is no key', () => {
        expect(buildMapsUrl('https://updates.example.com/api/v1/maps', undefined, 'uuid-1'))
            .toBe('https://updates.example.com/api/v1/maps?uuid=uuid-1')
    })

    test('never sends the uuid to Google', () => {
        expect(buildMapsUrl('https://maps.googleapis.com/maps/api/js', 'key', 'uuid-1'))
            .toBe('https://maps.googleapis.com/maps/api/js?key=key')
    })
})
