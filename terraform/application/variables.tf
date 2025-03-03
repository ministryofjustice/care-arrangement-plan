variable "docker_image" {
  description = "Where to pull the docker image from"
  type        = string
  nullable    = false
}

variable "build_number" {
  description = "The number of the build"
  type        = string
  default     = "N/A"
}

variable "git_ref" {
  description = "The git hash of the version being deployed"
  type        = string
  default     = "xxxxxxxxxxxxxxxxxxxxxxxx"
}

variable "git_branch" {
  description = "The name of the branch being deployed"
  type        = string
  default     = "xxxxxxxxxxxx"
}

variable "session_secret" {
  description = "The secret used to sign the session ID cookie"
  type        = string
  sensitive   = true
  nullable    = false
}

variable "beta_access_passwords" {
  description = "The passwords use to gain beta access.  They should be comma delimited"
  type        = string
  sensitive   = true
  nullable    = false
}
