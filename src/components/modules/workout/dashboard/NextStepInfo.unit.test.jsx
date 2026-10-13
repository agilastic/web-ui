import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextStepInfo } from './component'

const formatTime = (t) => `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`

describe('NextStepInfo', () => {
    test('shows name, duration, watts and % of FTP of the next step', () => {
        render(<NextStepInfo next={{ name:'Recover', duration:246, minPower:132, maxPower:132, minPct:48, maxPct:48 }} formatTime={formatTime} />)

        expect(screen.getByText('NEXT')).toBeInTheDocument()
        expect(screen.getByText('Recover')).toBeInTheDocument()
        expect(screen.getByText('4:06 · 132 W · (48%)')).toBeInTheDocument()
    })

    test('shows a range for ramps', () => {
        render(<NextStepInfo next={{ name:'Cooldown', duration:300, minPower:110, maxPower:151, minPct:40, maxPct:55 }} formatTime={formatTime} />)

        expect(screen.getByText('5:00 · 110-151 W · (40-55%)')).toBeInTheDocument()
    })

    test('shows only watts for steps defined in watts', () => {
        render(<NextStepInfo next={{ name:'Work', duration:60, minPower:250, maxPower:250 }} formatTime={formatTime} />)

        expect(screen.getByText('1:00 · 250 W')).toBeInTheDocument()
    })

    test('tells when the current step is the last one', () => {
        render(<NextStepInfo formatTime={formatTime} />)

        expect(screen.getByText('LAST STEP')).toBeInTheDocument()
    })
})
