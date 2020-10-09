terraform {
  backend "s3" {
    region = "eu-west-1"
    bucket = "user-management-ui-state"
    key    = "user-management-ui-state"
  }
}

provider "aws" {
  profile = "tekis"
  region = "eu-west-1"
}

data "aws_ssm_parameter" "email_dispatcher_url" {
  name = "email-dispatcher-url"
}

data "aws_ssm_parameter" "email_dispatcher_token" {
  name = "email-dispatcher-token"
}

data "aws_acm_certificate" "certificate" {
  domain = "*.tko-aly.fi"
}

data "aws_vpc" "tekis_vpc" {
  filter {
    name   = "tag:Name"
    values = ["tekis-VPC"]
  }
}

data "aws_subnet_ids" "user_managent_ui_subnets" {
  vpc_id = "${data.aws_vpc.tekis_vpc.id}"
  filter {
    name   = "tag:Name"
    values = ["tekis-private-subnet-1a", "tekis-private-subnet-1b"]
  }
}

data "aws_ecr_repository" "user_managent_ui_repo" {
  name = "user-management-ui"
}

data "aws_ecs_cluster" "cluster" {
  cluster_name = "christina-regina"
}

data "aws_lb" "tekis_lb" {
  name = "tekis-loadbalancer-1"
}

data "aws_lb_listener" "alb_listener" {
  load_balancer_arn = "${data.aws_lb.tekis_lb.arn}"
  port              = 443
}

resource "aws_iam_role" "user_managent_ui_execution_role" {
  name               = "user-managent-ui-execution-role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "user_managent_ui_execution_role_policy" {
  name = "user-managent-ui-execution-role-policy"
  role = "${aws_iam_role.user_managent_ui_execution_role.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_security_group" "user_managent_ui_task_sg" {
  name   = "user-managent-ui-task-sg"
  vpc_id = "${data.aws_vpc.tekis_vpc.id}"

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_alb_target_group" "user_managent_ui_lb_target_group" {
  name        = "cb-target-group"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = "${data.aws_vpc.tekis_vpc.id}"
  target_type = "ip"

  health_check {
    path = "/ping"
    matcher = 200
  }
}

resource "aws_alb_listener_rule" "user_managent_ui_listener_rule" {
  listener_arn = "${data.aws_lb_listener.alb_listener.arn}"

  action {
    type             = "forward"
    target_group_arn = "${aws_alb_target_group.user_managent_ui_lb_target_group.arn}"
  }

  condition {
    host_header {
      values = ["user-management.tko-aly.fi"]
    }
  }
}


resource "aws_cloudwatch_log_group" "user_managent_ui_cw" {
  name = "/ecs/christina-regina/user-managent-ui"
}

resource "aws_ecs_task_definition" "user_managent_ui_task" {
  family                   = "service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = "${aws_iam_role.user_managent_ui_execution_role.arn}"
  container_definitions    = <<DEFINITION
[
  {
    "name": "user_managent_ui",
    "image": "${data.aws_ecr_repository.user_managent_ui_repo.repository_url}:latest",
    "cpu": 256,
    "memory": null,
    "memoryReservation": null,
    "essential": true,
    "portMappings": [{
      "containerPort": 3001,
      "hostPort": 3001,
      "protocol": "tcp"
    }],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${aws_cloudwatch_log_group.user_managent_ui_cw.name}",
        "awslogs-region": "eu-west-1",
        "awslogs-stream-prefix": "ecs",
        "awslogs-datetime-format": "%Y-%m-%d %H:%M:%S"
      }
    },
    "environment": [
      {"name": "PORT", "valueFrom": "3001"}
    ],
    "secrets": [
      {"name": "EMAIL_DISPATCHER_URL", "valueFrom": "${data.aws_ssm_parameter.email_dispatcher_url.arn}"},
      {"name": "EMAIL_DISPATCHER_TOKEN", "valueFrom": "${data.aws_ssm_parameter.email_dispatcher_token.arn}"}
    ]
  }
]
DEFINITION
}

resource "aws_ecs_service" "user_managent_ui" {
  name            = "user-managent-ui"
  cluster         = "${data.aws_ecs_cluster.cluster.id}"
  task_definition = "${aws_ecs_task_definition.user_managent_ui_task.arn}"
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = ["${aws_security_group.user_managent_ui_task_sg.id}"]
    subnets         = "${data.aws_subnet_ids.user_managent_ui_subnets.ids}"
  }

  load_balancer {
    target_group_arn = "${aws_alb_target_group.user_managent_ui_lb_target_group.arn}"
    container_name   = "user_managent_ui"
    container_port   = 3001
  }

  depends_on = [
    aws_alb_target_group.user_managent_ui_lb_target_group
  ]
}