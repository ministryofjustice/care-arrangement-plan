resource "aws_ecs_cluster" "ecs_cluster" {
  name = "ECSCluster${local.suffix}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

data "aws_ssm_parameter" "ecs_ec2_instance_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2023/arm64/recommended/image_id"
}

resource "aws_launch_template" "ecs_ec2_launch_template" {
  name                   = "ECS-EC2InstanceLaunchTemplate${local.suffix}"
  image_id               = data.aws_ssm_parameter.ecs_ec2_instance_ami.value
  instance_type          = "t4g.small"
  vpc_security_group_ids = [aws_security_group.ecs_security_group.id]
  user_data = base64encode(<<-EOF
      #!/bin/bash
      echo ECS_CLUSTER=${aws_ecs_cluster.ecs_cluster.name} >> /etc/ecs/ecs.config;
    EOF
  )
  monitoring {
    enabled = true
  }
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      encrypted = "true"
    }
  }
  iam_instance_profile {
    arn = aws_iam_instance_profile.ecs_ec2_instance_profile.arn
  }
}

resource "aws_autoscaling_group" "asg" {
  name                      = "AutoScalingGroup${local.suffix}"
  vpc_zone_identifier       = aws_subnet.private_subnets[*].id
  min_size                  = 1
  max_size                  = 2
  health_check_grace_period = 0
  health_check_type         = "EC2"
  protect_from_scale_in     = false
  launch_template {
    id      = aws_launch_template.ecs_ec2_launch_template.id
    version = "$Latest"
  }
  tag {
    key                 = "Name"
    value               = "EC2${local.suffix}"
    propagate_at_launch = true
  }
  tag {
    key                 = "AmazonECSManaged"
    value               = ""
    propagate_at_launch = true
  }
}

resource "aws_ecs_capacity_provider" "capacity_provider" {
  name = "CapacityProvider${local.suffix}"
  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.asg.arn
    managed_termination_protection = "DISABLED"
    managed_scaling {
      maximum_scaling_step_size = 2
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = 100
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "cluster_capacity_provider" {
  cluster_name       = aws_ecs_cluster.ecs_cluster.name
  capacity_providers = [aws_ecs_capacity_provider.capacity_provider.name]
  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.capacity_provider.name
    base              = 1
    weight            = 100
  }
}

resource "aws_ecs_task_definition" "ecs_task" {
  family                   = "ECSTask${local.suffix}"
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_exec_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  requires_compatibilities = ["EC2"]
  container_definitions = jsonencode([
    {
      name      = "Container${local.suffix}"
      image     = var.docker_image
      cpu       = 512
      memory    = 512
      essential = true
      portMappings = [{
        containerPort = local.app_port
        hostPort      = local.app_port
      }]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-region"        = local.region,
          "awslogs-group"         = data.aws_cloudwatch_log_group.ecs.name,
          "awslogs-stream-prefix" = "app"
        }
      },
      environment = [
        { name = "PORT", value = tostring(local.app_port) },
        { name = "BUILD_NUMBER", value = var.build_number },
        { name = "GIT_REF", value = var.git_ref },
        { name = "GIT_BRANCH", value = var.git_branch },
        { name = "USE_HTTPS", value = "false" },
        { name = "STATIC_RESOURCE_CACHE_DURATION", value = "1h" },
        { name = "SESSION_SECRET", value = var.session_secret },
        { name = "WEB_SESSION_TIMEOUT_IN_MINUTES", value = "120" },
        { name = "VALKEY_ENABLED", value = "false" },
        { name = "NODE_ENV", value = "production" },
        { name = "INCLUDE_WELSH_LANGUAGE", value = "false" },
      ]
    }
  ])
}

resource "aws_ecs_service" "ecs_service" {
  name            = "ECSService${local.suffix}"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ecs_task.arn
  desired_count   = 1
  launch_type     = "EC2"
  network_configuration {
    subnets         = aws_subnet.private_subnets[*].id
    security_groups = [aws_security_group.ecs_security_group.id]
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.alb_target_group.arn
    container_name   = "Container${local.suffix}"
    container_port   = local.app_port
  }
}

resource "aws_security_group" "ecs_security_group" {
  name   = "ECSSecurityGroup${local.suffix}"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "ecs_allow_inbound_traffic" {
  security_group_id            = aws_security_group.ecs_security_group.id
  description                  = "Allow traffic from ALB"
  from_port                    = local.app_port
  to_port                      = local.app_port
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.alb_security_group.id

  tags = {
    Name = "ECSIngress${local.suffix}"
  }
}

resource "aws_vpc_security_group_egress_rule" "ecs_allow_outbound_traffic" {
  security_group_id = aws_security_group.ecs_security_group.id
  description       = "Allow all outbound traffic"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"

  tags = {
    Name = "ECSEgress${local.suffix}"
  }
}
