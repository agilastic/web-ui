import { useUserSettings } from "incyclist-services";
import { api, hasFeature,isElectron,isReactNative } from "../../utils";

// Direct Connect (Wi-Fi) is only active when the interface is enabled in the user settings.
// incyclist-devices starts the mDNS (Bonjour) discovery as soon as it gets the binding - without
// this guard, all devices of the local network would be contacted even with Wi-Fi switched off.
export const isWifiEnabled = () => {
    try {
        const interfaces = useUserSettings().get('interfaces', []) ?? []
        const wifi = interfaces.find(i => i.name === 'wifi')
        return wifi?.enabled !== false
    }
    catch {
        return true
    }
}

export const guardMdns = (binding) => {
    const mdns = binding?.mdns
    if (!mdns)
        return binding

    const guarded = Object.create(binding)
    guarded.mdns = {
        connect: (...args) => isWifiEnabled() ? mdns.connect(...args) : undefined,
        disconnect: (...args) => mdns.disconnect(...args),
        find: (...args) => isWifiEnabled() ? mdns.find(...args) : undefined,
    }
    return guarded
}

export default function getDirectConnectBinding() {
    try {
        if ( isElectron() && hasFeature('dc')) {
            const binding =   api.dc.getBinding()
            return guardMdns(binding)
        }
        else if ( isReactNative()) {
            // TODO: provide RN binding
            return null
        }
        else { /*if  (AppInfoService.getInstance().isApp()) {
            console.log('~~~ ANT: Legacy Binding')
            return window.localSupport.getAnt()  // This is Ant v1
        }    
        else { // Web*/
            console.log('~~~ DC: No Binding')
            return null;
        }
    }
    catch (err) {
        this.logger.logEvent({message:'error',fn:'getDirectConnectBinding()',error:err.message||err})
    }

}
