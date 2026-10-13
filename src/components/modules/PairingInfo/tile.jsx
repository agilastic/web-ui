import styled, { css, keyframes } from 'styled-components'

// modern device tile, shared by SearchingDevice and SelectedDevice
const accent = p => p.theme?.button?.primary?.background ?? '#f0a03c'

const pulse = keyframes`
    0%   { box-shadow: 0 0 0 0 rgba(245,166,35,.55), 0 6px 18px rgba(0,0,0,.35); }
    70%  { box-shadow: 0 0 0 10px rgba(245,166,35,0), 0 6px 18px rgba(0,0,0,.35); }
    100% { box-shadow: 0 0 0 0 rgba(245,166,35,0), 0 6px 18px rgba(0,0,0,.35); }
`

const states = {
    searching: css`
        background: rgba(14,18,26,.55);
    `,
    selected: css`
        background: linear-gradient(160deg, rgba(240,160,60,.34) 0%, rgba(14,18,26,.62) 62%);
        border-color: rgba(240,160,60,.55);
    `,
    failed: css`
        background: linear-gradient(160deg, rgba(231,76,60,.30) 0%, rgba(14,18,26,.62) 62%);
        border-color: rgba(231,76,60,.7);
    `,
    off: css`
        background: rgba(14,18,26,.45);
        opacity: .75;
    `,
}

export const Tile = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 20vw;
    min-width: 20vw;
    max-width: 20vw;
    height: 25vh;
    min-height: 25vh;
    max-height: 25vh;
    padding: 1.8vh 1.2vw 0 1.2vw;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    color: #fff;
    border: 1px solid rgba(255,255,255,.14);
    box-shadow: 0 6px 18px rgba(0,0,0,.35);
    backdrop-filter: blur(10px) saturate(1.2);
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
    ${p => states[p.$state] ?? states.searching}
    ${p => p.$waiting && css`
        border: 2px solid #f5a623;
        animation: ${pulse} 2s ease-out infinite;
    `}

    &:hover {
        transform: translateY(-3px);
        border-color: ${accent};
        box-shadow: 0 12px 28px rgba(0,0,0,.45);
    }

    @media (prefers-reduced-motion: reduce) {
        transition: none;
        animation: none;
        &:hover { transform: none; }
    }
`

export const TileTitle = styled.div`
    font-size: 1.5vh;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: rgba(255,255,255,.78);
`

export const TileFooter = styled.div`
    position: absolute;
    box-sizing: border-box;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 20%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: .5vw;
    font-size: 1.6vh;
    letter-spacing: .06em;
    color: rgba(255,255,255,.8);
    background: rgba(0,0,0,.28);
    border-top: 1px solid rgba(255,255,255,.1);
`

export const Dot = styled.span`
    display: inline-block;
    width: 1vh;
    height: 1vh;
    border-radius: 50%;
    background: ${p => p.$color ?? 'rgba(255,255,255,.45)'};
`
