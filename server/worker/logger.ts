// TODO: use pino
export const log = (message: string): void => {
  console.log(`${new Date()} ${message}`)
}
