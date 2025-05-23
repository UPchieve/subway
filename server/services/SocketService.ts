import { Ulid } from '../models/pgUtils'
import socketio from 'socket.io'
import logger from '../logger'
import { CurrentSession, getCurrentSessionBySessionId } from '../models/Session'
import { getUnfulfilledSessions } from '../models/Session/queries'
import getSessionRoom from '../utils/get-session-room'
import { ProgressReport } from '../services/ProgressReportsService'
import { addDocEditorVersionTo } from './SessionService'
import { ProgressReportAnalysisTypes } from '../models/ProgressReports'
import { TransactionClient } from '../db'

class SocketService {
  private static instance: SocketService
  private io: socketio.Server

  private constructor(io: socketio.Server) {
    this.io = io
  }

  // Allow singleton use of SocketService
  static getInstance(io?: socketio.Server): SocketService {
    if (!SocketService.instance) {
      if (!io) throw new Error('SocketService has not been initialized')
      SocketService.instance = new SocketService(io)
    }
    return SocketService.instance
  }

  /**
   * Get session data to send to client for a given session ID
   * @param sessionId
   * @returns the session object
   */
  private async getSessionData(
    sessionId: Ulid,
    tc?: TransactionClient
  ): Promise<CurrentSession> {
    // Replaced by getCurrentSessionBySessionId
    const populatedSession = await getCurrentSessionBySessionId(sessionId, tc)

    if (populatedSession) return populatedSession
    else throw new Error(`Session data for ${sessionId} not found`)
  }

  async updateSessionList(): Promise<void> {
    const sessions = await getUnfulfilledSessions()
    this.io.in('volunteers').emit('sessions', sessions)
  }

  async emitSessionChange(
    sessionId: Ulid,
    tc?: TransactionClient
  ): Promise<void> {
    const session = await this.getSessionData(sessionId, tc)
    await addDocEditorVersionTo(session)
    this.io.in(getSessionRoom(sessionId)).emit('session-change', session)

    await this.updateSessionList()
  }

  async emitTutorBotMessage(sessionId: Ulid, messageData: any): Promise<void> {
    const socketRoom = getSessionRoom(sessionId)
    this.io.in(socketRoom).emit('tutorBotConversationMessage', messageData)
  }

  bump(
    socket: socketio.Socket,
    data: {
      endedAt?: Date
      volunteer?: Ulid
      student: Ulid
      sessionId: Ulid
      userId: Ulid
    },
    err: Error
  ): void {
    logger.error(
      `User ${data.userId} could not join session ${data.sessionId}: ${err}`
    )
    socket.emit('bump', data, err.toString())
  }

  async emitProgressReportProcessedToUser(
    userId: Ulid,
    data: {
      report: ProgressReport
      subject: string
      sessionId?: Ulid
      analysisType: ProgressReportAnalysisTypes
    }
  ) {
    // The overall progress report is ready
    if (data.analysisType === 'group')
      this.io.to(userId).emit('progress-report:processed:overview', data)
    // A single progress report is ready
    else this.io.to(userId).emit('progress-report:processed:session', data)
  }

  async emitUserLiveMediaBannedEvents(
    userId: string,
    sessionId: string
  ): Promise<void> {
    this.io
      .to(getSessionRoom(sessionId))
      .except(userId)
      .emit('sessions:partner-banned-from-live-media')
    this.io.to(userId).emit('sessions:banned-from-live-media')
  }

  async emitModerationInfractionEvent(
    userId: string,
    data: {
      isBanned: boolean
      infraction: string[]
      source: string
      occurredAt: Date
    }
  ): Promise<void> {
    this.io.to(userId).emit('moderation-infraction', data)
  }
}

export default SocketService
