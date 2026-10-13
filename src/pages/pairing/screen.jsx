import React, { useEffect, useRef, useState } from 'react';
import MainPage from '../../components/molecules/MainPage';
import {PageTitle} from '../../components/atoms/Title';
import styled from 'styled-components';
import { SearchingDevice, SelectedDevice } from '../../components/modules/PairingInfo';
import {InterfaceInfo}  from '../../components/modules/PairingInfo/InterfaceSettings/interface-info';
import { Button } from '../../components/atoms/Buttons/Button';

const StatusLine = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 1vh;
`

const StatusPill = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 0.8vh 1.2vw;
    border-radius: 999px;
    font-size: 1.9vh;
    color: white;
    text-align: center;
    background: rgba(12,14,20,.55);
    border: 1px solid rgba(255,255,255,.16);
    backdrop-filter: blur(8px);
`

const StatusDot = styled.span`
    display: inline-block;
    width: 1.2vh;
    height: 1.2vh;
    border-radius: 50%;
    margin-right: 0.8vw;
    background: ${props => props.$color};
    box-shadow: 0 0 8px ${props => props.$color};
`

const statusDotColors = { red: '#e74c3c', green: '#2ecc71', amber: '#f5a623' }

// three tiles (20vw) with two gaps (3vw) - both rows share the same left edge
const Content = styled.div`
    width: 66vw;
    margin: 0 auto;
`

const Section = styled.div`
    margin-top: 3.5vh;
`

const RowHeader = styled.div`
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 0.8vw;
    margin-bottom: 1.4vh;
    color: white;
    text-shadow: 0 1px 6px rgba(0,0,0,.55);
    >div:first-child {
        font-size: 1.9vh;
        font-weight: 700;
        letter-spacing: .12em;
    }
    >div:nth-child(2) {
        font-size: 1.7vh;
        color: rgba(255,255,255,.8);
    }
`

const Tiles = styled.div`
    display: flex;
    flex-direction: row;
    gap: 3vw;
`

const Buttons = styled.div`
    position: absolute;
    width:100%;
    height: 10vh;
    bottom: 0px;
    min-height: 10vh;
    max-height: 10vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
`

const Interfaces = styled.div`
    position: absolute;
    bottom:1vh;
    left:1vw;

`

// Purely a renderer of the page service's display props: tile order/role, row labels, status and
// button layout all come from `capabilities`/`status`/`buttons` - nothing is derived here beyond
// what depends on the page's own size (the resize listener) and the "waiting" ring, which mirrors
// mobile's CapabilityGrid (computed from role/readyToStart/noSearch, not sent over the wire). Tile
// and interface clicks call each item's own bound `onClick` (the service already logs them), the
// same way a selected tile's onUnselect/onUse come straight from its own props.
export const PairingScreen = ( {capabilities,interfaces,connectRetry, readyToStart,status, buttons}) => {

    const ref = useRef(null);

    const [,setWidth] = useState()
    const [,setHeight] = useState()

    useEffect(() => {
        const div = ref.current;
        if (div) {
            window.addEventListener("resize", onResize);
        }
        onResize()
    })

    const top = capabilities?.top ?? []
    const bottom = capabilities?.bottom ?? []
    const rowLabels = capabilities?.rowLabels
    const noSearch = status?.id === 'S1'

    const onResize = () =>  {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)

    }

    const renderTile = (c,idx) => {
        const waiting = c.role==='required' && !readyToStart && !noSearch && !c.disabled
        return c.deviceName ?
            <SelectedDevice key={idx} title={c.title} capability={c.capability} deviceName={c.deviceName} connectState={c.connectState} value={c.value} unit={c.unit} disabled={c.disabled} footer={c.emptyFooter}  onClick={c.onClick} onUnselect={c.onUnselect} onUse={c.onUse} /> :
            <SearchingDevice key={idx} title={c.title} capability={c.capability} waiting={waiting} helpText={c.helpText?.full} footer={c.emptyFooter}  onClick={c.onClick} />
    }

    return (
        <MainPage className='main'>
            <PageTitle>Devices</PageTitle>
            {status ?
                <StatusLine>
                    <StatusPill>
                        <StatusDot $color={statusDotColors[status.dot]} />
                        <span>{status.text}</span>
                    </StatusPill>
                </StatusLine>
            : null}
            <Content>
                <Section className='top'>
                    <RowHeader>
                        <div>{rowLabels?.top?.text}</div>
                        {rowLabels?.top?.subtext ? <div>{rowLabels.top.subtext}</div> : null}
                    </RowHeader>
                    <Tiles>{top.map(renderTile)}</Tiles>
                </Section>
                <Section className='bottom'>
                    <RowHeader>
                        <div>{rowLabels?.bottom?.text}</div>
                        {rowLabels?.bottom?.subtext ? <div>{rowLabels.bottom.subtext}</div> : null}
                    </RowHeader>
                    <Tiles>{bottom.map(renderTile)}</Tiles>
                </Section>
            </Content>
            {buttons?.length ?
                <Buttons>
                    {buttons.map( (b,idx)=> <Button key={idx} height={'6vh'} width={'8vw'} primary={b.primary} text={b.label} onClick={b.onClick} />)}
                </Buttons>
            : null}
            {interfaces?.length ?
                <Interfaces>
                    { interfaces.map( (info,idx)=>
                        <InterfaceInfo
                            name={info.name} connectRetry={connectRetry} isScanning={info.isScanning} enabled={info.enabled} protocol={info.protocol} ifState={info.state} key={idx} size='5vh'
                                        onClick={info.onClick}
                                    />
                                )}
                </Interfaces>
                :null}

        </MainPage>
    )

}
