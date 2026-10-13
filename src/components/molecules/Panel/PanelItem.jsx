import React from 'react';
import styled from 'styled-components';

// modern dashboard cell: transparent, separated from its neighbour by a thin line - the dark
// glass background comes from the dashboard container
export const Box = styled.div`
    width:  ${props => props.width??'100%'};
    box-sizing: border-box;
    border-left: 1px solid rgba(255,255,255,.1);
    position:relative;
    display: flex;
    flex-direction: column;
    color: #fff;
    &:first-child { border-left: none; }
`;

export const Title = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  text-align: center;
  font-size: 1.25vh;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(255,255,255,.62);
  width: 100%;
  height: 24%;
  padding: 0;
`;

const getFontSize = (props) =>{
  if (props.primary)
    return (props.len!==undefined && props.len>6 ? '1.8vw' : '2.1vw')
  return '1.2vw'
}

const getValueSize = (props) => {
  const totalHeight = props.showTitle ? 76:100;
  const rows = props.rows || 2;
  return `${totalHeight/rows}%`;
}

const Value = styled.div`
  position: relative;
  text-align: center;
  font-size: ${props => getFontSize(props)} ;
  font-weight: ${props => props.primary ? 650 : 500};
  font-variant-numeric: tabular-nums;
  letter-spacing: -.01em;
  color: ${props => props.primary ? '#fff' : 'rgba(255,255,255,.72)'};
  width: 100%;
  height: ${props => getValueSize(props)};
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: .3vw;
  padding: 0px 0px;
  >div:first-of-type { align-self: center; }
`;

const Unit = styled.span`
  align-self: center;
  font-size: 1.2vh;
  font-weight: 500;
  color: rgba(255,255,255,.6);
`;

const Info = styled.span`
  align-self: center;
  font-size: 1.1vh;
  color: rgba(255,255,255,.55);
`;

const Label = styled.span`
  align-self: center;
  order: -1;
  font-size: 1.1vh;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: rgba(255,255,255,.5);
`;


const Led = styled.div`
  position: absolute;
  top: 0.6vh;
  right: 0.4vw;
  width: 0.9vh;
  height: 0.9vh;
  background-color: ${props=>props.color||'none'};
  border-radius: 50%;
  box-shadow: 0 0 6px ${props=>props.color||'transparent'};
`

export const PanelItem = ({width,showHeader,title,noTitle=false,rows,dataState,data,children}) => {



    const renderValue = (d,idx,showTitle=true) => {
      const numRows = rows || data.length;        
      const hasValue = (d) => {
        return !(d?.value===undefined || d?.value==='' )
      }


      const val = d.value;
      const len = d.value!==undefined ? d.value.length : 0 ;
      const key = 'row_'+idx
      
      if (idx>=numRows)
        return null;


      return (
        <Value rows ={numRows} key={key} primary={idx===0} len={len} showTitle={showTitle}>
          {d.info ? <Info>{d.info}</Info> : null}
          {!hasValue(d) ? <div>&nbsp;</div> :<div>{val}</div>}
          {d.label ? <Label>{d.label}</Label> : null}
          {d.unit ? <Unit>{d.unit}</Unit> : null}
        </Value>
      )
    }

    let d = data;
    if ( !Array.isArray(data) && typeof(data)==='object')
      d = [data]
    
    const showTitle = showHeader!==undefined ? showHeader : title!==undefined && !noTitle;
    
    return (
        <Box width={width}>
            {showTitle ? <Title>{title}</Title>: null}
            {dataState==='red' ? <Led color='red'/> : null}
            {dataState==='amber' ? <Led color='#FFBF00'/> : null}
            {d ? d.map( (d,i) => 
              renderValue(d,i,showTitle)
            ):null}               
            {children}
        </Box>
    )
}