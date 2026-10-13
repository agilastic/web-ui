import React from 'react';
import styled, { keyframes } from 'styled-components';
import { EventLogger } from 'gd-eventlog';

import { Column,  ErrorBoundary,  Row } from '../../../atoms';
import { PanelItem,  Box, WorkoutGraph } from '../../../molecules';

const PanelArea = styled.div`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0 0.4vw 0.4vh 0.4vw;
    margin: 0;
    z-index: ${props => props.zIndex?? 10};
    background: rgba(12,15,22,.72);
    backdrop-filter: blur(10px) saturate(1.2);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 14px;
    box-shadow: 0 8px 22px rgba(0,0,0,.35);
    overflow: hidden;
    color: white;
    width: 100%;
    height: 100%;
`;

export const WorkoutInfo = styled.div`
  font-weight: 650;
  font-size: 1.5vh;
  letter-spacing: .02em;
  width: 100%;
  color: white;
  height: 2.6vh;
  min-height: 2.6vh;
  align-items: center;
  text-align: left;
  display: flex;
  gap: 0.5vw;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  &::before {
    content: '';
    flex: none;
    width: 0.8vh;
    height: 0.8vh;
    border-radius: 50%;
    background: #f0a03c;
    box-shadow: 0 0 6px #f0a03c;
  }
`;

export const WorkoutDetails = styled(Row)`
  display: flex;
  flex-direction: row;
  text-align: left;
  font-family: "Roboto", "Arial", sans-serif, bold;
  font-size: 1.5vh;
  width: 100%;
  height: 76%;
`;

const GraphBox = styled(Box)`
    padding: 0.4vh 0.3vw;
    >div { border-radius: 6px; overflow: hidden; }
`

export const Icons = styled(Row)`
    position: absolute;
    right:0;
    top:0;
`

export const NavButton = styled(Row)`
    position: absolute;
    bottom:0;
    left: ${props => props.direction==='left' ? 0 : undefined};
    right: ${props => props.direction==='right' ? 0 : undefined};
    margin: 0;
    padding: 0;
    justify-content: center;
`

const TitleBar = styled(Column)`
    
    width:${props => props.hasFTP ? 'calc(100% - 6.5vw - 3ch)' : '100%'} ;
    min-width:${props => props.hasFTP ? 'calc(100% - 6.5vw - 3ch)' : '100%'} ;
`
const FTPBar = styled(Row)`
    align-items: center;
    justify-content: flex-end;
    width:calc(6.5vw + 3ch);
    min-width:calc(6.5vw + 3ch);
`

export const FTPInfo = styled.div`
  font-size: 1.3vh;
  color: rgba(255,255,255,.85);
  display: flex;
  align-items: center;
  gap: 0.3vw;
  padding: 0.2vh 0.6vw;
  border-radius: 999px;
  background: rgba(240,160,60,.18);
  border: 1px solid rgba(240,160,60,.45);
  white-space: nowrap;
  >span { color: rgba(255,255,255,.6); letter-spacing: .1em; }
`;

export const FTPButton = styled(Column)`
  width: 1.5vw;
  margin: 0 0.1vw 0 0;
  height: 100%;
  align-items: center;
  justify-content: center;

`

export const StepIndicator = styled(Column)`
  position: absolute;
  top:0;
  left:0;
  font-size: 1vh;
  font-weight: bold;
  color:white;
`

// Subtle scale pulse for the once-per-second countdown ticks in the last 4s before a step ends.
const tickPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.18); }
  100% { transform: scale(1); }
`;

// Stronger background flash for the step-change transition itself (0s).
const stepFlash = keyframes`
  0% { background-color: rgba(255, 221, 0, 0.65); }
  100% { background-color: transparent; }
`;

// Keyed on stepPulse?.ts by the caller so React remounts this wrapper (and therefore
// restarts the CSS animation) on every new event, even consecutive same-type ones.
// display:flex + explicit width (matching the sibling PanelItems' slot) so this wrapper behaves
// like a transparent pass-through flex item: PanelItem's own Box relies on being a direct flex
// child of WorkoutDetails for both its width (percentage-based) and height (via flex `stretch`,
// since Box itself sets no explicit height) - a plain block/inline-block wrapper with no size of
// its own broke both.
export const StepPulseWrapper = styled.div`
  display: flex;
  width: ${props => props.$width ?? '100%'};
  animation-name: ${props => props.$pulseType === 'tick' ? tickPulse : props.$pulseType === 'flash' ? stepFlash : 'none'};
  animation-duration: ${props => props.$pulseType === 'flash' ? '0.5s' : '0.3s'};
  animation-timing-function: ease-in-out;
