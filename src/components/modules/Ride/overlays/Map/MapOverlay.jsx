import React from 'react';
import styled from 'styled-components';
import {Marker} from 'react-leaflet';
import L from 'leaflet'
import * as ReactDOMServer from 'react-dom/server';
import { getPointAtDistance, useAvatars, useRideDisplay } from 'incyclist-services';
import { CoachAvatar, ErrorBoundary, MaleAvatar } from '../../../../atoms';
import {FreeMap} from '../../../../molecules/Maps';
import { EventLogger } from 'gd-eventlog';
import { HeadingUpControls, HeadingUpStage, MapViewButtons, MapViewController, getRouteBounds } from './MapView';
import { getTiteConfig } from '../../../../../utils/tiles';

const getPosition = (latLng) => {            
    return [latLng.lat, latLng.lng]            
}

const AvatarIcon = (props, rotate=0) => {
    const Avatar = props?.type==='coach' ? CoachAvatar : MaleAvatar
    const avatar = <Avatar {...props}/>
    
    return L.divIcon({
        // on a turned map (heading-up) the icon is turned back, so it stays upright
        html: ReactDOMServer.renderToString(rotate ? <div style={{transform:`rotate(${rotate}deg)`}}>{avatar}</div> : avatar),
        className: "avatar",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
}

const Markers = ({markers, rotate}) =>{
    if (!markers?.length)
        return null;

    return markers.map( (marker,idx) => 
        <Marker
            icon = {AvatarIcon({...marker.avatar}, rotate)}
            key = {idx}
            draggable={false}
            position={ getPosition(marker)} 
        /> )

}


const DetailedMapArea = styled.div`
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    z-index:  ${props => props.zIndex };
    box-shadow: 0 4px 6px -4px #333;
    background: rgba(0,0,0);
    border: rgb(229, 229, 229) 1px solid;
    position: relative;
`;

export class MapOverlay extends React.Component {

    constructor(props) {
        super(props)
        this.logger = new EventLogger('MapOverlay')

        this.isLegacy = false
        this.prevCenter;
    }
   


    getMarkers() {
        try {
            const {markers=[],position,routeData }= this.props;
            const avatars = useAvatars()
            
            if (markers?.length) {
                markers.forEach( m => {
                    if (!m?.lat && !m?.lng && m?.distance) {
                        const point = getPointAtDistance(routeData,m.distance,true)
                        m.lat = point.lat;
                        m.lng = point.lng
                    }
                })
    
            }

        
        
            const mapMarkers = []
            if (position?.lat && position?.lng) {
                mapMarkers.push( { lat:position.lat, lng:position.lng, avatar: avatars.get('current')})
            }

            const otherRides = markers?.filter( m => m.lat && m.lng)??[]
            if (otherRides?.length)
                mapMarkers.push( ...otherRides)
            return mapMarkers
    
        }
        catch(err) {
            this.logger.logEvent( {message:'error',fn:'getMarkers',error:err.messagem, stack:err.stack})

            return []
        }
    }
    


    renderMap({routeData,options,startPos,endPos,viewport,bounds,viewportOverwrite,onViewportChange,view,zoom,center,followCenter,routeBounds,headingUp,bearing}) {
        return (
            <FreeMap 
                viewport={viewport}
                bounds={bounds}
                viewportOverwrite = {viewportOverwrite}
                routeData={routeData}
                options={options}
                startPos={startPos}
                endPos={endPos}
                center= {followCenter}
                onViewportChanged={onViewportChange}
                zoomControl={!headingUp}
                attributionControl={!headingUp}
                draggable={!headingUp}
            >
                <Markers markers={this.getMarkers()} rotate={headingUp ? bearing : 0}/>
                {view ? <MapViewController view={view} zoom={zoom} center={center} bounds={routeBounds} onMap={this.onMap}/> : null}
            </FreeMap>
        )
    }

    onMap = (map) => {
        this.leafletMap = map
    }

    getRouteBounds(routeData) {
        if (routeData!==this.boundsRoute) {
            this.boundsRoute = routeData
            this.routeBounds = getRouteBounds(routeData)
        }
        return this.routeBounds
    }

    onSelectView(view) {
        try {
            useRideDisplay().setMapView(view)
        }
        catch(err) {
            this.logger.logEvent( {message:'error',fn:'onSelectView',error:err.message})
        }
    }

    render() {
        try {
            if (this.state?.error)
                return null;


            const {routeData,options,preview, startPos,endPos,position,viewport,onViewportChange, view, zoom, bearing }= this.props;
            const headingUp = !!this.props.headingUp && view==='navigation'
            const viewportOverwrite = this.isLegacy ? true : this.props.viewportOverwrite
            const routeBounds = view ? this.getRouteBounds(routeData) : undefined
            const bounds = this.props.bounds ?? routeBounds

            let center = this.props.center ?? position ?? this.prevCenter
            
            if (!this.props.center && preview) {
            
                const path = routeData.points??routeData.decoded
                center = path[path.length-1];
            }
            this.prevCenter = center
            const followCenter = view==='overview' ? undefined : center
        

            return (

                <DetailedMapArea className='map'>
                    <ErrorBoundary hideOnError>
                        {headingUp ?
                            <HeadingUpStage bearing={bearing}>{this.renderMap({routeData,options,startPos,endPos,viewport,bounds,viewportOverwrite,onViewportChange,view,zoom,center,followCenter,routeBounds,headingUp,bearing})}</HeadingUpStage>
                            : this.renderMap({routeData,options,startPos,endPos,viewport,bounds,viewportOverwrite,onViewportChange,view,zoom,center,followCenter,routeBounds,headingUp,bearing})}
                    </ErrorBoundary>
                    {headingUp ?
                        <HeadingUpControls onZoomIn={()=>this.leafletMap?.zoomIn()} onZoomOut={()=>this.leafletMap?.zoomOut()} attribution={getTiteConfig()?.attribution}/>
                        : null}
                    {view ? <MapViewButtons view={view} onSelect={this.onSelectView.bind(this)}/> : null}
                </DetailedMapArea>
                
    
            )
        }
        catch(err) {
            this.logger.logEvent( {message:'error in component',error:err.messagem, stack:err.stack})
            return null
        }
    }
}

