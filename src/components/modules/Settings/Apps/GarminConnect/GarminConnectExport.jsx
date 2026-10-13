import React, { useState } from 'react'
import { useUserSettings } from 'incyclist-services'
import { GarminConnectExportView } from './GarminConnectExportView'

export const GARMIN_CONNECT_GPX_EXPORT = 'preferences.garminConnect.gpxExport'

/**
 * Settings for the manual Garmin Connect upload (user setting preferences.garminConnect.gpxExport)
 */
export const GarminConnectExport = () => {
    const settings = useUserSettings()
    const [enabled, setEnabled] = useState(() => settings.get(GARMIN_CONNECT_GPX_EXPORT, false) === true)

    const onChange = (value) => {
        setEnabled(value)
        settings.set(GARMIN_CONNECT_GPX_EXPORT, value)
    }

    return <GarminConnectExportView enabled={enabled} onChange={onChange} />
}
