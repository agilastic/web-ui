import React from 'react';
import styled from 'styled-components';
import { ConnectionStatus } from '../ConnectionStatus';
import { Tile, TileTitle } from '../tile';

const DeviceName = styled.div`
    margin-top: 1.2vh;
    font-size: 2.6vh;
    font-weight: 600;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const Info = styled.div`
    display: flex;
    flex-direction: row;
    align-items: baseline;
    margin-top: 1vh;
`

const Value = styled.div`
    font-size: 5vh;
    font-weight: 700;
    letter-spacing: -.02em;
    font-variant-numeric: tabular-nums;
`

const Unit = styled.div`
    font-size: 1.9vh;
    margin-left: 0.5vw;
    color: rgba(255,255,255,.75);
`


export const SelectedDevice = ( {title, capability, value, unit, deviceName, connectState, disabled, footer, onClick,onUnselect, onUse }) => {

    const onContainerClicked = () =>{
        if (onClick)
            onClick(capability)
    }

    const onUnselectClicked = () =>{
        if (onUnselect)
            onUnselect(capability)
    }

    const onUseClicked = () =>{
        if (onUse)
            onUse(capability)
    }

    // T16: switched off by the rider, but the device is still remembered - shown muted, with no
    // value, and the toggle in the off position (onUse turns it back on, with no new scan)
    const failed = connectState==='failed'
    const state = disabled ? 'off' : failed ? 'failed' : 'selected'

    return (
        <Tile $state={state} onClick={ onContainerClicked}>
            <TileTitle>{title??capability}</TileTitle>
            <DeviceName title={deviceName}>{deviceName}</DeviceName>
            {!disabled && value!==undefined && value!==null && !isNaN(value)?
            <Info>
                <Value>{value}</Value>
                <Unit>{unit}</Unit>
            </Info>
            : null}

            <ConnectionStatus state={connectState} disabled={disabled} footer={footer} onUnselect={onUnselectClicked} onUse={onUseClicked} />
        </Tile>
    )
}
