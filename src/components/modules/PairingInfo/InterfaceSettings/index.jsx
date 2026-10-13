import React, { PureComponent } from 'react';
import { Button,ButtonBar, CheckBox, EditText, Radio } from '../../../atoms';
import { Dialog } from '../../../molecules';
import styled from 'styled-components';
import { Header } from '../../../molecules/Styling';

const Texts= {
    serial: { title:'Serial Port Settings', description:'Scan for devices connected via serial port (serial USB or paired Bluetooth)'},
    tcpip: { title:'TCP/IP Settings', description:'Scan for devices connected via TCP Socket over LAN/Wifi'},
    ant: { title:'Serial Port Settings', description:'Scan for ANT+ devices'},
    ble: { title:'BLE Settings', description:'Scan for BLE devices'}  ,
    wifi: { title:'Wifi (Direct Connect) Settings', description:'Scan for devices connected via Direct Connect over LAN/Wifi'}   
}

export const SettingsArea = styled.div`
    font-size: 2.2vh;
    padding-left: 0;
    padding:2vh;
    text-align: left;
    margin:0;
`
export const ContentArea = styled.div`
    position:relative;
    width: 100%;
    height: 100%;
    text-align: center ;
    margin:auto;
    display: flex;
    padding:0;
    top:0;
    left:0;
    height: calc(100% - 7.7vh);
    width: 100%;
    background: ${props => props.background};
`;

export const WarningMessage = styled.div`
    font-size: 1.7vh;
    color: yellow;
    `

export default class InterfaceSettings extends PureComponent {

    getTitle() {
        switch (this.props?.name) {
            case 'ant':
                return 'Ant+ Settings'
            case 'ble':
                return 'BLE Settings'
            case 'serial':
                return 'Serial Port Settings'
            case 'tcpip':
                return 'TCP/IP Settings'
            case 'wifi':
                return 'Wifi (Direct Connect) Settings'
            default:
                return 'Interface Settings'
        }
        
    }

    constructor(props) {
        super( props)

        const {enabled,protocols} = props;
        let protocol
        if (protocols && protocols.length===1)
            protocol = props.protocols[0]
        else 
            protocol = props.protocol

        this.state = {enabled,protocol,host:props.host??''}       
        
    }

    onChangeEnable( event ) {
        const enabled = (event.target.checked)
        this.setState( {enabled});
    }
        

    onProtocolSelected(name) {
        const {protocol} = this.state;

        if (protocol!==name) {            
            this.setState( {protocol:name})    
        }
    }

    onHostChanged(host) {
        this.setState( {host})
    }

    onOK() {
        if (!this.props.onOK)
            return

        const {enabled,protocol,host} = this.state
        const settings = {enabled,protocol}
        // tcpip: a fixed host avoids scanning the local network; empty = scan
        if (this.props.name==='tcpip')
            settings.host = host.trim()
        this.props.onOK(settings)
    }

 
    render() {
        const {name} = this.props
        const texts = Texts[name] 
        
        if (!texts)
            return null

        const {enabled,protocol,host} = this.state
        const {protocols} = this.props;
 
        return (
           <Dialog id='InterfaceSettings' level={10} log={ {interface:this.props.name}} title={this.getTitle? this.getTitle() : this.props.title} zIndex={this.props.zIndex||20} onESC={()=>this.onOK()}>

                <ContentArea>
                    <SettingsArea>
                        <CheckBox  
                            checked={enabled}
                            onChange={ (event) => this.onChangeEnable(event) }
                            name= 'enabled'
                            label={texts.description}
                            />           
                        

                        <br></br>

                        { !enabled && name==='wifi' ?
                            <WarningMessage>
                                <p><span role='img' aria-label='warning'>⚠️</span>When you enable this option, the Windows Firewall will request that you grant Incyclist the permissions to access the network</p>
                                <p>This network access is required to scan for devices in the local network<br/>You can limit this access to local network only.</p>
                            </WarningMessage> 
                            : null}

                        { enabled && name==='tcpip' && 
                            <div>
                                <br></br>
                                <Header>Device</Header>
                                <EditText className='host' label='IP Address' labelPosition='before' labelWidth='12ch'
                                    value={host} onChange={(value)=>this.onHostChanged(value)} />
                                <WarningMessage>
                                    <p>Enter the IP address of the device (e.g. 192.168.1.50).<br/>
                                    Leave empty to search the local network for the device (port {this.props.port??51955}).</p>
                                </WarningMessage>
                            </div>
                        }

                        { ( enabled && protocols && protocols.length>1) && 
                            <div>
                                <br></br>
                                <Header>Protocols</Header>
                                
                                { protocols.map ( (name,i) =>  (
                                        <div key = {i}>            
                                            <Radio
                                                checked= { name===protocol}
                                                name='protocols' 
                                                value={name} onChange={ (event) => this.onProtocolSelected( event.target.value)}
                                                />
                                            <label htmlFor='enabled' onClick={ ()=> {this.onProtocolSelected(name) } }>{name} </label>
                                        </div>
                                    ))
                                }
                            </div>
                        }
                    </SettingsArea>
                     
                </ContentArea>
                <ButtonBar justify='center'>                    
                    <Button primary={true} text='OK' onClick={()=>this.onOK()} />                    
                </ButtonBar>


        </Dialog>
        )
    }

}