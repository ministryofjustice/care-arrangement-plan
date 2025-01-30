# Terraform

All our infrastructure is defined in terraform.

To get start install the [terraform CLI](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli).
Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), and
[configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) it for the AWS account being used.

We have three (maybe?) terraform modules. Each will need `terraform init` running before working on it.

## Staging and Production

// TODO

## Bootstrapping

The bootstrap module shouldn't be touched, as it is used to configure the initial storage location for the
terraform state. In the event that the whole service needs to be recreated:

- Delete the backend section from [the terraform file](bootstrap/main.tf).
- Run `terraform init`
- Run `terraform apply`
- Re-add the backend section to the file
- Run `terraform init`, and copy the existing state to the new backend
