import React from 'react';
import styled from 'styled-components';
import { Dot, Tile, TileFooter, TileTitle } from '../tile';

const HelpText = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 5vh;
    text-align: center;
    font-size: 2vh;
    color: rgba(255,255,255,.88);
`

export const SearchingDevice = ( {title, capability, waiting, helpText, footer, onClick }) => {

    const onContainerClicked = () =>{
        if (onClick)
            onClick(capability)
    }

    return (
        <Tile $state='searching' $waiting={waiting} onClick={ onContainerClicked}>
            <TileTitle>{title ?? capability}</TileTitle>
            <HelpText>{helpText}</HelpText>
            <TileFooter><Dot $color={waiting ? '#f5a623' : undefined} /><span>{footer}</span></TileFooter>
        </Tile>
    )
}
