import React, { useState } from 'react'
import { useUserSettings } from 'incyclist-services'
import { RouteServersSettingsView } from './RouteServersSettingsView'

const KEY = 'ROUTE_SERVERS'

// first use: start with the single server configured so far (ROUTE_API), so it is not lost
const loadServers = (settings) => {
    const servers = settings.get(KEY, undefined)
    if (Array.isArray(servers))
        return servers

    const url = settings.get('ROUTE_API', undefined)
    return url ? [{ id: 'default', name: 'Default', url, enabled: true }] : []
}

const newId = () => `server-${Date.now().toString(36)}`

/**
 * Settings tab to manage the route servers (user setting ROUTE_SERVERS)
 */
export const RouteServersSettings = () => {
    const settings = useUserSettings()
    const [servers, setServers] = useState(() => loadServers(settings))

    const save = (updated) => {
        setServers(updated)
        settings.set(KEY, updated)
    }

    const onAdd = ({ name, url }) => save([...servers, { id: newId(), name, url: url.replace(/\/+$/, ''), enabled: true }])
    const onRemove = (id) => save(servers.filter(s => s.id !== id))
    const onToggle = (id, enabled) => save(servers.map(s => s.id === id ? { ...s, enabled } : s))

    return <RouteServersSettingsView servers={servers} onAdd={onAdd} onRemove={onRemove} onToggle={onToggle} />
}
