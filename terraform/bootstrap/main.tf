terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.84"
    }
  }
  backend "s3" {
    encrypt      = true
    bucket       = "pfl-care-arrangement-plan-tf-state"
    region       = "eu-west-2"
    key          = "bootstrap.terraform.tfstate"
    use_lockfile = true
  }
  required_version = "~> 1.10"
}

provider "aws" {
  region = "eu-west-2"
}

resource "aws_s3_bucket" "tf_state" {
  bucket = "pfl-care-arrangement-plan-tf-state"
}

resource "aws_s3_bucket_versioning" "tf_state_versioning" {
  bucket = aws_s3_bucket.tf_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_ecr_repository" "ecr_repository" {
  name                 = "pfl-care-arrangement-plan"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

