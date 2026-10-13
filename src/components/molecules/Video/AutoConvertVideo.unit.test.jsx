import React from 'react'
import { EventEmitter } from 'events'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'

const { hasFeatureMock } = vi.hoisted(() => ({ hasFeatureMock: vi.fn() }))
vi.mock('../../../utils/electron/integration', () => ({ hasFeature: hasFeatureMock }))

import { AutoConvertVideo, DEFAULT_STREAM_MIME } from './AutoConvertVideo'

class FakeSourceBuffer extends EventEmitter {
    appendBuffer = vi.fn()
    addEventListener(ev, cb) { this.on(ev, cb) }
}

class FakeMediaSource extends EventEmitter {
    static instances = []
    static isTypeSupported = vi.fn(() => true)
    readyState = 'closed'
    constructor() { super(); FakeMediaSource.instances.push(this) }
    addEventListener(ev, cb) { this.on(ev, cb) }
    addSourceBuffer = vi.fn(() => new FakeSourceBuffer())
    open() { this.readyState = 'open'; this.emit('sourceopen') }
}

const createConversion = () => {
    const observer = new EventEmitter()
    return {
        observer,
        getObserver: () => observer,
        convert: vi.fn(),
        getNextSegment: vi.fn(() => new Promise(() => {})),
        stop: vi.fn(),
    }
}

describe('AutoConvertVideo', () => {
    let conversion

    beforeEach(() => {
        FakeMediaSource.instances = []
        vi.stubGlobal('MediaSource', FakeMediaSource)
        URL.createObjectURL = vi.fn(() => 'blob:test')
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
        conversion = createConversion()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    const mediaSource = () => FakeMediaSource.instances.at(-1)

    describe('desktop with audio support (video.convert.audio)', () => {
        beforeEach(() => { hasFeatureMock.mockReturnValue(true) })

        test('requests audio in the conversion', () => {
            render(<AutoConvertVideo src={conversion} muted={false} />)

            expect(conversion.convert).toHaveBeenCalledWith({ audio: true })
        })

        test('creates the source buffer with the MIME type reported by the stream', () => {
            render(<AutoConvertVideo src={conversion} muted={false} />)
            const mime = 'video/mp4; codecs="avc1.64001F, mp4a.40.2"'

            act(() => { mediaSource().open() })
            expect(mediaSource().addSourceBuffer).not.toHaveBeenCalled()   // stream not started yet

            act(() => { conversion.observer.emit('convert-start', { mime }) })
            expect(mediaSource().addSourceBuffer).toHaveBeenCalledWith(mime)
        })

        test('also works when the stream starts before the MediaSource is open', () => {
            render(<AutoConvertVideo src={conversion} muted={false} />)
            const mime = 'video/mp4; codecs="avc1.64001F"'

            act(() => { conversion.observer.emit('convert-start', { mime }) })
            act(() => { mediaSource().open() })

            expect(mediaSource().addSourceBuffer).toHaveBeenCalledWith(mime)
        })

        test('is not muted when sound is switched on', () => {
            const { container } = render(<AutoConvertVideo src={conversion} muted={false} />)

            expect(container.querySelector('video').muted).toBe(false)
        })
    })

    describe('older desktop without audio support', () => {
        beforeEach(() => { hasFeatureMock.mockReturnValue(false) })

        test('does not request audio and uses the video-only MIME type', () => {
            render(<AutoConvertVideo src={conversion} muted={false} />)

            act(() => { mediaSource().open() })
            act(() => { conversion.observer.emit('convert-start') })

            expect(conversion.convert).toHaveBeenCalledWith(undefined)
            expect(mediaSource().addSourceBuffer).toHaveBeenCalledWith(DEFAULT_STREAM_MIME)
        })

        test('stays muted even when sound is switched on', () => {
            const { container } = render(<AutoConvertVideo src={conversion} muted={false} />)

            expect(container.querySelector('video').muted).toBe(true)
        })
    })
})
