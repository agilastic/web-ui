import { api, hasFeature } from '../../utils/electron/integration'

/**
 * Desktop-only binding: watches folders for new files via the desktop `fileWatch` feature
 * (desktop/src/features/file-watch). Used by the workout inbox (services: WorkoutInboxService).
 */
export class FileWatchBinding {
    watch(dir, extensions) {
        return api.fileWatch.watch(dir, extensions)
    }
    unwatch(id) {
        return api.fileWatch.unwatch(id)
    }
    onMessage(callback) {
        api.fileWatch.onMessage(callback)
    }
}

export const getFileWatchBinding = () => {
    if (hasFeature('fileWatch'))
        return new FileWatchBinding()
    return undefined
}
