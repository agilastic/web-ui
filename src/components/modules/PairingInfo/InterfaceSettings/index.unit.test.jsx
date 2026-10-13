import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import InterfaceSettings from './index'

describe('InterfaceSettings', () => {

    const getHostInput = (container) => container.querySelector('.host input') ?? container.querySelector('input[type="text"]')

    test('TCP/IP: shows the configured host and passes the edited host on OK', () => {
        const onOK = vi.fn()
        const { container } = render(<InterfaceSettings name='tcpip' enabled protocols={['Daum Premium']} host='192.168.1.50' onOK={onOK} />)

        const input = getHostInput(container)
        expect(input.value).toBe('192.168.1.50')

        fireEvent.change(input, { target: { value: ' 192.168.1.60 ' } })
        fireEvent.blur(input)   // EditText reports the value when the field loses focus
        fireEvent.click(screen.getByText('OK'))

        expect(onOK).toHaveBeenCalledWith({ enabled: true, protocol: 'Daum Premium', host: '192.168.1.60' })
    })

    test('TCP/IP: an empty host means scanning', () => {
        const onOK = vi.fn()
        render(<InterfaceSettings name='tcpip' enabled protocols={['Daum Premium']} onOK={onOK} />)

        fireEvent.click(screen.getByText('OK'))

        expect(onOK).toHaveBeenCalledWith({ enabled: true, protocol: 'Daum Premium', host: '' })
    })

    test('other interfaces have no host field and pass no host', () => {
        const onOK = vi.fn()
        const { container } = render(<InterfaceSettings name='serial' enabled protocols={['Daum Classic']} onOK={onOK} />)

        expect(container.querySelector('input[type="text"]')).toBeNull()
        fireEvent.click(screen.getByText('OK'))

        expect(onOK).toHaveBeenCalledWith({ enabled: true, protocol: 'Daum Classic' })
    })
})
