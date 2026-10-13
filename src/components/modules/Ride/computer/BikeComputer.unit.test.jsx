import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComputerFields, pickFields } from './BikeComputer'

// the same items as the classic dashboard
const items = [
    { title:'Time', data:[{value:'02:09'},{value:'-34:15'}] },
    { title:'Distance', data:[{value:'0.33',unit:'km'},{value:'-4.64'}] },
    { title:'Speed', data:[{value:'7.4',unit:'km/h'},{value:'9.2',label:'avg'}] },
    { title:'Power', data:[{value:'150',unit:'W'},{value:'150',label:'avg'}] },
    { title:'Slope', data:[{value:'6.7',unit:'%'},{value:'306',label:'elev. todo',unit:'m'}] },
    { title:'Heartrate', data:[{value:'150',unit:'bpm'},{value:'150',label:'avg'}], dataState:'amber' },
    { title:'Cadence', data:[{value:'90',unit:'rpm'},{value:'90',label:'avg'}] },
]

describe('ComputerFields', () => {
    test('shows every data field of the dashboard', () => {
        render(<ComputerFields items={items} />)
        items.forEach(i => expect(screen.getByText(i.title)).toBeInTheDocument())
        expect(document.querySelectorAll('.computer-field')).toHaveLength(7)
    })

    test('shows the main value with unit and the second line', () => {
        render(<ComputerFields items={items} />)
        expect(screen.getByText('02:09')).toBeInTheDocument()
        expect(screen.getByText('-34:15')).toBeInTheDocument()
        expect(screen.getByText('-4.64')).toBeInTheDocument()
        expect(screen.getByText('elev. todo')).toBeInTheDocument()
        expect(screen.getByText('306')).toBeInTheDocument()
        expect(screen.getByText('km/h')).toBeInTheDocument()
        expect(screen.getAllByText('avg')).toHaveLength(4)
    })

    test('a missing value is shown as a dash', () => {
        render(<ComputerFields items={[{ title:'Heartrate', data:[{unit:'bpm'},{value:'99',label:'avg'}] }]} />)
        expect(screen.getByText('–')).toBeInTheDocument()
    })
})

describe('pickFields', () => {
    test('picks the key values for the map and climb screens', () => {
        expect(pickFields(items, ['Time','Speed','Power','Distance']).map(i => i.title)).toEqual(['Time','Speed','Power','Distance'])
    })

    test('falls back to the first fields if the titles are unknown', () => {
        expect(pickFields(items, ['Foo','Bar']).map(i => i.title)).toEqual(['Time','Distance'])
    })
})

describe('ComputerFields grid', () => {
    test('the last field fills the rest of the row', () => {
        render(<ComputerFields items={items} columns={3} />)
        const fields = document.querySelectorAll('.computer-field')
        expect(fields).toHaveLength(7)
    })

    test('small fields show only the main value - except the remaining time', () => {
        render(<ComputerFields items={items.slice(0,3)} columns={3} small />)
        expect(screen.getByText('02:09')).toBeInTheDocument()
        expect(screen.getByText('-34:15')).toBeInTheDocument()
        expect(screen.queryByText('-4.64')).toBeNull()
        expect(screen.queryByText('avg')).toBeNull()
    })
})

describe('free space', () => {
    test('is used for extra content (e.g. the elevation profile)', () => {
        render(<ComputerFields items={items} columns={3} extra={<div>profile</div>} />)
        expect(screen.getByText('profile')).toBeInTheDocument()
        expect(document.querySelector('.computer-extra')).not.toBeNull()
    })

    test('no extra content when all rows are full', () => {
        render(<ComputerFields items={items.slice(0,6)} columns={3} extra={<div>profile</div>} />)
        expect(screen.queryByText('profile')).toBeNull()
    })
})
