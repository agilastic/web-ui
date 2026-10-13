import React, { useState } from 'react'
import styled from 'styled-components'
import { TrashIcon } from '@primer/octicons-react'
import { Button, CheckBox, EditText } from '../../../atoms'
import { AppThemeProvider } from '../../../../theme'

const ContentArea = styled.div`
    width: calc(100% - 2vw);
    padding: 1vw;
    text-align: left;
    background: ${props => props.theme?.dialogContent?.background || 'white'};
    color: ${props => props.theme?.dialogContent?.text};
`

const Header = styled.h2`
    font-size: 2vh;
`

const Hint = styled.p`
    font-size: 1.5vh;
    opacity: 0.8;
`

const ServerRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1ch;
    padding: 0.5vh 0;
`

const ServerName = styled.div`
    min-width: 20ch;
    font-weight: bold;
`

const ServerUrl = styled.div`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1.6vh;
`

const RemoveButton = styled.button`
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
`

const Error = styled.div`
    color: #ff6b6b;
    font-size: 1.5vh;
`

export const isValidServerUrl = (url) => /^https?:\/\/[^\s/]+\.[^\s]+$/i.test((url ?? '').trim()) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/\S*)?$/i.test((url ?? '').trim())

/**
 * Pure view: list of route servers (name, URL, enabled) with add/remove
 */
export const RouteServersSettingsView = ({ servers = [], onAdd, onRemove, onToggle }) => {
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [error, setError] = useState()

    const onAddClicked = () => {
        if (!isValidServerUrl(url)) {
            setError('Please enter a valid URL, e.g. https://example.com/rlv/api/v1/routes')
            return
        }
        if (servers.some(s => s.url === url.trim().replace(/\/+$/, ''))) {
            setError('This server is already in the list')
            return
        }
        setError(undefined)
        onAdd?.({ name: name.trim() || url.trim(), url: url.trim() })
        setName('')
        setUrl('')
    }

    return (
        <AppThemeProvider>
            <ContentArea>
                <Header>Video servers</Header>
                <Hint>Routes and videos are loaded from all enabled servers. Changes apply after restarting ForkyCyclist.</Hint>

                {servers.length === 0 ? <Hint>No server configured.</Hint> : null}
                {servers.map(server => (
                    <ServerRow key={server.id} className='route-server'>
                        <CheckBox label='' checked={server.enabled !== false} onValueChange={(enabled) => onToggle?.(server.id, enabled)} />
                        <ServerName>{server.name}</ServerName>
                        <ServerUrl title={server.url}>{server.url}</ServerUrl>
                        <RemoveButton type='button' className='remove-server' aria-label={`Remove ${server.name}`} onClick={() => onRemove?.(server.id)}>
                            <TrashIcon size={16} />
                        </RemoveButton>
                    </ServerRow>
                ))}

                <Header>New server</Header>
                <EditText className='server-name' label='Name' labelPosition='before' labelWidth='8ch' value={name} onChange={setName} />
                <EditText className='server-url' label='URL' labelPosition='before' labelWidth='8ch' value={url} onChange={setUrl} />
                {error ? <Error className='server-error'>{error}</Error> : null}
                <Button text='Add server' onClick={onAddClicked} />
            </ContentArea>
        </AppThemeProvider>
    )
}
