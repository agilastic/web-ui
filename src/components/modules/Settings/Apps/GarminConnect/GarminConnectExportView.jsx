import React from 'react'
import styled from 'styled-components'
import { CheckBox } from '../../../../atoms'
import { AppThemeProvider } from '../../../../../theme'

const Area = styled.div`
    text-align: left;
    padding: 1vw;
    background: ${props => props.theme?.dialogContent?.background || 'white'};
    color: ${props => props.theme?.dialogContent?.text};
`

const Header = styled.h2`
    font-size: 2vh;
`

const Hint = styled.p`
    font-size: 1.5vh;
    opacity: 0.8;
`

/**
 * Pure view: on/off switch for the manual Garmin Connect upload
 */
export const GarminConnectExportView = ({ enabled = false, onChange }) => (
    <AppThemeProvider>
        <Area className='garmin-connect-export'>
            <Header>Garmin Connect</Header>
            <CheckBox label='Upload ride to Garmin Connect (GPX)' value={enabled} onValueChange={onChange} />
            <Hint>After a ride, the GPX file is saved to your Downloads folder and the Garmin Connect import page opens in your browser. Drag the file there to upload it.</Hint>
        </Area>
    </AppThemeProvider>
)
