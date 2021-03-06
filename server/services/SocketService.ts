import { Ulid } from '../models/pgUtils'
import socketio from 'socket.io'
import logger from '../logger'
import { CurrentSession, getCurrentSessionBySessionId } from '../models/Session'
import { getUnfulfilledSessions } from '../models/Session/queries'
import getSessionRoom from '../utils/get-session-room'

class SocketService {
  private io: socketio.Server

  constructor(io: socketio.Server) {
    this.io = io
  }

  /**
   * Get session data to send to client for a given session ID
   * @param sessionId
   * @returns the session object
   */
  private async getSessionData(sessionId: Ulid): Promise<CurrentSession> {
    // Replaced by getCurrentSessionBySessionId
    const populatedSession = await getCurrentSessionBySessionId(sessionId)

    if (populatedSession) return populatedSession
    else throw new Error(`Session data for ${sessionId} not found`)
  }

  async updateSessionList(): Promise<void> {
    const sessions = await getUnfulfilledSessions()
    this.io.in('volunteers').emit('sessions', sessions)
  }

  async emitSessionChange(sessionId: Ulid): Promise<void> {
    const session = await this.getSessionData(sessionId)
    this.io.in(getSessionRoom(sessionId)).emit('session-change', session)

    await this.updateSessionList()
  }

  bump(
    socket: socketio.Socket,
    data: {
      endedAt?: Date
      volunteer?: Ulid
      student: Ulid
    },
    err: Error
  ): void {
    logger.error('Could not join session')
    logger.error(err)
    socket.emit('bump', data, err.toString())
  }
}

export default SocketService
