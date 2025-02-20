resource "aws_lb" "application_load_balancer" {
  name               = "ApplicationLoadBalancer${local.suffix}"
  load_balancer_type = "application"
  subnets            = aws_subnet.public_subnets[*].id
  security_groups    = [aws_security_group.alb_security_group.id]
}

resource "aws_lb_target_group" "alb_target_group" {
  name        = "ALBTargetGroup${local.suffix}"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.vpc.id
  target_type = "ip"

  health_check {
    path = "/health"
  }
}

resource "aws_lb_listener" "alb_listener" {
  load_balancer_arn = aws_lb.application_load_balancer.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb_target_group.arn
  }
}

resource "aws_security_group" "alb_security_group" {
  name   = "ALBSecurityGroup${local.suffix}"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "alb_allow_inbound_traffic" {
  security_group_id = aws_security_group.alb_security_group.id
  description       = "Allow all inbound traffic"
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = aws_lb_listener.alb_listener.port
  to_port           = aws_lb_listener.alb_listener.port
  ip_protocol       = "tcp"

  tags = {
    Name = "ALBIngress${local.suffix}"
  }
}

resource "aws_vpc_security_group_egress_rule" "alb_allow_outbound_traffic_to_ecs" {
  security_group_id            = aws_security_group.alb_security_group.id
  description                  = "Allow all outbound traffic to ECS"
  from_port                    = local.app_port
  to_port                      = local.app_port
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs_security_group.id

  tags = {
    Name = "ALBEgress${local.suffix}"
  }
}
