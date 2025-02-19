# Terraform

All our infrastructure is defined in Terraform.

To get start install the [Terraform CLI](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli).
Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), and
[configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) it for the AWS account being used.

We have two Terraform modules. Each will need `terraform init` running before working on it.

## Application

This contains the Terraform for the application itself. It uses [Terraform workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces)
to manage the different environments.

To see the list of existing workspaces:

```shell
terraform workspace list
```

To select a workspace (in this example the workspace is called test):

```shell
terraform workspace select test
```

We currently have two environments:

- prod
- test

Every resource should be tagged with the environment, and the name should include the environment.

This infrastructure is managed by the pipeline, so we shouldn't need to run it manually. When making changes

- Ensure you are using the test workspace
- Make the changes manually, to ensure they work as expected
- Undo any changes you have been working on once you are done, to prevent confusion with the infrastructure not matching
  the main branch
- Leave the pipeline to manage the deployment once the changes are merged

## Bootstrapping

The bootstrap module shouldn't be touched, as it is used to configure the initial storage location for the
Terraform state. In the event that the whole service needs to be recreated:

- Delete the backend section from [the Terraform file](bootstrap/main.tf).
- Run `terraform init`
- Run `terraform apply`
- Re-add the backend section to the file
- Run `terraform init`, and copy the existing state to the new backend

We currently also have to create the log group in AWS manually, as we don't have permission to delete log groups and this
breaks Terraform. The expected name is `ECS-CAP-${envName}`
