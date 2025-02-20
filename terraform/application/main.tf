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
    key          = "terraform.tfstate"
    use_lockfile = true
  }
  required_version = "~> 1.10"
}

locals {
  suffix              = "-CAP-${terraform.workspace}"
  environment         = terraform.workspace
  region              = "eu-west-2"
  availability_zones  = ["eu-west-2a", "eu-west-2b", "eu-west-2c"]
  public_subnet_cids  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnet_cids = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
  az_labels           = ["-az-A", "-az-B", "-az-C"]
  app_port            = 8001
}

provider "aws" {
  region = local.region

  default_tags {
    tags = {
      Environment = local.environment
      Service     = "PFL Care Arrangement Plan"
      Source      = "Terraform"
      Repository  = "https://dev.azure.com/ACE-C514/_git/pfl-care-arrangement-plan"
    }
  }
}
