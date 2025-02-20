# This isn't managed in terraform as we don't have permissions to delete it
data "aws_cloudwatch_log_group" "ecs" {
  name = "/ECS${local.suffix}"
}
