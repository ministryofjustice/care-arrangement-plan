import crypto from 'crypto'

const encryptPassword = (password: string) => {
  const hash = crypto.createHash('sha256')
  hash.update(password)
  return hash.digest('hex')
}

export default encryptPassword