`

const NextBox = styled.div`
    width: ${props => props.width};
    box-sizing: border-box;
    border-left: 1px solid rgba(255,255,255,.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 1vw;
    gap: 0.4vh;
    color: white;
`

const NextLabel = styled.div`
    font-size: 1.2vh;
    font-weight: 700;
    letter-spacing: .14em;
    color: rgba(255,255,255,.6);
`

const NextName = styled.div`
    font-size: 1.9vh;
    font-weight: 650;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const NextTarget = styled.div`
    font-size: 1.7vh;
    color: rgba(255,255,255,.8);
    font-variant-numeric: tabular-nums;
`

const range = (min,max,unit) => {
    if (min===undefined && max===undefined)
        return undefined
    if (min===undefined || max===undefined || min===max)
        return `${max??min}${unit}`
    return `${min}-${max}${unit}`
}

export const NextStepInfo = ({next, width, formatTime}) => {
    if (!next)
        return <NextBox width={width} className='workout-next'><NextLabel>LAST STEP</NextLabel></NextBox>

    const watts = range(next.minPower,next.maxPower,' W')
    const pct = range(next.minPct,next.maxPct,'%')
    const target = [formatTime(next.duration), watts, pct ? `(${pct})` : undefined].filter(Boolean).join(' · ')

    return (
        <NextBox width={width} className='workout-next'>
            <NextLabel>NEXT</NextLabel>
            <NextName>{next.name}</NextName>
            <NextTarget>{target}</NextTarget>
        </NextBox>
    )
}

function pad (num,size) {
	let s = String(num);
	while (s.length < (size || 2)) {s = '0' + s;}
	return s;
}


export default class WorkoutDashboard extends React.Component {

    constructor() {
        super()
        this.logger = new EventLogger('WorkoutDashboard')
    }

    formatTime( tv, cutMissing ) {
        if ( tv===undefined || tv===null)
            return;

        let timeVal = Math.round(tv);
    
        const h = parseInt(timeVal/3600);
        timeVal = timeVal % 3600;
        const m = parseInt(timeVal/60);
        timeVal = timeVal % 60;
        const s = parseInt(timeVal);
    
        if (cutMissing===undefined || cutMissing===false || h>0)
            return  h + ':'+ pad(m) +':' +pad(s);
        else 
            return pad(m) +':' +pad(s);
    } 




    formatWorkout() {
       

        const limit = this.props.current
        if (!limit)
            return{};
        
        const remaining = this.formatTime( limit.remaining,true );
        const currentStep = this.formatTime( limit.duration,true );
        const current = limit.time
        


        return {
            time:{
                current,currentStep,
                remaining:remaining ? '-'+remaining : undefined
            }, 
            limits:{}
        }
    }


    getWorkoutPanelItems() {
        const power = {}
        const hrm = {}
        const cadence = {}

        const limits = this.props.current

        const n = (v) =>  v!==undefined && v!==null ? Number(v).toFixed(0) : undefined

        const parse = (max,min,target,unit ) =>  {
            if ( max!==undefined) {
                if ( min!==undefined) {
                    target.value = min!==max ? `${min}-${max}` : `${max}`;
                    target.unit = unit;
                }
                else {
                    target.value = `${max}`;
                    target.unit = 'max';
                }
            }
            else if ( min!==undefined) {
                target.value = `${min}`;
                target.unit = 'min';    
            }
        }

        if ( limits!==undefined) {
            parse( n(limits.maxPower), n(limits.minPower), power, 'W')
            parse( n(limits.maxHrm), n(limits.minHrm), hrm, 'bpm')
            parse( n(limits.maxCadence), n(limits.minCadence), cadence, 'rpm')    
        }


        return { power,hrm,cadence}
        
    }

    render() {

        try {

            const {ftp,scheme,numDataColumns,start,stop,workout,next,showGraph=true}=this.props;       

            const workoutEnabled = (this.props.workout!==undefined && this.props.workout!==null)
            if (!workoutEnabled)
                return null;


            const {time={},limits} = this.formatWorkout();

            const workoutInfo = this.props.title ?? this.workout?.name ?? 'Workout'
            const woPI = this.getWorkoutPanelItems(limits);
            const hasFTP = (ftp??-1) !== -1

            

            const cnt = numDataColumns+3;

            const wPct = 100/cnt;
            const w = `${wPct}%`
            const wBlank = `${(numDataColumns-1)*wPct}%`
            const panelProps = {  rows:1, showHeader:false,width:w }


            const woTime = time.current

            return (
                <ErrorBoundary hideOnError>
                    <PanelArea id={this.props.id} scheme={scheme} className='panel'>
                    
                        <Row>
                            <TitleBar hasFTP={hasFTP} className='workout-title'>
                                <WorkoutInfo>
                                    {workoutInfo||''}
                                </WorkoutInfo>                    
                            </TitleBar>
                            {hasFTP?
                            <FTPBar className='workout-settings'>
                                <Column>
                                    <FTPInfo><span>FTP</span><b>{Number(ftp).toFixed(0)}W</b></FTPInfo> 
                                </Column>
                                
                            </FTPBar>
                            :null}
                        </Row>
                        <WorkoutDetails>                    
                            
                            
                            <StepPulseWrapper key={this.props.stepPulse?.ts} $pulseType={this.props.stepPulse?.type} $width={panelProps.width}>
                                <PanelItem {...panelProps} width="100%" rows={2} data={[{value:time.currentStep},{value:time.remaining}]} ></PanelItem>
                            </StepPulseWrapper>
                            
                            {showGraph ?
                                <GraphBox width={wBlank}><WorkoutGraph dashboard={true} scheme='dark' ftp={ftp} start={start} stop={stop} position={[{x:woTime}]} workout={workout}/></GraphBox> :
                                <NextStepInfo next={next} width={wBlank} formatTime={(t)=>this.formatTime(t,true)} />
                            } 
                            <PanelItem {...panelProps} data={{ value:woPI.power.value, unit:woPI.power.unit}} ></PanelItem>
                            <PanelItem {...panelProps} data={{value:woPI.hrm.value,unit:woPI.hrm.unit}} ></PanelItem>
                            <PanelItem {...panelProps} data={{value:woPI.cadence.value,unit:woPI.cadence.unit}}></PanelItem>
                        </WorkoutDetails>
                

                    </PanelArea>
                </ErrorBoundary>
            )
        }
        catch(err) {
            this.logger.logEvent({message:'error in component',component:'WorkoutDashboard', error:err.message, stack:err.stack})
        }
    }

}