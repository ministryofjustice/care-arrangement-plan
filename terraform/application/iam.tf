data "aws_iam_policy_document" "ecs_ec2_instance_assume_role_doc" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_ec2_instance_role" {
  name               = "ECS-EC2InstanceRole${local.suffix}"
  assume_role_policy = data.aws_iam_policy_document.ecs_ec2_instance_assume_role_doc.json
}

resource "aws_iam_role_policy_attachment" "ecs_ec2_instance_role_policy" {
  role       = aws_iam_role.ecs_ec2_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_ec2_instance_profile" {
  name = "ECS-EC2InstanceProfile${local.suffix}"
  path = "/ecs/instance/"
  role = aws_iam_role.ecs_ec2_instance_role.name
}

data "aws_iam_policy_document" "ecs_task_assume_role_doc" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "ECSTaskRole${local.suffix}"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role_doc.json
}

resource "aws_iam_role" "ecs_exec_role" {
  name               = "ECSExecRole${local.suffix}"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role_doc.json
}

resource "aws_iam_role_policy_attachment" "ecs_exec_role_policy" {
  role       = aws_iam_role.ecs_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
